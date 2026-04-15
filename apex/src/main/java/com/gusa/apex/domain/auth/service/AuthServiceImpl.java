package com.gusa.apex.domain.auth.service;

import com.gusa.apex.domain.auth.dto.AuthRequest;
import com.gusa.apex.domain.auth.dto.AuthTokenPair;
import com.gusa.apex.domain.user.entity.User;
import com.gusa.apex.domain.user.repository.UserRepository;
import com.gusa.apex.global.exception.CustomException;
import com.gusa.apex.global.exception.ErrorCode;
import com.gusa.apex.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public AuthTokenPair login(AuthRequest authRequest) {
        log.info("로그인 시도: userId={}", authRequest.getUserId());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUserId(), authRequest.getUserPw())
        );

        User user = userRepository.findByUserId(authRequest.getUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        log.info("로그인 성공: userId={}, role={}", user.getUserId(), user.getRole());

        return new AuthTokenPair(
                jwtUtil.createToken(user.getUserId(), user.getRole()),
                jwtUtil.createRefreshToken(user.getUserId())
        );
    }

    @Override
    public AuthTokenPair adminLogin(AuthRequest authRequest) {
        log.info("관리자 로그인 시도: userId={}", authRequest.getUserId());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUserId(), authRequest.getUserPw())
        );

        User user = userRepository.findByUserId(authRequest.getUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!"ROLE_ADMIN".equals(user.getRole())) {
            log.warn("관리자 로그인 거부 - 권한 없음: userId={}, role={}", user.getUserId(), user.getRole());
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        log.info("관리자 로그인 성공: userId={}", user.getUserId());

        return new AuthTokenPair(
                jwtUtil.createToken(user.getUserId(), user.getRole()),
                jwtUtil.createRefreshToken(user.getUserId())
        );
    }

    @Override
    public AuthTokenPair refresh(String refreshToken) {
        if (!jwtUtil.validateRefreshToken(refreshToken)) {
            log.warn("토큰 갱신 실패 - 유효하지 않은 리프레시 토큰");
            throw new CustomException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        String userId = jwtUtil.getUserIdFromRefreshToken(refreshToken);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        log.debug("토큰 갱신 완료: userId={}", user.getUserId());

        return new AuthTokenPair(
                jwtUtil.createToken(user.getUserId(), user.getRole()),
                jwtUtil.createRefreshToken(user.getUserId())
        );
    }
}
