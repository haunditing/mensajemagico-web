import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OCCASIONS } from "../constants";
import { CONFIG } from "../config";
import { updateSeoTags } from "../services/seoService.ts";
import AdBanner from "../components/AdBanner";
import OccasionIcon from "../components/OccasionIcon";
import FallingParticles from "../components/FallingParticles";
import ValentineCountdown from "../components/ValentineCountdown";
import ChristmasCountdown from "../components/ChristmasCountdown";
import ValentineBanner from "../components/ValentineBanner";
import CreateContactModal from "../components/CreateContactModal";
import { useAuth } from "../context/AuthContext";
import { useUpsell } from "../context/UpsellContext";
import FaqSection, { faqData } from "../components/FaqSection";

const HomePage: React.FC = () => {
  useEffect(() => {
    updateSeoTags();

    // --- SEO: Structured Data for SoftwareApplication ---
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": CONFIG.SEO.BASE_TITLE,
      "image": "https://www.mensajemagico.com/favicon.ico",
      "operatingSystem": "WEB",
      "applicationCategory": "CommunicationApplication",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "250" 
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    });
    document.head.appendChild(script);

    // --- SEO: Structured Data for FAQPage ---
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": typeof item.answer === 'string' ? item.answer : 'Visita nuestra página de precios para más detalles.'
        }
      }))
    });
    document.head.appendChild(faqScript);

    return () => {
      // Clean up script on component unmount
      document.head.removeChild(script);
      document.head.removeChild(faqScript);
    };
  }, []);
  const { user } = useAuth();
  const { triggerUpsell } = useUpsell();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const isValentine = CONFIG.THEME.IS_VALENTINE;
  const isChristmas = CONFIG.THEME.IS_CHRISTMAS;
  const isHalloween = CONFIG.THEME.IS_HALLOWEEN;
  const isBlackFriday = CONFIG.THEME.IS_BLACK_FRIDAY;

  console.log(
    `[HomePage] Renderizado. San Valentín: ${isValentine}, Navidad: ${isChristmas}, Halloween: ${isHalloween}, Black Friday: ${isBlackFriday}`
  );

  return (
    <main className="animate-fade-in-up">
      {/* Hero Section */}
      <section className="text-center mb-16 md:mb-24 relative">
        {(isValentine || isChristmas || isHalloween || isBlackFriday) && (
          <FallingParticles
            count={20}
            emojis={
              isValentine
                ? ["❤️", "💖", "💘", "💝", "🌹"]
                : isHalloween
                ? ["🎃", "👻", "🦇", "🕷️", "🍬"]
                : isBlackFriday
                ? ["🛍️", "🏷️", "💸", "🖤", "✨"]
                : ["❄️", "❅", "🌨️", "☃️"]
            }
            iterationCount={isValentine ? 2 : "infinite"}
          />
        )}

        {isValentine && <ValentineBanner />}

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
          {isValentine ? (
            <>
              Palabras que enamoran, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">
                en San Valentín.
              </span>
            </>
          ) : isChristmas ? (
            <>
              Mensajes llenos de magia, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600">
                en esta Navidad.
              </span>
            </>
          ) : (
            <>
              Tu Asistente de Mensajes con IA, <br className="hidden md:block" />
              <span className="text-gradient">sin complicaciones.</span>
            </>
          )}
        </h1>

        {isValentine && <ValentineCountdown />}
        {isChristmas && <ChristmasCountdown />}

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          {isValentine
            ? "Sorprende a tu pareja o crush con mensajes únicos creados por IA. La inspiración perfecta para este 14 de febrero."
            : isChristmas
              ? "Comparte tus mejores deseos de paz y alegría. Crea felicitaciones navideñas únicas con nuestra IA en segundos."
              : "Nuestra IA redacta cartas, mensajes y respuestas personalizadas en segundos. La solución perfecta para cuando las palabras no fluyen."}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to={
              isValentine
                ? "/mensajes/amor"
                : isChristmas
                  ? "/mensajes/navidad"
                  : "/mensajes/responder-un-mensaje"
            }
            className={`h-14 px-8 rounded-xl ${isValentine ? "bg-rose-600 shadow-rose-600/20 hover:bg-rose-700" : isChristmas ? "bg-red-600 shadow-red-600/20 hover:bg-red-700" : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"} text-white font-bold flex items-center justify-center shadow-lg transition-all active:scale-95 gap-3`}
          >
            <OccasionIcon
              slug={
                isValentine
                  ? "amor"
                  : isChristmas
                    ? "navidad"
                    : "responder-un-mensaje"
              }
              className="w-6 h-6 text-white"
            />
            <span>
              {isValentine
                ? "Crear mensaje de Amor"
                : isChristmas
                  ? "Crear mensaje de Navidad"
                  : "Qué responder a..."}
            </span>
          </Link>
          <Link
            to="/mensajes/no-me-dejes-en-visto"
            className="h-14 px-8 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 gap-3"
          >
            <OccasionIcon
              slug="no-me-dejes-en-visto"
              className="w-6 h-6 text-white"
            />
            <span>Me dejaron en visto</span>
          </Link>
        </div>

        {/* Botón Proactivo del Guardián */}
        <div className="mt-6">
          <button
            onClick={() => user ? setIsContactModalOpen(true) : triggerUpsell("Regístrate para que el Guardián pueda recordar a tus contactos.")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          >
            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-xs group-hover:scale-110 transition-transform">+</span>
            ✨ Agregar a alguien especial para seguimiento del Guardián
          </button>
        </div>
        <CreateContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      </section>

      {/*<AdBanner position="top" />*/}

      {/* Grid de Ocasiones */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Categorías Populares
          </h2>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow ml-6 hidden sm:block"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OCCASIONS.map((occasion) => {
            const isVisto = occasion.slug === "no-me-dejes-en-visto";
            const isResponder = occasion.slug === "responder-un-mensaje";
            const isGreeting = occasion.slug === "un-saludo";

            return (
              <Link
                key={occasion.id}
                to={`/mensajes/${occasion.slug}`}
                className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-xl transition-all duration-300 
                  ${isVisto ? "hover:border-green-400 dark:hover:border-green-500 hover:shadow-green-500/5" : ""}
                  ${isResponder ? "hover:border-blue-500 dark:hover:border-blue-500 border-blue-50 dark:border-blue-900/30" : "hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-blue-500/5"}
                `}
              >
                <div
                  className={`mb-6 grayscale group-hover:grayscale-0 transition-all duration-300`}
                >
                  <OccasionIcon
                    slug={occasion.slug}
                    icon={occasion.icon}
                    isLarge
                  />
                </div>
                <h3
                  className={`text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors 
                  ${isVisto ? "group-hover:text-green-600 dark:group-hover:text-green-400" : ""}
                  ${isResponder ? "group-hover:text-blue-600 dark:group-hover:text-blue-400" : "group-hover:text-blue-600 dark:group-hover:text-blue-400"}
                `}
                >
                  {occasion.name}
                  {isResponder && (
                    <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      Nuevo
                    </span>
                  )}
                  {isGreeting && (
                    <span className="ml-2 text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      Nuevo
                    </span>
                  )}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6 flex-grow">
                  {occasion.description}
                </p>
                <div
                  className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest 
                  ${isVisto ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}
                `}
                >
                  Crear ahora <span>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/*<div className="my-16">
        <AdBanner position="middle" />
      </div>*/}

      {/* Feature Section */}
      <section className="bg-slate-900 rounded-3xl p-8 md:p-16 text-white text-center relative overflow-hidden mt-16 dark:border dark:border-slate-800">
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-6">
            ¿Bloqueo al escribir?
          </h2>
          <p className="text-slate-400 text-base md:text-lg mb-8 font-medium">
            Simplemente elige a quién va dirigido el mensaje, qué te enviaron
            (si es respuesta) y el tono que deseas. Nosotros nos encargamos del
            resto.
          </p>
          <Link
            to="/mensajes/responder-un-mensaje"
            className="inline-flex h-12 px-8 rounded-lg bg-white text-slate-900 font-bold items-center justify-center hover:bg-slate-100 transition-colors active:scale-95"
          >
            Saber qué responder
          </Link>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none">
          <div className="text-[20rem] absolute -bottom-20 -right-20">🪄</div>
        </div>
      </section>

      <FaqSection />

      {/*<div className="mt-16">
        <AdBanner position="bottom" />
      </div>*/}
    </main>
  );
};

export default HomePage;
