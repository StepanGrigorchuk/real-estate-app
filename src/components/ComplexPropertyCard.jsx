import React, { useState } from 'react';
import { generateImagePathsForProperty } from '../utils/imagePath';
import { splitTitleIntoDeveloperAndComplex, titleCaseFromSlug } from '../utils/nameDisplay';

function ComplexPropertyCard({ property, allProperties }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [images, setImages] = useState([]);

  // Загружаем изображения при раскрытии карточки
  const handleToggle = () => {
    if (!isExpanded && images.length === 0) {
      const paths = generateImagePathsForProperty(property, allProperties, 10);
      setImages(paths);
    }
    setIsExpanded(!isExpanded);
  };

  const { title, tags, price } = property;
  
  // Форматируем название
  const displayTitle = title || `${property.developer} ${property.complex}`;
  
  // Получаем параметры
  const rooms = tags?.rooms || '—';
  const area = tags?.area || '—';
  const finishing = tags?.finishing || '—';
  const view = tags?.view || '—';
  
  // Форматируем цену - берём из tags.price
  const priceText = tags?.price 
    ? `${tags.price.toLocaleString('ru-RU')} ₽`
    : 'По запросу';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Основная карточка */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          {/* Левая часть - параметры */}
          <div className="flex-1">
            <div className="flex items-center gap-6">
              {/* Комнаты */}
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--primary)]">
                  {rooms}
                </div>
                <div className="text-xs text-gray-500">комнат</div>
              </div>
              
              {/* Площадь */}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">
                  {area}
                </div>
                <div className="text-xs text-gray-500">м²</div>
              </div>
              
              {/* Отделка */}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">
                  {finishing}
                </div>
                <div className="text-xs text-gray-500">отделка</div>
              </div>
              
              {/* Вид */}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">
                  {view}
                </div>
                <div className="text-xs text-gray-500">вид</div>
              </div>
            </div>
          </div>
          
          {/* Правая часть - цена и стрелка */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-[var(--primary)]">
                {priceText}
              </div>
            </div>
            
            {/* Стрелка */}
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg 
                className="w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Раскрывающаяся часть с фотографиями */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {displayTitle}
            </h4>
          </div>
          
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Фото ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg bg-gray-200"
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              Фотографии отсутствуют
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ComplexPropertyCard;
