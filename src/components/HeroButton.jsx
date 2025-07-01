import { Link } from 'react-router-dom';

function HeroButton({ to, href, onClick, children, className = "", ...props }) {
  const baseClasses = "bg-gradient-to-r from-blue-500 to-blue-700 !text-white px-6 sm:px-6 py-6 sm:py-4 rounded-lg hover:from-blue-600 hover:to-blue-800 hover:shadow-xl hover:scale-105 hover:brightness-110 transition-all duration-300 text-[var(--font-size-hero)] sm:text-[var(--font-size-button)] inline-block min-h-[64px] sm:min-h-[48px] leading-tight font-medium";
  
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
