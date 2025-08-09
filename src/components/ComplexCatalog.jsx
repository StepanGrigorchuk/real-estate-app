import React, { useCallback, useEffect, useRef, useState } from 'react';
import ComplexCard from './ComplexCard';
import Filters from './Filters';

function ComplexCatalog({ onTagClick, filtersRef, tagFilter, resetTagFilter }) {
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

  const [complexes, setComplexes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(() => {
    const savedFilters = localStorage.getItem('appliedComplexFilters');
    return savedFilters ? JSON.parse(savedFilters) : initialFilters;
  });
  const [sortOption, setSortOption] = useState('none');
  const limit = 20;

  const cardsRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('appliedComplexFilters', JSON.stringify(appliedFilters));
  }, [appliedFilters]);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, val]) => {
      if (key === 'delivery' || key === 'sea-distance') return;
      if (Array.isArray(val) && val.length > 0) {
        val.filter((v) => v && v !== '').forEach((v) => params.append(key, v));
      } else if (
        val &&
        typeof val === 'object' &&
        ((val.min != null) || (val.max != null))
      ) {
        if (val.min != null) params.append(key + 'Min', val.min);
        if (val.max != null) params.append(key + 'Max', val.max);
      } else if (val != null && val !== '' && typeof val !== 'object') {
        params.append(key, val);
      }
    });
    if (sortOption && sortOption !== 'none') params.append('sort', sortOption);
    params.append('limit', limit > 0 ? limit : 20);
    params.append('skip', page * (limit > 0 ? limit : 20));
    return params.toString();
  }, [appliedFilters, sortOption, page]);

  const fetchComplexes = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQuery();
      const res = await fetch(`/api/complexes?${query}`);
      const data = await res.json();
      if (!Array.isArray(data.complexes)) throw new Error('Некорректный ответ от сервера');
      setComplexes((prev) => (reset ? data.complexes : [...prev, ...data.complexes]));
      setTotal(data.total);
      setHasMore((data.complexes.length + (reset ? 0 : complexes.length)) < data.total);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    setPage(0);
    fetchComplexes(true);
  }, [appliedFilters, sortOption]);

  useEffect(() => {
    if (page > 0) fetchComplexes();
  }, [page]);

  // Автоподгрузка при скролле (infinite scroll)
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        setPage((p) => p + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  const applyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };

  const resetFilters = () => {
    setAppliedFilters(initialFilters);
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-4">
          <Filters
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
            initialFilters={initialFilters}
            cardsRef={cardsRef}
            tagFilter={tagFilter}
            resetTagFilter={resetTagFilter}
            total={total}
            ref={filtersRef}
            mode="complexes"
          />
        </div>

        {error && (
          <div className="text-red-600">Ошибка: {error.message}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={cardsRef}>
          {complexes.map((c) => (
            <ComplexCard
              key={`${c.developer}_${c.complex}`}
              complex={c}
              onClick={() => {
                window.location.href = `/complex/${encodeURIComponent(c.developer)}/${encodeURIComponent(c.complex)}`;
              }}
            />)
          )}
        </div>

        {!loading && complexes.length === 0 && (
          <div className="text-center text-gray-600 py-8">Нет результатов</div>
        )}

        {loading && (
          <div className="text-center text-gray-500 py-6">Загрузка...</div>
        )}
      </div>
    </div>
  );
}

export default ComplexCatalog;


