package com.fitforge.config;

import com.fitforge.entity.*;
import com.fitforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final ExerciseRepository exercises;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final ProfileRepository profiles;
    private final MealRepository meals;
    private final WorkoutLogRepository logs;
    private final WeightRepository weights;
    private final CatalogRepository catalog;
    private final Environment env;

    @Override
    public void run(String... args) {
        seedExercises();
        seedCatalog();
        if (env.acceptsProfiles(Profiles.of("dev"))) seedDemo();
    }

    private void seedExercises() {
        String[][] d = {
            {"Barbell Bench Press", "Chest", "Barbell"}, {"Incline Dumbbell Press", "Chest", "Dumbbells"},
            {"Push-Up", "Chest", "Bodyweight"}, {"Cable Fly", "Chest", "Cable"}, {"Chest Dip", "Chest", "Bodyweight"},
            {"Pull-Up", "Back", "Bodyweight"}, {"Barbell Row", "Back", "Barbell"}, {"Lat Pulldown", "Back", "Cable"},
            {"Seated Cable Row", "Back", "Cable"}, {"Deadlift", "Back", "Barbell"},
            {"Barbell Squat", "Legs", "Barbell"}, {"Leg Press", "Legs", "Machine"}, {"Lunges", "Legs", "Dumbbells"},
            {"Romanian Deadlift", "Legs", "Barbell"}, {"Calf Raise", "Legs", "Machine"},
            {"Overhead Press", "Shoulders", "Barbell"}, {"Lateral Raise", "Shoulders", "Dumbbells"},
            {"Face Pull", "Shoulders", "Cable"}, {"Arnold Press", "Shoulders", "Dumbbells"},
            {"Rear Delt Fly", "Shoulders", "Dumbbells"},
            {"Barbell Curl", "Biceps", "Barbell"}, {"Hammer Curl", "Biceps", "Dumbbells"},
            {"Tricep Pushdown", "Triceps", "Cable"}, {"Skull Crusher", "Triceps", "Barbell"},
            {"Overhead Tricep Extension", "Triceps", "Dumbbells"},
            {"Plank", "Core", "Bodyweight"}, {"Crunch", "Core", "Bodyweight"},
            {"Hanging Leg Raise", "Core", "Bodyweight"}, {"Russian Twist", "Core", "Bodyweight"},
            {"Cable Crunch", "Core", "Cable"},
            {"Jumping Jacks", "Cardio", "Bodyweight"}, {"Burpees", "Cardio", "Bodyweight"},
            {"Mountain Climbers", "Cardio", "Bodyweight"}, {"High Knees", "Cardio", "Bodyweight"},
            {"Squat Jumps", "Legs", "Bodyweight"}, {"Bodyweight Squat", "Legs", "Bodyweight"},
            {"Glute Bridge", "Legs", "Bodyweight"}, {"Wall Sit", "Legs", "Bodyweight"},
            {"Reverse Lunges", "Legs", "Bodyweight"}, {"Pike Push-Up", "Shoulders", "Bodyweight"},
            {"Chair Tricep Dips", "Triceps", "Chair"}, {"Bicycle Crunch", "Core", "Bodyweight"},
            {"Superman Hold", "Back", "Bodyweight"}, {"Side Plank", "Core", "Bodyweight"},
            {"Sun Salutation", "Yoga", "Mat"}, {"Downward Dog", "Yoga", "Mat"}, {"Warrior Pose", "Yoga", "Mat"},
            {"Cat-Cow Stretch", "Yoga", "Mat"}, {"Cobra Pose", "Yoga", "Mat"}, {"Child's Pose", "Yoga", "Mat"},
            {"Treadmill Run", "Cardio", "Treadmill"}, {"Rowing Machine", "Cardio", "Machine"},
            {"Kettlebell Swing", "Full Body", "Kettlebell"}, {"Dumbbell Thruster", "Full Body", "Dumbbells"},
            {"Battle Ropes", "Cardio", "Rope"}, {"Chest Press Machine", "Chest", "Machine"},
            {"Leg Curl", "Legs", "Machine"}, {"Dumbbell Shoulder Press", "Shoulders", "Dumbbells"},
            {"Hip Thrust", "Legs", "Barbell"},
            {"Dumbbell Curl", "Biceps", "Dumbbells"}, {"Preacher Curl", "Biceps", "Machine"},
            {"Close-Grip Bench Press", "Triceps", "Barbell"}, {"Pec Deck Fly", "Chest", "Machine"},
            {"Leg Extension", "Legs", "Machine"}
        };
        java.util.Set<String> have = new java.util.HashSet<>();
        for (Exercise x : exercises.findAll()) have.add(x.getName());
        for (String[] e : d) if (!have.contains(e[0])) exercises.save(new Exercise(e[0], e[1], e[2]));
        java.util.Map<String, String> want = new java.util.HashMap<>();
        for (String[] e : d) want.put(e[0], e[1]);
        for (Exercise x : exercises.findAll()) {
            String g = want.get(x.getName());
            if (g != null && !g.equals(x.getMuscleGroup())) { x.setMuscleGroup(g); exercises.save(x); }
        }
    }

    private void seedCatalog() {
        if (catalog.count() > 0) return;
        java.util.Map<String, Exercise> ex = new java.util.HashMap<>();
        for (Exercise x : exercises.findAll()) ex.putIfAbsent(x.getName(), x);
        Location H = Location.HOME, G = Location.GYM;
        Experience B = Experience.BEGINNER, I = Experience.INTERMEDIATE, A = Experience.ADVANCED;

        // step format: Exercise|sets|reps|durationSeconds|restSeconds|tip   (reps=0 means timed)
        add(ex, "10-Min Morning Burn", "A quick no-equipment cardio blast to wake up your body.", H, "HIIT", B, 10, 90,
            "Jumping Jacks|3|0|30|15|Land softly on the balls of your feet",
            "High Knees|3|0|30|15|Drive knees up to hip height",
            "Mountain Climbers|3|0|30|15|Keep hips low and core tight",
            "Bodyweight Squat|3|15|0|20|Chest up, knees track over toes");
        add(ex, "Full Body - No Equipment", "A complete strength session using just your bodyweight.", H, "Strength", I, 30, 220,
            "Bodyweight Squat|4|15|0|45|Sit back into your heels",
            "Push-Up|4|12|0|45|Keep your body in one straight line",
            "Reverse Lunges|3|12|0|45|Step back with control",
            "Glute Bridge|3|15|0|30|Squeeze at the top",
            "Plank|3|0|45|30|Brace your core, don't let hips sag",
            "Burpees|3|10|0|45|Move fast but stay controlled");
        add(ex, "Tabata Fat Burner", "20 seconds all-out, 10 seconds rest. Short, brutal and effective.", H, "HIIT", A, 20, 250,
            "Burpees|4|0|20|10|Give maximum effort",
            "Squat Jumps|4|0|20|10|Land softly, absorb through your hips",
            "Mountain Climbers|4|0|20|10|Fast feet, steady shoulders",
            "High Knees|4|0|20|10|Pump your arms");
        add(ex, "Core Crusher", "Build a strong, stable midsection in 15 minutes.", H, "Core", B, 15, 110,
            "Plank|3|0|40|20|Squeeze glutes and abs",
            "Bicycle Crunch|3|20|0|20|Slow and controlled, elbow to opposite knee",
            "Side Plank|2|0|30|20|Stack your feet and lift your hips",
            "Superman Hold|3|0|30|20|Lift arms and legs together",
            "Crunch|3|15|0|20|Don't pull on your neck");
        add(ex, "Morning Yoga Flow", "Gentle flow to loosen up and start the day calm.", H, "Yoga", B, 20, 80,
            "Cat-Cow Stretch|2|0|60|10|Match movement to your breath",
            "Sun Salutation|3|0|60|15|Flow smoothly between poses",
            "Downward Dog|2|0|45|10|Press the floor away, lengthen your spine",
            "Warrior Pose|2|0|45|10|Sink into your front knee",
            "Cobra Pose|2|0|30|10|Keep shoulders away from your ears",
            "Child's Pose|1|0|90|0|Breathe deeply and relax");
        add(ex, "Lower Body Home Blast", "Legs and glutes, no gym needed.", H, "Strength", I, 25, 200,
            "Bodyweight Squat|4|20|0|40|Full depth if mobility allows",
            "Reverse Lunges|3|12|0|40|Alternate legs",
            "Wall Sit|3|0|45|30|Thighs parallel to the floor",
            "Glute Bridge|4|15|0|30|Pause for a second at the top",
            "Calf Raise|3|20|0|30|Rise onto your toes slowly");
        add(ex, "Upper Body at Home", "Chest, shoulders, arms and back using bodyweight.", H, "Strength", I, 25, 180,
            "Push-Up|4|15|0|45|Lower until your chest nearly touches the floor",
            "Pike Push-Up|3|10|0|45|Hips high, head between your arms",
            "Chair Tricep Dips|3|12|0|45|Keep your back close to the chair",
            "Superman Hold|3|0|30|30|Squeeze your upper back",
            "Plank|3|0|45|30|Stay tight head to heels");
        add(ex, "Evening Stretch & Unwind", "Slow stretches to release tension before bed.", H, "Yoga", B, 15, 55,
            "Cat-Cow Stretch|2|0|60|10|Slow, deep breaths",
            "Child's Pose|2|0|60|10|Reach your arms forward",
            "Cobra Pose|2|0|30|10|Open your chest gently",
            "Downward Dog|2|0|45|10|Pedal your feet to stretch calves");

        add(ex, "Push Day - Chest, Shoulders, Triceps", "Classic push session for upper-body size and strength.", G, "Strength", I, 55, 320,
            "Barbell Bench Press|4|8|0|90|Control the bar down, drive up hard",
            "Incline Dumbbell Press|3|10|0|75|Full stretch at the bottom",
            "Overhead Press|3|8|0|90|Brace your core, don't lean back",
            "Lateral Raise|3|15|0|45|Lead with your elbows",
            "Tricep Pushdown|3|12|0|45|Keep elbows pinned to your sides");
        add(ex, "Pull Day - Back & Biceps", "Build a wide, thick back and strong arms.", G, "Strength", I, 55, 310,
            "Deadlift|3|5|0|120|Keep the bar close, neutral spine",
            "Lat Pulldown|4|10|0|75|Pull to your upper chest",
            "Barbell Row|4|8|0|90|Hinge forward, pull to your belly",
            "Face Pull|3|15|0|45|Pull towards your face, elbows high",
            "Barbell Curl|3|12|0|45|No swinging");
        add(ex, "Leg Day Destroyer", "Heavy lower-body session for serious lifters.", G, "Strength", A, 60, 380,
            "Barbell Squat|5|5|0|120|Brace hard and hit depth",
            "Romanian Deadlift|4|8|0|90|Push your hips back, feel the hamstrings",
            "Leg Press|4|12|0|90|Don't lock out your knees",
            "Leg Curl|3|12|0|60|Squeeze at the top",
            "Calf Raise|4|15|0|45|Pause at the top");
        add(ex, "Beginner Full Body Gym", "Learn the machines and build a strong base.", G, "Strength", B, 45, 250,
            "Leg Press|3|12|0|60|Feet shoulder-width, smooth reps",
            "Chest Press Machine|3|12|0|60|Adjust the seat so handles are at chest height",
            "Lat Pulldown|3|12|0|60|Pull elbows down and back",
            "Dumbbell Shoulder Press|3|10|0|60|Press straight up, don't arch",
            "Plank|3|0|30|45|Keep your core braced");
        add(ex, "Cardio Intervals", "Treadmill and rower intervals to build endurance.", G, "Cardio", I, 30, 300,
            "Treadmill Run|5|0|180|60|Run at a hard but steady pace",
            "Rowing Machine|4|0|120|60|Drive with legs first, then pull");
        add(ex, "Gym HIIT Circuit", "High-intensity circuit mixing kettlebells, ropes and rowing.", G, "HIIT", A, 35, 400,
            "Kettlebell Swing|4|15|0|30|Snap your hips, arms just guide",
            "Battle Ropes|4|0|30|30|Keep a strong athletic stance",
            "Dumbbell Thruster|4|12|0|30|Squat deep and press explosively",
            "Rowing Machine|3|0|60|30|Row fast and powerful");
        add(ex, "Glute & Hamstring Focus", "Strengthen and shape your posterior chain.", G, "Strength", I, 45, 260,
            "Hip Thrust|4|10|0|90|Pause and squeeze at the top",
            "Romanian Deadlift|3|10|0|90|Soft knees, flat back",
            "Leg Curl|3|12|0|60|Slow on the way back",
            "Lunges|3|12|0|60|Long step, upright torso");
        add(ex, "Arms & Core Pump", "Biceps, triceps and abs to finish your week.", G, "Strength", B, 40, 200,
            "Barbell Curl|3|12|0|45|Elbows by your sides",
            "Hammer Curl|3|12|0|45|Neutral grip, no swinging",
            "Tricep Pushdown|3|12|0|45|Full extension each rep",
            "Skull Crusher|3|10|0|60|Lower to your forehead slowly",
            "Hanging Leg Raise|3|10|0|45|Avoid swinging",
            "Cable Crunch|3|15|0|45|Curl your ribs towards your hips");
    }

    private void add(java.util.Map<String, Exercise> ex, String title, String desc, Location loc, String cat,
                     Experience lvl, int minutes, int kcal, String... steps) {
        CatalogWorkout w = new CatalogWorkout();
        w.setTitle(title);
        w.setDescription(desc);
        w.setLocation(loc);
        w.setCategory(cat);
        w.setLevel(lvl);
        w.setDurationMinutes(minutes);
        w.setCaloriesBurned(kcal);
        int order = 0;
        for (String s : steps) {
            String[] p = s.split("\\|", -1);
            Exercise e = ex.get(p[0]);
            if (e == null) continue;
            CatalogStep st = new CatalogStep();
            st.setWorkout(w);
            st.setExercise(e);
            st.setStepOrder(order++);
            st.setSets(Integer.parseInt(p[1]));
            st.setReps(Integer.parseInt(p[2]));
            st.setDurationSeconds(Integer.parseInt(p[3]));
            st.setRestSeconds(Integer.parseInt(p[4]));
            st.setTip(p.length > 5 ? p[5] : "");
            w.getSteps().add(st);
        }
        catalog.save(w);
    }

    private void seedDemo() {
        if (users.existsByEmail("demo@fitforge.com")) return;
        User u = new User();
        u.setName("Demo User");
        u.setEmail("demo@fitforge.com");
        u.setPasswordHash(encoder.encode("Demo@1234"));
        u = users.save(u);
        Long uid = u.getId();
        LocalDate today = LocalDate.now();

        Profile p = new Profile();
        p.setUserId(uid);
        p.setGoal(Goal.MUSCLE_GAIN);
        p.setExperience(Experience.INTERMEDIATE);
        p.setHeightCm(175);
        p.setWeightKg(78);
        p.setDaysPerWeek(4);
        p.setCalorieTarget(2400);
        p.setProteinTarget(140);
        profiles.save(p);

        for (int i = 29; i >= 0; i--) {
            WeightEntry w = new WeightEntry();
            w.setUserId(uid);
            w.setEntryDate(today.minusDays(i));
            w.setKg(Math.round((82.0 - (29 - i) * 0.13 + (i % 3) * 0.1) * 10) / 10.0);
            weights.save(w);
        }

        Object[][] foods = {
            {MealType.BREAKFAST, "Oats with milk and banana", 450, 22.0, 70.0, 9.0},
            {MealType.LUNCH, "Chicken rice bowl", 750, 45.0, 85.0, 20.0},
            {MealType.DINNER, "Paneer curry with roti", 700, 35.0, 65.0, 28.0},
            {MealType.SNACK, "Peanut butter toast", 300, 12.0, 30.0, 14.0}
        };
        for (int d = 0; d < 7; d++) {
            for (Object[] f : foods) {
                Meal m = new Meal();
                m.setUserId(uid);
                m.setMealDate(today.minusDays(d));
                m.setMealType((MealType) f[0]);
                m.setFoodName((String) f[1]);
                m.setCalories((Integer) f[2] + (d % 3) * 40);
                m.setProtein((Double) f[3]);
                m.setCarbs((Double) f[4]);
                m.setFat((Double) f[5]);
                meals.save(m);
            }
        }

        List<Exercise> ex = exercises.findAllByOrderByNameAsc();
        int[] offsets = {0, 1, 2, 4, 6, 8, 11, 15, 20};
        for (int k = 0; k < offsets.length; k++) {
            WorkoutLog l = new WorkoutLog();
            l.setUserId(uid);
            l.setLogDate(today.minusDays(offsets[k]));
            l.setDurationMinutes(45 + (k % 3) * 10);
            for (int j = 0; j < 3; j++) {
                LogEntry e = new LogEntry();
                e.setLog(l);
                e.setExercise(ex.get((k * 3 + j) % ex.size()));
                e.setSets(3 + (j % 2));
                e.setReps(8 + j * 2);
                e.setWeightKg(20 + k * 2.5 + j * 5);
                l.getEntries().add(e);
            }
            logs.save(l);
        }
    }
}
