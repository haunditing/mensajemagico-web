
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OCCASIONS } from '../constants';
import { updateSeoTags } from '../services/seoService';
import AdBanner from '../components/AdBanner';
import OccasionIcon from '../components/OccasionIcon';

const HomePage: React.FC = () => {
  useEffect(() => {
    updateSeoTags();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <section className="text-center mb-16 md:mb-24">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
          Escribe lo que sientes, <br className="hidden md:block" />
          <span className="text-gradient">sin complicaciones.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Nuestra IA redacta cartas, mensajes y respuestas personalizadas en segundos. La solución perfecta para cuando las palabras no fluyen.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/mensajes/responder-un-mensaje" className="h-14 px-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 gap-3">
            <OccasionIcon slug="responder-un-mensaje" className="w-6 h-6 text-white" />
            <span>Qué responder a...</span>
          </Link>
          <Link to="/mensajes/no-me-dejes-en-visto" className="h-14 px-8 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 gap-3">
            <OccasionIcon slug="no-me-dejes-en-visto" className="w-6 h-6 text-white" />
            <span>Me dejaron en visto</span>
          </Link>
        </div>
      </section>

      <AdBanner position="top" />

      {/* Grid de Ocasiones */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Categorías Populares</h2>
          <div className="h-px bg-slate-200 flex-grow ml-6 hidden sm:block"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OCCASIONS.map(occasion => {
            const isVisto = occasion.slug === 'no-me-dejes-en-visto';
            const isResponder = occasion.slug === 'responder-un-mensaje';
            
            return (
              <Link 
                key={occasion.id}
                to={`/mensajes/${occasion.slug}`}
                className={`group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:shadow-xl transition-all duration-300 
                  ${isVisto ? 'hover:border-green-400 hover:shadow-green-500/5' : ''}
                  ${isResponder ? 'hover:border-blue-500 border-blue-50' : 'hover:border-blue-400 hover:shadow-blue-500/5'}
                `}
              >
                <div className={`mb-6 grayscale group-hover:grayscale-0 transition-all duration-300`}>
                  <OccasionIcon slug={occasion.slug} icon={occasion.icon} isLarge />
                </div>
                <h3 className={`text-xl font-bold text-slate-900 mb-2 transition-colors 
                  ${isVisto ? 'group-hover:text-green-600' : ''}
                  ${isResponder ? 'group-hover:text-blue-600' : 'group-hover:text-blue-600'}
                `}>
                  {occasion.name}
                  {isResponder && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Nuevo</span>}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 flex-grow">
                  {occasion.description}
                </p>
                <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest 
                  ${isVisto ? 'text-green-600' : 'text-blue-600'}
                `}>
                  Crear ahora <span>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="my-16">
        <AdBanner position="middle" />
      </div>

      {/* Feature Section */}
      <section className="bg-slate-900 rounded-3xl p-8 md:p-16 text-white text-center relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-6">¿Bloqueo al escribir?</h2>
          <p className="text-slate-400 text-base md:text-lg mb-8 font-medium">
            Simplemente elige a quién va dirigido el mensaje, qué te enviaron (si es respuesta) y el tono que deseas. Nosotros nos encargamos del resto.
          </p>
          <Link to="/mensajes/responder-un-mensaje" className="inline-flex h-12 px-8 rounded-lg bg-white text-slate-900 font-bold items-center justify-center hover:bg-slate-100 transition-colors active:scale-95">
            Saber qué responder
          </Link>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none">
          <div className="text-[20rem] absolute -bottom-20 -right-20">🪄</div>
        </div>
      </section>
      
      <div className="mt-16">
        <AdBanner position="bottom" />
      </div>
    </div>
  );
};

export default HomePage;
