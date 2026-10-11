package com.fitforge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Getter @Setter @NoArgsConstructor
public class Exercise {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String muscleGroup;
    private String equipment;
    public Exercise(String name, String muscleGroup, String equipment) {
        this.name = name; this.muscleGroup = muscleGroup; this.equipment = equipment;
    }
}
