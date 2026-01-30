
import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
          Reglas del <span className="text-gradient">Juego</span>
        </h1>
        <p className="text-slate-500 font-medium italic">Cómo usar MensajeMágico de forma responsable.</p>
      </div>

      <div className="grid gap-6">
        {[
          {
            title: "Uso del Contenido",
            icon: "✍️",
            text: "Los mensajes generados por nuestra IA son meras sugerencias. Siéntete libre de editarlos. El usuario es el único responsable de decidir qué mensajes enviar y a quién."
          },
          {
            title: "Propiedad Intelectual",
            icon: "⚖️",
            text: "El diseño, marca y tecnología de MensajeMágico son propiedad nuestra. Una vez generado un texto, el derecho de uso personal es tuyo."
          },
          {
            title: "Exención de Responsabilidad",
            icon: "🛡️",
            text: "La IA genera textos basados en patrones probabilísticos. MensajeMágico no garantiza que el resultado sea exacto o apropiado para tu situación específica. No nos hacemos responsables de rupturas, malentendidos o cualquier impacto personal, social o legal derivado del uso de los mensajes."
          },
          {
            title: "Publicidad de Terceros",
            icon: "📢",
            text: "Este sitio se financia mediante publicidad de Google AdSense. No controlamos los anuncios mostrados y no somos responsables de los servicios externos ofrecidos en dicha publicidad."
          }
        ].map((item, i) => (
          <div key={i} className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-50 group-hover:scale-110 transition-all shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed m-0">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-slate-400 text-sm mb-8">Al usar este sitio, aceptas que eres el único autor y responsable de tus comunicaciones.</p>
        <Link to="/contacto" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg">
          Hablar con el Equipo ✉️
        </Link>
      </div>
    </div>
  );
};

export default TermsPage;
