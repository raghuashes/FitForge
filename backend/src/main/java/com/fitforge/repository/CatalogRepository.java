package com.fitforge.repository;

import com.fitforge.entity.CatalogWorkout;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CatalogRepository extends JpaRepository<CatalogWorkout, Long> {
    List<CatalogWorkout> findAllByOrderByIdAsc();
}
