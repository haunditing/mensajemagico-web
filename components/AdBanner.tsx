import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface AdBannerProps {
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  hasContent?: boolean;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ position, hasContent = true, className = '' }) => {
  const { monetization } = useAuth();
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (adRef.current && !initialized.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initialized.current = true;
      } catch (e) {
        console.error("AdSense error", e);
      }
    }
  }, []);

  // 1. Validación del Plan: Si es Premium (show_ads: false), no renderizar nada.
  if (!monetization.show_ads) {
    return null;
  }

  if (!hasContent) return null;

  // IDs de bloque de anuncios (REEMPLAZA ESTOS CON TUS IDs REALES DE ADSENSE)
  const slots: Record<string, string> = {
    top: "1234567890", 
    middle: "1234567890",
    bottom: "1234567890",
    sidebar: "1234567890"
  };

  return (
    <div className={`ad-banner-wrapper my-6 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 ${className}`}>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Publicidad</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', minHeight: '250px' }}
        data-ad-client="ca-pub-8117082099604641"
        data-ad-slot={slots[position] || slots.middle}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;