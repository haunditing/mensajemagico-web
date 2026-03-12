import React from 'react';
import { Link } from 'react-router-dom';
import { CONFIG } from '../config';

const TermsPage: React.FC = () => {
  const siteName = CONFIG.SEO.BASE_TITLE;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Términos y <span className="text-gradient">Condiciones</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium italic">Última actualización: 12 de marzo de 2026</p>
      </div>

      <div className="grid gap-6">
        {[
          {
            title: "1. Naturaleza del Servicio",
            icon: "✍️",
            text: `${siteName} es una herramienta de asistencia creativa impulsada por Inteligencia Artificial (incluyendo modelos como Gemma y Gemini). Su propósito es sugerir textos para la comunicación personal. No garantizamos resultados específicos en tus relaciones interpersonales.`
          },
          {
            title: "2. Propiedad Intelectual de los Mensajes",
            icon: "⚖️",
            text: "Aunque la tecnología subyacente es propiedad nuestra, tú (el usuario) eres el propietario exclusivo de los mensajes finales generados y editados. Eres libre de usarlos, modificarlos y compartirlos como desees."
          },
          {
            title: "3. Limitación de Responsabilidad Relacional",
            icon: "🛡️",
            text: "El 'Guardián Relacional' ofrece análisis basados en patrones de datos, no en psicología clínica. No nos hacemos responsables de rupturas, malentendidos, o cualquier consecuencia emocional o legal derivada del envío de los mensajes generados. Tú eres el único responsable de tus comunicaciones."
          },
          {
            title: "4. Uso Justo y Cuotas (Fair Use)",
            icon: "⚖️",
            text: "Cada plan tiene cuotas diarias publicadas en la página de precios (por ejemplo, Premium Lite y Premium Pro). Estas cuotas aplican bajo política de uso justo para prevenir abuso automatizado (bots) y proteger la estabilidad del servicio. Podemos ajustar límites y controles antiabuso con previo aviso razonable."
          },
          {
            title: "5. Entrenamiento de IA y Privacidad",
            icon: "🧠",
            text: "Al usar el 'Editor Mágico', aceptas que tus ediciones sean procesadas para entrenar tu modelo personal de estilo (Lexicón Preferido). Estos datos son privados y no se comparten con terceros para fines comerciales."
          },
          {
            title: "6. Jurisdicción",
            icon: "🇨🇴",
            text: "Estos términos se rigen e interpretan de acuerdo con las leyes de la República de Colombia. Cualquier disputa se resolverá en los tribunales de Cartagena de Indias."
          }
        ].map((item, i) => (
          <div key={i} className="group bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-slate-50 dark:bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:scale-110 transition-all shrink-0">
              {item.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed m-0">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Al usar este sitio, aceptas estos términos y nuestra Política de Privacidad.</p>
        <Link to="/contacto" className="inline-flex items-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-lg">
          Hablar con el Equipo ✉️
        </Link>
      </div>
    </div>
  );
};

export default TermsPage;
