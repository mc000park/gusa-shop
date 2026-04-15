package com.gusa.apex.domain.user.service;

import com.gusa.apex.domain.user.dto.*;

public interface UserService {

    UserResponse userRegister(UserRequest userRequest);

    UserProfileResponse getMyProfile(String userId);

    UserProfileResponse updateMyProfile(String userId, UserUpdateRequest request);

    UserPageResponse getUsers(String keyword, String grade, Boolean enabled, int page, int size);

    UserAdminResponse updateUser(Long id, UserAdminUpdateRequest request);

    void deleteUser(Long id);
}
