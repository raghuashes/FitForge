package com.fitforge.repository;

import com.fitforge.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface WeightRepository extends JpaRepository<WeightEntry, Long> {
    List<WeightEntry> findByUserIdOrderByEntryDateAscIdAsc(Long userId);
    List<WeightEntry> findTop30ByUserIdOrderByEntryDateDescIdDesc(Long userId);
    Optional<WeightEntry> findByIdAndUserId(Long id, Long userId);
}
