package com.fitforge.repository;

import com.fitforge.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface MealRepository extends JpaRepository<Meal, Long> {
    List<Meal> findByUserIdAndMealDateOrderByIdAsc(Long userId, LocalDate date);
    List<Meal> findByUserIdAndMealDateBetween(Long userId, LocalDate from, LocalDate to);
    Optional<Meal> findByIdAndUserId(Long id, Long userId);
}
