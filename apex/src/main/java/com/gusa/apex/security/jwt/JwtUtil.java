package com.gusa.apex.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String createToken(String userId, String role) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role)
                .claim("type", "access")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String createRefreshToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserId(String token) {
        return parse(token).getBody().getSubject();
    }

    public boolean validate(String token) {
        try {
            parse(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("[JWT] 액세스 토큰 만료");
        } catch (SignatureException e) {
            log.warn("[JWT] 서명 불일치 — 토큰 변조 의심");
        } catch (MalformedJwtException e) {
            log.warn("[JWT] 잘못된 토큰 형식");
        } catch (Exception e) {
            log.warn("[JWT] 토큰 검증 실패: {}", e.getMessage());
        }
        return false;
    }

    public boolean validateRefreshToken(String token) {
        try {
            Jws<Claims> jws = parse(token);
            return "refresh".equals(jws.getBody().get("type", String.class));
        } catch (ExpiredJwtException e) {
            log.warn("[JWT] 리프레시 토큰 만료");
        } catch (SignatureException e) {
            log.warn("[JWT] 리프레시 토큰 서명 불일치");
        } catch (Exception e) {
            log.warn("[JWT] 리프레시 토큰 검증 실패: {}", e.getMessage());
        }
        return false;
    }

    public String getUserIdFromRefreshToken(String token) {
        return parse(token).getBody().getSubject();
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }
}
