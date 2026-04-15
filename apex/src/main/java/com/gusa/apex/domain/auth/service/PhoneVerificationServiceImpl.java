package com.gusa.apex.domain.auth.service;

import com.gusa.apex.global.exception.CustomException;
import com.gusa.apex.global.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class PhoneVerificationServiceImpl implements PhoneVerificationService {

    private static final int EXPIRY_MINUTES = 5;

    private final Map<String, VerificationEntry> store = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    @Override
    public void sendCode(String phoneNumber) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        store.put(phoneNumber, new VerificationEntry(code, LocalDateTime.now().plusMinutes(EXPIRY_MINUTES)));

        log.info("인증 코드 발송: phoneNumber={}****", phoneNumber.substring(0, Math.min(phoneNumber.length(), 7)));
        // TODO: 실제 서비스에서는 SMS API(NHN Toast, Twilio 등)로 발송
    }

    @Override
    public void verifyCode(String phoneNumber, String code) {
        VerificationEntry entry = store.get(phoneNumber);

        if (entry == null || LocalDateTime.now().isAfter(entry.expiresAt())) {
            store.remove(phoneNumber);
            log.warn("인증 코드 만료 또는 없음: phoneNumber={}****", phoneNumber.substring(0, Math.min(phoneNumber.length(), 7)));
            throw new CustomException(ErrorCode.VERIFICATION_CODE_EXPIRED);
        }

        if (!entry.code().equals(code)) {
            log.warn("인증 코드 불일치: phoneNumber={}****", phoneNumber.substring(0, Math.min(phoneNumber.length(), 7)));
            throw new CustomException(ErrorCode.INVALID_VERIFICATION_CODE);
        }

        store.remove(phoneNumber);
        log.info("휴대폰 인증 성공: phoneNumber={}****", phoneNumber.substring(0, Math.min(phoneNumber.length(), 7)));
    }

    private record VerificationEntry(String code, LocalDateTime expiresAt) {}

}
