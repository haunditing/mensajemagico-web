import React, { useRef, useEffect } from "react";
import { Link, useLocation, useNavigationType } from "react-router-dom";
import { useLocalization } from "../context/LocalizationContext";
import { CONFIG } from "../config";
import MetricsDisplay from "./MetricsDisplay";
import CookieBanner from "./CookieBanner";
import NotificationManager from "./NotificationManager";
import OfferBanner from "./OfferBanner";
import TrialBanner from "./TrialBanner";
import TrialWelcomeBanner from "./TrialWelcomeBanner";
import TrialOnboardingModal from "./TrialOnboardingModal";
import InstallPWA from "./InstallPWA";
import Header from "./Header";
import CountrySelector from "./Header/CountrySelector";
import { OCCASIONS } from "../constants";
import { getLocalizedOccasion } from "../services/localizationService";


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { country: currentCountry } = useLocalization();
  const siteName = CONFIG.SEO.BASE_TITLE;
  const isValentine = CONFIG.THEME.IS_VALENTINE;
  const isChristmas = CONFIG.THEME.IS_CHRISTMAS;
  const originalTitleRef = useRef(document.title);

  // Verificar si es el día exacto de San Valentín (14 de Febrero)
  const isValentineDay =
    new Date().getMonth() === 1 && new Date().getDate() === 14;

  // Cambiar favicon dinámicamente según la festividad
  useEffect(() => {
    const updateFavicon = () => {
      const iconPath = isValentine
        ? "/favicon-32x32.png?v=valentine"
        : "/favicon-32x32.png";
      
      // Icono para iOS: Debe ser PNG, cuadrado, sin transparencia y min 180x180px
      const appleIconPath = isValentine
        ? "/apple-touch-icon-valentine.png"
        : isChristmas
          ? "/apple-touch-icon-christmas.png"
          : "/apple-touch-icon.png";

      // 1. Favicon (Pestaña del navegador)
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;

      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = iconPath;

      // 2. Apple Touch Icon (iOS y accesos directos móviles)
      let appleLink = document.querySelector(
        "link[rel='apple-touch-icon']",
      ) as HTMLLinkElement;

      if (!appleLink) {
        appleLink = document.createElement("link");
        appleLink.rel = "apple-touch-icon";
        document.head.appendChild(appleLink);
      }
      // Se recomienda tener un archivo 'apple-touch-icon.png' (180x180) en /public
      appleLink.href = appleIconPath;
    };
    updateFavicon();
  }, [isValentine, isChristmas]);

  // Cambiar título de la pestaña cuando el usuario se va
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        originalTitleRef.current = document.title;
        document.title = "¡Te extrañamos! 🥺";
      } else {
        document.title = originalTitleRef.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Sincronizar meta tag theme-color con el tema actual (para móviles)
  useEffect(() => {
    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains("dark");
      // slate-900 (#0f172a) para oscuro, white (#ffffff) para claro
      const color = isDark ? "#0f172a" : "#ffffff";

      let meta = document.querySelector("meta[name='theme-color']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", color);
    };

    updateThemeColor(); // Ejecutar al montar

    // Observar cambios en la clase 'dark' del elemento html para reaccionar a cambios de tema
    const observer = new MutationObserver(updateThemeColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Scroll al inicio al cambiar de ruta (Solución para links del footer)
  useEffect(() => {
    // Solo hacemos scroll al inicio si es una navegación nueva (PUSH/REPLACE)
    // Si es POP (botón atrás), dejamos que el navegador restaure la posición
    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navigationType]);

  // Actualizar etiquetas Open Graph de URL y Canonical para compartir correctamente
  useEffect(() => {
    // Definir el dominio canónico de producción explícitamente para evitar duplicados
    const PRODUCTION_ORIGIN = "https://mensajemagico.com";

    // Usar el origen actual solo si estamos en localhost (desarrollo), de lo contrario forzar producción
    const baseOrigin =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? window.location.origin
        : PRODUCTION_ORIGIN;

    // Construimos la URL limpia (sin query params) para canonical y OG
    const cleanUrl = `${baseOrigin}${location.pathname}`;

    const canonicalLink = document.querySelector(
      "link[rel='canonical']",
    ) as HTMLLinkElement;
    if (canonicalLink) canonicalLink.href = cleanUrl;

    const ogUrlMeta = document.querySelector("meta[property='og:url']");
    if (ogUrlMeta) ogUrlMeta.setAttribute("content", cleanUrl);
  }, [location.pathname]);

  const selectionClass = isValentine
    ? "selection:bg-rose-200 selection:text-rose-900 dark:selection:bg-rose-500 dark:selection:text-white"
    : isChristmas
      ? "selection:bg-red-200 selection:text-red-900 dark:selection:bg-red-500 dark:selection:text-white"
      : "selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-indigo-500 dark:selection:text-white";

  return (
    <div
      className={`min-h-screen supports-[min-block-size:100dvh]:min-h-[100dvh] flex flex-col ${selectionClass} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}
    >
      <NotificationManager />
      <TrialOnboardingModal />
      <TrialWelcomeBanner />
      <TrialBanner />
      <OfferBanner />
      <InstallPWA />
      <Header
        isValentine={isValentine}
        isChristmas={isChristmas}
        isValentineDay={isValentineDay}
      />

      <main className="flex-grow">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 min-w-0">
          {children}
        </div>
      </main>

      <MetricsDisplay />

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-16 pb-12 transition-colors duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 mb-6 group"
              >
                <div className="w-8 h-8 bg-slate-900 dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors text-white">
                  <img
                    src="/favicon-32x32.png"
                    alt="MensajeMágico Logo"
                    width="32"
                    height="32"
                    className="w-5 h-5 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                  />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                  {siteName}
                </span>
              </Link>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed mb-8 font-medium">
                Plataforma impulsada por IA para crear conexiones significativas
                a través de las palabras.
              </p>

              <div className="inline-flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  Selecciona tu Región
                </span>
                <CountrySelector />
              </div>
            </div>

            <div className="grid grid-cols-2 md:col-span-7 gap-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-8">
                  Categorías
                </h3>
                <ul className="space-y-4 text-sm font-semibold">
                  {OCCASIONS.slice(0, 4).map((o) => {
                    const localized = getLocalizedOccasion(o, currentCountry);
                    return (
                      <li key={o.id}>
                        <Link
                          to={`/mensajes/${o.slug}`}
                          className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                          {localized.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-8">
                  Institucional
                </h3>
                <ul className="space-y-4 text-sm font-semibold">
                  <li>
                    <Link
                      to="/privacidad"
                      className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Aviso de Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terminos"
                      className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Términos de Uso
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contacto"
                      className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Centro de Contacto
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Preguntas Frecuentes
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-tight">
              &copy; {new Date().getFullYear()} {siteName}. Diseñado con ❤️ para
              el mundo.
            </p>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
};

export default Layout;
