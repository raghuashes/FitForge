import { useState } from "react";
import { poseFor, poseSvg } from "../poses.js";

const QUOTES = [
  "Sweat now, shine later.",
  "Small reps, big results.",
  "Your only competition is yesterday's you.",
  "Show up. Lift. Repeat.",
  "Strong is built one set at a time.",
  "Discipline beats motivation.",
  "Earn your rest day.",
  "Progress, not perfection.",
];

export const quoteOfDay = () => QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

export function GymArt({ className = "" }) {
  return (
    <svg className={`gym-art ${className}`} viewBox="0 0 400 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round">
        <line x1="24" y1="100" x2="376" y2="100" />
      </g>
      <g fill="currentColor">
        <rect x="64" y="42" width="24" height="116" rx="7" />
        <rect x="94" y="58" width="18" height="84" rx="6" />
        <rect x="116" y="72" width="12" height="56" rx="4" />
        <rect x="312" y="42" width="24" height="116" rx="7" />
        <rect x="288" y="58" width="18" height="84" rx="6" />
        <rect x="272" y="72" width="12" height="56" rx="4" />
        <rect x="30" y="86" width="10" height="28" rx="3" />
        <rect x="360" y="86" width="10" height="28" rx="3" />
      </g>
    </svg>
  );
}

const THUMB = {
  Chest: ["🏋️", "#3b4a9c", "#1b2150"], Back: ["🧗", "#2f6f8f", "#14304a"], Legs: ["🦵", "#7a3b8f", "#2a1448"],
  Shoulders: ["💪", "#9c4a3b", "#4a1b1b"], Arms: ["💪", "#9c6b3b", "#4a2f1b"], Core: ["🎯", "#3b8f6a", "#14483a"],
  Cardio: ["🏃", "#2f8f9c", "#14424a"], Yoga: ["🧘", "#3b8f55", "#144a28"],
};
export function ExerciseThumb({ group }) {
  const [e, a, b] = THUMB[group] || ["⚡", "#4a4a9c", "#1b1b50"];
  return <div className="ex-thumb" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>{e}</div>;
}

export function Scene({ kind }) {
  return (
    <svg className="scene" viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b5bdb" /><stop offset="1" stopColor="#8fb4ff" /></linearGradient>
      </defs>
      <rect width="360" height="300" fill="#4a3556" />
      <rect x="40" y="20" width="120" height="150" fill="url(#sky)" stroke="#e8cfc9" strokeWidth="6" />
      <rect x="190" y="20" width="120" height="150" fill="url(#sky)" stroke="#e8cfc9" strokeWidth="6" />
      <rect y="190" width="360" height="110" fill="#5b6070" />
      {kind === "kettlebell" && (
        <g>
          <path d="M200 160 L268 160 L292 205 L178 205 Z" fill="#8a2c4b" />
          <rect x="207" y="98" width="54" height="68" rx="14" fill="#ece9f7" />
          <circle cx="234" cy="78" r="19" fill="#c9805c" /><path d="M215 72 q19 -26 38 0 q-19 -8 -38 0z" fill="#7a3d22" />
          <rect x="178" y="203" width="24" height="52" rx="9" fill="#e0956c" /><rect x="266" y="203" width="24" height="52" rx="9" fill="#e0956c" />
          <rect x="170" y="250" width="40" height="14" rx="6" fill="#1b1b24" /><rect x="260" y="250" width="40" height="14" rx="6" fill="#1b1b24" />
          <path d="M214 112 L208 190 M254 112 L260 190" stroke="#e0956c" strokeWidth="11" strokeLinecap="round" />
          <circle cx="234" cy="222" r="21" fill="#3b6fb5" /><path d="M222 203 q12 -20 24 0" stroke="#2b4f8a" strokeWidth="7" fill="none" />
        </g>
      )}
      {kind === "barbell" && (
        <g>
          <rect x="212" y="110" width="50" height="76" rx="14" fill="#e9684a" />
          <circle cx="237" cy="88" r="19" fill="#d79a74" /><path d="M218 82 q19 -24 38 0 q-19 -8 -38 0z" fill="#2b2b33" />
          <rect x="214" y="184" width="22" height="70" rx="9" fill="#2f3a6a" /><rect x="240" y="184" width="22" height="70" rx="9" fill="#2f3a6a" />
          <rect x="208" y="250" width="32" height="12" rx="5" fill="#111" /><rect x="238" y="250" width="32" height="12" rx="5" fill="#111" />
          <path d="M218 118 L192 62 M256 118 L282 62" stroke="#d79a74" strokeWidth="11" strokeLinecap="round" />
          <line x1="110" y1="56" x2="360" y2="56" stroke="#cfd3e0" strokeWidth="6" strokeLinecap="round" />
          <rect x="126" y="30" width="16" height="52" rx="5" fill="#222" /><rect x="334" y="30" width="16" height="52" rx="5" fill="#222" />
        </g>
      )}
      {kind === "rack" && (
        <g>
          <rect x="40" y="170" width="280" height="8" fill="#2a2f3f" /><rect x="40" y="230" width="280" height="8" fill="#2a2f3f" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={62 + i * 52} y="152" width="12" height="18" rx="3" fill="#ff6a3d" /><rect x={90 + i * 52} y="152" width="12" height="18" rx="3" fill="#ff6a3d" />
              <rect x={72 + i * 52} y="158" width="20" height="6" fill="#aab" />
              <rect x={62 + i * 52} y="212" width="12" height="18" rx="3" fill="#6ea8ff" /><rect x={90 + i * 52} y="212" width="12" height="18" rx="3" fill="#6ea8ff" />
              <rect x={72 + i * 52} y="218" width="20" height="6" fill="#aab" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

const GRAD = {
  Chest: ["#3b4a9c", "#1b2150"], Back: ["#2f6f8f", "#14304a"], Legs: ["#7a3b8f", "#2a1448"],
  Shoulders: ["#9c4a3b", "#4a1b1b"], Biceps: ["#9c6b3b", "#4a2f1b"], Triceps: ["#8f5a3b", "#40241b"],
  Core: ["#3b8f6a", "#14483a"], Cardio: ["#2f8f9c", "#14424a"], Yoga: ["#3b8f55", "#144a28"],
};
// Set VITE_EXERCISE_PHOTOS=true and add frontend/public/images/exercises/<exercise-name>.jpg to use real photos.
const PHOTOS = import.meta.env.VITE_EXERCISE_PHOTOS === "true";

export function ExerciseImg({ name, group, pose }) {
  const [bad, setBad] = useState(false);
  const [a, b] = GRAD[group] || ["#4a4a9c", "#1b1b50"];
  const slug = (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className="ex-thumb" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      {PHOTOS && !bad ? (
        <img src={`/images/exercises/${slug}.jpg`} alt={name} loading="lazy" onError={() => setBad(true)} />
      ) : (
        <svg viewBox="0 0 100 100" role="img" aria-label={name}
          dangerouslySetInnerHTML={{ __html: poseSvg(pose || poseFor(name, group)) }} />
      )}
    </div>
  );
}
