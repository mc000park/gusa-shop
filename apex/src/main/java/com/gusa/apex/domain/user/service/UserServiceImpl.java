package com.gusa.apex.domain.user.service;

import com.gusa.apex.domain.user.dto.*;
import com.gusa.apex.domain.user.entity.User;
import com.gusa.apex.domain.user.repository.UserRepository;
import com.gusa.apex.global.exception.CustomException;
import com.gusa.apex.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse userRegister(UserRequest userRequest) {
        log.info("회원가입 시도: userId={}", userRequest.getUserId());

        if (userRepository.existsByUserId(userRequest.getUserId())) {
            log.warn("회원가입 실패 - 중복 아이디: userId={}", userRequest.getUserId());
            throw new CustomException(ErrorCode.DUPLICATE_USER_ID);
        }

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            log.warn("회원가입 실패 - 중복 이메일: userId={}", userRequest.getUserId());
            throw new CustomException(ErrorCode.DUPLICATE_USER);
        }

        if (userRepository.existsByPhoneNumber(userRequest.getPhoneNumber())) {
            log.warn("회원가입 실패 - 중복 전화번호: userId={}", userRequest.getUserId());
            throw new CustomException(ErrorCode.DUPLICATE_PHONE);
        }

        User user = User.builder()
                .userId(userRequest.getUserId())
                .password(passwordEncoder.encode(userRequest.getPassword()))
                .userName(userRequest.getUserName())
                .email(userRequest.getEmail())
                .phoneNumber(userRequest.getPhoneNumber())
                .zipCode(userRequest.getZipCode())
                .address(userRequest.getAddress())
                .addressDetail(userRequest.getAddressDetail())
                .role("ROLE_USER")
                .grade(userRequest.getGrade())
                .build();

        userRepository.save(user);

        log.info("회원가입 완료: userId={}", user.getUserId());
        return UserResponse.from(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateMyProfile(String userId, UserUpdateRequest request) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        user.updateProfile(
                request.getUserName(),
                request.getEmail(),
                request.getPhoneNumber(),
                request.getZipCode(),
                request.getAddress(),
                request.getAddressDetail()
        );

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                log.warn("비밀번호 변경 실패 - 현재 비밀번호 불일치: userId={}", userId);
                throw new CustomException(ErrorCode.INVALID_PASSWORD);
            }
            user.changePassword(passwordEncoder.encode(request.getNewPassword()));
            log.info("비밀번호 변경 완료: userId={}", userId);
        }

        log.info("회원 정보 수정 완료: userId={}", userId);
        return UserProfileResponse.from(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return UserProfileResponse.from(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserPageResponse getUsers(String keyword, String grade, Boolean enabled, int page, int size) {
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String gr = (grade != null && !grade.isBlank()) ? grade : null;

        Page<User> result = userRepository.searchUsers(kw, gr, enabled, PageRequest.of(page, size));
        List<UserAdminResponse> content = result.getContent().stream()
                .map(UserAdminResponse::from)
                .toList();

        return UserPageResponse.builder()
                .content(content)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .page(page)
                .size(size)
                .build();
    }

    @Override
    @Transactional
    public UserAdminResponse updateUser(Long id, UserAdminUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.update(request.getUserName(), request.getEmail(),
                    request.getPhoneNumber(), request.getGrade(), request.isEnabled());
        log.info("관리자 - 회원 정보 수정: userId={}, id={}", user.getUserId(), id);
        return UserAdminResponse.from(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
        log.info("관리자 - 회원 삭제: userId={}, id={}", user.getUserId(), id);
    }
}
