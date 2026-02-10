import React, { useState } from 'react';
import { generateAmazonLink } from '../services/amazonService';
import { CONFIG } from '../config';

export interface GiftSuggestion {
  title: string;
  search_term: string;
  reason: string;
  price_range: string;
}

interface GiftRecommendationsProps {
  gifts: GiftSuggestion[];
  country: string;
}

const GiftRecommendations: React.FC<GiftRecommendationsProps> = ({ gifts, country }) => {
  if (!gifts || gifts.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t border-slate-100 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF9900]/10 p-2 rounded-lg text-xl">🎁</div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Ideas de Regalo
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Seleccionadas por nuestra IA para esta ocasión
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#FF9900] bg-[#FF9900]/5 px-3 py-1 rounded-full border border-[#FF9900]/20">
          Amazon Finds
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gifts.map((gift, idx) => (
          <GiftCard key={idx} gift={gift} country={country} />
        ))}
      </div>
      
      <p className="text-[10px] text-slate-400 mt-8 text-center italic opacity-70">
        {CONFIG.AMAZON.DISCLAIMER}
      </p>
    </div>
  );
};

const GiftCard: React.FC<{ gift: GiftSuggestion; country: string }> = ({ gift, country }) => {
  const [imgError, setImgError] = useState(false);
  
  // Generamos una imagen basada en el término de búsqueda para simular la foto del producto
  // Usamos pollinations.ai que permite generar imágenes por URL sin API Key
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(gift.search_term + " product photography photorealistic white background")}`;

  return (
    <a
      href={generateAmazonLink(gift.search_term, country)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#FF9900]/50 hover:shadow-xl hover:shadow-[#FF9900]/10 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
    >
      {/* Contenedor de Imagen */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-50 flex items-center justify-center">
        {!imgError ? (
          <img 
            src={imageUrl} 
            alt={gift.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-4xl opacity-20">🛍️</div>
        )}
        
        {/* Etiqueta de Precio */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-slate-100">
          {gift.price_range}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h5 className="font-bold text-slate-900 text-sm mb-2 leading-snug group-hover:text-[#C77700] transition-colors line-clamp-2">
          {gift.title}
        </h5>

        <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-grow line-clamp-3">
          {gift.reason}
        </p>

        <div className="mt-auto">
          <div className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] hover:border-[#F2C200] text-[#0F1111] text-xs font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
            Ver en Amazon
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </div>
        </div>
      </div>
    </a>
  );
};

export default GiftRecommendations;