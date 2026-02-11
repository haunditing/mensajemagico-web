import React from "react";
import { Link } from "react-router-dom";
import { CONFIG } from "../config";

const ContactPage: React.FC = () => {
  const siteName = CONFIG.SEO.BASE_TITLE;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
          Estamos a un <span className="text-gradient">Click</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
          ¿Problemas con el generador? ¿Sugerencias para una nueva ocasión? Nos
          encanta escucharte.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
          <div>
            <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl mb-8">
              📧
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">
              Canal Directo
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Nuestro equipo creativo revisa personalmente cada mensaje para
              mejorar tu experiencia en {siteName}.
            </p>

            <a
              href="mailto:mycsolucioneslogisticas@gmail.com"
              className="group flex items-center justify-between bg-blue-600 hover:bg-blue-700 p-6 rounded-3xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest text-blue-100 mb-1 font-bold">
                  Contacto Oficial
                </span>
                <span className="text-xl md:text-2xl font-bold text-white transition-colors">
                  Enviar Correo
                </span>
              </div>
              <span className="text-3xl group-hover:translate-x-2 transition-transform duration-300">
                ✉️
              </span>
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50">
            <p className="text-sm text-slate-400 italic">
              * Respondemos en menos de 48 horas hábiles. Siempre.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center py-12 md:py-16">
            <h3 className="text-2xl font-bold mb-4 relative z-10">
              ¿Dónde estamos?
            </h3>
            <p className="text-slate-400 mb-6 relative z-10 font-bold uppercase tracking-widest text-[10px]">
              Mensaje Mágico
            </p>
            <div className="flex items-center gap-4 text-xl relative z-10">
              <span className="text-3xl">📍</span>
              <span className="font-bold">El mundo es nuestro hogar</span>
            </div>
            <div className="absolute right-0 bottom-0 text-[15rem] opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              🌎
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative z-20">
            <h3 className="font-bold text-slate-900 mb-3 italic flex items-center gap-2">
              <span className="text-blue-600 text-lg">💡</span> Nuestra razón de
              ser:
            </h3>
            <div className="text-slate-500 text-sm leading-relaxed m-0 font-medium">
              {siteName} Impulsa una tecnología con alma, diseñada para que las
              personas conecten mejor a través de sus emociones y la innovación
              digital.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 py-10 text-center border-t border-slate-200">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl text-slate-500 hover:text-blue-600 font-bold transition-all group bg-slate-100 hover:bg-blue-50"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          Volver a generar magia
        </Link>
      </div>
    </div>
  );
};

export default ContactPage;
