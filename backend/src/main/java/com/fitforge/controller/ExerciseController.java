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
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {
    private final com.fitforge.repository.ExerciseRepository repo;

    @GetMapping
    public List<ExerciseDto> list() {
        return repo.findAllByOrderByNameAsc().stream()
                .map(e -> new ExerciseDto(e.getId(), e.getName(), e.getMuscleGroup(), e.getEquipment())).toList();
    }
}
