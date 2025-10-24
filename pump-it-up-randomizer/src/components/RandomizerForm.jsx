import { useState } from "react";
import FilterPanel from "./FilterPanel";

function RandomizerForm({ onSubmit, isChartMode }) {
  const [count, setCount] = useState(5);
  const [minLevel, setMinLevel] = useState(15);
  const [maxLevel, setMaxLevel] = useState(28);
  const [filters, setFilters] = useState({
    mode: [],
    series: [],
    category: [],
    type: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ count, minLevel, maxLevel, filters });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label>곡 갯수: <input type="number" value={count} onChange={e => setCount(+e.target.value)} className="border p-1" /></label>
      {isChartMode && (
      <>
        <label>레벨 범위: {minLevel} ~ {maxLevel}</label>
        <div className="flex gap-2">
          <input
            type="range"
            min={15}
            max={28}
            value={minLevel}
            onChange={e => setMinLevel(+e.target.value)}
          />
          <input
            type="range"
            min={15}
            max={28}
            value={maxLevel}
            onChange={e => setMaxLevel(+e.target.value)}
          />
        </div>
      </>
    )}
      <FilterPanel filters={filters} setFilters={setFilters} />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">🎲 뽑기</button>
    </form>
  );
}

export default RandomizerForm;