import { useState, useEffect, useRef } from 'react';

function Lightbox({ images, initialImage, onClose }) {
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [galleryImages, setGalleryImages] = useState(images);
  const [showZoomHint, setShowZoomHint] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, imageX: 0, imageY: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    setGalleryImages(images);
  }, [images]);
  
  useEffect(() => {
    setSelectedImage(initialImage);
    if (initialImage) {
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      setShowZoomHint(true);
      const timer = setTimeout(() => setShowZoomHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [initialImage]);

  // Блокировка скролла страницы при открытом лайтбоксе
  useEffect(() => {
    if (selectedImage) {
      // Сохраняем текущую позицию скролла и блокируем скролл
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Восстанавливаем скролл при закрытии
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedImage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          setZoomLevel(1);
          break;        case 'ArrowRight':
          setSelectedImage(galleryImages[(galleryImages.indexOf(selectedImage) + 1) % galleryImages.length]);
          setZoomLevel(1);
          setImagePosition({ x: 0, y: 0 });
          break;
        case 'ArrowLeft':
          setSelectedImage(galleryImages[(galleryImages.indexOf(selectedImage) - 1 + galleryImages.length) % galleryImages.length]);
          setZoomLevel(1);
          setImagePosition({ x: 0, y: 0 });
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
    const newZoomLevel = Math.max(1, Math.min(zoomLevel + delta, 3));
    setZoomLevel(newZoomLevel);
    
    // Сброс позиции при зуме 1x
    if (newZoomLevel === 1) {
      setImagePosition({ x: 0, y: 0 });
    }
  };

  // Функции для перетаскивания изображения
  const handleImageMouseDown = (e) => {
    if (zoomLevel <= 1) return; // Перетаскивание только при зуме
    e.stopPropagation();
    setIsDraggingImage(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      imageX: imagePosition.x,
      imageY: imagePosition.y
    });
  };
  const handleImageMouseMove = (e) => {
    if (!isDraggingImage || zoomLevel <= 1) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setImagePosition({
      x: dragStart.imageX + deltaX,
      y: dragStart.imageY + deltaY
    });
  };

  const handleImageMouseUp = () => {
    setIsDraggingImage(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDraggingImage(false);
    const handleGlobalMouseMove = (e) => {
      if (isDraggingImage) {
        handleImageMouseMove(e);
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDraggingImage, dragStart, imagePosition, zoomLevel]);

  if (!selectedImage) return null;

  return (
    <div
      className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 overflow-auto transition-opacity duration-300 p-2 sm:p-0"
      style={{ opacity: selectedImage ? 1 : 0 }}
      onClick={() => {
        onClose();
        setZoomLevel(1);
      }}      onWheel={handleWheel}
    >      {showZoomHint && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-opacity-80 px-4 py-2 z-[60] transition-opacity duration-300 pointer-events-none">
          <span className="text-sm font-medium drop-shadow-lg">Используйте колесо мыши для зума</span>
        </div>
      )}
      <div className="absolute top-8 sm:top-24 text-[var(--gray-800)] text-xs sm:text-sm opacity-50 z-60" style={{ fontSize: 'var(--font-size-xs)' }}>
        {zoomLevel > 1 && `Зум: x${zoomLevel.toFixed(1)}`}
      </div>
      <button
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--white)] p-2 sm:p-3 rounded-full shadow-md hover:bg-[var(--blue-600)] transition-all duration-300 ease-in-out"
        style={{ fontSize: 'var(--font-size-xs)' }}        onClick={(e) => {
          e.stopPropagation();
          setSelectedImage(galleryImages[(galleryImages.indexOf(selectedImage) - 1 + galleryImages.length) % galleryImages.length]);
          setZoomLevel(1);
          setImagePosition({ x: 0, y: 0 });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 sm:h-6 sm:w-6"
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
      </button>      <img
        ref={imageRef}
        src={selectedImage}
        alt="Full screen"
        className={`max-h-[90vh] max-w-[90vw] object-contain rounded-lg ${
          zoomLevel > 1 ? (isDraggingImage ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
        style={{ 
          transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
          userSelect: 'none',
          transition: isDraggingImage ? 'none' : 'transform 0.2s ease-out'
        }}
        onMouseDown={handleImageMouseDown}
        onClick={e => e.stopPropagation()}
        draggable={false}
        onError={(e) => {
          console.log(`Lightbox: Не удалось загрузить изображение: ${selectedImage}`);
          e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
          e.target.alt = "Изображение в лайтбоксе не найдено";
        }}
      />
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--white)] p-3 rounded-full shadow-md hover:bg-[var(--blue-600)] transition-all duration-300 ease-in-out"
        style={{ fontSize: 'var(--font-size-xs)' }}        onClick={(e) => {
          e.stopPropagation();
          setSelectedImage(galleryImages[(galleryImages.indexOf(selectedImage) + 1) % galleryImages.length]);
          setZoomLevel(1);
          setImagePosition({ x: 0, y: 0 });
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
              className={`w-16 h-16 object-cover rounded cursor-pointer bg-[var(--gray-200)] ${img === selectedImage ? 'border-2 border-[var(--primary)] opacity-100' : 'opacity-70'}`}              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(img);
                setZoomLevel(1);
                setImagePosition({ x: 0, y: 0 });
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
        style={{ fontSize: 'var(--font-size-xl)' }}
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