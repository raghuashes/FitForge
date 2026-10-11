package com.fitforge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Getter @Setter @NoArgsConstructor
public class Profile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private Long userId;
    @Enumerated(EnumType.STRING) private Goal goal;
    @Enumerated(EnumType.STRING) private Experience experience;
    private double heightCm;
    private double weightKg;
    private int daysPerWeek;
    private int calorieTarget;
    private int proteinTarget;
}
