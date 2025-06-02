import { useState, useRef, useEffect } from 'react';

const TextFilter = ({ label, filterKey, options, selectedValues, onChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const safeSelectedValues = Array.isArray(selectedValues) ? selectedValues : [];
  const textRef = useRef(null);
  const containerRef = useRef(null);

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleCheckboxChange = (value) => {
    const newValues = safeSelectedValues.includes(value)
      ? safeSelectedValues.filter(v => v !== value)
      : [...safeSelectedValues, value];
    onChange(filterKey, newValues);
  };

  const handleMouseLeave = () => setIsOpen(false);

  const formatLabel = (value) => {
    if (filterKey === 'bedrooms') return value === '1' ? "1 спальня" : `${value} спальни`;
    if (filterKey === 'bathrooms') return value === '1' ? "1 ванна" : `${value} ванные`;
    return value;
  };

  useEffect(() => {
    const updateArrowVisibility = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.offsetWidth;
        const containerWidth = containerRef.current.offsetWidth;
        const arrowSpace = 32;
        setShowArrow(textWidth + arrowSpace < containerWidth);
      }
    };

    updateArrowVisibility();
    window.addEventListener('resize', updateArrowVisibility);
    return () => window.removeEventListener('resize', updateArrowVisibility);
  }, [safeSelectedValues]);

  return (
    <div className="relative w-full max-w-full">
      <label className="block text-xs sm:text-sm font-medium text-[var(--gray-700)]" style={{ fontSize: 'var(--font-size-xs)' }}>{label}</label>
      <div className="relative mt-1">
        <div
          ref={containerRef}
          className="p-2 border border-[var(--gray-200)] rounded-md w-full bg-[var(--white)] cursor-pointer focus:ring-[var(--primary)] focus:border-[var(--primary)] overflow-hidden relative text-xs sm:text-sm"
          style={{ fontSize: 'var(--font-size-xs)' }}
          onClick={toggleDropdown}
          style={{
            background: showArrow
              ? "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%221.5%22 stroke=%22%23A1A1AA%22 class=%22w-4 h-4%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22 /%3E%3C/svg%3E') no-repeat right 1rem center"
              : 'none',
            backgroundSize: '1rem',
          }}
        >
          <span
            ref={textRef}
            className={`${safeSelectedValues.length === 0 ? 'text-[var(--gray-400)]' : 'text-[var(--gray-700)]'} text-xs sm:text-sm whitespace-nowrap`}
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            {safeSelectedValues.length === 0 ? 'Выберите' : safeSelectedValues.join(', ')}
          </span>
          {showArrow && (
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-[var(--white)] pointer-events-none" />
          )}
        </div>
        {isOpen && (
          <div
            className="absolute top-0 left-0 w-full bg-[var(--white)] border border-[var(--gray-200)] rounded-md shadow-lg max-h-60 overflow-y-auto z-[1000] text-xs sm:text-sm"
            style={{ fontSize: 'var(--font-size-xs)', background: 'var(--white)' }}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="p-2 text-xs sm:text-sm text-[var(--blue-600)] hover:bg-[var(--gray-200)] cursor-pointer sticky top-0 bg-[var(--white)] z-10 whitespace-nowrap"
              style={{ fontSize: 'var(--font-size-xs)' }}
              onClick={() => { onReset(filterKey); setIsOpen(false); }}
            >
              Сбросить
            </div>
            <div
              className="relative z-0"
              style={{ background: 'linear-gradient(to bottom, transparent 90%, var(--white) 100%)' }}
            >
              {options.map(value => (
                <div
                  key={value}
                  className="p-2 text-xs sm:text-sm text-[var(--gray-700)] hover:bg-[var(--gray-200)] flex items-center cursor-pointer whitespace-nowrap"
                  style={{ fontSize: 'var(--font-size-xs)' }}
                  onClick={() => handleCheckboxChange(value)}
                >
                  <input
                    type="checkbox"
                    checked={safeSelectedValues.includes(value)}
                    onChange={() => handleCheckboxChange(value)}
                    className="mr-2 h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--gray-200)] rounded"
                    style={{ fontSize: 'var(--font-size-xs)' }}
                  />
                  {formatLabel(value)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextFilter;