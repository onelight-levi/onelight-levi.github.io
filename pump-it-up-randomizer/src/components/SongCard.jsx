import { useState } from 'react';
import { FiLock, FiUnlock, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function SongCard({ item, isChartMode, locked, onToggleLock, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white shadow rounded px-4 py-1 transition-all relative ${locked ? 'border-blue-500 border-2' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={`/data/thumbs/${item.songId}.jpg`} alt={item.title} className="w-16 h-16 object-cover rounded" />
          <div>
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-sm">{item.artist}</p>
            {isChartMode && <p className="text-sm">{item.modeName} Lv.{item.level}</p>}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={onToggleLock}>
            {locked
              ? <FiLock className="w-5 h-5 text-blue-500" />
              : <FiUnlock className="w-5 h-5 text-gray-500" />}
          </button>
          <button onClick={onDelete}>
            <FiX className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>BPM: {item.bpm_min == item.bpm_max ? item.bpm_max : item.bpm_min + "-" + item.bpm_max}</div>
          <div>Series: {item.series}</div>
          <div>Category: {item.category}</div>
          <div>Type: {item.type}</div>
          <div>Premium: {item.premium ? 'Yes' : 'No'}</div>
          {isChartMode && <div>Chart Level: Lv.{item.level}</div>}
        </div>
      )}

      <button className="mt-2 text-blue-600 text-sm flex items-center gap-1" onClick={() => setExpanded(!expanded)}>
        {expanded ? (
          <>
            <FiChevronUp />
            접기
          </>
        ) : (
          <>
            <FiChevronDown />
            펼치기
          </>
        )}
      </button>
    </div>
  );
}
