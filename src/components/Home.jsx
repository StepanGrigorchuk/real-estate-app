import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getParsedTags } from '../utils/property';
import { formatTag, isNotEmpty } from '../utils/format';
import { PARAM_NAMES, TELEGRAM_LINK } from '../constants';
import { imagePath } from '../utils/imagePath';

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
          let checkIndex = 0;
          function tryLoad() {
            if (checkIndex >= imagePaths.length) {
              resolve({ index, path: 'https://via.placeholder.com/256x160?text=Image+Not+Found' });
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
      });

      const results = await Promise.all(imagePromises);
      // Сохраняем массив всех путей для каждого property (для галереи)
      const sortedImages = results
        .sort((a, b) => a.index - b.index)
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
    <section className="bg-[var(--white)] pt-20 sm:pt-24 pb-8 sm:pb-12 w-full min-h-screen flex flex-col px-2 sm:px-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start justify-between w-full flex-grow gap-8 md:gap-0">
        <div className="w-full md:w-1/2 pl-0 pr-0 md:pr-6 pt-4 md:pt-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[var(--gray-800)] mb-2 sm:mb-4">
            Найдите дом своей мечты
          </h1>
          <p className="text-base sm:text-lg text-[var(--gray-600)] mb-6 sm:mb-12 max-w-lg">
            Найдите идеальный дом с нашим каталогом. Умный поиск по цене, площади и другим параметрам поможет выбрать жильё, соответствующее вашим желаниям.
          </p>
          <Link
            to="/catalog"
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-[var(--white)] px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 hover:shadow-xl hover:scale-105 hover:brightness-110 transition-all duration-300 text-base sm:text-lg font-semibold inline-block"
          >
            Смотреть недвижку
          </Link>
        </div>
        <div className="w-full md:w-1/2 flex-grow md:flex md:justify-end mt-4 md:mt-0 pr-0 relative">
          {topProperties.length > 0 && isLoaded ? (
            <div className="w-full max-w-full sm:max-w-xl">
              <div className="w-full max-w-full sm:max-w-xl h-56 sm:h-[450px] rounded-lg shadow-lg relative overflow-hidden">
                {topProperties.map((property, index) => {
                  const tags = getParsedTags(property);
                  return (
                    loadedImages[index] && (
                      <div
                        key={property.id}
                        className={`absolute w-full h-full transition-opacity duration-500 ${
                          index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <img
                          src={loadedImages[index].main}
                          alt={property.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Link
                          to={`/property/${property.id}`}
                          className="absolute inset-0 z-10 flex justify-center items-center"
                        >
                          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-50 text-white p-2 sm:p-4 rounded-lg z-20 text-xs sm:text-base">
                            {isNotEmpty(tags?.price) && <p className="text-lg sm:text-2xl font-semibold">{formatTag('price', tags.price)}</p>}
                            <h3 className="text-xs sm:text-base">{property.title}</h3>
                            {isNotEmpty(tags?.area) && <p className="text-xs sm:text-base">{formatTag('area', tags.area)}</p>}
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
              <div className="relative mt-2 flex gap-2 justify-center z-10">
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
            </div>
          ) : (
            <div className="w-full max-w-full sm:max-w-xl h-56 sm:h-[450px] bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
              <p className="text-gray-600 text-xs sm:text-base">Нет данных для отображения</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Home;