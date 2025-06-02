import { useState, useRef, useEffect, useCallback } from 'react';
import PropertyCard from './PropertyCard';
import Filters from './Filters';

function Catalog({ onTagClick, filtersRef, tagFilter, resetTagFilter }) {
  const initialFilters = {
    price: { min: null, max: null },
    rooms: [],
    city: [],
    delivery: { min: null, max: null },
    area: { min: null, max: null },
    'sea-distance': [],
    type: [],
    view: [],
    finishing: [],
    floor: { min: null, max: null },
    payment: [],
  };

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(() => {
    const savedFilters = localStorage.getItem('appliedFilters');
    return savedFilters ? JSON.parse(savedFilters) : initialFilters;
  });
  const [sortOption, setSortOption] = useState('none');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [tagOptions, setTagOptions] = useState({}); // Добавляем состояние для tagOptions, чтобы не было ReferenceError
  const [isSortOpen, setIsSortOpen] = useState(false); // Добавляем состояние для isSortOpen (сортировка)
  const limit = 20;

  const cardsRef = useRef(null);
  const scrollButtonRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('appliedFilters', JSON.stringify(appliedFilters));
  }, [appliedFilters]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      let shouldShowButton = false;
      let filtersBottom = null;
      if (filtersRef.current) {
        filtersBottom = filtersRef.current.getBoundingClientRect().bottom;
        shouldShowButton = scrollPosition > 200 && filtersBottom < 0;
      }
      setShowScrollButton(shouldShowButton);
      // console.log("Catalog: Scroll position:", scrollPosition, "Filters bottom:", filtersBottom, "Show button:", shouldShowButton);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Отладка позиции кнопки
  // useEffect(() => {
  //   if (scrollButtonRef.current) {
  //     const rect = scrollButtonRef.current.getBoundingClientRect();
  //     console.log("Catalog: Scroll button position:", rect);
  //   }
  // }, [showScrollButton]);

  // buildQuery: фильтры диапазона добавлять только если min/max !== null и !== undefined
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, val]) => {
      if (key === 'delivery' || key === 'sea-distance') return; // delivery и sea-distance временно не фильтруем
      if (Array.isArray(val) && val.length > 0) {
        val.filter(v => v && v !== '').forEach(v => params.append(key, v));
      } else if (val && typeof val === 'object' && (('min' in val && val.min != null) || ('max' in val && val.max != null))) {
        if (val.min != null) params.append(key + 'Min', val.min);
        if (val.max != null) params.append(key + 'Max', val.max);
      } else if (val != null && val !== '' && typeof val !== 'object') {
        params.append(key, val);
      }
    });
    if (sortOption && sortOption !== 'none') params.append('sort', sortOption);
    params.append('limit', limit > 0 ? limit : 20); // limit всегда >= 1
    params.append('skip', page * (limit > 0 ? limit : 20));
    return params.toString();
  }, [appliedFilters, sortOption, page]);

  // Загрузка данных с сервера
  const fetchProperties = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQuery();
      const res = await fetch(`/api/properties?${query}`);
      const data = await res.json();
      if (!Array.isArray(data.properties)) throw new Error('Некорректный ответ от сервера');
      setProperties(prev => reset ? data.properties : [...prev, ...data.properties]);
      setTotal(data.total);
      setHasMore((data.properties.length + (reset ? 0 : properties.length)) < data.total);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // При изменении фильтров/сортировки — сбрасываем page и перезапрашиваем
  useEffect(() => {
    setPage(0);
    fetchProperties(true);
  }, [appliedFilters, sortOption]);

  // При изменении page (подгрузка)
  useEffect(() => {
    if (page > 0) fetchProperties();
  }, [page]);

  // Автоподгрузка при скролле (infinite scroll)
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        setPage(p => p + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  const applyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };

  const resetFilters = () => {
    // Полный сброс фильтров и localStorage
    localStorage.removeItem('appliedFilters');
    localStorage.removeItem('tempFilters');
    setAppliedFilters(() => {
      // Если в initialFilters min/max === null, не добавляем их в appliedFilters
      const cleanFilters = {};
      Object.entries(initialFilters).forEach(([key, val]) => {
        if (typeof val === 'object' && val !== null && ('min' in val || 'max' in val)) {
          // Диапазон: добавляем только если min/max заданы
          if (val.min != null || val.max != null) {
            cleanFilters[key] = {};
            if (val.min != null) cleanFilters[key].min = val.min;
            if (val.max != null) cleanFilters[key].max = val.max;
          }
        } else if (Array.isArray(val)) {
          // Массив: добавляем только если не пустой
          if (val.length > 0) cleanFilters[key] = val;
        } else if (val != null && val !== '') {
          cleanFilters[key] = val;
        }
      });
      return cleanFilters;
    });
    resetTagFilter();
  };

  const toggleSortDropdown = () => setIsSortOpen(prev => !prev);
  const handleSortMouseLeave = () => setIsSortOpen(false);

  const scrollToFilters = () => {
    if (filtersRef.current) {
      const elementPosition = filtersRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - 88, // Увеличенный отступ с учётом хедера
        behavior: 'smooth',
      });
      setTimeout(() => {
        window.scrollTo({
          top: elementPosition - 88,
          behavior: 'auto',
        });
      }, 1000);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-red-600 text-center animate-fadeIn">
        Ошибка в Catalog: {error.message}
      </div>
    );
  }

  return (
    <>
      <section className="bg-white min-h-screen p-6 animate-fadeIn" style={{ position: 'static' }}>
        <div className="pt-6 mb-6">
          <Filters
            ref={filtersRef}
            properties={properties}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
            initialFilters={initialFilters}
            cardsRef={cardsRef}
            tagFilter={tagFilter}
            resetTagFilter={resetTagFilter}
            onTagOptionsChange={setTagOptions}
            total={total}
          />
        </div>
        <div className="mb-6 px-6 relative">
          <div
            className={`p-2 border border-gray-200 rounded-md w-full sm:w-1/4 bg-white cursor-pointer focus:ring-primary focus:border-primary overflow-hidden relative box-border ${isSortOpen ? 'opacity-0' : 'opacity-100'}`}
            onClick={toggleSortDropdown}
            style={{
              background: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%221.5%22 stroke=%22%23A1A1AA%22 class=%22w-4 h-4%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22 /%3E%3C/svg%3E') no-repeat right 1rem center",
              backgroundSize: '1rem',
            }}
          >
            <span className={`${sortOption === 'none' ? 'text-gray-400' : 'text-gray-700'} text-sm whitespace-nowrap`}>
              {sortOption === 'none' ? 'Без сортировки' :
               sortOption === 'price-asc' ? 'Сначала дешевле' :
               sortOption === 'price-desc' ? 'Сначала дороже' :
               sortOption === 'area-desc' ? 'Сначала больше площадь' :
               'Сначала меньше площадь'}
            </span>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-white pointer-events-none" />
          </div>
          {isSortOpen && (
            <div
              className="absolute top-0 left-6 right-6 w-full sm:w-1/4 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 box-border"
              onMouseLeave={handleSortMouseLeave}
              style={{ background: 'var(--white)' }}
            >
              <div
                className="p-2 text-sm text-blue-600 hover:bg-gray-200 cursor-pointer sticky top-0 bg-white z-10"
                onClick={() => { setSortOption('none'); setIsSortOpen(false); }}
              >
                Без сортировки
              </div>
              <div
                className="relative z-0"
                style={{ background: 'linear-gradient(to bottom, transparent 90%, var(--white) 100%)' }}
              >
                <div
                  className="p-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                  onClick={() => { setSortOption('price-asc'); setIsSortOpen(false); }}
                >
                  Сначала дешевле
                </div>
                <div
                  className="p-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                  onClick={() => { setSortOption('price-desc'); setIsSortOpen(false); }}
                >
                  Сначала дороже
                </div>
                <div
                  className="p-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                  onClick={() => { setSortOption('area-desc'); setIsSortOpen(false); }}
                >
                  Сначала больше площадь
                </div>
                <div
                  className="p-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                  onClick={() => { setSortOption('area-asc'); setIsSortOpen(false); }}
                >
                  Сначала меньше площадь
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {properties && properties.length > 0 ? (
            properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onTagClick={onTagClick}
                tagOptions={tagOptions}
              />
            ))
          ) : (
            <div className="text-gray-600 text-center">Нет объектов, соответствующих фильтрам</div>
          )}
        </div>
      </section>
      {/* Кнопка "Наверх к фильтрам" теперь вне section, всегда фиксирована */}
      {(
        <button
          ref={scrollButtonRef}
          onClick={scrollToFilters}
          className={`fixed bottom-6 right-6 z-[100] bg-[var(--primary)] text-white p-3 rounded-full shadow-lg pointer-events-auto
            scroll-to-filters-btn
            ${showScrollButton ? 'scroll-to-filters-btn--visible' : ''}`}
          aria-label="Наверх к фильтрам"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </>
  );
}

export default Catalog;