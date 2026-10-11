export const CAT = {
  Strength: { emoji: "💪", colors: ["#f97316", "#b91c1c"] },
  HIIT: { emoji: "🔥", colors: ["#ef4444", "#7f1d1d"] },
  Cardio: { emoji: "🏃", colors: ["#06b6d4", "#1e40af"] },
  Core: { emoji: "🎯", colors: ["#8b5cf6", "#4c1d95"] },
  Yoga: { emoji: "🧘", colors: ["#10b981", "#065f46"] },
};
export const catStyle = (c) => CAT[c] || CAT.Strength;
export const banner = (c) => ({
  backgroundImage: `linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,.05)), url(/images/${(c || "").toLowerCase()}.jpg), linear-gradient(135deg, ${catStyle(c).colors[0]}, ${catStyle(c).colors[1]})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});
export const rx = (s) => (s.durationSeconds > 0 ? `${s.sets} × ${s.durationSeconds}s` : `${s.sets} × ${s.reps} reps`);
export const fmt = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
