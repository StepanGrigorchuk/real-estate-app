import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getParsedTags } from '../utils/property';
import { formatTag, isNotEmpty } from '../utils/format';
import { PARAM_NAMES, TELEGRAM_LINK } from '../constants';
import { imagePath } from '../utils/imagePath';

function PropertyCard({ property, onTagClick, tagOptions }) {
  if (!property) {
    console.error("PropertyCard: Invalid property data:", property);
    return <div className="bg-[var(--white)] rounded-lg shadow-md p-4">Ошибка: данные объекта недоступны</div>;
  }

  // Безопасно получаем tags
  const tags = getParsedTags(property);

  const developer = property.developer || '';
  const complex = property.complex || '';
  const objectFolder = property.folder || property.slug || property.id;
  const images = [];
  if (developer && complex && objectFolder) {
    for (let i = 1; i <= 3; i++) {
      images.push(`/developers/${developer}/${complex}/${objectFolder}/${i}.jpg`);
    }
  } else {
    console.warn('PropertyCard: Недостаточно данных для формирования пути к изображению', { developer, complex, objectFolder, property });
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const sectionWidth = rect.width / 3;
    setCurrentImageIndex(Math.min(Math.floor(x / sectionWidth), 2));
  };

  const handleMouseLeave = () => setCurrentImageIndex(0);

  // Только существующие значения
  const tagsToDisplay = [
    { key: 'developer', value: property.developer },
    { key: 'complex', value: property.complex },
    { key: 'type', value: tags?.type },
    { key: 'rooms', value: tags?.rooms },
    { key: 'material', value: tags?.material },
    { key: 'parking', value: tags?.parking },
    { key: 'condition', value: tags?.condition },
    { key: 'location', value: tags?.location },
    { key: 'finishing', value: tags?.finishing },
    { key: 'district', value: tags?.district },
    { key: 'yearBuilt', value: tags?.yearBuilt },
    { key: 'bedrooms', value: tags?.bedrooms },
    { key: 'bathrooms', value: tags?.bathrooms },
    { key: 'area', value: tags?.area },
    { key: 'floor', value: tags?.floor },
    { key: 'delivery', value: tags?.delivery },
    { key: 'sea-distance', value: tags?.['sea-distance'] },
    { key: 'payment', value: tags?.payment },
    { key: 'view', value: tags?.view },
  ].filter(tag => isNotEmpty(tag.value));

  return (
    <Link to={`/property/${property.id}`} className="bg-[var(--white)] rounded-lg shadow-md pb-4 hover:shadow-lg transition block animate-fadeIn">
      <div className="relative">
        <img
          src={images[currentImageIndex]}
          alt={property.title}
          className="w-full h-48 object-cover rounded-t-lg bg-[var(--gray-200)]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onError={(e) => {
            console.log(`PropertyCard: Не удалось загрузить изображение: ${images[currentImageIndex]}`);
            e.target.src = 'https://via.placeholder.com/256x160?text=Image+Not+Found';
            e.target.alt = "Изображение не найдено";
          }}
        />
        <div className="absolute bottom-2 left-0 right-0 px-4">
          <div className="flex justify-between gap-2">
            {[0, 1, 2].map(index => (
              <div
                key={index}
                className={`flex-1 h-1 bg-[var(--white)] rounded-full transition-opacity duration-300 ${currentImageIndex === index ? 'opacity-100' : 'opacity-50'}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 pt-2">
        {property.title && (
          <h3 className="text-base text-[var(--gray-600)] mb-1">{property.title}</h3>
        )}
        {tags?.price && (
          <p className="text-2xl text-[var(--primary)] font-bold mb-3">{tags.price.toLocaleString()} ₽</p>
        )}
        <div className="flex flex-wrap gap-2">
          {tagsToDisplay
            .filter(tag => tag.key !== 'developer' && tag.key !== 'complex' && tag.key !== 'price' && tag.key !== 'title')
            .map(({ key, value }) => (
              <button
                key={key}
                onClick={(e) => { e.preventDefault(); onTagClick(key, value); }}
                className="bg-[var(--blue-100)] text-[var(--primary)] px-2 py-1 rounded text-sm hover:bg-[var(--blue-200)] transition"
              >
                {formatTag(key, value)}
              </button>
            ))}
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;