
import React, { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';

interface AdBannerProps {
  position: 'top' | 'middle' | 'bottom';
  hasContent?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdBanner: React.FC<AdBannerProps> = ({ position, hasContent = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adStatus, setAdStatus] = useState<'idle' | 'loading' | 'ready' | 'disabled'>(
    CONFIG.ADSENSE.IS_ACTIVE ? 'loading' : 'disabled'
  );

  useEffect(() => {
    // Si la posición es media y no hay contenido, no mostramos nada nunca
    if (position === 'middle' && !hasContent) return;

    if (!CONFIG.ADSENSE.IS_ACTIVE) {
      setAdStatus('disabled');
      return;
    }

    const clientId = CONFIG.ADSENSE.CLIENT_ID;
    const SCRIPT_ID = 'adsbygoogle-js-loader';

    // 1. Inyectar Script solo una vez
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.crossOrigin = "anonymous";
      script.onerror = () => console.error("Error cargando AdSense. ¿AdBlocker activo?");
      document.head.appendChild(script);
    }

    // 2. Inicializar el anuncio
    const initAd = () => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        const ins = containerRef.current?.querySelector('ins');
        
        // Solo hacemos push si el INS está vacío y presente
        if (ins && ins.innerHTML === "") {
          window.adsbygoogle.push({});
          setAdStatus('ready');
        }
      } catch (e) {
        console.warn(`[AdSense] Error en slot ${position}:`, e);
      }
    };

    // Esperar a que el componente esté bien montado en el DOM
    const timer = setTimeout(initAd, 500);
    return () => clearTimeout(timer);
  }, [position, hasContent]);

  // Si está desactivado y NO estamos en modo debug, desaparece
  if (adStatus === 'disabled' && !CONFIG.ADSENSE.DEBUG_MODE) {
    return null;
  }

  const specs = {
    top: { minH: '90px', maxW: '728px', label: 'Banner Superior' },
    middle: { minH: '250px', maxW: '336px', label: 'Banner Lateral/Intermedio' },
    bottom: { minH: '90px', maxW: '970px', label: 'Banner Inferior' }
  };

  const current = specs[position];
  const slotId = CONFIG.ADSENSE.SLOTS[position.toUpperCase() as keyof typeof CONFIG.ADSENSE.SLOTS];

  return (
    <div 
      ref={containerRef}
      className="w-full mx-auto my-8 flex flex-col items-center justify-center animate-fade-in-up"
      style={{ maxWidth: current.maxW }}
    >
      {/* Etiqueta visible para depuración */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold">Publicidad</span>
        {CONFIG.ADSENSE.DEBUG_MODE && (
          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${adStatus === 'disabled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {adStatus === 'disabled' ? 'OFF' : 'ON'}
          </span>
        )}
      </div>
      
      {/* Contenedor con dimensiones garantizadas */}
      <div 
        className={`w-full flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-500
          ${adStatus === 'disabled' 
            ? 'border-2 border-dashed border-slate-200 bg-slate-50' 
            : 'border border-slate-100 bg-slate-50/30'
          }`}
        style={{ minHeight: current.minH }}
      >
        {adStatus === 'disabled' ? (
          <div className="text-center p-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase">{current.label}</p>
            <p className="text-[9px] text-slate-300 italic">Espacio reservado (AdSense Inactivo)</p>
          </div>
        ) : (
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block', 
              width: '100%', 
              height: '100%',
              minHeight: current.minH,
              backgroundColor: 'transparent'
            }}
            data-ad-client={CONFIG.ADSENSE.CLIENT_ID}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>
    </div>
  );
};

export default AdBanner;
