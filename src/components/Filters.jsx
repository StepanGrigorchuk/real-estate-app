import { useState, forwardRef, useEffect, useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import TextFilter from './TextFilter';
import RangeFilter from './RangeFilter';

const Filters = forwardRef(({ properties, onApplyFilters, onResetFilters, initialFilters, cardsRef, tagFilter, resetTagFilter, onTagOptionsChange }, ref) => {
  const ranges = useMemo(() => {
    const ranges = {
      yearBuilt: { min: Infinity, max: -Infinity },
      area: { min: Infinity, max: -Infinity },
      price: { min: Infinity, max: -Infinity },
      floor: { min: Infinity, max: -Infinity },
    };

    properties.forEach(property => {
      if (property.tags && typeof property.tags === 'object') {
        if (property.tags.yearBuilt) {
          ranges.yearBuilt.min = Math.min(ranges.yearBuilt.min, property.tags.yearBuilt);
          ranges.yearBuilt.max = Math.max(ranges.yearBuilt.max, property.tags.yearBuilt);
        }
        if (property.tags.area) {
          ranges.area.min = Math.min(ranges.area.min, property.tags.area);
          ranges.area.max = Math.max(ranges.area.max, property.tags.area);
        }
        if (property.tags.price) {
          ranges.price.min = Math.min(ranges.price.min, property.tags.price);
          ranges.price.max = Math.max(ranges.price.max, property.tags.price);
        }
        if (property.tags.floor) {
          ranges.floor.min = Math.min(ranges.floor.min, property.tags.floor);
          ranges.floor.max = Math.max(ranges.floor.max, property.tags.floor);
        }
      }
    });

    Object.keys(ranges).forEach(key => {
      if (ranges[key].min === Infinity) ranges[key].min = 0;
      if (ranges[key].max === -Infinity) ranges[key].max = 100;
    });

    return ranges;
  }, [properties]);

  const tagOptions = useMemo(() => {
    const options = {};
    properties.forEach(property => {
      if (property.tags && typeof property.tags === 'object') {
        Object.entries(property.tags).forEach(([key, value]) => {
          if (!options[key]) options[key] = new Set();
          if (key === 'parking') {
            const formattedValue = value === true || value === 'true' || value === 'Есть' ? 'Есть парковка' : 'Нет парковки';
            options[key].add(formattedValue);
          } else {
            options[key].add(String(value).charAt(0).toUpperCase() + String(value).slice(1));
          }
        });
      }
    });

    options.developer = new Set(properties.map(p => p.developer ? String(p.developer).charAt(0).toUpperCase() + String(p.developer).slice(1) : null).filter(d => d));
    options.complex = new Set(properties.map(p => p.complex ? String(p.complex).charAt(0).toUpperCase() + String(p.complex).slice(1) : null).filter(c => c));
    options.finishing = new Set(['Мебель', 'Чистовая', 'Штукатурка']);
    options.district = new Set(['Курортный', 'Спальный', 'Отдалённый']);
    options.material = new Set(['Кирпич', 'Бетон', 'Дерево', 'Панель']);
    options.parking = new Set(['Нет парковки', 'Есть парковка']);
    return options;
  }, [properties]);

  useEffect(() => {
    if (onTagOptionsChange) {
      onTagOptionsChange(tagOptions);
    }
  }, [tagOptions, onTagOptionsChange]);

  const dynamicInitialFilters = {
    ...initialFilters,
    type: [],
    rooms: [],
    developer: [],
    complex: [],
    yearBuilt: { min: ranges.yearBuilt.min, max: ranges.yearBuilt.max },
    material: [],
    area: { min: ranges.area.min, max: ranges.area.max },
    price: { min: ranges.price.min, max: ranges.price.max },
    floor: { min: ranges.floor.min, max: ranges.floor.max },
    bedrooms: [],
    bathrooms: [],
    parking: [],
    condition: [],
    location: [],
    finishing: [],
    district: [],
  };

  const [tempFilters, setTempFilters] = useState(() => {
    const savedTempFilters = localStorage.getItem('tempFilters');
    return savedTempFilters ? JSON.parse(savedTempFilters) : dynamicInitialFilters;
  });
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(() => {
    const savedCollapsed = localStorage.getItem('isFiltersCollapsed');
    return savedCollapsed ? JSON.parse(savedCollapsed) : true;
  });

  useEffect(() => {
    localStorage.setItem('tempFilters', JSON.stringify(tempFilters));
  }, [tempFilters]);

  useEffect(() => {
    localStorage.setItem('isFiltersCollapsed', JSON.stringify(isFiltersCollapsed));
  }, [isFiltersCollapsed]);

  const animationPropsCollapsed = useSpring({
    opacity: isFiltersCollapsed ? 1 : 0,
    height: isFiltersCollapsed ? 'auto' : 0,
    config: { tension: 280, friction: 60 },
  });

  const animationPropsExpanded = useSpring({
    opacity: isFiltersCollapsed ? 0 : 1,
    height: isFiltersCollapsed ? 0 : 'auto',
    config: { tension: 280, friction: 60 },
  });

  useEffect(() => {
    if (tagFilter && tagFilter.key && tagFilter.value) {
      console.log("Filters: Syncing tagFilter:", tagFilter);
      const newFilters = {
        ...tempFilters,
        [tagFilter.key]: [tagFilter.value],
      };
      setTempFilters(newFilters);
      onApplyFilters(newFilters);
    }
  }, [tagFilter]);

  if (!properties || !Array.isArray(properties)) {
    console.error("Filters: Properties is not an array or is undefined");
    return <div className="text-[var(--red-600)] p-4">Ошибка: данные для фильтров недоступны</div>;
  }

  const filterConfig = [
    { label: "Тип", key: "type", options: [...tagOptions.type] },
    { label: "Комнаты", key: "rooms", options: ["1-комнатная", "2-комнатная", "3-комнатная", "4-комнатная"] },
    { label: "Застройщик", key: "developer", options: [...tagOptions.developer] },
    { label: "ЖК", key: "complex", options: [...tagOptions.complex] },
    { label: "Материал здания", key: "material", options: [...tagOptions.material] },
    { label: "Количество спален", key: "bedrooms", options: [...tagOptions.bedrooms] },
    { label: "Количество ванных комнат", key: "bathrooms", options: [...tagOptions.bathrooms] },
    { label: "Парковка", key: "parking", options: [...tagOptions.parking] },
    { label: "Состояние", key: "condition", options: [...tagOptions.condition] },
    { label: "Местоположение", key: "location", options: [...tagOptions.location] },
    { label: "Отделка", key: "finishing", options: [...tagOptions.finishing] },
    { label: "Район", key: "district", options: [...tagOptions.district] },
    { label: "Год сдачи", key: "yearBuilt", type: "range", range: ranges.yearBuilt },
    { label: "Площадь (м²)", key: "area", type: "range", range: ranges.area },
    { label: "Цена (₽)", key: "price", type: "range", range: ranges.price },
    { label: "Этаж", key: "floor", type: "range", range: ranges.floor },
  ];

  const getFilteredCount = (filters) => {
    try {
      const count = properties.filter(property => {
        if (!property.tags || typeof property.tags !== 'object') {
          console.warn("Filters: Skipping property with invalid tags:", property);
          return false;
        }

        return filterConfig.every(filter => {
          if (filter.type === "range") {
            const { min, max } = filters[filter.key];
            const value = property.tags[filter.key];
            return !min || !max || (value >= min && value <= max);
          } else {
            const selectedValues = filters[filter.key] || [];
            const value = filter.key === 'developer' || filter.key === 'complex'
              ? property[filter.key]
              : property.tags[filter.key];
            const formattedValue = filter.key === 'parking'
              ? (value === true || value === 'true' || value === 'Есть' ? 'Есть парковка' : 'Нет парковки')
              : value;
            return selectedValues.length === 0 || selectedValues.includes(String(formattedValue));
          }
        });
      }).length;
      console.log("Filters: Filtered count:", count);
      return count;
    } catch (err) {
      console.error("Filters: Error in getFilteredCount:", err);
      return 0;
    }
  };

  const handleFilterChange = (key, value) => {
    setTempFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (tagFilter && tagFilter.key === key && !value.includes(tagFilter.value)) {
        resetTagFilter();
      }
      return newFilters;
    });
  };

  const handleResetFilter = (key) => {
    setTempFilters(prev => {
      const newFilters = { ...prev, [key]: [] };
      if (tagFilter && tagFilter.key === key) {
        resetTagFilter();
      }
      return newFilters;
    });
  };

  const applyFilters = () => {
    console.log("Filters: Applying filters:", tempFilters);
    onApplyFilters(tempFilters);
    if (cardsRef.current) {
      console.log("Filters: Scrolling to cards, cardsRef:", cardsRef.current);
      const elementPosition = cardsRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - 88, // Увеличенный отступ с учётом хедера
        behavior: 'smooth',
      });
    } else {
      console.error("Filters: cardsRef is null");
    }
  };

  const resetFilters = () => {
    console.log("Filters: Resetting filters:", dynamicInitialFilters);
    setTempFilters(dynamicInitialFilters);
    onApplyFilters(dynamicInitialFilters);
    resetTagFilter();
    localStorage.removeItem('tempFilters');
    localStorage.removeItem('isFiltersCollapsed');
  };

  const toggleFilters = () => {
    setIsFiltersCollapsed(prev => {
      const newState = !prev;
      if (newState && cardsRef.current) { // Если фильтры сворачиваются (newState = true), мгновенно прокручиваем к карточкам
        const elementPosition = cardsRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - 88, // Увеличенный отступ с учётом хедера
          behavior: 'auto',
        });
      } else if (!newState && ref.current) { // Если фильтры разворачиваются (newState = false), мгновенно прокручиваем к фильтрам
        const elementPosition = ref.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - 88, // Увеличенный отступ с учётом хедера
          behavior: 'auto',
        });
      }
      return newState;
    });
  };

  const filteredCount = getFilteredCount(tempFilters);

  return (
    <div ref={ref} className="bg-[var(--gray-50)] p-4 rounded-lg shadow-sm relative z-[1000]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--gray-800)] z-0">Фильтры</h3>
      </div>
      <div>
        {isFiltersCollapsed ? (
          <animated.div style={animationPropsCollapsed} className="overflow-visible z-[1000]">
            <div className="grid grid-cols-6 gap-4 px-6">
              <div className="col-span-1">
                <TextFilter
                  label="Комнаты"
                  filterKey="rooms"
                  options={["1-комнатная", "2-комнатная", "3-комнатная", "4-комнатная"]}
                  selectedValues={tempFilters.rooms}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-1">
                <TextFilter
                  label="ЖК"
                  filterKey="complex"
                  options={[...tagOptions.complex]}
                  selectedValues={tempFilters.complex}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-1">
                <TextFilter
                  label="Отделка"
                  filterKey="finishing"
                  options={[...tagOptions.finishing]}
                  selectedValues={tempFilters.finishing}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-3">
                <RangeFilter
                  label="Цена (₽)"
                  filterKey="price"
                  range={ranges.price}
                  value={tempFilters.price}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </animated.div>
        ) : (
          <animated.div style={animationPropsExpanded} className="overflow-hidden z-[1000]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-32 gap-y-6 px-6 mb-14">
              {filterConfig.filter(f => f.type !== "range").map(filter => (
                <TextFilter
                  key={filter.key}
                  label={filter.label}
                  filterKey={filter.key}
                  options={filter.options}
                  selectedValues={tempFilters[filter.key]}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-48 gap-y-12 px-6 mb-24">
              {filterConfig.filter(f => f.type === "range").map(filter => (
                <RangeFilter
                  key={filter.key}
                  label={filter.label}
                  filterKey={filter.key}
                  range={filter.range}
                  value={tempFilters[filter.key]}
                  onChange={handleFilterChange}
                />
              ))}
            </div>
          </animated.div>
        )}
      </div>
      <div className="flex justify-between items-center gap-4 mt-4 px-6 z-10">
        <button
          onClick={toggleFilters}
          className="text-[var(--gray-600)] underline text-sm hover:text-[var(--gray-800)] transition"
        >
          {isFiltersCollapsed ? "Развернуть фильтры" : "Свернуть фильтры"}
        </button>
        <div className="flex gap-4">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[var(--gray-200)] text-[var(--gray-800)] rounded-lg hover:bg-[var(--gray-300)] transition"
          >
            Сбросить
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--white)] rounded-lg hover:bg-[var(--blue-600)] transition"
          >
            Показать {filteredCount} вариантов
          </button>
        </div>
      </div>
    </div>
  );
});

export default Filters;