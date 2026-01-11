package org.example.commandservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor bearerTokenRequestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                // Récupérer l'authentification actuelle depuis SecurityContextHolder
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                    Jwt jwt = (Jwt) authentication.getPrincipal();
                    String tokenValue = jwt.getTokenValue();

                    // Ajouter le header Authorization avec le Bearer token
                    template.header("Authorization", "Bearer " + tokenValue);

                    System.out.println("Token JWT ajouté à la requête Feign: " + tokenValue.substring(0, 50) + "...");
                } else {
                    System.out.println("Aucun token JWT trouvé dans le contexte de sécurité");
                    System.out.println("Authentication: " + authentication);
                    if (authentication != null) {
                        System.out.println("Principal type: " + authentication.getPrincipal().getClass().getName());
                    }
                }
            }
        };
    }
}