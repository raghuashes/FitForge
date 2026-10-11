export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const weekdayName = (d) => DAYS[(d.getDay() + 6) % 7];

export function weekDates(offset = 0) {
  const base = new Date();
  base.setDate(base.getDate() + 7 * offset);
  const mon = new Date(base);
  mon.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return DAYS.map((name, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return { name, num: x.getDate(), short: name.slice(0, 3).toUpperCase(), month: x.toLocaleString(undefined, { month: "short" }) };
  });
}

export function dayTitle(items) {
  if (!items.length) return "Rest day";
  const g = [...new Set(items.map((i) => i.muscleGroup))];
  if (g.length >= 4) return g.includes("Legs") ? "Full body" : "Upper body";
  return g.slice(0, 2).join(" & ");
}

export const dayMinutes = (items) =>
  Math.round(items.reduce((a, i) => a + (i.minutes > 0 ? i.minutes : (i.sets * (40 + i.restSeconds)) / 60), 0));

export function repsList(i, goal) {
  if (i.minutes > 0) return [`${i.minutes} min`];
  if (goal === "MUSCLE_GAIN" && i.reps <= 8)
    return Array.from({ length: i.sets }, (_, k) => `${Math.max(4, i.reps + 4 - 2 * k)} Reps`);
  return Array.from({ length: i.sets }, () => `${i.reps} Reps`);
}

const WU = {
  Chest: [{ n: "Arm circles", d: "30 sec each way", pose: "raise" }, { n: "Scapular push-ups", d: "2 × 10", pose: "pushup" }, { n: "Light push-ups", d: "1 × 10", pose: "pushup" }],
  Back: [{ n: "Cat-cow stretch", d: "1 min", pose: "stretch" }, { n: "Band pull-aparts (or arm sweeps)", d: "2 × 15", pose: "raise" }, { n: "Hip hinge drill", d: "2 × 10", pose: "hinge" }],
  Legs: [{ n: "Leg swings", d: "10 each leg", pose: "lunge" }, { n: "Bodyweight squats", d: "2 × 15", pose: "squat" }, { n: "Glute bridges", d: "2 × 12", pose: "crunch" }, { n: "Walking lunges", d: "2 × 8 each", pose: "lunge" }],
  Shoulders: [{ n: "Shoulder rolls", d: "30 sec", pose: "raise" }, { n: "Wall slides (or arm raises)", d: "2 × 10", pose: "overhead" }, { n: "Light lateral raises", d: "1 × 15", pose: "raise" }],
  Biceps: [{ n: "Wrist circles", d: "30 sec", pose: "curl" }, { n: "Light curls (no weight)", d: "1 × 15", pose: "curl" }],
  Triceps: [{ n: "Arm swings", d: "30 sec", pose: "raise" }, { n: "Light overhead extensions", d: "1 × 15", pose: "tricep" }],
  Core: [{ n: "Dead bug", d: "2 × 8 each side", pose: "crunch" }, { n: "Torso twists", d: "30 sec", pose: "raise" }],
  Cardio: [{ n: "Easy march or jog", d: "3 min", pose: "run" }, { n: "Dynamic leg swings", d: "10 each leg", pose: "lunge" }],
};
const GENERAL_WARMUP = { n: "Light cardio (jog, skipping or bike)", d: "3 min", pose: "run", tag: "Full body" };

export function warmupFor(items) {
  const groups = [...new Set(items.map((i) => i.muscleGroup))];
  const per = groups.length === 1 ? 4 : groups.length === 2 ? 2 : 1;
  const list = [GENERAL_WARMUP];
  groups.forEach((g) => (WU[g] || []).slice(0, per).forEach((w) => list.push({ ...w, tag: g })));
  return list.slice(0, 7);
}
export const warmMinutes = (list) => Math.min(12, Math.max(6, 3 + 2 * (list.length - 1)));

export const goalLabel = (g) => ({ MUSCLE_GAIN: "GAIN MUSCLE", WEIGHT_LOSS: "LOSE FAT", GENERAL_FITNESS: "STAY FIT" }[g] || "STAY FIT");
export const dietKind = (g) => (g === "WEIGHT_LOSS" ? "FAT_LOSS" : g === "MUSCLE_GAIN" ? "MUSCLE_GAIN" : "MAINTAIN");
