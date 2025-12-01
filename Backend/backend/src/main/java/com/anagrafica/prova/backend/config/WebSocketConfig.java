package com.anagrafica.prova.backend.config;

import com.anagrafica.prova.backend.security.CustomUserDetailsService;
import com.anagrafica.prova.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99) // Assicura che questo giri prima della sicurezza standard
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Aggiungiamo l'endpoint sia con SockJS che senza, per massima compatibilità
        registry.addEndpoint("/ws-auction")
                .setAllowedOriginPatterns("*"); // Per client standard

        registry.addEndpoint("/ws-auction")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // Per client SockJS
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                // Intercettiamo solo il comando di CONNESSIONE
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {

                    // 1. Cerchiamo il token nell'header nativo "Authorization" (standard)
                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    // 2. SE NON C'È, LO CERCHIAMO NELL'URL (query param "access_token")
                    // Spring converte i query params in Native Headers automaticamente
                    if (authHeader == null) {
                        String accessToken = accessor.getFirstNativeHeader("access_token");
                        if (accessToken != null) {
                            authHeader = "Bearer " + accessToken;
                        }
                    }

                    // 3. Validazione Token
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String jwt = authHeader.substring(7);

                        // Usiamo il tuo JwtService per validare
                        if (jwtService.validateToken(jwt)) {
                            // Estraiamo l'username
                            String userEmail = jwtService.getUsernameFromToken(jwt);

                            // Carichiamo i dettagli utente completi (ruoli, ecc.)
                            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                            // Creiamo l'oggetto di autenticazione
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());

                            // Impostiamo l'utente nella sessione WebSocket
                            accessor.setUser(authToken);

                            System.out.println("✅ WebSocket Autenticato per: " + userEmail);
                        } else {
                            System.out.println("❌ Token WebSocket non valido");
                        }
                    }
                }
                return message;
            }
        });
    }
}