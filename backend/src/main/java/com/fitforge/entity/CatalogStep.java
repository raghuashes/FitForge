package com.fitforge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity @Getter @Setter @NoArgsConstructor
public class CatalogStep {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "workout_id") private CatalogWorkout workout;
    @ManyToOne(optional = false) @JoinColumn(name = "exercise_id") private Exercise exercise;
    @Column(name = "step_order") private int stepOrder;
    private int sets;
    private int reps;
    private int durationSeconds;
    private int restSeconds;
    @Column(length = 300) private String tip;
}
