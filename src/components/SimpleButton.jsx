import { Link } from 'react-router-dom';

function SimpleButton({ to, href, onClick, children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "px-4 py-2 bg-[var(--primary)] text-[var(--white)] rounded-lg hover:bg-[var(--blue-600)] transition text-button",
    secondary: "px-4 py-2 bg-[var(--gray-200)] text-[var(--gray-600)] rounded-lg hover:bg-[var(--gray-300)] transition text-button",
    outline: "px-4 py-2 border border-[var(--primary)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)] hover:text-[var(--white)] transition text-button"
  };
  
  const baseClasses = variants[variant] || variants.primary;
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

export default SimpleButton;
