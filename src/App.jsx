import { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import Catalog from "./components/Catalog.jsx";
import PropertyPage from "./components/PropertyPage.jsx";
import Footer from "./components/Footer.jsx";
import properties from "./data.json";

function App() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Ref для фильтров, который будет передан в Catalog
  const filtersRef = useRef(null);

  // Отладка: убедимся, что useRef импортирован
  console.log("App: useRef defined:", typeof useRef !== 'undefined');

  useEffect(() => {
    console.log("App: Fetching properties (mock)...");
    console.log("App: Current location:", location.pathname);
    console.log("App: Properties loaded:", properties);

    // Проверка на MetaMask
    if (typeof window.ethereum !== 'undefined') {
      console.log("App: MetaMask is detected");
    } else {
      console.log("App: MetaMask is not detected");
    }
  }, [location]);

  const handleTagClick = (key, value) => {
    console.log("App: Tag clicked:", key, value);
    setTagFilter({ key, value });
    navigate("/catalog");
  };

  // Функция для сброса tagFilter
  const resetTagFilter = () => {
    console.log("App: Resetting tagFilter");
    setTagFilter(null);
  };

  // Обработка ошибок
  if (error) {
    console.error("App: Error occurred:", error);
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

  // Проверка импорта properties
  if (!properties || !Array.isArray(properties)) {
    const errorMsg = "Данные недвижимости недоступны или некорректны";
    console.error("App: Properties check failed:", properties);
    setError(new Error(errorMsg));
    return null;
  }

  // Проверка структуры properties
  const hasValidStructure = properties.every(prop => 
    prop && typeof prop === 'object' && prop.id && prop.tags && typeof prop.tags === 'object'
  );
  if (!hasValidStructure) {
    const errorMsg = "Некорректная структура данных в properties";
    console.error("App: Properties structure check failed:", properties);
    setError(new Error(errorMsg));
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div>App is rendering...</div>
      <Header />
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/catalog"
            element={
              <Catalog
                properties={tagFilter ? properties.filter(p => p.tags[tagFilter.key] === tagFilter.value) : properties}
                onTagClick={handleTagClick}
                filtersRef={filtersRef}
                tagFilter={tagFilter}
                resetTagFilter={resetTagFilter}
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
            element={<div className="p-6 text-center text-gray-600 animate-fadeIn">Страница не найдена</div>}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;