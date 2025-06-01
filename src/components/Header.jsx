import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Скролл вниз и прокручено больше 50px
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Скролл вверх
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`bg-white shadow-md py-4 md:py-4 px-6 fixed w-full z-10 transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Логотип Компас" className="h-10" />
        </Link>
        <div className="flex gap-3">
          <a href="https://t.me/yourmanager" className="hidden md:inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Написать помощнику
          </a>
          <a href="tel:+1234567890" className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;