import { Link } from 'react-router-dom';
import { useState } from 'react';

function PropertyCard({ property, onTagClick, tagOptions }) {
  if (!property || !property.tags) {
    console.error("PropertyCard: Invalid property data:", property);
    return <div className="bg-[var(--white)] rounded-lg shadow-md p-4">Ошибка: данные объекта недоступны</div>;
  }

  const developer = property.developer.replace(/\s+/g, '');
  const complex = property.complex.replace(/\s+/g, '');
  const images = [
    `/developers/${developer}/${complex}/${property.id}/images/${property.id}-1.jpg`,
    `/developers/${developer}/${complex}/${property.id}/images/${property.id}-2.jpg`,
    `/developers/${developer}/${complex}/${property.id}/images/${property.id}-3.jpg`,
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const sectionWidth = rect.width / 3;
    setCurrentImageIndex(Math.min(Math.floor(x / sectionWidth), 2));
  };

  const handleMouseLeave = () => setCurrentImageIndex(0);

  const formatTag = (key, value) => {
    switch (key) {
      case 'bedrooms':
        return value === 1 ? '1 спальня' : `${value} спальни`;
      case 'bathrooms':
        return value === 1 ? '1 ванна' : `${value} ванные`;
      case 'area':
        return `${value} кв.м.`;
      case 'floor':
        return `${value} этаж`;
      case 'parking':
        return value === true || value === 'true' || value === 'Есть' ? 'Есть парковка' : 'Нет парковки';
      default:
        return value;
    }
  };

  const tagsToDisplay = [
    { key: 'developer', value: property.developer },
    { key: 'complex', value: property.complex },
    { key: 'type', value: tagOptions?.type?.has(property.tags.type) ? property.tags.type : undefined },
    { key: 'rooms', value: tagOptions?.rooms?.has(property.tags.rooms) ? property.tags.rooms : undefined },
    { key: 'material', value: tagOptions?.material?.has(property.tags.material) ? property.tags.material : undefined },
    { key: 'parking', value: tagOptions?.parking?.has(formatTag('parking', property.tags.parking)) ? property.tags.parking : undefined },
    { key: 'condition', value: tagOptions?.condition?.has(property.tags.condition) ? property.tags.condition : undefined },
    { key: 'location', value: tagOptions?.location?.has(property.tags.location) ? property.tags.location : undefined },
    { key: 'finishing', value: tagOptions?.finishing?.has(property.tags.finishing) ? property.tags.finishing : undefined },
    { key: 'district', value: tagOptions?.district?.has(property.tags.district) ? property.tags.district : undefined },
    { key: 'yearBuilt', value: property.tags.yearBuilt },
    { key: 'bedrooms', value: tagOptions?.bedrooms?.has(String(property.tags.bedrooms)) ? property.tags.bedrooms : undefined },
    { key: 'bathrooms', value: tagOptions?.bathrooms?.has(String(property.tags.bathrooms)) ? property.tags.bathrooms : undefined },
    { key: 'area', value: property.tags.area },
    { key: 'floor', value: property.tags.floor },
  ].filter(tag => tag.value !== undefined && tag.value !== null);

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
        <h3 className="text-base text-[var(--gray-600)] mb-1">{property.title}</h3>
        <p className="text-2xl text-[var(--primary)] font-bold mb-3">{property.tags.price.toLocaleString()} ₽</p>
        <div className="flex flex-wrap gap-2">
          {tagsToDisplay.map(({ key, value }) => (
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