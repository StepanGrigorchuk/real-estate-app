import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Lightbox from './Lightbox.jsx';
import { getParsedTags } from '../utils/property';
import { formatTag, isNotEmpty } from '../utils/format';
import { PARAM_NAMES, TELEGRAM_LINK } from '../constants';
import { imagePath, getNForProperty } from '../utils/imagePath';
import HeroButton from './HeroButton';

function PropertyPage({ properties, setSelectedProperty }) {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const galleryRef = useRef(null);
  const miniGalleryRef = useRef(null);  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  // Найти объект в props, если есть
  useEffect(() => {
    if (Array.isArray(properties) && properties.length > 0) {
      const found = properties.find(p => String(p.id) === String(id));
      if (found) {
        setProperty(found);
        setError(null);
        setLoading(false); // добавлено: явно завершаем загрузку
        return;
      }
    }
    // Если не найден — не делаем fetch, просто показываем ошибку
    setProperty(null);
    setError(new Error('Объект не найден'));
    setLoading(false);
    // fetch(`/api/properties/${id}`)
    //   .then(res => {
    //     if (!res.ok) throw new Error('Объект не найден');
    //     return res.json();
    //   })
    //   .then(data => {
    //     setProperty(data.property || data); // поддержка разных форматов ответа
    //     setError(null);
    //   })
    //   .catch(err => {
    //     setError(err);
    //     setProperty(null);
    //   })
    //   .finally(() => setLoading(false));
  }, [id, properties]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);  // Загрузка изображений
  useEffect(() => {
    if (!property || !property.developer || !property.complex || !properties) return;
    
    const developer = property.developer;
    const complex = property.complex;
    const n = getNForProperty(property, properties);
    
    // Проверяем изображения последовательно и добавляем только существующие
    const checkImages = async () => {
      setLoadedImages([]); // Очищаем предыдущие изображения
      const validImages = [];
      let consecutiveFailures = 0;
      
      for (let i = 1; i <= 20; i++) {
        const imgPath = imagePath({ developer, complex, n, i });
        
        try {
          // Создаем промис для проверки загрузки изображения
          const isImageValid = await new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
              img.onload = null;
              img.onerror = null;
              resolve(false);
            }, 3000); // Тайм-аут 3 секунды
            
            img.onload = () => {
              clearTimeout(timeout);
              resolve(true);
            };
            
            img.onerror = () => {
              clearTimeout(timeout);
              resolve(false);
            };
            
            img.src = imgPath;
          });
          
          if (isImageValid) {
            validImages.push(imgPath);
            consecutiveFailures = 0; // Сбрасываем счетчик неудач
          } else {
            consecutiveFailures++;
            // Если 3 изображения подряд не загружаются, прекращаем поиск
            if (consecutiveFailures >= 3) {
              break;
            }
          }
        } catch (error) {
          consecutiveFailures++;
          if (consecutiveFailures >= 3) {
            break;
          }
        }
      }
      
      setLoadedImages(validImages);
    };
    
    checkImages();
  }, [property, properties]);
  // Безопасно получить параметры объекта
  const parsedTags = getParsedTags(property);
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
    const walk = (x - dragStart.x); // Убираем множитель для естественной скорости
    
    // Отмечаем что было перетаскивание если движение больше 5px
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    
    ref.current.scrollLeft = dragStart.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Сбрасываем флаг перетаскивания через небольшую задержку
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
  if (!property) {
    return <div className="text-[var(--gray-800)] p-6 animate-fadeIn">Объект с ID {id} не найден</div>;
  }
  if (!property.developer || !property.complex) {
    return <div className="text-[var(--gray-800)] p-6 animate-fadeIn">Ошибка: объект не содержит необходимые данные</div>;
  }

  return (
    <>
      <section className="bg-[var(--white)] min-h-screen pt-20 pb-12 px-6 animate-fadeIn">
        {/* Удалён локальный <style> для скроллбара, теперь используется глобальный из index.css */}
        <div className="w-full flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 flex flex-col">              <div className="rounded-lg">
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
                        alt={`Фото ${index + 1}`}                        className="w-full h-full object-contain rounded cursor-pointer bg-[var(--gray-200)]"                        onClick={() => !hasDragged && setSelectedImage(img)}
                        draggable={false}
                      />
                    ))
                  ) : (
                    <p className="text-[var(--gray-600)]">Изображения отсутствуют</p>
                  )}
                </div>
              </div>              <div className="mt-4">
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
                        className="w-16 h-16 object-cover rounded cursor-pointer bg-[var(--gray-200)]"                        onClick={() => setSelectedImage(img)}
                        draggable={false}
                      />
                    ))
                  ) : (
                    <p className="text-[var(--gray-600)]">Мини-превью отсутствуют</p>
                  )}
                </div>
              </div>
              <div className="mt-8">
                <p className="text-[var(--gray-600)] leading-relaxed">
                  {property.description || 'Описание отсутствует'}
                </p>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="bg-[var(--white)] rounded-lg px-6 pb-6 pt-0">
                <h2 className="text-2xl font-bold text-[var(--gray-800)] mb-4">
                  {property.title || 'Название отсутствует'}
                </h2>
                <div className="grid grid-cols-2 gap-3 text-[var(--gray-600)] mb-6">
                  {Object.entries(parsedTags)
                    .filter(([_, value]) => isNotEmpty(value))
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--gray-800)]">
                          {PARAM_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span className="text-sm">
                          {formatTag(key, value)}
                        </span>
                      </div>
                    ))}
                </div>                <HeroButton
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

export default PropertyPage;