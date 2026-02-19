import React from 'react';
import { generateAmazonLink } from '../services/amazonService';
import { CONFIG } from '../config';

export interface GiftSuggestion {
  title: string;
  search_term: string;
  reason: string;
  price_range: string;
  image_url?: string;
}

interface GiftRecommendationsProps {
  gifts: GiftSuggestion[];
  country: string;
  isLoading?: boolean;
}

const GiftCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse flex flex-col h-full" aria-hidden="true">
      {/* Image Placeholder */}
      <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
      <div className="p-5 flex flex-col flex-grow">
        {/* Title Placeholder */}
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
        
        {/* Reason Placeholder */}
        <div className="space-y-2 mb-4 flex-grow">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
        </div>
        
        {/* Button Placeholder */}
        <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-xl mt-auto"></div>
      </div>
    </div>
  );
};

const CompactGiftCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-start gap-3 h-full" aria-hidden="true">
      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0 animate-pulse"></div>
      <div className="flex-1 space-y-2 w-full pt-1">
        <div className="flex justify-between gap-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3 animate-pulse"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-8 animate-pulse"></div>
        </div>
        <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse"></div>
        <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
};

const CompactGiftCard: React.FC<{ gift: GiftSuggestion; country: string }> = ({ gift, country }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Validación robusta: Si la URL es el placeholder, está vacía o falló la carga, usamos el fallback
  const hasValidImage = gift.image_url && 
                        gift.image_url !== "url_imagen_opcional" && 
                        !gift.image_url.includes("example.com") &&
                        gift.image_url.trim() !== "" &&
                        !imageError;

  return (
    <a
      href={generateAmazonLink(gift.search_term, country)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex flex-row items-start gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#FF9900]/50 transition-all shadow-sm h-full active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label={`Ver ${gift.title} en Amazon (se abre en una nueva pestaña)`}
      title={`Ver ${gift.title} en Amazon`}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform overflow-hidden relative">
        {hasValidImage ? (
          <>
            <img 
              src={gift.image_url} 
              alt={gift.title} 
              className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"}`} 
              loading="lazy" 
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />}
          </>
        ) : (
          <span className="text-3xl" role="img" aria-label="Icono de regalo">🎁</span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="mb-1">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2 mb-1">
            {gift.title}
            </h5>
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block whitespace-nowrap">
                {gift.price_range}
            </span>
        </div>
        <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2 flex-grow">
          {gift.reason}
        </p>
        <div className="flex items-center gap-1 text-[10px] font-bold text-[#B16000] dark:text-[#FF9900] mt-auto">
             Ver en Amazon <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </div>
      </div>
    </a>
  );
};

const GiftRecommendations: React.FC<GiftRecommendationsProps> = ({ gifts, country, isLoading = false }) => {
  // Filtrar regalos inválidos (sin título o término de búsqueda) para evitar errores de renderizado
  const validGifts = gifts?.filter(g => g && g.title && g.search_term);

  // Si no estamos cargando y no hay regalos válidos, no renderizamos nada.
  if (!isLoading && (!validGifts || validGifts.length === 0)) {
    return null;
  }

  return (
    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF9900]/10 p-2 rounded-lg text-xl" aria-hidden="true">🎁</div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Ideas de Regalo
              </h4>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold text-[#B16000] dark:text-[#FF9900] bg-[#FF9900]/10 px-2 py-0.5 rounded-full border border-[#B16000]/20 dark:border-[#FF9900]/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                Amazon Finds
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Seleccionadas por nuestra IA para esta ocasión
            </p>
          </div>
        </div>
        <span className="sm:hidden flex items-center gap-1 text-[9px] font-bold text-[#B16000] dark:text-[#FF9900] bg-[#FF9900]/10 px-2 py-0.5 rounded-full border border-[#B16000]/20 dark:border-[#FF9900]/30 whitespace-nowrap">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
          Amazon Finds
        </span>
      </div>

      {isLoading ? (
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="min-w-[260px] w-[80%] sm:w-[300px] snap-center shrink-0">
              <div className="block md:hidden h-full"><CompactGiftCardSkeleton /></div>
              <div className="hidden md:block h-full"><GiftCardSkeleton /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar">
          {validGifts.map((gift, idx) => (
            <div key={idx} className="min-w-[260px] w-[80%] sm:w-[300px] snap-center shrink-0">
              <div className="block md:hidden h-full"><CompactGiftCard gift={gift} country={country} /></div>
              <div className="hidden md:block h-full"><GiftCard gift={gift} country={country} /></div>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-8 text-center italic">
        {CONFIG.AMAZON.DISCLAIMER}
      </p>
    </div>
  );
};

const GiftCard: React.FC<{ gift: GiftSuggestion; country: string }> = ({ gift, country }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const hasValidImage = gift.image_url && 
                        gift.image_url !== "url_imagen_opcional" && 
                        !gift.image_url.includes("example.com") &&
                        gift.image_url.trim() !== "" &&
                        !imageError;

  return (
    <a
      href={generateAmazonLink(gift.search_term, country)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-[#FF9900]/50 hover:shadow-xl hover:shadow-[#FF9900]/10 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label={`Ver ${gift.title} en Amazon (se abre en una nueva pestaña)`}
      title={`Ver ${gift.title} en Amazon`}
    >
      {/* Contenedor de Imagen */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center group-hover:from-[#FF9900]/5 group-hover:to-[#FF9900]/10 transition-colors duration-300">
        {hasValidImage ? (
          <>
            <img 
              src={gift.image_url} 
              alt={gift.title} 
              className={`w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700 ${imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-lg"}`} 
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />}
          </>
        ) : (
          <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" role="img" aria-label="Icono de regalo">🎁</div>
        )}
        
        {/* Etiqueta de Precio */}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
          {gift.price_range}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-2 leading-snug group-hover:text-[#B16000] dark:group-hover:text-[#FF9900] transition-colors line-clamp-2">
          {gift.title}
        </h5>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-grow line-clamp-3">
          {gift.reason}
        </p>

        <div className="mt-auto">
          <div className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] hover:border-[#F2C200] text-[#0F1111] text-xs font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
            Ver en Amazon
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </div>
        </div>
      </div>
    </a>
  );
};

export default GiftRecommendations;