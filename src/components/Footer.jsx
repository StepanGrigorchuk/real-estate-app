import { TELEGRAM_LINK } from '../constants';

function Footer() {
  return (
    <footer className="bg-[var(--white)] py-6 sm:py-8 px-2 sm:px-6 border-t border-[var(--gray-200)] w-full animate-fadeIn pb-24 sm:pb-20">
      <div className="max-w-4xl pl-8 sm:pl-12">
        <div className="text-[var(--gray-600)] text-base leading-relaxed mb-12">
          Мы искренне верим, что каждый инвестор достоин прозрачной и честной информации о рынке недвижимости Крыма, чтобы увидеть его уникальный потенциал и сделать осознанный выбор без давления и навязчивых звонков.
          <br /> <br />
          Поэтому мы — дуэт  эксперта по инвестиционной недвижимости и дизайнера-разработчика, с заботой и любовью к нашим клиентам создали этот сервис. Наша безграничная вера в Крым и его будущее вдохновила нас на этот шаг.
        </div>
        
        <div className="flex justify-start">
          <a 
            href={TELEGRAM_LINK} 
            className="inline-flex items-center justify-center w-12 h-12 bg-[var(--primary)] text-[var(--white)] rounded-full hover:bg-[var(--blue-600)] transition-all duration-300 hover:scale-110"
            aria-label="Telegram канал"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6" 
              fill="currentColor"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.643 7.748c-.124.56-.453.697-.918.434l-2.548-1.879-1.228 1.183c-.136.136-.251.251-.514.251l.183-2.586 4.735-4.281c.206-.183-.045-.284-.319-.101L9.74 11.947l-2.49-.778c-.542-.17-.553-.542.112-.803l9.733-3.757c.451-.17.848.101.704.803h-.001z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;