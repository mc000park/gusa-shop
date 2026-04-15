package com.gusa.apex.domain.auth.service;

public interface PhoneVerificationService {

    /** 인증번호를 생성하고 SMS로 발송합니다. */
    void sendCode(String phoneNumber);

    /** 인증번호가 올바른지 검증합니다. */
    void verifyCode(String phoneNumber, String code);

}
