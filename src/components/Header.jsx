import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { TELEGRAM_LINK } from '../constants';

function Header() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHeaderVisible(false); // Скролл вниз — скрыть
      } else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true); // Скролл вверх — показать
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <header
      className={`bg-white shadow-md py-4 sm:py-5 px-4 sm:px-6 fixed w-full z-10 transition-transform duration-500`}
      style={{
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-row flex-wrap justify-between items-center gap-3 sm:gap-0">
        <Link to="/" reloadDocument className="flex items-center min-w-[40px]">
          <img src="/logo.svg" alt="Логотип Компас" className="h-10 sm:h-10 w-auto" />
        </Link>
        <div className="flex gap-3 sm:gap-3 items-center">
          <a
            href={TELEGRAM_LINK}
            className="hidden md:inline-block bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap text-base sm:text-base"
            style={{ fontSize: 'clamp(1rem, 2vw + 0.8rem, 1.1rem)' }}
          >
            Написать помощнику
          </a>
          <a
            href="tel:+1234567890"
            className="bg-primary md:bg-white p-3 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center"
            style={{ fontSize: 'clamp(1.1rem, 2vw + 0.8rem, 1.15rem)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 sm:h-6 sm:w-6 text-white md:text-primary"
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