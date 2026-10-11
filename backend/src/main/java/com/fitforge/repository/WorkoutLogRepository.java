package com.fitforge.repository;

import com.fitforge.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByUserIdOrderByLogDateDescIdDesc(Long userId);
    Optional<WorkoutLog> findByIdAndUserId(Long id, Long userId);
    List<WorkoutLog> findByUserIdAndLogDateBetween(Long userId, LocalDate from, LocalDate to);
    List<WorkoutLog> findTop5ByUserIdOrderByLogDateDescIdDesc(Long userId);

    @Query("select distinct l.logDate from WorkoutLog l where l.userId = :uid")
    List<LocalDate> findDistinctDates(@Param("uid") Long uid);

    @Query("select e.exercise.name, max(e.weightKg) from LogEntry e where e.log.userId = :uid group by e.exercise.name order by e.exercise.name")
    List<Object[]> personalBests(@Param("uid") Long uid);
}
