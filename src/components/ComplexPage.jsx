import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { generateImagePathsForProperty } from '../utils/imagePath';

function ComplexPage() {
  const { developer, complex } = useParams();
  const [summary, setSummary] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [developer, complex]);

  const title = useMemo(() => `${developer} — ${complex}`, [developer, complex]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-6 text-gray-600">Загрузка...</div>;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-6 text-red-600">Ошибка: {error.message}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4 text-sm text-gray-600">
        <Link className="hover:underline" to="/catalog">Каталог</Link>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h1>

      {summary && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <div><span className="text-gray-500">Цена:</span> {summary.price?.min?.toLocaleString('ru-RU')} – {summary.price?.max?.toLocaleString('ru-RU')} ₽</div>
            <div><span className="text-gray-500">Площадь:</span> {summary.area?.min}–{summary.area?.max} м²</div>
            <div><span className="text-gray-500">Этажи:</span> {summary.floor?.min}–{summary.floor?.max}</div>
            <div><span className="text-gray-500">Комнаты:</span> {Array.isArray(summary.rooms) ? summary.rooms.sort().join(', ') : '—'}</div>
            <div><span className="text-gray-500">Доступно лотов:</span> {summary.totalUnits ?? 0}</div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-3">Доступные квартиры</h2>
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
  );
}

export default ComplexPage;


