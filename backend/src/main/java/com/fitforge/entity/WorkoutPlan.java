package com.fitforge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Getter @Setter @NoArgsConstructor
public class WorkoutPlan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false) private String name;
    private String goal;
    private LocalDate createdOn;
    @Column(length = 600) private String notes;
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<PlanItem> items = new ArrayList<>();
}
