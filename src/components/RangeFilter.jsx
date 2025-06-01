import { useState, useEffect } from 'react';

const RangeFilter = ({ label, filterKey, range, value, onChange }) => {
  const [rawMinValue, setRawMinValue] = useState(value.min.toString());
  const [rawMaxValue, setRawMaxValue] = useState(value.max.toString());
  const isPriceField = filterKey === "price";

  const formatNumber = (num) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') || '';
  const parseNumber = (str) => parseInt(str.replace(/\s/g, ''), 10) || 0;

  const handleValueChange = (isMinField, newValue) => {
    let parsedValue = isPriceField ? parseNumber(newValue) : parseInt(newValue);
    if (isNaN(parsedValue)) parsedValue = range.min;
    parsedValue = Math.min(Math.max(parsedValue, range.min), range.max);

    if (isMinField) {
      const newMin = Math.min(parsedValue, value.max);
      onChange(filterKey, { min: newMin, max: value.max });
      setRawMinValue(isPriceField ? formatNumber(newMin) : newMin.toString());
    } else {
      const newMax = Math.max(parsedValue, value.min);
      onChange(filterKey, { min: value.min, max: newMax });
      setRawMaxValue(isPriceField ? formatNumber(newMax) : newMax.toString());
    }
  };

  useEffect(() => {
    setRawMinValue(isPriceField ? formatNumber(value.min) : value.min.toString());
    setRawMaxValue(isPriceField ? formatNumber(value.max) : value.max.toString());
  }, [value.min, value.max, isPriceField]);

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--gray-700)]">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--gray-600)]">от</span>
        <input
          type="range"
          min={range.min}
          max={range.max}
          value={value.min}
          onChange={e => handleValueChange(true, e.target.value)}
          className="w-full"
        />
        <div className="relative min-w-[100px]">
          <input
            type={isPriceField ? "text" : "number"}
            value={isPriceField ? rawMinValue : value.min}
            onChange={e => setRawMinValue(e.target.value)}
            onFocus={e => e.target.select()}
            onBlur={e => handleValueChange(true, rawMinValue)}
            onKeyDown={e => e.key === 'Enter' && handleValueChange(true, rawMinValue)}
            className="p-1 border border-[var(--gray-200)] rounded-md w-full focus:ring-[var(--primary)] focus:border-[var(--primary)] overflow-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <span className="text-sm text-[var(--gray-600)]">до</span>
        <input
          type="range"
          min={range.min}
          max={range.max}
          value={value.max}
          onChange={e => handleValueChange(false, e.target.value)}
          className="w-full"
        />
        <div className="relative min-w-[100px]">
          <input
            type={isPriceField ? "text" : "number"}
            value={isPriceField ? rawMaxValue : value.max}
            onChange={e => setRawMaxValue(e.target.value)}
            onFocus={e => e.target.select()}
            onBlur={e => handleValueChange(false, rawMaxValue)}
            onKeyDown={e => e.key === 'Enter' && handleValueChange(false, rawMaxValue)}
            className="p-1 border border-[var(--gray-200)] rounded-md w-full focus:ring-[var(--primary)] focus:border-[var(--primary)] overflow-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
};

export default RangeFilter;