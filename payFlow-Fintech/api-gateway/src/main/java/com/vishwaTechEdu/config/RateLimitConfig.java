package com.vishwaTechEdu.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimitConfig {

    @Bean
    public KeyResolver userKeyResolver() {

        return exchange -> {

            // 1️⃣ Prefer userId (added by JwtGlobalFilter)
            String userId = exchange.getRequest()
                    .getHeaders()
                    .getFirst("userId");

            if (userId != null) {
                return Mono.just("USER_" + userId);
            }

            // 2️⃣ Fallback to Authorization token (hashed / raw)
            String auth = exchange.getRequest()
                    .getHeaders()
                    .getFirst("Authorization");

            if (auth != null) {
                return Mono.just("TOKEN_" + auth.hashCode());
            }

            // 3️⃣ Final fallback → IP address
            String ip = exchange.getRequest()
                    .getRemoteAddress() != null
                    ? exchange.getRequest()
                    .getRemoteAddress()
                    .getAddress()
                    .getHostAddress()
                    : "UNKNOWN_IP";

            return Mono.just("IP_" + ip);
        };
    }
}
