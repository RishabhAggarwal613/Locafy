package com.locafy.auth.dto;

import com.locafy.user.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GoogleAuthRequest {

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    @NotNull(message = "Role is required")
    private User.Role role;
}
