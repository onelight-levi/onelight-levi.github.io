function FilterPanel({ filters, setFilters }) {
  const options = {
    mode: ["Single", "Double", "Co-op"],
    series: ["1st To Zero", "NX To NXA", "FIESTA To FIESTA2", "Prime", "Prime 2" ,"XX", "Phoenix",],
    category: ["Original", "K-pop", "World Music", "J-Music", "Xross"],
    type: ["Arcade", "Remix", "Full Song", "Short Cut"],
  };

  const toggle = (type, value) => {
    setFilters(prev => {
      const updated = prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value];
      return { ...prev, [type]: updated };
    });
  };

  return (
    <div className="grid gap-2">
      {Object.entries(options).map(([type, list]) => (
        <fieldset key={type}>
          <legend className="font-bold capitalize">{type}</legend>
          <div className="flex gap-2 flex-wrap">
            {list.map(opt => (
              <label key={opt} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={filters[type].includes(opt)}
                  onChange={() => toggle(type, opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default FilterPanel;
