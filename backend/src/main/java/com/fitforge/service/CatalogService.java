package com.fitforge.service;

import com.fitforge.dto.Dtos.*;
import com.fitforge.entity.*;
import com.fitforge.exception.ApiException;
import com.fitforge.repository.CatalogRepository;
import com.fitforge.repository.WorkoutLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CatalogService {
    private final CatalogRepository repo;
    private final WorkoutLogRepository logs;
    private final WorkoutService workouts;

    @Transactional(readOnly = true)
    public List<CatalogRes> list(Location loc, String category, Experience level) {
        return repo.findAllByOrderByIdAsc().stream()
                .filter(w -> loc == null || w.getLocation() == loc)
                .filter(w -> category == null || category.isBlank() || w.getCategory().equalsIgnoreCase(category))
                .filter(w -> level == null || w.getLevel() == level)
                .map(w -> toRes(w, false)).toList();
    }

    @Transactional(readOnly = true)
    public CatalogRes get(Long id) { return toRes(find(id), true); }

    public WorkoutRes complete(Long uid, Long id, CompleteReq r) {
        CatalogWorkout w = find(id);
        WorkoutLog l = new WorkoutLog();
        l.setUserId(uid);
        l.setLogDate(r.date());
        l.setDurationMinutes(r.durationMinutes());
        l.setTitle(w.getTitle() + (w.getLocation() == Location.HOME ? " (Home)" : " (Gym)"));
        for (CatalogStep s : w.getSteps()) {
            LogEntry e = new LogEntry();
            e.setLog(l);
            e.setExercise(s.getExercise());
            e.setSets(s.getSets());
            e.setReps(s.getReps() > 0 ? s.getReps() : 1);
            e.setWeightKg(0);
            l.getEntries().add(e);
        }
        return workouts.toRes(logs.save(l));
    }

    private CatalogWorkout find(Long id) {
        return repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Workout not found"));
    }

    private CatalogRes toRes(CatalogWorkout w, boolean withSteps) {
        List<CatalogStepRes> steps = withSteps
                ? w.getSteps().stream().map(s -> new CatalogStepRes(s.getStepOrder(), s.getExercise().getId(),
                    s.getExercise().getName(), s.getExercise().getMuscleGroup(), s.getSets(), s.getReps(),
                    s.getDurationSeconds(), s.getRestSeconds(), s.getTip())).toList()
                : List.of();
        return new CatalogRes(w.getId(), w.getTitle(), w.getDescription(), w.getLocation(), w.getCategory(),
                w.getLevel(), w.getDurationMinutes(), w.getCaloriesBurned(), w.getSteps().size(), steps);
    }
}
