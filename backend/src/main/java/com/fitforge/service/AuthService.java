package com.fitforge.service;

import com.fitforge.dto.Dtos.*;
import com.fitforge.entity.User;
import com.fitforge.exception.ApiException;
import com.fitforge.repository.UserRepository;
import com.fitforge.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthRes register(RegisterReq r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        User u = new User();
        u.setName(r.name().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(r.password()));
        users.save(u);
        return res(u);
    }

    public AuthRes login(LoginReq r) {
        User u = users.findByEmail(r.email().trim().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!encoder.matches(r.password(), u.getPasswordHash()))
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        return res(u);
    }

    private AuthRes res(User u) { return new AuthRes(jwt.generate(u), u.getId(), u.getName(), u.getEmail()); }
}
