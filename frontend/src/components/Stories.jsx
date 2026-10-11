import { useEffect, useState } from "react";
import { Scene } from "./Art.jsx";

const SLIDES = [
  { scene: "kettlebell", caption: "Every rep counts." },
  { scene: "barbell", caption: "Earn your rest day." },
  { scene: "rack", caption: "Show up. Lift. Repeat." },
];
const QUOTES = [
  "Strong is built one set at a time.",
  "Discipline beats motivation on the days you don't feel like it.",
  "Don't wish for it. Train for it.",
  "Progress is quiet. Keep showing up.",
];
const MS = 4500;

export default function Stories() {
  const [i, setI] = useState(0);
  const total = SLIDES.length + 1;
  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

  useEffect(() => {
    const t = setTimeout(() => setI((x) => (x + 1) % total), MS);
    return () => clearTimeout(t);
  }, [i, total]);

  return (
    <div className="stories" onClick={() => setI((x) => (x + 1) % total)} role="button" aria-label="Next story">
      {i < SLIDES.length ? (
        <>
          <Scene kind={SLIDES[i].scene} />
          <p className="story-cap">“{SLIDES[i].caption}”</p>
        </>
      ) : (
        <div className="story-quote">
          <div className="qm">”</div>
          <p>{quote}</p>
          <hr />
          <span>FitForge Coach</span>
        </div>
      )}
      <div className="seg-bars">
        {Array.from({ length: total }).map((_, k) => (
          <span key={k} className={k < i ? "full" : k === i ? "cur" : ""} />
        ))}
      </div>
    </div>
  );
}
