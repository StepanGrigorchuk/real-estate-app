import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { generateImagePathsForProperty } from '../utils/imagePath';

function ComplexCard({ complex, onTagClick }) {
  const { developer, complex: complexName, price, area, floor, rooms, types, views, finishings, payments, totalUnits } = complex;

  const [previewProperty, setPreviewProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/properties?limit=1&developer=${encodeURIComponent(developer)}&complex=${encodeURIComponent(complexName)}`);
        const data = await res.json();
        const prop = Array.isArray(data.properties) && data.properties.length > 0 ? data.properties[0] : null;
        if (!isCancelled) {
          setPreviewProperty(prop);
          if (prop) {
            const paths = generateImagePathsForProperty(prop, [prop], 3);
            setImages(paths);
          }
        }
      } catch (_) {
        // ignore
      }
    };
    load();
    return () => { isCancelled = true; };
  }, [developer, complexName]);

  const priceText = useMemo(() => {
    if (price?.min != null && price?.max != null) {
      return `${price.min.toLocaleString('ru-RU')} – ${price.max.toLocaleString('ru-RU')} ₽`;
    }
    return 'Цена по запросу';
  }, [price]);

  const title = useMemo(() => `${developer} ${complexName}`, [developer, complexName]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const sectionWidth = rect.width / 3;
    setCurrentImageIndex(Math.min(Math.floor(x / sectionWidth), 2));
  };
  const handleMouseLeave = () => setCurrentImageIndex(0);

  const chips = [];
  if (Array.isArray(rooms) && rooms.length) chips.push({ key: 'rooms', values: rooms });
  if (floor && (floor.min != null || floor.max != null)) chips.push({ key: 'floor', values: [`${floor.min ?? '—'}–${floor.max ?? '—'}`] });
  if (area && (area.min != null || area.max != null)) chips.push({ key: 'area', values: [`${area.min ?? '—'}–${area.max ?? '—'} м²`] });
  if (Array.isArray(types) && types.length) chips.push({ key: 'type', values: types });
  if (Array.isArray(views) && views.length) chips.push({ key: 'view', values: views });
  if (Array.isArray(finishings) && finishings.length) chips.push({ key: 'finishing', values: finishings });
  if (Array.isArray(payments) && payments.length) chips.push({ key: 'payment', values: payments });

  return (
    <Link to={`/complex/${encodeURIComponent(developer)}/${encodeURIComponent(complexName)}`} className="bg-[var(--white)] rounded-lg shadow-md pb-4 hover:shadow-lg transition block animate-fadeIn w-full max-w-full min-w-[320px]">
      <div className="relative">
        <img
          src={images[currentImageIndex]}
          alt={title}
          className="w-full h-48 sm:h-48 md:h-56 object-cover rounded-t-lg bg-[var(--gray-200)]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
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
      <div className="px-3 sm:px-4 pt-4">
        <h3 className="mb-1 line-clamp-2 min-h-[1.4em] text-lg text-[var(--gray-600)]">{title}</h3>
        <p className="text-price mb-6 sm:mb-3">{priceText}</p>
        <div className="flex flex-wrap gap-2 sm:gap-2">
          {chips.flatMap(({ key, values }) => values.map((val, idx) => (
            <button
              key={`${key}-${idx}`}
              onClick={(e) => { e.preventDefault(); onTagClick && onTagClick(key, val); }}
              className="bg-[var(--blue-100)] text-[var(--primary)] px-3 py-1 rounded text-tag hover:bg-[var(--blue-200)] transition"
            >
              {key === 'area' || key === 'floor' ? val : `${val}`}
            </button>
          )))}
          <span className="text-xs text-gray-500 ml-1">Лотов: {totalUnits ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}

export default ComplexCard;


