package com.fitforge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Getter @Setter @NoArgsConstructor
public class LogEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "log_id") private WorkoutLog log;
    @ManyToOne(optional = false) @JoinColumn(name = "exercise_id") private Exercise exercise;
    private int sets;
    private int reps;
    private double weightKg;
}
