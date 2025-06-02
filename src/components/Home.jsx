import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getParsedTags } from '../utils/property';
import { formatTag, isNotEmpty } from '../utils/format';
import { PARAM_NAMES, TELEGRAM_LINK } from '../constants';
import { imagePath } from '../utils/imagePath';
import HeroButton from './HeroButton';

function getSortedImagePaths({ developer, complex, objectFolder }) {
  // Получаем n из objectFolder (ожидается формат developer_complex_n)
  let n = 1;
  if (objectFolder) {
    const match = objectFolder.match(/_(\d+)$/);
    if (match) n = Number(match[1]);
  }
  const imagePaths = [];
  for (let i = 1; i <= 15; i++) {
    imagePaths.push(imagePath({ developer, complex, n, i }));
  }
  return imagePaths;
}

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);
  const [userInteractedAt, setUserInteractedAt] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/properties?limit=20')
      .then(res => res.json())
      .then(data => {
        setProperties(data.properties || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // Новый список тегов
  const topProperties = properties
    ? [...properties]
        .filter(p => p.tags && typeof p.tags.price === 'number')
        .sort((a, b) => b.tags.price - a.tags.price)
        .slice(0, 5)
    : [];

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = topProperties.map((property, index) => {
        return new Promise((resolve) => {
          const developer = property.developer;
          const complex = property.complex;
          const objectFolder = property.folder; // Изменено здесь
          // Получаем отсортированные пути
          const imagePaths = getSortedImagePaths({ developer, complex, objectFolder });
          // Проверяем, существует ли хотя бы одно изображение (можно реализовать через fetch HEAD, но для статических файлов просто пробуем загрузить)
          let found = false;
          let imgPath = '';
          let imgObj = new window.Image();
          let checkIndex = 0;          function tryLoad() {
            if (checkIndex >= imagePaths.length) {
              resolve({ index, path: null }); // Вместо placeholder возвращаем null
              return;
            }
            imgObj = new window.Image();
            imgObj.src = imagePaths[checkIndex];
            imgObj.onload = () => resolve({ index, path: imagePaths[checkIndex], all: imagePaths });
            imgObj.onerror = () => {
              checkIndex++;
              tryLoad();
            };
          }
          tryLoad();
        });
      });      const results = await Promise.all(imagePromises);
      // Сохраняем массив всех путей для каждого property (для галереи), фильтруем null
      const sortedImages = results
        .sort((a, b) => a.index - b.index)
        .filter(result => result.path !== null) // Фильтруем null изображения
        .map(result => ({
          main: result.path,
          all: result.all || [result.path]
        }));
      setLoadedImages(sortedImages);
      setIsLoaded(true);
    };

    loadImages();
  }, [topProperties]);

  useEffect(() => {
    if (isLoaded && topProperties.length > 0) {
      const interval = setInterval(() => {
        // Если пользователь недавно взаимодействовал, не листаем
        if (
          !userInteractedAt ||
          Date.now() - userInteractedAt > 6000
        ) {
          setCurrentSlide(prev => (prev + 1) % topProperties.length);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isLoaded, topProperties.length, userInteractedAt]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + topProperties.length) % topProperties.length);
    setUserInteractedAt(Date.now());
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % topProperties.length);
    setUserInteractedAt(Date.now());
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    setUserInteractedAt(Date.now());
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Загрузка...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Ошибка загрузки: {error.message}</div>;

  return (
    <section className="bg-[var(--white)] w-full min-h-screen flex flex-col px-2 sm:px-6 animate-fadeIn">      <div className="flex flex-col md:flex-row items-stretch justify-between w-full flex-grow min-h-screen">
        {/* Центрируем текстовый блок вертикально и делаем отступы как у галереи */}        <div className="w-full md:w-1/2 flex items-start md:items-center justify-center pt-28 md:pt-0 min-h-[300px] md:min-h-0 md:pl-0 md:pr-8" style={{minHeight: 'auto'}}>
          <div className="max-w-lg w-full text-left md:text-left flex flex-col items-start md:items-start justify-center mx-auto">
            <h1 className="text-hero text-[var(--gray-800)] mb-2 sm:mb-4 text-left">
              Найдите дом своей мечты
            </h1>            <p className="text-lead mb-10 sm:mb-8 max-w-lg text-left">
              Найдите идеальный дом с нашим каталогом. Умный поиск по цене, площади и другим параметрам поможет выбрать жильё, соответствующее вашим желаниям.            </p>
            <div className="w-full flex justify-center md:justify-start mt-0 md:mt-4">
              <HeroButton to="/catalog">
                Смотреть недвижку
              </HeroButton>
            </div>
          </div>
        </div>        {/* Галерея с отступом сверху и индикацией под ней */}
        <div className="w-full md:w-1/2 flex-grow flex md:justify-end mt-16 md:mt-0 pr-0 md:pl-8 relative min-h-[300px]" style={{minHeight: '70vh'}}>
          <div className="flex flex-col w-full h-full items-center justify-center pt-12 md:pt-4">
            {topProperties.length > 0 && isLoaded ? (
              <>
                <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] max-w-full flex items-center justify-center">
                  <div className="w-full h-full rounded-lg shadow-lg relative overflow-hidden flex items-center justify-center">
                    {topProperties.map((property, index) => {
                      const tags = getParsedTags(property);
                      return (
                        loadedImages[index] && (
                          <div
                            key={property.id}
                            className={`absolute w-full h-full transition-opacity duration-500 ${
                              index === currentSlide ? 'opacity-100' : 'opacity-0'
                            } flex items-end`}
                          >
                            <img
                              src={loadedImages[index].main}
                              alt={property.title}
                              className="w-full h-full object-cover rounded-lg"
                            />                            <Link
                              to={`/property/${property.id}`}
                              className="absolute inset-0 z-10 flex justify-center items-end md:items-center"
                            >                              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-50 text-white p-2 sm:p-4 rounded-lg z-20 text-lead sm:text-small">
                                {isNotEmpty(tags?.price) && <p className="!text-white text-2xl sm:text-price font-bold">{formatTag('price', tags.price)}</p>}
                                <h3 className="!text-white text-lead sm:text-tag font-normal">{property.title}</h3>
                                {isNotEmpty(tags?.area) && <p className="!text-white text-lead sm:text-caption font-normal">{formatTag('area', tags.area)}</p>}
                              </div>
                            </Link>
                            <div
                              className={`absolute top-0 left-0 w-1/4 h-full cursor-pointer transition-opacity duration-300 z-10 bg-gradient-to-r from-black to-transparent`}
                              style={{ opacity: isLeftHovered ? 0.4 : 0, transition: 'opacity 150ms ease-in-out' }}
                              onMouseEnter={() => setIsLeftHovered(true)}
                              onMouseLeave={() => setIsLeftHovered(false)}
                              onClick={handlePrevSlide}
                            />
                            <div
                              className={`absolute top-0 right-0 w-1/4 h-full cursor-pointer transition-opacity duration-300 z-10 bg-gradient-to-l from-black to-transparent`}
                              style={{ opacity: isRightHovered ? 0.4 : 0, transition: 'opacity 150ms ease-in-out' }}
                              onMouseEnter={() => setIsRightHovered(true)}
                              onMouseLeave={() => setIsRightHovered(false)}
                              onClick={handleNextSlide}
                            />
                          </div>
                        )
                      );
                    })}
                  </div>
                </div>
                <div className="relative mt-2 flex gap-2 justify-center z-10 w-full">
                  {topProperties.map((_, index) => (
                    <div
                      key={index}
                      className={`rounded-full cursor-pointer transition-all duration-300 ${
                        index === currentSlide ? 'bg-blue-500 w-4 h-2' : 'bg-blue-500 bg-opacity-50 w-2 h-2'
                      }`}
                      onClick={() => handleDotClick(index)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-[40vh] sm:h-[60vh] md:h-[70vh] bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
                <p className="text-gray-600 text-small">Нет данных для отображения</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;