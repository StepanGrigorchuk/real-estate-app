import { useState, useRef, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import Filters from './Filters';

function Catalog({ properties, onTagClick, filtersRef, tagFilter, resetTagFilter }) {
  const initialFilters = {
    type: [],
    rooms: [],
    developer: [],
    complex: [],
    yearBuilt: { min: null, max: null },
    material: [],
    area: { min: null, max: null },
    price: { min: null, max: null },
    floor: { min: null, max: null },
    bedrooms: [],
    bathrooms: [],
    parking: [],
    condition: [],
    location: [],
    finishing: [],
    district: [],
  };

  const [appliedFilters, setAppliedFilters] = useState(() => {
    const savedFilters = localStorage.getItem('appliedFilters');
    return savedFilters ? JSON.parse(savedFilters) : initialFilters;
  });
  const [error, setError] = useState(null);
  const [tagOptions, setTagOptions] = useState(null);
  const [sortOption, setSortOption] = useState('none');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

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
      console.log("Catalog: Scroll position:", scrollPosition, "Filters bottom:", filtersBottom, "Show button:", shouldShowButton);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Отладка позиции кнопки
  useEffect(() => {
    if (scrollButtonRef.current) {
      const rect = scrollButtonRef.current.getBoundingClientRect();
      console.log("Catalog: Scroll button position:", rect);
    }
  }, [showScrollButton]);

  console.log("Catalog: Properties received:", properties);
  console.log("Catalog: onTagClick:", onTagClick);
  console.log("Catalog: filtersRef:", filtersRef);
  console.log("Catalog: tagFilter:", tagFilter);
  console.log("Catalog: tagOptions:", tagOptions);
  console.log("Catalog: Sort option:", sortOption);

  if (!properties || !Array.isArray(properties)) {
    const errorMsg = "Catalog: Properties is not an array or is undefined";
    console.error(errorMsg);
    setError(new Error(errorMsg));
    return null;
  }

  let filteredProperties;
  try {
    filteredProperties = properties.filter(property => {
      if (!property.tags || typeof property.tags !== 'object') {
        console.warn("Catalog: Skipping property with invalid tags:", property);
        return false;
      }

      const matchesType = appliedFilters.type.length === 0 || appliedFilters.type.includes(property.tags.type);
      const matchesRooms = appliedFilters.rooms.length === 0 || appliedFilters.rooms.includes(property.tags.rooms);
      const matchesDeveloper = appliedFilters.developer.length === 0 || appliedFilters.developer.includes(property.developer);
      const matchesComplex = appliedFilters.complex.length === 0 || appliedFilters.complex.includes(property.complex);
      const matchesYearBuilt = !appliedFilters.yearBuilt.min || !appliedFilters.yearBuilt.max || (property.tags.yearBuilt >= appliedFilters.yearBuilt.min && property.tags.yearBuilt <= appliedFilters.yearBuilt.max);
      const matchesMaterial = appliedFilters.material.length === 0 || appliedFilters.material.includes(property.tags.material);
      const matchesArea = !appliedFilters.area.min || !appliedFilters.area.max || (property.tags.area >= appliedFilters.area.min && property.tags.area <= appliedFilters.area.max);
      const matchesPrice = !appliedFilters.price.min || !appliedFilters.price.max || (property.tags.price >= appliedFilters.price.min && property.tags.price <= appliedFilters.price.max);
      const matchesFloor = !appliedFilters.floor.min || !appliedFilters.floor.max || (property.tags.floor >= appliedFilters.floor.min && property.tags.floor <= appliedFilters.floor.max);
      const matchesBedrooms = appliedFilters.bedrooms.length === 0 || appliedFilters.bedrooms.includes(String(property.tags.bedrooms));
      const matchesBathrooms = appliedFilters.bathrooms.length === 0 || appliedFilters.bathrooms.includes(String(property.tags.bathrooms));
      const matchesParking = appliedFilters.parking.length === 0 || appliedFilters.parking.includes(property.tags.parking);
      const matchesCondition = appliedFilters.condition.length === 0 || appliedFilters.condition.includes(property.tags.condition);
      const matchesLocation = appliedFilters.location.length === 0 || appliedFilters.location.includes(property.tags.location);
      const matchesFinishing = appliedFilters.finishing.length === 0 || appliedFilters.finishing.includes(property.tags.finishing);
      const matchesDistrict = appliedFilters.district.length === 0 || appliedFilters.district.includes(property.tags.district);
      const matchesTagFilter = !tagFilter || !tagFilter.key || !tagFilter.value || property.tags[tagFilter.key] === tagFilter.value;

      return matchesType && matchesRooms && matchesDeveloper && matchesComplex && matchesYearBuilt && matchesMaterial && matchesArea && matchesPrice && matchesFloor && matchesBedrooms && matchesBathrooms && matchesParking && matchesCondition && matchesLocation && matchesFinishing && matchesDistrict && matchesTagFilter;
    });
    console.log("Catalog: Filtered properties:", filteredProperties);
  } catch (err) {
    console.error("Catalog: Error in filtering properties:", err);
    setError(err);
  }

  const sortedProperties = [...filteredProperties];
  if (sortOption === 'price-asc') {
    sortedProperties.sort((a, b) => a.tags.price - b.tags.price);
  } else if (sortOption === 'price-desc') {
    sortedProperties.sort((a, b) => b.tags.price - a.tags.price);
  } else if (sortOption === 'area-desc') {
    sortedProperties.sort((a, b) => b.tags.area - a.tags.area);
  } else if (sortOption === 'area-asc') {
    sortedProperties.sort((a, b) => a.tags.area - b.tags.area);
  }

  const applyFilters = (newFilters) => {
    console.log("Catalog: Applying filters:", newFilters);
    setAppliedFilters(newFilters);
  };

  const resetFilters = (newFilters) => {
    console.log("Catalog: Resetting filters:", newFilters);
    setAppliedFilters(newFilters);
    resetTagFilter();
    localStorage.removeItem('appliedFilters');
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
        {sortedProperties && sortedProperties.length > 0 ? (
          sortedProperties.map(property => (
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
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
        <button
          ref={scrollButtonRef}
          onClick={scrollToFilters}
          className="bg-primary text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out"
          style={{
            opacity: showScrollButton ? 1 : 0,
            transform: showScrollButton ? 'scale(1)' : 'scale(0.5)',
            visibility: showScrollButton ? 'visible' : 'hidden',
            position: 'fixed !important',
            bottom: '1.5rem',
            right: '1.5rem',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default Catalog;