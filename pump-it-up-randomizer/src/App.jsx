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
      <h1 className="text-2xl font-bold mb-4">🎵 Pump It Up 랜덤 뽑기</h1>
      <div className="flex items-center gap-2 mb-4">
        <label>곡 모드</label>
        <input
          type="checkbox"
          checked={isChartMode}
          onChange={() => setIsChartMode(!isChartMode)}
        />
        <label>채보 포함 모드</label>
      </div>

      <RandomizerForm onSubmit={handleRandomize} />

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
