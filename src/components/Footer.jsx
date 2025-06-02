import { TELEGRAM_LINK } from '../constants';

function Footer() {
  return (
    <footer className="bg-[var(--white)] py-6 px-0 border-t border-[var(--gray-200)] w-full animate-fadeIn">
      <div className="text-center">
        <div className="italic text-[var(--gray-600)] mb-4">
          "Дом — это там, где ваше сердце." — Неизвестный автор
        </div>
        <a href={TELEGRAM_LINK} className="text-[var(--primary)] hover:underline">
          Телеграм-канал
        </a>
      </div>
    </footer>
  );
}

export default Footer;