import Dexie from "dexie";

export const db = new Dexie("PumpItUpDB");

db.version(1).stores({
  songs: "song_id, title, artist, series, category, type, premium",
  charts: "chart_id, song, mode, level",
  artists: "artist_id, name",
  series: "++serie_id, serie_name",
  category: "++category_id, category_name",
  type: "++type_id, type_name",
  mode: "++mode_id, mode_name"
});

// 초기화 함수
export async function initializeDataIfNeeded() {
  const songCount = await db.songs.count();
  if (songCount > 0) return; // 이미 있으면 생략

  await loadJsonToDb();
  await insertStaticKeyValues();
}

// JSON 로딩 및 삽입
async function loadJsonToDb() {
  const [songs, charts, artists] = await Promise.all([
    fetch("/data/songs.json").then((res) => res.json()),
    fetch("/data/charts.json").then((res) => res.json()),
    fetch("/data/artists.json").then((res) => res.json()),
  ]);

  // 자동으로 중복 덮어쓰기 허용
  await db.songs.bulkPut(songs);
  await db.charts.bulkPut(charts);
  await db.artists.bulkPut(artists);
}

// Key-Value 기반 시리즈/카테고리/모드/타입 초기 삽입
async function insertStaticKeyValues() {
  await db.series.bulkPut([
    { serie_id: 1, serie_name: "1st To Zero" },
    { serie_id: 2, serie_name: "NX To NXA" },
    { serie_id: 3, serie_name: "FIESTA To FIESTA2" },
    { serie_id: 4, serie_name: "Prime" },
    { serie_id: 5, serie_name: "Prime 2" },
    { serie_id: 6, serie_name: "XX" },
    { serie_id: 7, serie_name: "Phoenix" }
  ]);

  await db.category.bulkPut([
    { category_id: 1, category_name: "Original" },
    { category_id: 2, category_name: "K-pop" },
    { category_id: 3, category_name: "World Music" },
    { category_id: 4, category_name: "J-Music" },
    { category_id: 5, category_name: "Xross" }
  ]);

  await db.type.bulkPut([
    { type_id: 1, type_name: "Arcade" },
    { type_id: 2, type_name: "Remix" },
    { type_id: 3, type_name: "Full Song" },
    { type_id: 4, type_name: "Short Cut" }
  ]);

  await db.mode.bulkPut([
    { mode_id: 1, mode_name: "Single" },
    { mode_id: 2, mode_name: "Double" },
    { mode_id: 3, mode_name: "Co-op" }
  ]);
}


export async function getFilteredRandomSongs({
  count,
  levelRange,
  modeIds = [],
  seriesIds = [],
  typeIds = [],
  categoryIds = []
}) {
  // 1. 모든 곡 + 채보를 JOIN
  const charts = await db.charts.toArray();
  const songs = await db.songs.toArray();

  // 2. lookup 테이블들 (mode_name 등용)
  const [modes, series, categories, types] = await Promise.all([
    db.mode.toArray(),
    db.series.toArray(),
    db.category.toArray(),
    db.type.toArray()
  ]);

  // 헬퍼: ID → 이름 매핑
  const idToName = (list, idKey = "mode_id", nameKey = "mode_name") =>
    Object.fromEntries(list.map((v) => [v[idKey], v[nameKey]]));

  const modeMap = idToName(modes, "mode_id", "mode_name");
  const seriesMap = idToName(series, "serie_id", "serie_name");
  const categoryMap = idToName(categories, "category_id", "category_name");
  const typeMap = idToName(types, "type_id", "type_name");

  // 3. 곡 + 채보 매핑
  const combined = charts.map(chart => {
    const song = songs.find(s => s.song_id === chart.song_id);
    if (!song) return null;

    return {
      chart_id: chart.chart_id,
      song_id: song.song_id,
      level: chart.level,
      mode_id: chart.mode,
      mode_name: modeMap[chart.mode],
      title: song.title,
      artist: song.artist,
      bpm_min: song.bpm_min,
      bpm_max: song.bpm_max,
      series_id: song.series,
      series_name: seriesMap[song.series],
      type_id: song.type,
      type_name: typeMap[song.type],
      category_id: song.category,
      category_name: categoryMap[song.category],
      premium: song.premium
    };
  }).filter(Boolean); // song이 없는 경우 제외

  // 4. 필터링
  const filtered = combined.filter(song =>
    song.level >= levelRange[0] &&
    song.level <= levelRange[1] &&
    (modeIds.length === 0 || modeIds.includes(song.mode_id)) &&
    (seriesIds.length === 0 || seriesIds.includes(song.series_id)) &&
    (typeIds.length === 0 || typeIds.includes(song.type_id)) &&
    (categoryIds.length === 0 || categoryIds.includes(song.category_id))
  );

  // 5. 랜덤 섞기 + 개수 제한
  const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled;
}