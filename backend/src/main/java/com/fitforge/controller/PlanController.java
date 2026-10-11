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
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {
    private final com.fitforge.service.PlanService plans;

    @GetMapping public List<PlanRes> list(@AuthenticationPrincipal Long uid) { return plans.list(uid); }

    @GetMapping("/{id}")
    public PlanRes get(@AuthenticationPrincipal Long uid, @PathVariable("id") Long id) { return plans.get(uid, id); }

    @PostMapping
    public PlanRes create(@AuthenticationPrincipal Long uid, @Valid @RequestBody PlanReq r) { return plans.create(uid, r); }

    @PostMapping("/{id}/swap")
    public PlanRes swap(@AuthenticationPrincipal Long uid, @PathVariable("id") Long id, @Valid @RequestBody SwapReq r) {
        return plans.swap(uid, id, r);
    }

    @PostMapping("/smart")
    public PlanRes smart(@AuthenticationPrincipal Long uid, @Valid @RequestBody SmartReq r) { return plans.smart(uid, r); }

    @PostMapping("/generate")
    public PlanRes generate(@AuthenticationPrincipal Long uid) { return plans.generate(uid); }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal Long uid, @PathVariable("id") Long id) { plans.delete(uid, id); }
}
