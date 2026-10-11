package com.fitforge.service;

import com.fitforge.dto.Dtos.*;
import com.fitforge.entity.*;
import com.fitforge.exception.ApiException;
import com.fitforge.repository.ExerciseRepository;
import com.fitforge.repository.WorkoutLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkoutService {
    private final WorkoutLogRepository logs;
    private final ExerciseRepository exercises;

    @Transactional(readOnly = true)
    public List<WorkoutRes> list(Long uid) {
        return logs.findByUserIdOrderByLogDateDescIdDesc(uid).stream().map(this::toRes).toList();
    }

    public WorkoutRes create(Long uid, WorkoutReq r) {
        WorkoutLog l = new WorkoutLog();
        l.setUserId(uid);
        l.setLogDate(r.date());
        l.setDurationMinutes(r.durationMinutes());
        for (LogEntryReq e : r.entries()) {
            Exercise ex = exercises.findById(e.exerciseId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Unknown exercise"));
            LogEntry le = new LogEntry();
            le.setLog(l);
            le.setExercise(ex);
            le.setSets(e.sets());
            le.setReps(e.reps());
            le.setWeightKg(e.weightKg());
            l.getEntries().add(le);
        }
        return toRes(logs.save(l));
    }

    public void delete(Long uid, Long id) {
        logs.delete(logs.findByIdAndUserId(id, uid)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Workout not found")));
    }

    @Transactional(readOnly = true)
    public List<PersonalBest> personalBests(Long uid) {
        return logs.personalBests(uid).stream()
                .map(o -> new PersonalBest((String) o[0], ((Number) o[1]).doubleValue())).toList();
    }

    public WorkoutRes toRes(WorkoutLog l) {
        List<LogEntryRes> es = l.getEntries().stream().map(e -> new LogEntryRes(e.getId(),
                e.getExercise().getId(), e.getExercise().getName(), e.getSets(), e.getReps(), e.getWeightKg())).toList();
        return new WorkoutRes(l.getId(), l.getLogDate(), l.getTitle(), l.getDurationMinutes(), es);
    }
}
