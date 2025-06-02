import { useState, forwardRef, useEffect, useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import TextFilter from './TextFilter';
import RangeFilter from './RangeFilter';

const Filters = forwardRef(({ properties, onApplyFilters, onResetFilters, initialFilters, cardsRef, tagFilter, resetTagFilter, onTagOptionsChange }, ref) => {
  const ranges = useMemo(() => {
    const ranges = {
      price: { min: Infinity, max: -Infinity },
      delivery: { min: Infinity, max: -Infinity },
      area: { min: Infinity, max: -Infinity },
      floor: { min: Infinity, max: -Infinity },
    };
    properties.forEach(property => {
      if (property.tags && typeof property.tags === 'object') {
        if (property.tags.delivery) {
          ranges.delivery.min = Math.min(ranges.delivery.min, property.tags.delivery);
          ranges.delivery.max = Math.max(ranges.delivery.max, property.tags.delivery);
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
          options[key].add(String(value)); // сохраняем как есть, без изменения регистра
        });
      }
    });
    return options;
  }, [properties]);

  useEffect(() => {
    if (onTagOptionsChange) {
      onTagOptionsChange(tagOptions);
    }
  }, [tagOptions, onTagOptionsChange]);

  const dynamicInitialFilters = {
    ...initialFilters,
    // Новый набор фильтров только по актуальным тегам
    price: { min: ranges.price?.min ?? 0, max: ranges.price?.max ?? 0 },
    rooms: [],
    city: [],
    delivery: { min: ranges.delivery?.min ?? 0, max: ranges.delivery?.max ?? 0 },
    area: { min: ranges.area?.min ?? 0, max: ranges.area?.max ?? 0 },
    'sea-distance': [],
    type: [],
    view: [],
    finishing: [],
    floor: { min: ranges.floor?.min ?? 0, max: ranges.floor?.max ?? 0 },
    payment: [],
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
    { label: "Цена (₽)", key: "price", type: "range", range: ranges.price },
    { label: "Комнатность", key: "rooms", options: Array.from(tagOptions.rooms || []) },
    { label: "Город", key: "city", options: Array.from(tagOptions.city || []) },
    { label: "Расстояние до моря", key: "sea-distance", options: Array.from(tagOptions['sea-distance'] || []) },
    { label: "Тип", key: "type", options: Array.from(tagOptions.type || []) },
    { label: "Вид из окна", key: "view", options: Array.from(tagOptions.view || []) },
    { label: "Отделка", key: "finishing", options: Array.from(tagOptions.finishing || []) },
    { label: "Этаж", key: "floor", type: "range", range: ranges.floor },
    { label: "Способ оплаты", key: "payment", options: Array.from(tagOptions.payment || []) },
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
                  options={Array.from(tagOptions.rooms || [])}
                  selectedValues={tempFilters.rooms}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-1">
                <TextFilter
                  label="ЖК"
                  filterKey="complex"
                  options={Array.from(tagOptions.complex || [])}
                  selectedValues={tempFilters.complex}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-1">
                <TextFilter
                  label="Отделка"
                  filterKey="finishing"
                  options={Array.from(tagOptions.finishing || [])}
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