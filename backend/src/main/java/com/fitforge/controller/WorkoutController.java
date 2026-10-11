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
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {
    private final com.fitforge.service.WorkoutService workouts;

    @GetMapping public List<WorkoutRes> list(@AuthenticationPrincipal Long uid) { return workouts.list(uid); }

    @PostMapping
    public WorkoutRes create(@AuthenticationPrincipal Long uid, @Valid @RequestBody WorkoutReq r) { return workouts.create(uid, r); }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal Long uid, @PathVariable("id") Long id) { workouts.delete(uid, id); }

    @GetMapping("/personal-bests")
    public List<PersonalBest> bests(@AuthenticationPrincipal Long uid) { return workouts.personalBests(uid); }
}
