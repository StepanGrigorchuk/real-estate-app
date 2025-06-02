import { useState, useEffect } from 'react';

function Lightbox({ images, initialImage, onClose }) {
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [galleryImages, setGalleryImages] = useState(images);

  useEffect(() => {
    setGalleryImages(images);
  }, [images]);

  useEffect(() => {
    setSelectedImage(initialImage);
  }, [initialImage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          setZoomLevel(1);
          break;
        case 'ArrowRight':
          setSelectedImage(galleryImages[(galleryImages.indexOf(selectedImage) + 1) % galleryImages.length]);
          break;
        case 'ArrowLeft':
          setSelectedImage(galleryImages[(galleryImages.indexOf(selectedImage) - 1 + galleryImages.length) % galleryImages.length]);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, galleryImages, onClose]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(1, Math.min(prev + delta, 3)));
  };

  if (!selectedImage) return null;

  return (
    <div
      className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 overflow-auto transition-opacity duration-300"
      style={{ opacity: selectedImage ? 1 : 0 }}
      onClick={() => {
        onClose();
        setZoomLevel(1);
      }}
      onWheel={handleWheel}
    >
      <div className="absolute top-24 text-[var(--gray-800)] text-sm opacity-50 z-60">
        Используйте колесо мыши для зума (x{zoomLevel.toFixed(1)})
      </div>
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--white)] p-3 rounded-full shadow-md hover:bg-[var(--blue-600)] transition-all duration-300 ease-in-out"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedImage(galleryImages[(galleryImages.indexOf(selectedImage) - 1 + galleryImages.length) % galleryImages.length]);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <img
        src={selectedImage}
        alt="Full screen"
        className="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-200 rounded-lg"
        style={{ transform: `scale(${zoomLevel})` }}
        onClick={e => e.stopPropagation()}
        onError={(e) => {
          console.log(`Lightbox: Не удалось загрузить изображение: ${selectedImage}`);
          e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
          e.target.alt = "Изображение в лайтбоксе не найдено";
        }}
      />
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--white)] p-3 rounded-full shadow-md hover:bg-[var(--blue-600)] transition-all duration-300 ease-in-out"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedImage(galleryImages[(galleryImages.indexOf(selectedImage) + 1) % galleryImages.length]);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <div className="absolute bottom-4 w-full max-w-[90vw] flex justify-center">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {galleryImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Мини-превью ${index + 1}`}
              className={`w-16 h-16 object-cover rounded cursor-pointer bg-[var(--gray-200)] ${img === selectedImage ? 'border-2 border-[var(--primary)] opacity-100' : 'opacity-70'}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(img);
              }}
              onError={(e) => {
                console.log(`Lightbox: Не удалось загрузить мини-превью: ${img}`);
                e.target.src = 'https://via.placeholder.com/64x64?text=Image+Not+Found';
                e.target.alt = "Мини-превью не найдено";
              }}
            />
          ))}
        </div>
      </div>
      <button
        className="absolute top-4 right-4 text-[var(--gray-800)] text-2xl"
        onClick={() => {
          onClose();
          setZoomLevel(1);
        }}
      >
        ×
      </button>
    </div>
  );
}

export default Lightbox;