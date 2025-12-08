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

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
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
        registry.addEndpoint("/ws-auction").setAllowedOriginPatterns("*");
        registry.addEndpoint("/ws-auction").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {

                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    // Fallback access_token
                    if (authHeader == null) {
                        String accessToken = accessor.getFirstNativeHeader("access_token");
                        if (accessToken != null && !accessToken.isEmpty()) {
                            authHeader = "Bearer " + accessToken;
                        }
                    }

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String jwt = authHeader.substring(7);

                        // Controllo rapido anti-crash: se non ha punti, ignora silenziosamente
                        if (jwt == null || jwt.trim().isEmpty() || !jwt.contains(".")) {
                            return null;
                        }

                        try {
                            if (jwtService.validateToken(jwt)) {
                                String userEmail = jwtService.getUsernameFromToken(jwt);
                                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());

                                accessor.setUser(authToken);
                                System.out.println("✅ WS Connesso: " + userEmail);
                            }
                        } catch (Exception e) {
                            System.out.println("❌ WS Auth Failed");
                            return null;
                        }
                    }
                }
                return message;
            }
        });
    }
}