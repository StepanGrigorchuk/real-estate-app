import { TELEGRAM_LINK } from '../constants';

function Footer() {
  return (
    <footer className="bg-[var(--white)] py-4 sm:py-6 px-2 sm:px-0 border-t border-[var(--gray-200)] w-full animate-fadeIn">
      <div className="text-center max-w-2xl mx-auto px-2">
        <div className="italic text-[var(--gray-600)] mb-2 sm:mb-4 text-xs sm:text-base" style={{ fontSize: 'var(--font-size-xs)' }}>
          "Дом — это там, где ваше сердце." — Неизвестный автор
        </div>
        <a href={TELEGRAM_LINK} className="text-[var(--primary)] hover:underline text-sm sm:text-base break-all" style={{ fontSize: 'var(--font-size-sm)' }}>
          Телеграм-канал
        </a>
      </div>
    </footer>
  );
}

export default Footer;