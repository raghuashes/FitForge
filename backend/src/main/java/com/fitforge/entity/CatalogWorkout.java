package com.fitforge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity @Getter @Setter @NoArgsConstructor
public class CatalogWorkout {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String title;
    @Column(length = 500) private String description;
    @Enumerated(EnumType.STRING) private Location location;
    private String category;
    @Enumerated(EnumType.STRING) private Experience level;
    private int durationMinutes;
    private int caloriesBurned;
    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    private List<CatalogStep> steps = new ArrayList<>();
}
