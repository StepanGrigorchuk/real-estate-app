import { Link } from 'react-router-dom';

function HeroButton({ to, href, onClick, children, className = "", ...props }) {
  const baseClasses = "bg-gradient-to-r from-blue-500 to-blue-700 text-[var(--white)] px-6 sm:px-6 py-4 sm:py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 hover:shadow-xl hover:scale-105 hover:brightness-110 transition-all duration-300 text-lg sm:text-button inline-block min-h-[48px] sm:min-h-[40px]";
  
  const combinedClasses = `${baseClasses} ${className}`;

  // Если это внешняя ссылка
  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Если это внутренняя ссылка
  if (to) {
    return (
      <Link
        to={to}
        className={combinedClasses}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // Если это обычная кнопка с обработчиком
  return (
    <button
      onClick={onClick}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
}

export default HeroButton;
