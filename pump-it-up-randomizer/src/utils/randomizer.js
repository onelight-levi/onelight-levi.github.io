// utils/randomizer.js
import { db } from './db';

export async function getFilteredEntities({
  count, minLevel, maxLevel, filters, isChartMode
}) {
  const songs = await db.songs.toArray();
  const artists = await db.artists.toArray();
  const series = await db.series.toArray();
  const modes = await db.mode.toArray();
  const types = await db.type.toArray();
  const categories = await db.category.toArray();

  const artistMap = Object.fromEntries(artists.map(a => [a.artist_id, a.name]));
  const seriesMap = Object.fromEntries(series.map(s => [s.serie_id, s.serie_name]));
  const modeMap = Object.fromEntries(modes.map(m => [m.mode_id, m.mode_name]));
  const typeMap = Object.fromEntries(types.map(t => [t.type_id, t.type_name]));
  const categoryMap = Object.fromEntries(categories.map(c => [c.category_id, c.category_name]));

  let items = [];

  if (isChartMode) {
    const charts = await db.charts.toArray();
    items = charts.map(ch => {
      const s = songs.find(so => so.song_id === ch.song);
      return {
        id: `chart-${ch.chart_id}`,
        songId: s.song_id,
        title: s.title,
        artist: artistMap[s.artist],
        bpm_min: s.bpm_min, bpm_max: s.bpm_max,
        series: seriesMap[s.series],
        category: categoryMap[s.category],
        type: typeMap[s.type],
        premium: s.premium,
        mode: modeMap[ch.mode],
        level: ch.level
      };
    });
  } else {
    items = songs.map(s => ({
      id: `song-${s.song_id}`,
      songId: s.song_id,
      title: s.title,
      artist: artistMap[s.artist],
      bpm_min: s.bpm_min, bpm_max: s.bpm_max,
      series: seriesMap[s.series],
      category: categoryMap[s.category],
      type: typeMap[s.type],
      premium: s.premium
    }));
  }

  console.log("chartMode : " + isChartMode + 
    " levelRange : " + minLevel + "~" + maxLevel + 
    " modeID : " + filters.mode + 
    " seriesID : " + filters.series + 
    " typeID : " + filters.type +
    " categoryID : " + filters.category);

  const filtered = items.filter(i =>
    (!isChartMode || (i.level >= minLevel && i.level <= maxLevel && (filters.mode.length === 0 || filters.mode.includes(i.mode)))) &&
    (filters.series.length === 0 || filters.series.includes(seriesMap[songs.find(s => s.song_id===i.songId).series])) &&
    (filters.type.length === 0 || filters.type.includes(typeMap[songs.find(s => s.song_id===i.songId).type])) &&
    (filters.category.length === 0 || filters.category.includes(categoryMap[songs.find(s => s.song_id===i.songId).category]))
  );

  console.log(filtered);

  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
