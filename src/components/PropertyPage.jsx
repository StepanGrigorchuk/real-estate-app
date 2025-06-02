import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Lightbox from './Lightbox.jsx';

function PropertyPage({ properties, setSelectedProperty }) {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Найти объект в props, если есть
  useEffect(() => {
    if (Array.isArray(properties) && properties.length > 0) {
      const found = properties.find(p => String(p.id) === String(id));
      if (found) {
        setProperty(found);
        setError(null);
        return;
      }
    }
    // Если не найден — загрузить с сервера
    setLoading(true);
    fetch(`/api/properties/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Объект не найден');
        return res.json();
      })
      .then(data => {
        setProperty(data.property || data); // поддержка разных форматов ответа
        setError(null);
      })
      .catch(err => {
        setError(err);
        setProperty(null);
      })
      .finally(() => setLoading(false));
  }, [id, properties]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Загрузка изображений
  useEffect(() => {
    if (!property || !property.developer || !property.complex) return;
    const developer = property.developer.replace(/\s+/g, '');
    const complex = property.complex.replace(/\s+/g, '');
    const images = [];
    let index = 1;
    const checkNextImage = () => {
      const imagePath = `/developers/${developer}/${complex}/${property.id}/images/${property.id}-${index}.jpg`;
      return new Promise((resolve) => {
        const img = new window.Image();
        img.src = imagePath;
        img.onload = () => {
          images.push(imagePath);
          index++;
          checkNextImage().then(resolve);
        };
        img.onerror = () => resolve();
      });
    };
    checkNextImage().then(() => setLoadedImages(images));
  }, [property]);

  // Безопасно получить параметры объекта
  let parsedTags = {};
  if (property && property.tags) {
    if (typeof property.tags === 'string') {
      try {
        parsedTags = JSON.parse(property.tags);
      } catch (e) {
        parsedTags = {};
      }
    } else if (typeof property.tags === 'object' && property.tags !== null) {
      parsedTags = property.tags;
    }
  }

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

  const paramNames = {
    type: 'Тип',
    rooms: 'Комнаты',
    area: 'Площадь',
    floor: 'Этаж',
    price: 'Цена',
    location: 'Местоположение',
    yearBuilt: 'Год постройки',
    bedrooms: 'Спальни',
    bathrooms: 'Ванные комнаты',
    parking: 'Парковка',
    condition: 'Состояние',
    delivery: 'Срок сдачи',
    'sea-distance': 'Расстояние до моря',
    payment: 'Способ оплаты',
    view: 'Вид из окна',
  };

  return (
    <>
      <section className="bg-[var(--white)] min-h-screen pt-20 pb-12 px-6 animate-fadeIn">
        <div className="w-full flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 flex flex-col">
              <div className="rounded-lg">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide h-[calc(100vh-300px)]">
                  {loadedImages.length > 0 ? (
                    loadedImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-full object-contain rounded cursor-pointer bg-[var(--gray-200)]"
                        onClick={() => setSelectedImage(img)}
                        onError={e => {
                          e.target.src = 'https://via.placeholder.com/256x160?text=Image+Not+Found';
                          e.target.alt = 'Изображение не найдено';
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-[var(--gray-600)]">Изображения отсутствуют</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {loadedImages.length > 0 ? (
                    loadedImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Мини-превью ${index + 1}`}
                        className="w-16 h-16 object-cover rounded cursor-pointer bg-[var(--gray-200)]"
                        onClick={() => setSelectedImage(img)}
                        onError={e => {
                          e.target.src = 'https://via.placeholder.com/64x64?text=Image+Not+Found';
                          e.target.alt = 'Мини-превью не найдено';
                        }}
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
                    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                    .map(([key, value]) => {
                      let displayValue = value;
                      if (key === 'price' || key === 'area') {
                        const num = Number(value);
                        if (!isNaN(num)) {
                          displayValue = key === 'price' ? `${num.toLocaleString()} ₽` : `${num} м²`;
                        } else {
                          displayValue = value;
                        }
                      }
                      return (
                        <div key={key} className="flex flex-col">
                          <span className="text-sm font-medium text-[var(--gray-800)]">
                            {paramNames[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span className="text-sm">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                </div>
                <a
                  href="https://t.me/yourmanager"
                  className="inline-block w-full text-center bg-gradient-to-r from-blue-500 to-blue-700 text-[var(--white)] px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 hover:shadow-xl hover:scale-105 hover:brightness-110 transition-all duration-300 font-medium"
                >
                  Забронировать
                </a>
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