package com.fitforge.controller;

import com.fitforge.dto.Dtos.DietPlan;
import com.fitforge.dto.Dtos.RecipeRes;
import com.fitforge.service.DietService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diet")
@RequiredArgsConstructor
public class DietController {
    private final DietService diet;

    @GetMapping("/plans")
    public List<DietPlan> plans(@AuthenticationPrincipal Long uid) { return diet.plans(uid); }

    @GetMapping("/recipes")
    public List<RecipeRes> recipes(@RequestParam(value = "goal", required = false) String goal) {
        return diet.recipes(goal);
    }
}
