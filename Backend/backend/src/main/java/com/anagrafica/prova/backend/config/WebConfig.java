package com.anagrafica.prova.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Questa configurazione dice a Spring Boot:
        // "Quando qualcuno cerca un URL che inizia con /uploads/..."
        // "...vai a prendere il file fisico nella cartella 'uploads' del progetto"

        registry.addResourceHandler("uploads/**")
                .addResourceLocations("file:uploads/");
    }
}