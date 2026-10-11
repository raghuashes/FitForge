package com.fitforge.service;

import com.fitforge.dto.Dtos.*;
import com.fitforge.entity.*;
import com.fitforge.exception.ApiException;
import com.fitforge.repository.ExerciseRepository;
import com.fitforge.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PlanService {
    private final PlanRepository plans;
    private final ExerciseRepository exercises;
    private final ProfileService profiles;

    private record Day(String name, String[] groups) {}

    // body-part day templates (the order of groups decides the day title, e.g. "Chest & Triceps")
    private static final String[] FULL = {"Chest", "Back", "Legs", "Shoulders", "Core"};
    private static final String[] CHEST_TRI = {"Chest", "Chest", "Chest", "Triceps", "Triceps"};
    private static final String[] BACK_BI = {"Back", "Back", "Back", "Biceps", "Biceps"};
    private static final String[] LEGS = {"Legs", "Legs", "Legs", "Legs", "Legs"};
    private static final String[] SHOULDER_CORE = {"Shoulders", "Shoulders", "Shoulders", "Core", "Core"};
    private static final String[] ARMS = {"Biceps", "Biceps", "Triceps", "Triceps", "Core"};
    private static final String[] LEGS_CORE = {"Legs", "Legs", "Legs", "Legs", "Core"};
    private static final String[] LEGS_SHOULDERS = {"Legs", "Legs", "Legs", "Shoulders", "Shoulders"};

    // curated exercise priority per muscle group (compound lifts first)
    private static final Map<String, String[]> PICKS = Map.of(
            "Chest", new String[]{"Barbell Bench Press", "Incline Dumbbell Press", "Pec Deck Fly", "Cable Fly", "Push-Up", "Chest Dip"},
            "Back", new String[]{"Lat Pulldown", "Barbell Row", "Seated Cable Row", "Pull-Up", "Deadlift"},
            "Legs", new String[]{"Barbell Squat", "Leg Press", "Romanian Deadlift", "Lunges", "Leg Extension", "Leg Curl", "Calf Raise", "Hip Thrust"},
            "Shoulders", new String[]{"Overhead Press", "Lateral Raise", "Face Pull", "Arnold Press", "Rear Delt Fly"},
            "Biceps", new String[]{"Barbell Curl", "Hammer Curl", "Preacher Curl", "Dumbbell Curl"},
            "Triceps", new String[]{"Tricep Pushdown", "Skull Crusher", "Overhead Tricep Extension", "Close-Grip Bench Press", "Chair Tricep Dips"},
            "Core", new String[]{"Plank", "Cable Crunch", "Hanging Leg Raise", "Crunch", "Russian Twist"});

    @Transactional(readOnly = true)
    public List<PlanRes> list(Long uid) {
        return plans.findByUserIdOrderByIdDesc(uid).stream().map(this::toRes).toList();
    }

    @Transactional(readOnly = true)
    public PlanRes get(Long uid, Long id) { return toRes(find(uid, id)); }

    public PlanRes create(Long uid, PlanReq r) {
        WorkoutPlan p = new WorkoutPlan();
        p.setUserId(uid);
        p.setName(r.name().trim());
        p.setGoal(r.goal());
        p.setCreatedOn(LocalDate.now());
        for (PlanItemReq i : r.items()) {
            Exercise e = exercises.findById(i.exerciseId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Unknown exercise"));
            p.getItems().add(item(p, e, i.dayOfWeek(), i.sets(), i.reps(), i.restSeconds(), 0, null, 1));
        }
        return toRes(plans.save(p));
    }

    public void delete(Long uid, Long id) { plans.delete(find(uid, id)); }

    public PlanRes generate(Long uid) {
        Profile pr = profiles.getOrCreate(uid);
        return buildSmart(uid, pr.getGoal(), pr.getExperience(), pr.getWeightKg(), pr.getDaysPerWeek());
    }

    public PlanRes smart(Long uid, SmartReq r) {
        Profile pr = profiles.getOrCreate(uid);
        pr.setGoal(r.goal());
        pr.setExperience(r.experience());
        pr.setWeightKg(r.weightKg());
        pr.setDaysPerWeek(r.daysPerWeek());
        return buildSmart(uid, r.goal(), r.experience(), r.weightKg(), r.daysPerWeek());
    }

    public PlanRes swap(Long uid, Long id, SwapReq r) {
        List<String> days = List.of("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
        if (!days.contains(r.from()) || !days.contains(r.to()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown day");
        int week = r.week() == null ? 1 : r.week();
        WorkoutPlan p = find(uid, id);
        if (!r.from().equals(r.to())) {
            for (PlanItem i : p.getItems()) {
                if (i.getWeekNo() != week) continue;
                if (i.getDayOfWeek().equals(r.from())) i.setDayOfWeek(r.to());
                else if (i.getDayOfWeek().equals(r.to())) i.setDayOfWeek(r.from());
            }
        }
        return toRes(p);
    }

    private PlanRes buildSmart(Long uid, Goal goal, Experience exp, double weight, int days) {
        Map<String, Exercise> byName = exercises.findAllByOrderByNameAsc().stream()
                .collect(Collectors.toMap(Exercise::getName, e -> e, (a, b) -> a));
        boolean loss = goal == Goal.WEIGHT_LOSS;
        boolean gain = goal == Goal.MUSCLE_GAIN;
        int baseSets = switch (exp) { case BEGINNER -> 2; case INTERMEDIATE -> 3; case ADVANCED -> 4; };

        List<Day> strength;
        int cardioDays = 0;
        if (loss) {
            int sd = Math.min(days, 3);
            cardioDays = days - sd;
            strength = schedule(sd);
        } else {
            strength = schedule(days);
        }

        String label = loss ? "Fat Loss" : gain ? "Muscle Gain" : "General Fitness";
        WorkoutPlan p = new WorkoutPlan();
        p.setUserId(uid);
        p.setName("Smart Plan - " + label + " (" + Math.round(weight) + " kg, " + days + " days)");
        p.setGoal(goal.name());
        p.setCreatedOn(LocalDate.now());

        String[] cardio = {"Treadmill Run", "Rowing Machine", "Jumping Jacks", "Treadmill Run"};
        String[] cardioDayNames = {"Tuesday", "Thursday", "Saturday", "Sunday"};
        int mins = 20 + 10 * exp.ordinal();

        for (int week = 1; week <= 2; week++) {
            Map<String, Integer> counter = new HashMap<>();
            for (Day d : strength) {
                boolean first = true;
                for (String g : d.groups()) {
                    Exercise e = pick(g, counter, byName, week);
                    if (e == null) continue;
                    boolean compound = first;
                    first = false;
                    int sets = gain && compound ? Math.min(5, baseSets + 1) : baseSets;
                    int reps = loss ? 14 : gain ? (compound ? 8 : 12) : 12;
                    int rest = loss ? 45 : gain ? (compound ? 90 : 60) : 60;
                    p.getItems().add(item(p, e, d.name(), sets, reps, rest, 0,
                            weekNote(loadNote(e, exp, weight, loss), week), week));
                }
                if (loss && days <= 3 && byName.get("Treadmill Run") != null) {
                    p.getItems().add(item(p, byName.get("Treadmill Run"), d.name(), 1, 1, 0, 10,
                            "10 min brisk finisher (treadmill, or jog / skipping outdoors)", week));
                }
            }
            for (int k = 0; k < cardioDays && k < 4; k++) {
                Exercise c = byName.get(cardio[k]);
                if (c != null) p.getItems().add(item(p, c, cardioDayNames[k], 1, 1, 0, mins + (week - 1) * 5,
                        "Steady pace you can still talk through (or brisk walk / cycling)", week));
                Exercise cr = byName.get("Crunch");
                if (cr != null) p.getItems().add(item(p, cr, cardioDayNames[k], 3, 15, 30, 0,
                        "Bodyweight - focus on clean form", week));
            }
        }

        String next = " Next week keeps your main lifts, swaps some accessories and adds a small progression.";
        if (loss) {
            p.setNotes("Goal: fat loss at about 0.5 kg per week. You lift " + strength.size() + " day(s) to keep your muscle"
                    + (cardioDays > 0 ? ", plus " + cardioDays + " cardio day(s) of " + mins + " min." : " and finish each session with a short cardio block.")
                    + " Aim for 8,000-10,000 steps daily and a moderate calorie deficit. Starting weights are estimates from your body weight - begin light and adjust." + next);
        } else if (gain) {
            p.setNotes("Goal: muscle gain. Heavy compound lifts first (8 reps), then accessories (12 reps). Add about 2.5 kg when you complete all reps with good form. "
                    + "Eat a small calorie surplus with roughly " + Math.round(weight * 1.8) + " g protein per day and sleep 7-8 hours. Starting weights are estimates - begin light and adjust." + next);
        } else {
            p.setNotes("Goal: balanced general fitness with moderate reps and rest. Starting weights are estimates from your body weight - begin light and adjust." + next);
        }
        return toRes(plans.save(p));
    }

    private static String weekNote(String note, int week) {
        return week == 2 ? note + " Week 2: add a little weight or 1 more rep." : note;
    }

    private Exercise pick(String group, Map<String, Integer> counter, Map<String, Exercise> byName, int week) {
        String[] list = PICKS.get(group);
        if (list == null) return null;
        int occ = counter.merge(group, 1, Integer::sum) - 1;
        int idx = (week == 1 || occ == 0) ? occ : occ + 1;   // week 2: keep the main lift, rotate accessories
        for (int t = 0; t < list.length; t++) {
            Exercise e = byName.get(list[(idx + t) % list.length]);
            if (e != null) return e;
        }
        return null;
    }

    private static double[] factors(Exercise e) {
        return switch (e.getName()) {
            case "Barbell Bench Press" -> new double[]{.5, .75, 1.0};
            case "Barbell Squat" -> new double[]{.6, 1.0, 1.4};
            case "Deadlift" -> new double[]{.8, 1.2, 1.6};
            case "Overhead Press" -> new double[]{.3, .45, .65};
            case "Barbell Row" -> new double[]{.4, .6, .85};
            default -> {
                String eq = e.getEquipment() == null ? "" : e.getEquipment();
                yield switch (eq) {
                    case "Barbell" -> new double[]{.3, .5, .7};
                    case "Dumbbells" -> new double[]{.1, .17, .25};
                    case "Machine", "Cable" -> new double[]{.3, .5, .7};
                    default -> null;
                };
            }
        };
    }

    private static String loadNote(Exercise e, Experience exp, double weight, boolean loss) {
        double[] f = factors(e);
        if (f == null) return "Bodyweight - focus on clean form";
        double kg = weight * f[exp.ordinal()] * (loss ? 0.85 : 1.0);
        kg = Math.max(2.5, Math.round(kg / 2.5) * 2.5);
        String shown = kg == Math.floor(kg) ? String.valueOf((int) kg) : String.valueOf(kg);
        String unit = "Dumbbells".equals(e.getEquipment()) ? "kg per dumbbell" : "kg";
        return "Start around " + shown + " " + unit + " - the last 2 reps should feel hard";
    }

    private List<Day> schedule(int days) {
        return switch (days) {
            case 1 -> List.of(new Day("Monday", FULL));
            case 2 -> List.of(new Day("Monday", FULL), new Day("Thursday", FULL));
            case 3 -> List.of(new Day("Monday", CHEST_TRI), new Day("Wednesday", BACK_BI), new Day("Friday", LEGS_SHOULDERS));
            case 4 -> List.of(new Day("Monday", CHEST_TRI), new Day("Tuesday", BACK_BI),
                    new Day("Thursday", LEGS), new Day("Friday", SHOULDER_CORE));
            case 5 -> List.of(new Day("Monday", CHEST_TRI), new Day("Tuesday", BACK_BI), new Day("Wednesday", LEGS),
                    new Day("Thursday", SHOULDER_CORE), new Day("Friday", ARMS));
            default -> List.of(new Day("Monday", CHEST_TRI), new Day("Tuesday", BACK_BI), new Day("Wednesday", LEGS),
                    new Day("Thursday", SHOULDER_CORE), new Day("Friday", ARMS), new Day("Saturday", LEGS_CORE));
        };
    }

    private PlanItem item(WorkoutPlan p, Exercise e, String day, int sets, int reps, int rest, int minutes,
                          String note, int week) {
        PlanItem it = new PlanItem();
        it.setPlan(p);
        it.setExercise(e);
        it.setDayOfWeek(day);
        it.setSets(sets);
        it.setReps(reps);
        it.setRestSeconds(rest);
        it.setMinutes(minutes);
        it.setNote(note);
        it.setWeekNo(week);
        return it;
    }

    private WorkoutPlan find(Long uid, Long id) {
        return plans.findByIdAndUserId(id, uid)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));
    }

    private PlanRes toRes(WorkoutPlan p) {
        List<PlanItemRes> items = p.getItems().stream().map(i -> new PlanItemRes(i.getId(),
                i.getExercise().getId(), i.getExercise().getName(), i.getExercise().getMuscleGroup(),
                i.getDayOfWeek(), i.getSets(), i.getReps(), i.getRestSeconds(), i.getMinutes(), i.getNote(),
                i.getWeekNo())).toList();
        return new PlanRes(p.getId(), p.getName(), p.getGoal(), p.getCreatedOn(), p.getNotes(), items);
    }
}
