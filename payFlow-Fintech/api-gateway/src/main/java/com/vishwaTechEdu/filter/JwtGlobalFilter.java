//package com.vishwaTechEdu.filter;
//
//import com.vishwaTechEdu.util.JwtUtil;
//import io.jsonwebtoken.Claims;
//import org.springframework.cloud.gateway.filter.GlobalFilter;
//import org.springframework.cloud.gateway.filter.GatewayFilterChain;
//import org.springframework.core.io.buffer.DataBuffer;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.MediaType;
//import org.springframework.stereotype.Component;
//import org.springframework.web.server.ServerWebExchange;
//import reactor.core.publisher.Mono;
//
//import java.nio.charset.StandardCharsets;
//@Component
//public class JwtGlobalFilter implements GlobalFilter {
//
//    private final JwtUtil jwtUtil;
//
//    public JwtGlobalFilter(JwtUtil jwtUtil) {
//        this.jwtUtil = jwtUtil;
//    }
//
//    @Override
//    public Mono<Void> filter(ServerWebExchange exchange,
//                             GatewayFilterChain chain) {
//
//        String path = exchange.getRequest().getURI().getPath();
//
//        // ✅ Public endpoints
//        if (path.startsWith("/api/v1/auth")
//                || path.contains("swagger")
//                || path.contains("v3/api-docs")) {
//            return chain.filter(exchange);
//        }
//
//        String authHeader = exchange.getRequest()
//                .getHeaders()
//                .getFirst(HttpHeaders.AUTHORIZATION);
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            return unauthorized(exchange, "Missing or invalid Authorization header");
//        }
//
//        String token = authHeader.substring(7);
//
//        if (!jwtUtil.validate(token)) {
//            return unauthorized(exchange, "Invalid or expired JWT token");
//        }
//
//        Claims claims;
//        try {
//            claims = jwtUtil.getClaims(token);
//        } catch (Exception e) {
//            return unauthorized(exchange, "Invalid JWT token");
//        }
//
//        String userId = String.valueOf(claims.get("userId"));
//        String role = String.valueOf(claims.get("role"));
//
//        ServerWebExchange modifiedExchange =
//                exchange.mutate()
//                        .request(r -> r
//                                .header("userId", userId)
//                                .header("role", role)
//                        )
//                        .build();
//
//        return chain.filter(modifiedExchange);
//    }
//
//    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
//
//        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//        exchange.getResponse().getHeaders()
//                .setContentType(MediaType.APPLICATION_JSON);
//
//        String body =
//                "{"
//                        + "\"status\":401,"
//                        + "\"error\":\"UNAUTHORIZED\","
//                        + "\"message\":\"" + message + "\""
//                        + "}";
//
//        DataBuffer buffer = exchange.getResponse()
//                .bufferFactory()
//                .wrap(body.getBytes(StandardCharsets.UTF_8));
//
//        return exchange.getResponse().writeWith(Mono.just(buffer));
//    }
//}



package com.vishwaTechEdu.filter;

import com.vishwaTechEdu.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
public class JwtGlobalFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    public JwtGlobalFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
                             GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

//        // ✅ Public endpoints
//        if (isPublicEndpoint(path)) {
//            return chain.filter(exchange);
//        }

        // PUBLIC ENDPOINTS
        if (path.startsWith("/api/v1/auth")
                || path.startsWith("/api/v1/kyc/file")) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        Claims claims;

        try {
            claims = jwtUtil.getClaims(token);  // ✅ Parse once
        } catch (JwtException e) {
            return unauthorized(exchange, "Invalid or expired JWT token");
        }

        String userId = String.valueOf(claims.get("userId"));
        String role = String.valueOf(claims.get("role"));

        ServerWebExchange modifiedExchange =
                exchange.mutate()
                        .request(r -> r
                                .header("userId", userId)
                                .header("role", role)
                        )
                        .build();

        return chain.filter(modifiedExchange);
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/v1/auth")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {

        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders()
                .setContentType(MediaType.APPLICATION_JSON);

        String body =
                "{"
                        + "\"status\":401,"
                        + "\"error\":\"UNAUTHORIZED\","
                        + "\"message\":\"" + message + "\""
                        + "}";

        DataBuffer buffer = exchange.getResponse()
                .bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));

        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1; // Run before other filters
    }
}
