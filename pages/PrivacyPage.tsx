
import React from 'react';
import { Link } from 'react-router-dom';
import { CONFIG } from '../config';

const PrivacyPage: React.FC = () => {
  const siteName = CONFIG.SEO.BASE_TITLE;
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
          Tu Privacidad es <span className="text-gradient">Sagrada</span>
        </h1>
        <p className="text-slate-500 font-medium">Actualizado el {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-blue-600 rounded-[2.5rem] p-8 md:p-10 text-white mb-12 shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span> Resumen para humanos (TL;DR)
          </h2>
          <ul className="space-y-3 text-blue-50 opacity-90">
            <li className="flex items-start gap-3">
              <span className="bg-blue-400/30 rounded-full p-1 text-[10px]">✓</span>
              <span><strong>No guardamos tus mensajes:</strong> Lo que pegas o generas muere en tu sesión.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-400/30 rounded-full p-1 text-[10px]">✓</span>
              <span>No vendemos tus datos personales a terceros.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-400/30 rounded-full p-1 text-[10px]">✓</span>
              <span>Usamos cookies solo para publicidad (AdSense) y estadísticas básicas.</span>
            </li>
          </ul>
        </div>
        <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 rotate-12">🛡️</div>
      </div>

      <div className="space-y-8 prose prose-slate max-w-none">
        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mt-0 flex items-center gap-3">
            <span className="text-blue-500">01.</span> Tratamiento de tus Mensajes
          </h2>
          <p>
            En {siteName}, la privacidad de tu contexto es fundamental. 
            <strong> El texto que pegas en nuestro generador se procesa en tiempo real para instruir a la IA y no se guarda en ninguna base de datos propia.</strong> 
            Tus conversaciones privadas siguen siendo privadas.
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mt-0 flex items-center gap-3">
            <span className="text-blue-500">02.</span> Cookies y Google AdSense
          </h2>
          <p>
            Google utiliza cookies para mostrar anuncios basados en tus visitas anteriores. Puedes gestionar estas preferencias en la configuración de anuncios de Google. No tenemos control sobre el contenido de los anuncios mostrados por terceros a través de la red de AdSense.
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mt-0 flex items-center gap-3">
            <span className="text-blue-500">03.</span> Responsabilidad del Usuario
          </h2>
          <p>
            Al utilizar este servicio, comprendes que eres el autor de la comunicación final enviada. {siteName} solo proporciona una herramienta de redacción creativa. Cualquier consecuencia derivada del uso del contenido generado es responsabilidad exclusiva del usuario.
          </p>
        </section>
      </div>

      <div className="mt-20 flex flex-col md:flex-row justify-center items-center gap-4 border-t border-slate-200 pt-12">
        <Link to="/terminos" className="text-slate-400 hover:text-blue-600 font-bold transition-colors">Términos de Uso</Link>
        <span className="hidden md:block text-slate-200">|</span>
        <Link to="/contacto" className="text-slate-400 hover:text-blue-600 font-bold transition-colors">Soporte y Contacto</Link>
      </div>
    </div>
  );
};

export default PrivacyPage;
