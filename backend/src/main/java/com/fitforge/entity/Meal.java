package com.fitforge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Getter @Setter @NoArgsConstructor
public class Meal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long userId;
    @Column(name = "meal_date", nullable = false) private LocalDate mealDate;
    @Enumerated(EnumType.STRING) private MealType mealType;
    @Column(nullable = false) private String foodName;
    private int calories;
    private double protein;
    private double carbs;
    private double fat;
}
