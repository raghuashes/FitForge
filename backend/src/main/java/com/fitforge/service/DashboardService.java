package com.fitforge.service;

import com.fitforge.dto.Dtos.*;
import com.fitforge.entity.*;
import com.fitforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final WorkoutLogRepository logs;
    private final MealRepository meals;
    private final WeightRepository weights;
    private final ProfileService profiles;
    private final WorkoutService workoutService;

    @Transactional
    public Dashboard build(Long uid, LocalDate today) {
        LocalDate from7 = today.minusDays(6);
        LocalDate from30 = today.minusDays(29);

        List<WorkoutLog> last30 = logs.findByUserIdAndLogDateBetween(uid, from30, today);
        int w30 = last30.size();
        int w7 = (int) last30.stream().filter(l -> !l.getLogDate().isBefore(from7)).count();

        Set<LocalDate> dates = new HashSet<>(logs.findDistinctDates(uid));
        LocalDate cur = dates.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        while (dates.contains(cur)) { streak++; cur = cur.minusDays(1); }

        List<WeightEntry> wl = new ArrayList<>(weights.findTop30ByUserIdOrderByEntryDateDescIdDesc(uid));
        Collections.reverse(wl);
        List<WeightRes> trend = wl.stream().map(w -> new WeightRes(w.getId(), w.getEntryDate(), w.getKg(), w.getBodyFat())).toList();

        List<Meal> ms = meals.findByUserIdAndMealDateBetween(uid, from7, today);
        Map<LocalDate, Integer> cal = new HashMap<>();
        for (Meal m : ms) cal.merge(m.getMealDate(), m.getCalories(), Integer::sum);
        List<DayCalories> days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            days.add(new DayCalories(d, cal.getOrDefault(d, 0)));
        }
        double protein = ms.stream().filter(m -> m.getMealDate().equals(today)).mapToDouble(Meal::getProtein).sum();

        Profile p = profiles.getOrCreate(uid);
        List<WorkoutRes> recent = logs.findTop5ByUserIdOrderByLogDateDescIdDesc(uid).stream()
                .map(workoutService::toRes).toList();

        return new Dashboard(w7, w30, streak, trend, cal.getOrDefault(today, 0), protein,
                p.getCalorieTarget(), p.getProteinTarget(), days, recent);
    }
}
