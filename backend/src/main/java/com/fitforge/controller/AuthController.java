package com.fitforge.controller;

import com.fitforge.dto.Dtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final com.fitforge.service.AuthService auth;

    @PostMapping("/register")
    public AuthRes register(@Valid @RequestBody RegisterReq r) { return auth.register(r); }

    @PostMapping("/login")
    public AuthRes login(@Valid @RequestBody LoginReq r) { return auth.login(r); }
}
