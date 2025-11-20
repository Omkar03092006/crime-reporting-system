package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allowed Origins (Frontend URLs)
        config.addAllowedOriginPattern("http://localhost:3000");
        config.addAllowedOriginPattern("https://frontend.up.railway.app");

        // Allowed Methods
        config.addAllowedMethod("*");

        // Allowed Headers
        config.addAllowedHeader("*");

        // Important for cookies / Authorization headers
        config.setAllowCredentials(true);

        // Apply to all routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
