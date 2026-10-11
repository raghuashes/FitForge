package com.fitforge.dto;

import com.fitforge.entity.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public class Dtos {
    private Dtos() {}

    public record RegisterReq(@NotBlank String name, @NotBlank @Email String email,
                              @NotBlank @Size(min = 6, message = "must be at least 6 characters") String password) {}
    public record LoginReq(@NotBlank String email, @NotBlank String password) {}
    public record AuthRes(String token, Long id, String name, String email) {}

    public record ProfileDto(@NotNull Goal goal, @NotNull Experience experience,
                             @NotNull @Positive Double heightCm, @NotNull @Positive Double weightKg,
                             @NotNull @Min(1) @Max(7) Integer daysPerWeek,
                             @NotNull @Min(500) Integer calorieTarget, @NotNull @Min(10) Integer proteinTarget) {}

    public record ExerciseDto(Long id, String name, String muscleGroup, String equipment) {}

    public record PlanItemReq(@NotNull Long exerciseId, @NotBlank String dayOfWeek,
                              @Min(1) int sets, @Min(1) int reps, @Min(0) int restSeconds) {}
    public record PlanReq(@NotBlank String name, @NotBlank String goal, @NotEmpty @Valid List<PlanItemReq> items) {}
    public record PlanItemRes(Long id, Long exerciseId, String exerciseName, String muscleGroup,
                              String dayOfWeek, int sets, int reps, int restSeconds, int minutes, String note, int weekNo) {}
    public record PlanRes(Long id, String name, String goal, LocalDate createdOn, String notes, List<PlanItemRes> items) {}

    public record LogEntryReq(@NotNull Long exerciseId, @Min(1) int sets, @Min(1) int reps, @PositiveOrZero double weightKg) {}
    public record WorkoutReq(@NotNull LocalDate date, @Min(1) int durationMinutes,
                             @NotEmpty @Valid List<LogEntryReq> entries) {}
    public record LogEntryRes(Long id, Long exerciseId, String exerciseName, int sets, int reps, double weightKg) {}
    public record WorkoutRes(Long id, LocalDate date, String title, int durationMinutes, List<LogEntryRes> entries) {}

    public record CatalogStepRes(int order, Long exerciseId, String name, String muscleGroup, int sets, int reps,
                                 int durationSeconds, int restSeconds, String tip) {}
    public record CatalogRes(Long id, String title, String description, Location location, String category,
                             Experience level, int durationMinutes, int caloriesBurned, int exerciseCount,
                             List<CatalogStepRes> steps) {}
    public record CompleteReq(@NotNull LocalDate date, @Min(1) int durationMinutes) {}
    public record PersonalBest(String exerciseName, double weightKg) {}

    public record MealReq(@NotNull LocalDate date, @NotNull MealType mealType, @NotBlank String foodName,
                          @Min(0) int calories, @PositiveOrZero double protein,
                          @PositiveOrZero double carbs, @PositiveOrZero double fat) {}
    public record MealRes(Long id, LocalDate date, MealType mealType, String foodName,
                          int calories, double protein, double carbs, double fat) {}
    public record MealSummary(LocalDate date, int calories, double protein, double carbs, double fat,
                              int calorieTarget, int proteinTarget, int carbTarget, int fatTarget) {}

    public record WeightReq(@NotNull LocalDate date, @NotNull @Positive Double kg,
                            @DecimalMin("3.0") @DecimalMax("60.0") Double bodyFat) {}
    public record WeightRes(Long id, LocalDate date, double kg, Double bodyFat) {}

    public record SmartReq(@NotNull Goal goal, @NotNull Experience experience,
                           @NotNull @Positive Double weightKg, @NotNull @Min(1) @Max(7) Integer daysPerWeek) {}

    public record DietMeal(String name, String mealType, String time, int calories, int protein, String veg, String nonVeg, String rich) {}
    public record Micro(String name, String target, String why, String sources) {}
    public record DietPlan(String goal, String title, String summary, double weightKg, int calories, int protein,
                           int carbs, int fat, List<String> tips, List<Micro> micros, List<DietMeal> meals) {}
    public record RecipeRes(String name, String emoji, int calories, int protein, int carbs, int fat, int minutes,
                            String diet, String goal, String rich, String about) {}
    public record SwapReq(@NotBlank String from, @NotBlank String to, Integer week) {}

    public record DayCalories(LocalDate date, int calories) {}
    public record Dashboard(int workouts7, int workouts30, int streak, List<WeightRes> weightTrend,
                            int todayCalories, double todayProtein, int calorieTarget, int proteinTarget,
                            List<DayCalories> caloriesLast7, List<WorkoutRes> recentWorkouts) {}
}
