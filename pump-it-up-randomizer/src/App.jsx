import React, { useState, useEffect } from 'react';
import { initializeDataIfNeeded } from './utils/db';
import { getFilteredEntities } from './utils/randomizer';
import RandomizerForm from './components/RandomizerForm';
import SongCard from './components/SongCard';

function App() {
  const [results, setResults] = useState([]);
  const [lockedIds, setLockedIds] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [isChartMode, setIsChartMode] = useState(false);

  useEffect(() => {
    //데이터 로딩
    initializeDataIfNeeded();
  }, []);

  const handleRandomize = async (options) => {
    const lockedItems = results.filter(item => lockedIds.includes(item.id));
    console.log(options);
    const newItems = await getFilteredEntities({
      isChartMode,
      ...options,
    });

    // 고정되지 않은 ID 중, 삭제되지 않은 ID만 뽑기 대상으로 사용
    const filtered = newItems.filter(item =>
      !lockedIds.includes(item.id) &&
      !deletedIds.includes(item.id)
    );

    // 필요한 개수만큼만 잘라서 넣기 (locked 개수만큼 빼고)
    const count = options.count - lockedItems.length;
    const selected = filtered.slice(0, count);

    setResults([...lockedItems, ...selected]);
  };

  const toggleLock = (id) => {
    setLockedIds((prev) =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const deleteCard = (id) => {
    setDeletedIds((prev) => [...prev, id]);
    setResults((prev) => prev.filter(item => item.id !== id));
    setLockedIds((prev) => prev.filter(l => l !== id)); // 삭제 시 잠금도 해제
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🎵 Pump It Up 채보 랜덤 뽑기</h1>
      <div className="flex items-center gap-2 mb-4">
        <label>곡 뽑기</label>
        <div class="relative inline-block w-11 h-5">
          <input
            id="switch-component" type="checkbox" className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-slate-800 cursor-pointer transition-colors duration-300"
            checked={isChartMode}
            onChange={() => setIsChartMode(!isChartMode)}
          />
          <label for="switch-component" class="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer">
          </label>
        </div>
        <label>채보 뽑기</label>
      </div>

      <RandomizerForm onSubmit={handleRandomize} isChartMode={isChartMode} />

      <div className="mt-6 grid gap-4">
        {results.map(item => (
          <SongCard
            key={item.id}
            item={item}
            isChartMode={isChartMode}
            locked={lockedIds.includes(item.id)}
            onToggleLock={() => toggleLock(item.id)}
            onDelete={() => deleteCard(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
