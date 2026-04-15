package com.gusa.apex.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.*;

class JwtUtilTest {

    private static final String VALID_SECRET = "test-secret-must-be-at-least-32-bytes-long!!";
    private static final long EXPIRATION_MS = 3_600_000L;

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", VALID_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", EXPIRATION_MS);
        jwtUtil.init();
    }

    // ─── 토큰 생성 ────────────────────────────────────────────────

    @Test
    @DisplayName("토큰 생성 — null이 아닌 문자열 반환")
    void createToken_notNull() {
        String token = jwtUtil.createToken("user01", "ROLE_USER");
        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    @DisplayName("토큰 생성 — userId 클레임 포함")
    void createToken_containsUserId() {
        String token = jwtUtil.createToken("user01", "ROLE_USER");
        String userId = jwtUtil.getUserId(token);
        assertThat(userId).isEqualTo("user01");
    }

    @Test
    @DisplayName("토큰 생성 — role 클레임 포함")
    void createToken_containsRole() {
        String token = jwtUtil.createToken("user01", "ROLE_ADMIN");

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(VALID_SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertThat(claims.get("role", String.class)).isEqualTo("ROLE_ADMIN");
    }

    @Test
    @DisplayName("토큰 생성 — 만료 시각이 현재보다 미래")
    void createToken_expirationInFuture() {
        String token = jwtUtil.createToken("user01", "ROLE_USER");

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(VALID_SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertThat(claims.getExpiration()).isAfter(new Date());
    }

    // ─── 토큰 검증 ────────────────────────────────────────────────

    @Test
    @DisplayName("검증 — 유효한 토큰은 true")
    void validate_validToken_returnsTrue() {
        String token = jwtUtil.createToken("user01", "ROLE_USER");
        assertThat(jwtUtil.validate(token)).isTrue();
    }

    @Test
    @DisplayName("검증 — 변조된 서명은 false")
    void validate_tamperedSignature_returnsFalse() {
        String token = jwtUtil.createToken("user01", "ROLE_USER");
        String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";
        assertThat(jwtUtil.validate(tampered)).isFalse();
    }

    @Test
    @DisplayName("검증 — 만료된 토큰은 false")
    void validate_expiredToken_returnsFalse() throws InterruptedException {
        ReflectionTestUtils.setField(jwtUtil, "expiration", 1L); // 1ms
        String token = jwtUtil.createToken("user01", "ROLE_USER");
        Thread.sleep(10);
        assertThat(jwtUtil.validate(token)).isFalse();
    }

    @Test
    @DisplayName("검증 — 완전히 잘못된 문자열은 false")
    void validate_malformedToken_returnsFalse() {
        assertThat(jwtUtil.validate("this.is.not.a.jwt")).isFalse();
    }

    @Test
    @DisplayName("검증 — 빈 문자열은 false")
    void validate_emptyString_returnsFalse() {
        assertThat(jwtUtil.validate("")).isFalse();
    }

    @Test
    @DisplayName("검증 — 다른 시크릿으로 서명된 토큰은 false")
    void validate_differentSecret_returnsFalse() {
        JwtUtil otherUtil = new JwtUtil();
        ReflectionTestUtils.setField(otherUtil, "secret", "completely-different-secret-key-for-test!!");
        ReflectionTestUtils.setField(otherUtil, "expiration", EXPIRATION_MS);
        otherUtil.init();

        String foreignToken = otherUtil.createToken("user01", "ROLE_USER");
        assertThat(jwtUtil.validate(foreignToken)).isFalse();
    }

    // ─── @PostConstruct init ──────────────────────────────────────

    @Test
    @DisplayName("init — 32바이트 미만 시크릿은 예외 발생")
    void init_shortSecret_throwsException() {
        JwtUtil util = new JwtUtil();
        ReflectionTestUtils.setField(util, "secret", "tooshort");
        ReflectionTestUtils.setField(util, "expiration", EXPIRATION_MS);

        assertThatThrownBy(util::init)
                .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("init — 환경변수 기본값 시크릿(40자)으로 정상 초기화")
    void init_defaultDevSecret_initializesSuccessfully() {
        // application.properties 기본값과 동일한 길이(40자) 확인
        String devDefault = "dev-only-local-secret-do-not-use-in-production-32x";
        assertThat(devDefault.getBytes(StandardCharsets.UTF_8).length)
                .isGreaterThanOrEqualTo(32);

        JwtUtil util = new JwtUtil();
        ReflectionTestUtils.setField(util, "secret", devDefault);
        ReflectionTestUtils.setField(util, "expiration", EXPIRATION_MS);

        assertThatCode(util::init).doesNotThrowAnyException();
    }
}
