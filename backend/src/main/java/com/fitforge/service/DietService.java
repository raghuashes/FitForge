package com.fitforge.service;

import com.fitforge.dto.Dtos.*;
import com.fitforge.entity.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DietService {
    private final ProfileService profiles;

    private record Slot(String name, String type, String time, double share, String veg, String nonVeg, String rich) {}
    private record Rec(String name, String emoji, int cal, int p, int c, int f, int min, String diet, String goal,
                       String rich, String about) {}

    private static final List<Rec> RECIPES = List.of(
        new Rec("Masala Oats Bowl", "🥣", 180, 7, 30, 4, 10, "VEG", "FAT_LOSS", "Fiber, magnesium, iron", "Savoury oats with onion, tomato and peas."),
        new Rec("Moong Dal Chilla", "🥞", 210, 14, 28, 5, 15, "VEG", "FAT_LOSS", "Protein, iron, folate", "Crisp lentil crepes with grated vegetables."),
        new Rec("Egg White Veg Omelette", "🍳", 150, 18, 5, 5, 8, "NONVEG", "FAT_LOSS", "Protein, B12, selenium", "Fluffy egg whites with capsicum and spinach."),
        new Rec("Grilled Chicken Salad", "🥗", 280, 32, 12, 10, 20, "NONVEG", "FAT_LOSS", "Iron, vitamin C, potassium", "Lean chicken over crunchy greens with lemon dressing."),
        new Rec("Sprouts Chaat", "🌱", 160, 10, 26, 2, 10, "VEG", "FAT_LOSS", "Vitamin C, fiber, folate", "Tangy sprouts with tomato, cucumber and lime."),
        new Rec("Paneer Bhurji Bowl", "🧀", 320, 22, 14, 20, 15, "VEG", "BOTH", "Calcium, protein, B12", "Scrambled paneer with onion, tomato and spices."),
        new Rec("Greek Yogurt Berry Bowl", "🫐", 190, 15, 24, 4, 5, "VEG", "BOTH", "Calcium, probiotics, vitamin C", "Thick yogurt with berries and a few seeds."),
        new Rec("Soya Chunk Curry", "🍲", 340, 34, 24, 12, 25, "VEG", "BOTH", "Protein, iron, calcium", "High-protein soya chunks in a light tomato gravy."),
        new Rec("Baked Fish with Veggies", "🐟", 310, 34, 12, 14, 25, "NONVEG", "BOTH", "Omega-3, vitamin D, B12", "Oven-baked fish fillet with roasted vegetables."),
        new Rec("Peanut Butter Banana Smoothie", "🍌", 420, 20, 52, 14, 5, "VEG", "MUSCLE_GAIN", "Potassium, magnesium, healthy fats", "Milk, banana and peanut butter blended smooth."),
        new Rec("Chicken Rice Power Bowl", "🍗", 650, 45, 75, 16, 25, "NONVEG", "MUSCLE_GAIN", "Iron, zinc, B vitamins", "Grilled chicken, rice and vegetables in one bowl."),
        new Rec("Scrambled Eggs on Toast", "🍞", 450, 28, 34, 22, 10, "NONVEG", "MUSCLE_GAIN", "B12, choline, vitamin D", "Whole eggs scrambled soft on multigrain toast."),
        new Rec("Rajma Chawal Bowl", "🍛", 560, 22, 92, 10, 30, "VEG", "MUSCLE_GAIN", "Iron, fiber, magnesium", "Kidney beans in gravy over steamed rice."),
        new Rec("Overnight Oats with Nuts", "🥛", 380, 16, 48, 14, 5, "VEG", "MUSCLE_GAIN", "Magnesium, fiber, vitamin E", "Oats soaked in milk with almonds and walnuts."));

    public List<DietPlan> plans(Long uid) {
        Profile p = profiles.getOrCreate(uid);
        double w = p.getWeightKg();
        int maintenance = (int) (Math.round(w * 33 / 10.0) * 10);
        return List.of(fatLoss(w, maintenance), muscleGain(w, maintenance), maintain(w, maintenance));
    }

    public List<RecipeRes> recipes(String goal) {
        return RECIPES.stream()
                .filter(r -> goal == null || goal.equals("MAINTAIN") || goal.isBlank()
                        || r.goal().equals("BOTH") || r.goal().equals(goal))
                .map(r -> new RecipeRes(r.name(), r.emoji(), r.cal(), r.p(), r.c(), r.f(), r.min(), r.diet(),
                        r.goal(), r.rich(), r.about())).toList();
    }

    private List<Slot> balancedSlots() {
        return List.of(
            new Slot("Breakfast", "BREAKFAST", "7:30 - 9:00 AM", 0.25,
                "Vegetable poha or oats upma with sprouts + 1 glass skim milk or 150 g Greek yogurt",
                "3-egg-white omelette with vegetables + 2 multigrain toast + 1 fruit", "Fiber, B vitamins, calcium"),
            new Slot("Mid-morning snack", "SNACK", "11:00 AM", 0.10,
                "1 fruit (apple or guava) + 8-10 almonds", "1 fruit + 1 boiled egg", "Vitamin C, healthy fats, magnesium"),
            new Slot("Lunch", "LUNCH", "1:00 - 2:00 PM", 0.30,
                "2 rotis + 1 bowl dal + large salad + 100 g paneer or tofu bhurji",
                "2 rotis or 3/4 cup brown rice + 120 g grilled chicken or fish + salad + sabzi", "Iron, fiber, protein"),
            new Slot("Evening snack", "SNACK", "4:30 - 5:30 PM", 0.10,
                "Roasted chana or a whey/soy protein shake + green tea",
                "Protein shake or buttermilk + a handful of roasted chana", "Zinc, fiber, protein"),
            new Slot("Dinner", "DINNER", "8:00 - 9:00 PM", 0.25,
                "2 moong dal chillas with paneer filling + sauteed vegetables or clear soup",
                "150 g grilled fish or chicken + sauteed vegetables + clear soup", "Calcium, potassium, vitamin A"));
    }

    private List<Slot> muscleSlots() {
        return List.of(
            new Slot("Breakfast", "BREAKFAST", "7:30 - 9:00 AM", 0.25,
                "3 paneer or besan chilla (or 2 stuffed parathas) + 1 cup curd + 1 banana + 1 glass milk",
                "4 whole eggs scrambled + 3 toast + 1 banana + 1 glass milk", "B12, calcium, potassium"),
            new Slot("Mid-morning snack", "SNACK", "11:00 AM", 0.10,
                "Peanut butter sandwich + 1 fruit", "Chicken sandwich + 1 fruit", "Magnesium, vitamin E, healthy fats"),
            new Slot("Lunch", "LUNCH", "1:00 - 2:00 PM", 0.30,
                "1.5 cups rice + rajma or chole + 150 g paneer + curd + salad",
                "1.5 cups rice + 180 g chicken curry + 1 bowl dal + salad", "Iron, zinc, B vitamins"),
            new Slot("Pre/post-workout snack", "SNACK", "4:30 - 6:00 PM", 0.10,
                "Whey or soy protein shake + 1 banana + a handful of nuts",
                "2-3 boiled eggs + 1 banana + protein shake", "Potassium, magnesium, protein"),
            new Slot("Dinner", "DINNER", "8:00 - 9:00 PM", 0.25,
                "3 rotis + dal + soya chunks or paneer sabzi + curd",
                "3 rotis + 150-200 g fish or chicken + vegetables + dal", "Iron, calcium, B12"));
    }

    private DietPlan fatLoss(double w, int maintenance) {
        int cal = Math.max(1300, maintenance - 500);
        int protein = (int) Math.round(w * 2.0);
        int fat = (int) Math.round(w * 0.8);
        List<String> tips = List.of(
            "Drink 3-4 litres of water daily.",
            "Aim for 8,000-10,000 steps a day.",
            "Keep dinner light and finish it 2-3 hours before sleep.",
            "Limit sugary drinks, fried snacks and sweets.",
            "Aim for about 0.5 kg loss per week. If progress stalls for 2 weeks, trim intake slightly or add a cardio session.");
        return build("FAT_LOSS", "Fat loss diet plan",
            "A moderate deficit of about 500 kcal below your estimated maintenance, with high protein to protect muscle. General guidance, not medical advice.",
            w, cal, protein, fat, tips, balancedSlots(), List.of("Fiber", "Potassium", "Calcium", "Vitamin C"));
    }

    private DietPlan muscleGain(double w, int maintenance) {
        int cal = maintenance + 300;
        int protein = (int) Math.round(w * 1.8);
        int fat = (int) Math.round(w * 1.0);
        List<String> tips = List.of(
            "Eat every 3-4 hours and do not skip meals.",
            "Have 20-30 g protein within 2 hours after training.",
            "Sleep 7-8 hours - muscles grow while you recover.",
            "Add about 2.5 kg to your lifts when you complete all reps with good form.",
            "Aim to gain 0.25-0.5 kg per week. If the scale does not move for 2 weeks, add 150-200 kcal.");
        return build("MUSCLE_GAIN", "Muscle gain diet plan",
            "A small surplus of about 300 kcal above your estimated maintenance, with plenty of protein and carbs to fuel training. General guidance, not medical advice.",
            w, cal, protein, fat, tips, muscleSlots(), List.of("Magnesium", "Zinc", "Iron", "Vitamin B12"));
    }

    private DietPlan maintain(double w, int maintenance) {
        int protein = (int) Math.round(w * 1.6);
        int fat = (int) Math.round(w * 0.9);
        List<String> tips = List.of(
            "Keep portions steady and listen to hunger cues.",
            "Include a fruit and a vegetable in every main meal.",
            "Drink 2.5-3.5 litres of water daily.",
            "Adjust portion sizes so each meal matches the calories listed.",
            "Weigh yourself weekly; if your weight drifts, add or remove about 150 kcal.");
        return build("MAINTAIN", "Balanced diet plan",
            "Calories close to your estimated maintenance for steady energy and general fitness. General guidance, not medical advice.",
            w, maintenance, protein, fat, tips, balancedSlots(), List.of("Fiber", "Calcium", "Iron", "Vitamin D"));
    }

    private List<Micro> micros(int cal, List<String> focus) {
        int fiber = (int) Math.round(cal / 1000.0 * 14);
        List<Micro> m = new ArrayList<>(List.of(
            new Micro("Fiber", fiber + " g", "Keeps you full and supports digestion", "Oats, dal, vegetables, fruit, sprouts"),
            new Micro("Calcium", "1000 mg", "Bones, teeth and muscle contraction", "Milk, curd, paneer, ragi, sesame"),
            new Micro("Iron", "8-18 mg", "Carries oxygen to your muscles", "Spinach, rajma, chana, jaggery, eggs, chicken"),
            new Micro("Magnesium", "310-420 mg", "Muscle recovery, sleep and energy", "Nuts, seeds, banana, whole grains"),
            new Micro("Zinc", "8-11 mg", "Immunity and muscle repair", "Pumpkin seeds, chickpeas, paneer, eggs, chicken"),
            new Micro("Potassium", "2600-3400 mg", "Fluid balance and muscle function", "Banana, coconut water, potato, beans"),
            new Micro("Vitamin C", "75-90 mg", "Immunity and better iron absorption", "Amla, guava, orange, lemon, capsicum"),
            new Micro("Vitamin D", "600-800 IU", "Bone health and muscle function", "Morning sunlight, eggs, fortified milk, fish"),
            new Micro("Vitamin B12", "2.4 mcg", "Energy production and nerve function", "Milk, curd, eggs, fish, chicken, fortified foods"),
            new Micro("Omega-3", "1.1-1.6 g", "Helps recovery and heart health", "Flax and chia seeds, walnuts, fish"),
            new Micro("Sodium", "under 2300 mg", "Keep salt moderate to limit water retention", "Go easy on pickles, chips and packaged snacks")));
        m.sort(Comparator.comparingInt(x -> focus.contains(x.name()) ? 0 : 1));
        return m;
    }

    private DietPlan build(String goal, String title, String summary, double w, int cal, int protein, int fat,
                           List<String> tips, List<Slot> slots, List<String> focus) {
        int carbs = Math.max(50, (cal - protein * 4 - fat * 9) / 4);
        List<DietMeal> meals = new ArrayList<>();
        for (Slot s : slots) {
            meals.add(new DietMeal(s.name(), s.type(), s.time(), (int) (Math.round(cal * s.share() / 5.0) * 5),
                    (int) Math.round(protein * s.share()), s.veg(), s.nonVeg(), s.rich()));
        }
        return new DietPlan(goal, title, summary, w, cal, protein, carbs, fat, tips, micros(cal, focus), meals);
    }
}
