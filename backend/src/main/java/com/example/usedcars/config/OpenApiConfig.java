package com.example.usedcars.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI usedCarOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Used Car Buy and Sell Management System API")
                        .version("1.0.0")
                        .description("Monolithic Spring Boot backend with Admin, Seller, and Buyer role layers."))
                .schemaRequirement("SessionToken",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-Session-Token"))
                .addSecurityItem(new SecurityRequirement().addList("SessionToken"));
    }
}
