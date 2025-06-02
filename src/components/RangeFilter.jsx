import { useState, useEffect } from 'react';

const RangeFilter = ({ label, filterKey, range, value, onChange }) => {
  // Гарантируем, что range всегда объект с min/max числами
  const normalizedRange = (range && typeof range === 'object') ? range : { min: 0, max: 0 };
  const safeMin = typeof normalizedRange.min === 'number' && !isNaN(normalizedRange.min) ? normalizedRange.min : 0;
  const safeMax = typeof normalizedRange.max === 'number' && !isNaN(normalizedRange.max) ? normalizedRange.max : 0;
  
  // Гарантируем, что value всегда объект с min/max
  const normalizedValue = (value && typeof value === 'object') ? value : { min: safeMin, max: safeMax };
  const safeValueMin = typeof normalizedValue.min === 'number' ? normalizedValue.min : safeMin;
  const safeValueMax = typeof normalizedValue.max === 'number' ? normalizedValue.max : safeMax;
  
  const [rawMinValue, setRawMinValue] = useState(safeValueMin.toString());
  const [rawMaxValue, setRawMaxValue] = useState(safeValueMax.toString());
  const isPriceField = filterKey === "price";

  const formatNumber = (num) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') || '';
  const parseNumber = (str) => parseInt(str.replace(/\s/g, ''), 10) || 0;
  
  const handleValueChange = (isMinField, newValue) => {
    let parsedValue = isPriceField ? parseNumber(newValue) : parseInt(newValue);
    if (isNaN(parsedValue)) parsedValue = safeMin;
    parsedValue = Math.min(Math.max(parsedValue, safeMin), safeMax);

    if (isMinField) {
      const newMin = Math.min(parsedValue, safeValueMax);
      onChange(filterKey, { min: newMin, max: safeValueMax });
      setRawMinValue(isPriceField ? formatNumber(newMin) : newMin.toString());
    } else {
      const newMax = Math.max(parsedValue, safeValueMin);
      onChange(filterKey, { min: safeValueMin, max: newMax });
      setRawMaxValue(isPriceField ? formatNumber(newMax) : newMax.toString());
    }
  };
  
  useEffect(() => {
    setRawMinValue(isPriceField ? formatNumber(safeValueMin) : safeValueMin.toString());
    setRawMaxValue(isPriceField ? formatNumber(safeValueMax) : safeValueMax.toString());
  }, [safeValueMin, safeValueMax, isPriceField]);

  // Если нет данных для диапазона — не отображаем фильтр
  if (range?.min == null || range?.max == null) {
    return (
      <div>
        <label className="block font-medium text-[var(--gray-700)] text-small">{label}</label>
        <div className="text-[var(--gray-400)] italic text-caption">Нет данных для фильтрации</div>
      </div>
    );
  }
  return (
    <div className="space-y-3 w-full" data-filter={filterKey}>
      <label className="block font-medium text-[var(--gray-700)] text-small">{label}</label>
        {/* Простой dual-range слайдер */}      <div className="relative w-full">
        <div className="relative h-2 bg-[var(--gray-200)] rounded-lg w-full">
          {/* Активная область между значениями */}
          <div 
            className="absolute h-full bg-[var(--primary)] rounded-lg"
            style={{
              left: `${((safeValueMin - safeMin) / (safeMax - safeMin)) * 100}%`,
              width: `${((safeValueMax - safeValueMin) / (safeMax - safeMin)) * 100}%`
            }}
          />
          
          {/* Максимальный слайдер */}
          <input
            type="range"
            min={safeMin}
            max={safeMax}
            value={safeValueMax}
            onChange={e => handleValueChange(false, e.target.value)}
            className="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer simple-range-slider range-slider-max"
            style={{ zIndex: 1 }}
          />
          
          {/* Минимальный слайдер */}
          <input
            type="range"
            min={safeMin}
            max={safeMax}
            value={safeValueMin}
            onChange={e => handleValueChange(true, e.target.value)}
            className="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer simple-range-slider range-slider-min"
            style={{ zIndex: 2 }}
          />
        </div>
      </div>{/* Поля ввода под слайдером */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="flex items-center gap-2">
          <span className="text-caption text-[var(--gray-600)] whitespace-nowrap">от</span>
          <input
            type={isPriceField ? "text" : "number"}
            value={isPriceField ? rawMinValue : safeValueMin}
            onChange={e => setRawMinValue(e.target.value)}
            onFocus={e => e.target.select()}
            onBlur={e => handleValueChange(true, rawMinValue)}
            onKeyDown={e => e.key === 'Enter' && handleValueChange(true, rawMinValue)}
            className="w-24 p-2 text-small border border-[var(--gray-200)] rounded focus:ring-[var(--primary)] focus:border-[var(--primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-caption text-[var(--gray-600)] whitespace-nowrap">до</span>
          <input
            type={isPriceField ? "text" : "number"}
            value={isPriceField ? rawMaxValue : safeValueMax}
            onChange={e => setRawMaxValue(e.target.value)}
            onFocus={e => e.target.select()}
            onBlur={e => handleValueChange(false, rawMaxValue)}
            onKeyDown={e => e.key === 'Enter' && handleValueChange(false, rawMaxValue)}
            className="w-24 p-2 text-small border border-[var(--gray-200)] rounded focus:ring-[var(--primary)] focus:border-[var(--primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
};

export default RangeFilter;