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
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final com.fitforge.service.ProfileService profiles;

    @GetMapping
    public ProfileDto get(@AuthenticationPrincipal Long uid) { return profiles.get(uid); }

    @PutMapping
    public ProfileDto update(@AuthenticationPrincipal Long uid, @Valid @RequestBody ProfileDto d) {
        return profiles.update(uid, d);
    }
}
