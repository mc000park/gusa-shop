package com.gusa.apex.domain.auth.service;

import com.gusa.apex.domain.auth.dto.AuthRequest;
import com.gusa.apex.domain.auth.dto.AuthTokenPair;

public interface AuthService {

    AuthTokenPair login(AuthRequest authRequest);

    AuthTokenPair adminLogin(AuthRequest authRequest);

    AuthTokenPair refresh(String refreshToken);
}
