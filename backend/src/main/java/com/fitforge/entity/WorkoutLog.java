package com.fitforge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Getter @Setter @NoArgsConstructor
public class WorkoutLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long userId;
    @Column(name = "log_date", nullable = false) private LocalDate logDate;
    private int durationMinutes;
    private String title;
    @OneToMany(mappedBy = "log", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<LogEntry> entries = new ArrayList<>();
}
