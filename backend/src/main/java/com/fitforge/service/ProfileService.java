package com.fitforge.service;

import com.fitforge.dto.Dtos.ProfileDto;
import com.fitforge.entity.*;
import com.fitforge.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ProfileRepository repo;

    @Transactional
    public Profile getOrCreate(Long uid) {
        return repo.findByUserId(uid).orElseGet(() -> {
            Profile p = new Profile();
            p.setUserId(uid);
            p.setGoal(Goal.GENERAL_FITNESS);
            p.setExperience(Experience.BEGINNER);
            p.setHeightCm(170);
            p.setWeightKg(70);
            p.setDaysPerWeek(3);
            p.setCalorieTarget(2000);
            p.setProteinTarget(100);
            return repo.save(p);
        });
    }

    @Transactional
    public ProfileDto get(Long uid) { return toDto(getOrCreate(uid)); }

    @Transactional
    public ProfileDto update(Long uid, ProfileDto d) {
        Profile p = getOrCreate(uid);
        p.setGoal(d.goal());
        p.setExperience(d.experience());
        p.setHeightCm(d.heightCm());
        p.setWeightKg(d.weightKg());
        p.setDaysPerWeek(d.daysPerWeek());
        p.setCalorieTarget(d.calorieTarget());
        p.setProteinTarget(d.proteinTarget());
        return toDto(repo.save(p));
    }

    private ProfileDto toDto(Profile p) {
        return new ProfileDto(p.getGoal(), p.getExperience(), p.getHeightCm(), p.getWeightKg(),
                p.getDaysPerWeek(), p.getCalorieTarget(), p.getProteinTarget());
    }
}
