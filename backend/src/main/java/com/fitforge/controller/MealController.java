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
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class MealController {
    private final com.fitforge.repository.MealRepository repo;
    private final com.fitforge.service.ProfileService profiles;

    private MealRes res(com.fitforge.entity.Meal m) {
        return new MealRes(m.getId(), m.getMealDate(), m.getMealType(), m.getFoodName(),
                m.getCalories(), m.getProtein(), m.getCarbs(), m.getFat());
    }

    @GetMapping
    public List<MealRes> list(@AuthenticationPrincipal Long uid,
                              @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return repo.findByUserIdAndMealDateOrderByIdAsc(uid, date).stream().map(this::res).toList();
    }

    @PostMapping
    public MealRes add(@AuthenticationPrincipal Long uid, @Valid @RequestBody MealReq r) {
        var m = new com.fitforge.entity.Meal();
        m.setUserId(uid);
        m.setMealDate(r.date());
        m.setMealType(r.mealType());
        m.setFoodName(r.foodName().trim());
        m.setCalories(r.calories());
        m.setProtein(r.protein());
        m.setCarbs(r.carbs());
        m.setFat(r.fat());
        return res(repo.save(m));
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal Long uid, @PathVariable("id") Long id) {
        repo.delete(repo.findByIdAndUserId(id, uid).orElseThrow(() ->
                new com.fitforge.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Meal not found")));
    }

    @GetMapping("/summary")
    public MealSummary summary(@AuthenticationPrincipal Long uid,
                               @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        var ms = repo.findByUserIdAndMealDateOrderByIdAsc(uid, date);
        var p = profiles.getOrCreate(uid);
        // Fat ~25% of calories; carbs fill the rest after protein and fat.
        int fatT = (int) Math.round(p.getCalorieTarget() * 0.25 / 9);
        int carbT = Math.max(0, (p.getCalorieTarget() - p.getProteinTarget() * 4 - fatT * 9) / 4);
        return new MealSummary(date,
                ms.stream().mapToInt(com.fitforge.entity.Meal::getCalories).sum(),
                ms.stream().mapToDouble(com.fitforge.entity.Meal::getProtein).sum(),
                ms.stream().mapToDouble(com.fitforge.entity.Meal::getCarbs).sum(),
                ms.stream().mapToDouble(com.fitforge.entity.Meal::getFat).sum(),
                p.getCalorieTarget(), p.getProteinTarget(), carbT, fatT);
    }
}
