package com.fitforge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Getter @Setter @NoArgsConstructor
public class PlanItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "plan_id") private WorkoutPlan plan;
    @ManyToOne(optional = false) @JoinColumn(name = "exercise_id") private Exercise exercise;
    private String dayOfWeek;
    private int sets;
    private int reps;
    private int restSeconds;
    private int minutes;
    private Integer weekNo = 1;
    public int getWeekNo() { return weekNo == null ? 1 : weekNo; }
    @Column(length = 200) private String note;
}
