import React, { useState } from "react";
import { Link } from "react-router-dom";

// 1. Definición de Interfaces
interface FaqItemData {
  question: string;
  answer: string | React.ReactNode;
  badge?: string;
}

export const faqData: FaqItemData[] = [
  {
    question: "¿Cómo funciona el generador de mensajes con IA?",
    answer:
      "Nuestra inteligencia artificial analiza la ocasión, el destinatario y el tono emocional que eliges para redactar un mensaje único. Es como tener un asistente de escritura que entiende tus necesidades.",
  },
  {
    question: "¿Puedo usar esto para saber qué responder en WhatsApp?",
    answer:
      "¡Claro! De hecho, es una de nuestras funciones más populares. Simplemente pega el mensaje que recibiste en la sección 'Responder un mensaje' y nuestra inteligencia artificial para WhatsApp te dará ideas creativas para contestar.",
  },
  {
    question: "¿Esto me ayudará a mejorar la comunicación con mi pareja?",
    answer:
      "Sí. La app está diseñada para ayudarte a encontrar las palabras correctas en momentos clave, lo que puede mejorar la comunicación de pareja. El Guardián de Sentimiento (en el plan Premium) incluso aprende tu estilo para que los mensajes suenen 100% como tú.",
  },
  {
    question: "¿Qué hago si no tengo ideas para mensajes de texto?",
    answer:
      "Ese es exactamente el problema que resolvemos. Explora nuestras categorías como 'Amor', 'Cumpleaños' o 'Perdóname' para obtener ideas para mensajes de texto al instante, personalizadas según tu necesidad.",
  },
  {
    question: "¿Cómo puedo realizar el pago del plan Premium?",
    answer:
      "Aceptamos pagos seguros a través de MercadoPago, lo que te permite usar tarjetas de crédito, débito y otros métodos locales. El proceso es rápido y tus datos están protegidos.",
  },
  {
    question: "¿Qué es el Guardián de Sentimientos?",
    answer: (
      <>
        Es nuestro motor de inteligencia emocional exclusivo del plan Premium.
        Analiza la salud de tus relaciones, aprende tu estilo de escritura y te
        da consejos personalizados para que cada mensaje fortalezca el vínculo
        con tus contactos.{" "}
        <Link to="/pricing" className="text-blue-600 font-bold hover:underline">
          Ver planes Premium
        </Link>
        .
      </>
    ),
    badge: "Nuevo ✨",
  },
];

// 2. Componente FaqItem corregido con React.FC para evitar error de 'key'
const FaqItem: React.FC<{ item: FaqItemData }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen} // Mejora de accesibilidad
        className="w-full flex justify-between items-center text-left focus:outline-none group"
      >
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
            {item.question}
          </h4>
          {item.badge && (
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
              {item.badge}
            </span>
          )}
        </div>
        <span
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </span>
      </button>

      {/* Contenedor de respuesta corregido de <p> a <div> para evitar errores de nesting */}
      {isOpen && (
        <div className="mt-4 animate-fade-in-up">
          <div className="text-slate-600 leading-relaxed">{item.answer}</div>
        </div>
      )}
    </div>
  );
};

// 3. Sección Principal
const FaqSection: React.FC = () => {
  return (
    <section id="faq" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-4">
          Preguntas Frecuentes
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Respuestas rápidas a tus dudas sobre nuestra Inteligencia Relacional
          para generar mensajes mágicos.
        </p>
      </div>
      <div className="max-w-3xl mx-auto px-4">
        {faqData.map((item) => (
          // Usamos la pregunta como key única para mejor estabilidad en el render
          <FaqItem key={item.question} item={item} />
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
