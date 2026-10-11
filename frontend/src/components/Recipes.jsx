import { MacroChips } from "./viz.jsx";

export function RecipeRow({ r, onLog }) {
  return (
    <div className="rrow">
      <div className="rthumb">{r.emoji}</div>
      <div className="rinfo">
        <strong>{r.name}</strong>
        <div className="muted small-text">{r.calories} kcal · {r.minutes} min</div>
        <MacroChips p={r.protein} c={r.carbs} f={r.fat} />
        <div className="rich">Rich in: {r.rich}</div>
      </div>
      {onLog && <button className="btn small ghost" onClick={() => onLog(r)}>+ Log</button>}
    </div>
  );
}
