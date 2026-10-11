// Simple pictogram illustrations (no external images needed).
const ln = (a, b, c, d, col = "#fff", w = 4) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
const hd = (x, y) => `<circle cx="${x}" cy="${y}" r="6.5" fill="#fff"/>`;
const pl = (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="#ff8a3d"/>`;
const bar = (x1, y1, x2, y2) => ln(x1, y1, x2, y2, "#ff8a3d", 3) + pl(x1, y1) + pl(x2, y2);
const db = (x, y) => `<rect x="${x - 7}" y="${y - 3}" width="14" height="6" rx="2" fill="#ff8a3d"/>`;
const floor = (y = 90) => `<line x1="8" y1="${y}" x2="92" y2="${y}" stroke="rgba(255,255,255,.25)" stroke-width="2"/>`;

export const POSES = {
  squat: () => floor() + hd(50, 20) + ln(50, 30, 45, 56) + ln(45, 56, 63, 64) + ln(63, 64, 57, 88) + ln(50, 33, 42, 30) + bar(26, 30, 66, 30),
  press: () => floor() + `<rect x="18" y="64" width="62" height="6" rx="2" fill="rgba(255,255,255,.3)"/>` + hd(24, 56) + ln(31, 59, 62, 59) + ln(62, 59, 75, 48) + ln(75, 48, 82, 62) + ln(36, 59, 36, 34) + bar(22, 34, 50, 34),
  pushup: () => floor(80) + hd(20, 50) + ln(27, 54, 84, 74) + ln(32, 56, 32, 78),
  overhead: () => floor() + hd(50, 24) + ln(50, 33, 50, 60) + ln(50, 60, 43, 88) + ln(50, 60, 57, 88) + ln(50, 36, 38, 16) + ln(50, 36, 62, 16) + bar(28, 14, 72, 14),
  raise: () => floor() + hd(50, 22) + ln(50, 31, 50, 60) + ln(50, 60, 43, 88) + ln(50, 60, 57, 88) + ln(50, 36, 22, 40) + ln(50, 36, 78, 40) + db(20, 40) + db(80, 40),
  pull: () => ln(24, 10, 76, 10, "#ff8a3d", 4) + hd(50, 32) + ln(50, 41, 50, 66) + ln(50, 66, 45, 88) + ln(50, 66, 55, 88) + ln(50, 44, 36, 11) + ln(50, 44, 64, 11),
  row: () => floor() + hd(28, 38) + ln(35, 42, 64, 56) + ln(64, 56, 60, 72) + ln(60, 72, 62, 89) + ln(40, 45, 44, 66) + bar(30, 68, 58, 68),
  hinge: () => floor() + hd(27, 46) + ln(34, 50, 66, 56) + ln(66, 56, 60, 89) + ln(37, 53, 40, 72) + bar(28, 74, 52, 74),
  lunge: () => floor() + hd(46, 22) + ln(46, 31, 46, 56) + ln(46, 56, 64, 60) + ln(64, 60, 64, 88) + ln(46, 56, 32, 72) + ln(32, 72, 20, 88) + ln(46, 36, 40, 54),
  curl: () => floor() + hd(50, 22) + ln(50, 31, 50, 60) + ln(50, 60, 44, 88) + ln(50, 60, 56, 88) + ln(50, 36, 52, 54) + ln(52, 54, 62, 40) + db(63, 38),
  tricep: () => floor() + hd(50, 28) + ln(50, 37, 50, 62) + ln(50, 62, 44, 88) + ln(50, 62, 56, 88) + ln(50, 40, 52, 14) + ln(52, 14, 62, 26) + db(64, 28),
  plank: () => floor(82) + hd(18, 58) + ln(25, 62, 84, 74) + ln(28, 64, 28, 80),
  crunch: () => floor() + hd(32, 54) + ln(38, 58, 60, 72) + ln(60, 72, 76, 54) + ln(76, 54, 84, 72) + ln(42, 60, 52, 56),
  run: () => floor() + hd(50, 20) + ln(50, 29, 48, 54) + ln(50, 32, 38, 44) + ln(38, 44, 44, 54) + ln(50, 32, 62, 40) + ln(48, 54, 64, 60) + ln(64, 60, 60, 82) + ln(48, 54, 34, 66) + ln(34, 66, 24, 80),
  stretch: () => floor() + hd(20, 52) + `<path d="M27 56 Q50 38 74 56" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>` + ln(28, 57, 28, 82) + ln(74, 56, 74, 82),
};

const BY_NAME = {
  "Push-Up": "pushup", "Pike Push-Up": "pushup", "Overhead Press": "overhead", "Arnold Press": "overhead",
  "Dumbbell Shoulder Press": "overhead", "Lateral Raise": "raise", "Rear Delt Fly": "raise", "Face Pull": "raise",
  "Lat Pulldown": "pull", "Pull-Up": "pull", "Barbell Row": "row", "Seated Cable Row": "row",
  "Deadlift": "hinge", "Romanian Deadlift": "hinge", "Hip Thrust": "hinge", "Kettlebell Swing": "hinge",
  "Lunges": "lunge", "Reverse Lunges": "lunge", "Plank": "plank", "Side Plank": "plank", "Superman Hold": "plank",
  "Crunch": "crunch", "Cable Crunch": "crunch", "Hanging Leg Raise": "crunch", "Russian Twist": "crunch",
  "Bicycle Crunch": "crunch", "Glute Bridge": "crunch", "Treadmill Run": "run", "High Knees": "run",
  "Jumping Jacks": "run", "Mountain Climbers": "run", "Rowing Machine": "run", "Burpees": "run", "Battle Ropes": "run",
  "Chair Tricep Dips": "tricep",
};
const BY_GROUP = {
  Chest: "press", Back: "row", Legs: "squat", Shoulders: "overhead", Biceps: "curl", Triceps: "tricep",
  Core: "plank", Cardio: "run", Yoga: "stretch", "Full Body": "run",
};
export const poseFor = (name, group) => BY_NAME[name] || BY_GROUP[group] || "squat";
export const poseSvg = (key) => (POSES[key] || POSES.squat)();
