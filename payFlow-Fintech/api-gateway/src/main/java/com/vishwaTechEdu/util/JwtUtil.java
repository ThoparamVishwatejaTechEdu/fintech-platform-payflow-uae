package com.vishwaTechEdu.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
//
//@Component
//public class JwtUtil {
//
//    private final SecretKey signingKey;
//
//    public JwtUtil(@Value("${jwt.secret}") String secret) {
//        this.signingKey = Keys.hmacShaKeyFor(
//                secret.getBytes(StandardCharsets.UTF_8)
//        );
//    }
//
//    public Claims getClaims(String token) {
//        return Jwts.parserBuilder()
//                .setSigningKey(signingKey)
//                .build()
//                .parseClaimsJws(token)
//                .getBody();
//    }
//
//    public boolean validate(String token) {
//        try {
//            Claims claims = getClaims(token);
//            Date expiry = claims.getExpiration();
//            return expiry != null && expiry.after(new Date());
//        } catch (Exception e) {
//            return false;
//        }
//    }
//
//
//}
//



@Component
public class JwtUtil {

    private final SecretKey signingKey;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
