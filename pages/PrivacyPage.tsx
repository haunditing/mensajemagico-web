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
        <p className="text-slate-500 font-medium">Última actualización: 10 de febrero de 2026</p>
      </div>

      <div className="bg-blue-600 rounded-[2.5rem] p-8 md:p-10 text-white mb-12 shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span> Resumen para humanos (TL;DR)
          </h2>
          <ul className="space-y-3 text-blue-50 opacity-90">
            <li className="flex items-start gap-3">
              <span className="bg-blue-400/30 rounded-full p-1 text-[10px]">✓</span>
              <span><strong>Datos Emocionales:</strong> Analizamos el tono para el Guardián, pero no vendemos tus emociones.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-400/30 rounded-full p-1 text-[10px]">✓</span>
              <span><strong>Aprendizaje:</strong> Usamos tus ediciones para que la IA aprenda TU estilo, no para publicidad.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-400/30 rounded-full p-1 text-[10px]">✓</span>
              <span><strong>Control Total:</strong> Puedes borrar tu historial de aprendizaje cuando quieras.</span>
            </li>
          </ul>
        </div>
        <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 rotate-12">🛡️</div>
      </div>

      <div className="space-y-8 prose prose-slate max-w-none">
        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mt-0 flex items-center gap-3">
            <span className="text-blue-500">01.</span> Datos que Recopilamos
          </h2>
          <p>
            Para brindarte la experiencia mágica, procesamos:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Datos de Perfil:</strong> Correo electrónico, plan de suscripción y preferencias como tu <strong>Género Gramatical</strong> (para dirigirnos a ti correctamente).</li>
            <li><strong>Datos de Uso:</strong> Ocasiones elegidas, tonos seleccionados y frecuencia de uso.</li>
            <li><strong>Datos del Guardián (Sensibles):</strong> Análisis de salud relacional y patrones emocionales. Estos datos se usan EXCLUSIVAMENTE para personalizar tus sugerencias y no se comparten con terceros.</li>
            <li><strong>Geolocalización:</strong> Tu ciudad (ej. Cartagena) para adaptar el contexto cultural de los mensajes.</li>
          </ul>
        </section>

        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mt-0 flex items-center gap-3">
            <span className="text-blue-500">02.</span> Inteligencia Artificial y Aprendizaje
          </h2>
          <p>
            Utilizamos modelos de IA (como Gemma y Gemini) para procesar tus solicitudes.
            <br /><br />
            <strong>Entrenamiento de Estilo:</strong> Cuando editas un mensaje sugerido, nuestro sistema analiza los cambios para aprender tu "Lexicón Preferido" (tus palabras y estilo). Esto crea un modelo personalizado para ti. Tienes derecho a solicitar la eliminación de este historial de aprendizaje en cualquier momento contactando a soporte.
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mt-0 flex items-center gap-3">
            <span className="text-blue-500">03.</span> Cookies y Terceros
          </h2>
          <p>
            Utilizamos cookies para mantener tu sesión y preferencias. Además:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Google AdSense:</strong> Muestra publicidad basada en tus intereses (solo en planes gratuitos).</li>
              <li><strong>Procesadores de Pago:</strong> MercadoPago y Stripe procesan tus transacciones de forma segura; nosotros no almacenamos tus datos financieros completos.</li>
            </ul>
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mt-0 flex items-center gap-3">
            <span className="text-blue-500">04.</span> Tus Derechos
          </h2>
          <p>
            Bajo las leyes de protección de datos, tienes derecho a acceder, rectificar y eliminar tus datos personales y emocionales. Puedes gestionar tu suscripción y preferencias de privacidad directamente desde tu perfil o escribiéndonos.
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
