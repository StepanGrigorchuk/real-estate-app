import { useState, forwardRef, useEffect, useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import TextFilter from './TextFilter';
import RangeFilter from './RangeFilter';

const Filters = forwardRef(({ properties, onApplyFilters, onResetFilters, initialFilters, cardsRef, tagFilter, resetTagFilter, onTagOptionsChange, total }, ref) => {
  // Диапазоны min/max теперь только с backend
  const [serverRanges, setServerRanges] = useState({ price: { min: null, max: null }, area: { min: null, max: null }, delivery: { min: null, max: null }, floor: { min: null, max: null } });
  const [rangesLoading, setRangesLoading] = useState(true);
  const [rangesError, setRangesError] = useState(null);

  useEffect(() => {
    setRangesLoading(true);
    setRangesError(null);
    fetch('/api/properties/ranges')
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки диапазонов');
        return res.json();
      })
      .then(data => {
        setServerRanges(data);
        setRangesLoading(false);
      })
      .catch((err) => {
        setServerRanges({ price: { min: null, max: null }, area: { min: null, max: null }, delivery: { min: null, max: null }, floor: { min: null, max: null } });
        setRangesError(err.message || 'Ошибка загрузки диапазонов');
        setRangesLoading(false);
      });
  }, []);

  // Получение tagOptions с сервера (уникальные значения для фильтров)
  const [serverTagOptions, setServerTagOptions] = useState({});
  useEffect(() => {
    fetch('/api/properties?limit=0')
      .then(res => res.json())
      .then(data => {
        const options = {};
        (data.properties || []).forEach(property => {
          if (property.tags && typeof property.tags === 'object') {
            Object.entries(property.tags).forEach(([key, value]) => {
              if (!options[key]) options[key] = new Set();
              options[key].add(String(value));
            });
          }
        });
        // Преобразуем Set в массивы
        Object.keys(options).forEach(key => {
          options[key] = Array.from(options[key]);
        });
        setServerTagOptions(options);
        if (onTagOptionsChange) onTagOptionsChange(options);
      });
  }, []);

  const dynamicInitialFilters = {
    ...initialFilters,
    // Новый набор фильтров только по актуальным тегам
    price: { min: serverRanges.price?.min ?? 0, max: serverRanges.price?.max ?? 0 },
    rooms: [],
    city: [],
    delivery: { min: serverRanges.delivery?.min ?? 0, max: serverRanges.delivery?.max ?? 0 },
    area: { min: serverRanges.area?.min ?? 0, max: serverRanges.area?.max ?? 0 },
    'sea-distance': [],
    type: [],
    view: [],
    finishing: [],
    floor: { min: serverRanges.floor?.min ?? 0, max: serverRanges.floor?.max ?? 0 },
    payment: [],
  };

  const [tempFilters, setTempFilters] = useState(() => {
    const savedTempFilters = localStorage.getItem('tempFilters');
    return savedTempFilters ? JSON.parse(savedTempFilters) : dynamicInitialFilters;
  });

  // Сброс фильтров при изменении ranges (то есть когда properties загружены)
  useEffect(() => {
    setTempFilters(dynamicInitialFilters);
  }, [serverRanges.price.min, serverRanges.price.max, serverRanges.area.min, serverRanges.area.max, serverRanges.delivery.min, serverRanges.delivery.max, serverRanges.floor.min, serverRanges.floor.max]);

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

  // Проверка готовности serverRanges для RangeFilter
  const isRangesReady = serverRanges && ['price','area','delivery','floor'].every(key => key in serverRanges);

  // Используем serverTagOptions вместо tagOptions для фильтров
  const filterConfig = [
    { label: "Цена (₽)", key: "price", type: "range", range: serverRanges.price },
    { label: "Комнатность", key: "rooms", options: serverTagOptions.rooms || [] },
    { label: "Город", key: "city", options: serverTagOptions.city || [] },
    { label: "Тип", key: "type", options: serverTagOptions.type || [] },
    { label: "Вид из окна", key: "view", options: serverTagOptions.view || [] },
    { label: "Отделка", key: "finishing", options: serverTagOptions.finishing || [] },
    { label: "Этаж", key: "floor", type: "range", range: serverRanges.floor },
    { label: "Способ оплаты", key: "payment", options: serverTagOptions.payment || [] },
  ];

  // Счётчик подходящих объектов с сервера
  const [serverCount, setServerCount] = useState(total || 0);

  // Формируем query string для фильтров
  const buildQuery = (filters) => {
    const params = new URLSearchParams();
    if (filters.price?.min != null) params.append('priceMin', filters.price.min);
    if (filters.price?.max != null) params.append('priceMax', filters.price.max);
    if (filters.area?.min != null) params.append('areaMin', filters.area.min);
    if (filters.area?.max != null) params.append('areaMax', filters.area.max);
    if (filters.floor?.min != null) params.append('floorMin', filters.floor.min);
    if (filters.floor?.max != null) params.append('floorMax', filters.floor.max);
    ['rooms','city','type','view','finishing','payment','sea-distance'].forEach(key => {
      if (Array.isArray(filters[key]) && filters[key].length > 0) {
        filters[key].filter(v => v && v !== '').forEach(val => params.append(key, val));
      }
    });
    params.append('limit', '20'); // limit всегда 20, не 0
    return params.toString();
  };

  // Получаем count с сервера при изменении фильтров
  useEffect(() => {
    const query = buildQuery(tempFilters);
    fetch(`/api/properties?${query}`)
      .then(res => res.json())
      .then(data => setServerCount(data.total || 0))
      .catch(() => setServerCount(0));
  }, [tempFilters]);

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
    const cleanFilters = {};
    Object.entries(dynamicInitialFilters).forEach(([key, val]) => {
      if (typeof val === 'object' && val !== null && ('min' in val || 'max' in val)) {
        if (val.min != null || val.max != null) {
          cleanFilters[key] = {};
          if (val.min != null) cleanFilters[key].min = val.min;
          if (val.max != null) cleanFilters[key].max = val.max;
        }
      } else if (Array.isArray(val)) {
        if (val.length > 0) cleanFilters[key] = val;
      } else if (val != null && val !== '') {
        cleanFilters[key] = val;
      }
    });
    setTempFilters(cleanFilters);
    onApplyFilters(cleanFilters);
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

  // filteredCount — только для локального массива, total — с сервера
  const isFiltersApplied = Object.values(tempFilters).some(val => {
    if (Array.isArray(val)) return val.length > 0;
    if (val && typeof val === 'object') return val.min != null || val.max != null;
    return val != null && val !== '';
  });
  const countToShow = serverCount;

  if (rangesLoading) {
    return <div className="text-center text-gray-600 p-6">Загрузка диапазонов фильтров...</div>;
  }
  if (rangesError) {
    return <div className="text-center text-red-600 p-6">Ошибка загрузки диапазонов: {rangesError}</div>;
  }
  if (!isRangesReady) {
    return <div className="text-center text-gray-600 p-6">Диапазоны фильтров недоступны. Попробуйте позже.</div>;
  }

  return (
    <div ref={ref} className="bg-[var(--gray-50)] p-2 sm:p-4 rounded-lg shadow-sm relative z-[1000] mt-4 sm:mt-10 w-full max-w-full overflow-x-auto">
      <div>
        {isFiltersCollapsed ? (
          <animated.div style={animationPropsCollapsed} className="overflow-visible z-[1000]">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-4 px-2 sm:px-6">
              <div className="col-span-1">
                <TextFilter
                  label="Комнаты"
                  filterKey="rooms"
                  options={Array.from(serverTagOptions.rooms || [])}
                  selectedValues={tempFilters.rooms}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-1">
                <TextFilter
                  label="Город"
                  filterKey="city"
                  options={Array.from(serverTagOptions.city || [])}
                  selectedValues={tempFilters.city}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-1">
                <TextFilter
                  label="Тип"
                  filterKey="type"
                  options={Array.from(serverTagOptions.type || [])}
                  selectedValues={tempFilters.type}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-1">
                <TextFilter
                  label="Вид из окна"
                  filterKey="view"
                  options={Array.from(serverTagOptions.view || [])}
                  selectedValues={tempFilters.view}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-1">
                <TextFilter
                  label="Отделка"
                  filterKey="finishing"
                  options={Array.from(serverTagOptions.finishing || [])}
                  selectedValues={tempFilters.finishing}
                  onChange={handleFilterChange}
                  onReset={handleResetFilter}
                />
              </div>
              <div className="col-span-2">
                <RangeFilter
                  label="Цена (₽)"
                  filterKey="price"
                  range={serverRanges.price}
                  value={tempFilters.price}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </animated.div>
        ) : (
          <animated.div style={animationPropsExpanded} className="overflow-hidden z-[1000]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 sm:gap-x-32 gap-y-4 sm:gap-y-6 px-2 sm:px-6 mb-8 sm:mb-14">
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
            Показать {countToShow} вариантов
          </button>
        </div>
      </div>
    </div>
  );
});

export default Filters;