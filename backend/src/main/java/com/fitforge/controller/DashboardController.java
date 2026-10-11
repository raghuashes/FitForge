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
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final com.fitforge.service.DashboardService dashboard;

    @GetMapping
    public Dashboard get(@AuthenticationPrincipal Long uid,
                         @RequestParam(value = "today", required = false)
                         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate today) {
        return dashboard.build(uid, today != null ? today : LocalDate.now());
    }
}
