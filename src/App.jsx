import { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import Catalog from "./components/Catalog.jsx";
import PropertyPage from "./components/PropertyPage.jsx";
import Footer from "./components/Footer.jsx";

function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) {
      setVisible(true);
    }
  }, []);
  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 w-full z-[9999] flex justify-center animate-fadeIn">
      <div className="bg-white border border-[var(--gray-200)] shadow-lg rounded-lg px-4 py-3 mb-6 flex flex-col sm:flex-row items-center gap-3 max-w-xl w-full mx-2 sm:mx-0">
        <span className="text-[var(--gray-700)] text-sm sm:text-base">Мы используем cookie-файлы для улучшения работы сайта. Продолжая пользоваться сайтом, вы соглашаетесь с <a href="/privacy" className="underline hover:text-[var(--primary)] transition">политикой конфиденциальности</a>.</span>
        <button
          onClick={handleAccept}
          className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-blue-800 active:bg-blue-900 transition-all duration-200 text-sm sm:text-base shadow-sm"
        >
          Хорошо
        </button>
      </div>
    </div>
  );
}

function App() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]); // добавлено состояние для properties
  const navigate = useNavigate();
  const location = useLocation();
  const filtersRef = useRef(null);

  const handleTagClick = (key, value) => {
    setTagFilter({ key, value });
    navigate("/catalog");
  };

  const resetTagFilter = () => {
    setTagFilter(null);
  };

  // Глобальная загрузка properties (можно доработать под ваши нужды)
  useEffect(() => {
    setLoading(true);
    fetch('/api/properties?limit=1000')
      .then(res => res.json())
      .then(data => {
        setProperties(data.properties || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow w-full p-6">
          <div className="text-center text-gray-600">Загрузка...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow w-full p-6">
          <div className="text-red-600 text-center">
            Произошла ошибка: {error.message}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <CookieConsent />
      <main className="flex-grow w-full">
        {/* Удалён временный DEBUG-блок */}
        <Routes>
          <Route path="/" element={<Home properties={properties} setProperties={setProperties} />} />
          <Route
            path="/catalog"
            element={
              <Catalog
                onTagClick={handleTagClick}
                filtersRef={filtersRef}
                tagFilter={tagFilter}
                resetTagFilter={resetTagFilter}
                properties={properties}
                setProperties={setProperties}
              />
            }
          />
          <Route
            path="/property/:id"
            element={
              <PropertyPage
                properties={properties}
                setSelectedProperty={setSelectedProperty}
              />
            }
          />
          <Route
            path="*"
            element={
              <div className="p-6 text-center text-gray-600 animate-fadeIn">
                Страница не найдена
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;