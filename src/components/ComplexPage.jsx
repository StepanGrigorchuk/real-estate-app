import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { generateImagePathsForProperty } from '../utils/imagePath';
import { splitTitleIntoDeveloperAndComplex, titleCaseFromSlug } from '../utils/nameDisplay';
import HeroButton from './HeroButton';
import { TELEGRAM_LINK } from '../constants';
import Lightbox from './Lightbox';

function ComplexPage() {
  const { developer, complex } = useParams();
  const [summary, setSummary] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const galleryRef = useRef(null);
  const miniGalleryRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sRes, pRes] = await Promise.all([
          fetch(`/api/complexes/details?developer=${encodeURIComponent(developer)}&complex=${encodeURIComponent(complex)}`),
          fetch(`/api/properties?limit=1000&developer=${encodeURIComponent(developer)}&complex=${encodeURIComponent(complex)}`),
        ]);
        const sData = await sRes.json();
        const pData = await pRes.json();
        setSummary(sData.summary || null);
        setProperties(Array.isArray(pData.properties) ? pData.properties : []);

        // Загружаем изображения для комплекса из первого объекта
        if (Array.isArray(pData.properties) && pData.properties.length > 0) {
          const firstProperty = pData.properties[0];
          const paths = generateImagePathsForProperty(firstProperty, pData.properties, 20);
          setLoadedImages(paths);
        } else {
          setLoadedImages([]);
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [developer, complex]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const title = useMemo(() => {
    if (summary?.previewPropertyTitle) {
      const { developerRu, complexRu } = splitTitleIntoDeveloperAndComplex({
        titleRu: summary.previewPropertyTitle,
        complexSlug: complex,
        roomRu: summary.previewPropertyTags?.rooms
      });
      return {
        developer: developerRu || titleCaseFromSlug(developer),
        complex: complexRu || titleCaseFromSlug(complex)
      };
    }
    return {
      developer: titleCaseFromSlug(developer),
      complex: titleCaseFromSlug(complex)
    };
  }, [developer, complex, summary]);

  // Функции для перетаскивания галереи
  const handleMouseDown = (e, ref) => {
    setIsDragging(true);
    setHasDragged(false);
    setDragStart({
      x: e.pageX,
      scrollLeft: ref.current.scrollLeft
    });
  };

  const handleMouseMove = (e, ref) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - dragStart.x);
    
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    
    ref.current.scrollLeft = dragStart.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setHasDragged(false), 100);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  if (loading) {
    return <div className="text-[var(--gray-800)] p-6 animate-fadeIn">Загрузка...</div>;
  }
  if (error) {
    return <div className="text-[var(--gray-800)] p-6 animate-fadeIn">Ошибка: {error.message || error.toString()}</div>;
  }

  return (
    <>
      <section className="bg-[var(--white)] min-h-screen pt-20 pb-12 px-6 animate-fadeIn">
        <div className="w-full flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 flex flex-col">
              <div className="rounded-lg">
                <div 
                  ref={galleryRef}
                  className={`flex gap-4 overflow-x-auto custom-scrollbar h-[calc(100vh-300px)] bg-white ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={(e) => handleMouseDown(e, galleryRef)}
                  onMouseMove={(e) => handleMouseMove(e, galleryRef)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ userSelect: 'none' }}
                >
                  {loadedImages.length > 0 ? (
                    loadedImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Фото комплекса ${index + 1}`}
                        className="w-full h-full object-contain rounded cursor-pointer bg-[var(--gray-200)]"
                        onClick={() => !hasDragged && setSelectedImage(img)}
                        draggable={false}
                      />
                    ))
                  ) : (
                    <p className="text-[var(--gray-600)]">Изображения отсутствуют</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <div 
                  ref={miniGalleryRef}
                  className="flex gap-2 overflow-x-auto custom-scrollbar"
                >
                  {loadedImages.length > 0 ? (
                    loadedImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Мини-превью ${index + 1}`}
                        className="w-16 h-16 object-cover rounded cursor-pointer bg-[var(--gray-200)]"
                        onClick={() => setSelectedImage(img)}
                        draggable={false}
                      />
                    ))
                  ) : (
                    <p className="text-[var(--gray-600)]">Мини-превью отсутствуют</p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Доступные квартиры</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((p) => {
                    const images = generateImagePathsForProperty(p, properties, 3);
                    return (
                      <PropertyCard key={p._id || p.id} property={p} onTagClick={() => {}} images={images} />
                    );
                  })}
                </div>
                {properties.length === 0 && (
                  <div className="text-gray-600">В этом комплексе нет доступных предложений.</div>
                )}
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-[var(--white)] rounded-lg px-6 pb-6 pt-0">
                <h2 className="text-2xl font-bold text-[var(--gray-800)] mb-4">
                  {title.complex}
                </h2>
                <p className="text-lg text-[var(--gray-600)] mb-6">
                  {title.developer}
                </p>
                
                {summary && (
                  <div className="grid grid-cols-1 gap-3 text-[var(--gray-600)] mb-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--gray-800)]">Цена</span>
                      <span className="text-sm">
                        {summary.price?.min && summary.price?.max 
                          ? `${summary.price.min.toLocaleString('ru-RU')} – ${summary.price.max.toLocaleString('ru-RU')} ₽`
                          : 'По запросу'
                        }
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--gray-800)]">Площадь</span>
                      <span className="text-sm">
                        {summary.area?.min && summary.area?.max 
                          ? `${summary.area.min}–${summary.area.max} м²`
                          : '—'
                        }
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--gray-800)]">Этажи</span>
                      <span className="text-sm">
                        {summary.floor?.min && summary.floor?.max 
                          ? `${summary.floor.min}–${summary.floor.max}`
                          : '—'
                        }
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--gray-800)]">Комнаты</span>
                      <span className="text-sm">
                        {Array.isArray(summary.rooms) && summary.rooms.length 
                          ? summary.rooms.sort().join(', ')
                          : '—'
                        }
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--gray-800)]">Доступно лотов</span>
                      <span className="text-sm">
                        {summary.totalUnits || 0}
                      </span>
                    </div>
                    {summary.cities && summary.cities.length > 0 && (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--gray-800)]">Город</span>
                        <span className="text-sm">
                          {summary.cities[0]}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <HeroButton
                  href={TELEGRAM_LINK}
                  className="w-full text-center"
                >
                  Забронировать
                </HeroButton>
              </div>
            </div>
          </div>
          
          <Link
            to="/catalog"
            className="text-[var(--primary)] hover:underline text-sm mt-6 inline-block"
          >
            ← Назад в каталог
          </Link>
        </div>
      </section>
      
      <Lightbox
        images={loadedImages}
        initialImage={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}

export default ComplexPage;


