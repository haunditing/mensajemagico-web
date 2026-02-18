import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigationType } from "react-router-dom";
import { OCCASIONS } from "../constants";
import { getLocalizedOccasion } from "../services/localizationService";
import { CountryCode } from "../types";
import { useLocalization } from "../context/LocalizationContext";
import { CONFIG } from "../config";
import MetricsDisplay from "./MetricsDisplay";
import CookieBanner from "./CookieBanner";
import OccasionIcon from "./OccasionIcon";
import UserMenu from "./UserMenu";
import NotificationManager from "./NotificationManager";
import OfferBanner from "./OfferBanner";
import { isOccasionActive } from "../services/holidayService";
import InstallPWA from "./InstallPWA";

const CountrySelector = () => {
  const { country: currentCountry, setCountry } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  // Detectar cambio de tamaño de ventana para renderizado condicional
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const countries: { code: CountryCode; label: string; flag: string }[] = [
    { code: "MX", label: "México", flag: "🇲🇽" },
    { code: "CO", label: "Colombia", flag: "🇨🇴" },
    { code: "AR", label: "Argentina", flag: "🇦🇷" },
    { code: "CL", label: "Chile", flag: "🇨🇱" },
    { code: "PE", label: "Perú", flag: "🇵🇪" },
    { code: "VE", label: "Venezuela", flag: "🇻🇪" },
    { code: "GENERIC", label: "LATAM", flag: "🌎" },
  ];

  const selected =
    countries.find((c) => c.code === currentCountry) ||
    countries[countries.length - 1];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideMain =
        selectorRef.current && selectorRef.current.contains(target);
      const isInsideMobile =
        mobileMenuRef.current && mobileMenuRef.current.contains(target);
      if (!isInsideMain && !isInsideMobile) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectorRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full gap-3 bg-white dark:bg-slate-800 border rounded-xl px-4 py-3 text-xs font-bold transition-all duration-200 group shadow-sm
          ${isOpen ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900" : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md"}
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg leading-none">{selected.flag}</span>
          <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
            {selected.label}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : "group-hover:text-blue-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen &&
        (() => {
          const MenuContent = (
            <div
              ref={isMobile ? mobileMenuRef : null}
              className={`
                bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 overflow-hidden z-50
                ${
                  isMobile
                    ? "fixed bottom-0 left-0 right-0 w-full rounded-t-[2.5rem] border-t shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)] max-h-[85vh] flex flex-col animate-slide-up-mobile pb-8"
                    : "absolute bottom-full left-0 mb-2 w-full min-w-[200px] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border animate-fade-in-up origin-bottom"
                }
              `}
            >
              {isMobile && (
                <style>{`
                  @keyframes slide-up-mobile {
                    0% { transform: translateY(100%); }
                    100% { transform: translateY(0); }
                  }
                  .animate-slide-up-mobile {
                    animation: slide-up-mobile 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }
                `}</style>
              )}

              {isMobile && (
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-4 shrink-0" />
              )}

              <div
                className={`p-1.5 overflow-y-auto custom-scrollbar ${isMobile ? "px-6 pb-4 max-h-[60vh]" : "max-h-[300px]"}`}
              >
                {isMobile && (
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 px-2">
                    Selecciona tu región
                  </h3>
                )}
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left mb-0.5 last:mb-0
                      ${
                        currentCountry === c.code
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                      }
                    `}
                  >
                    <span className="text-lg leading-none">{c.flag}</span>
                    <span className="flex-1">{c.label}</span>
                    {currentCountry === c.code && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );

          return isMobile
            ? createPortal(
                <div className="relative z-[100]">
                  <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
                    onClick={() => setIsOpen(false)}
                  />
                  {MenuContent}
                </div>,
                document.body,
              )
            : MenuContent;
        })()}
    </div>
  );
};

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

  // --- EASTER EGG LOGIC ---
  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimeoutRef = useRef<any>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    // Si el usuario está haciendo clics rápidos, prevenimos la navegación para que no recargue
    if (logoClicks > 0) {
      e.preventDefault();
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    setLogoClicks((prev) => {
      const newCount = prev + 1;
      if (newCount === 5) {
        triggerEasterEgg();
        return 0;
      }
      return newCount;
    });

    clickTimeoutRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 500);
  };

  const triggerEasterEgg = async () => {
    const confetti = (await import("canvas-confetti")).default;
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#2563eb", "#9333ea"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#db2777", "#e11d48"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };
  // ------------------------

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
      className={`min-h-screen supports-[min-height:100dvh]:min-h-[100dvh] flex flex-col ${selectionClass} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}
    >
      <NotificationManager />
      <OfferBanner />
      <InstallPWA />
      {/* Header Principal */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-screen-2xl mx-auto">
          {/* Fila Superior: Logo y Controles */}
          <div className="px-4 sm:px-6 lg:px-8 flex h-16 md:h-20 items-center justify-between">
            <Link
              to="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none group"
              aria-label={`Ir al inicio de ${siteName}`}
            >
              <div
                className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 text-white
                ${
                  isValentine
                    ? "bg-gradient-to-tr from-rose-500 to-pink-600 shadow-rose-500/20"
                    : isChristmas
                      ? "bg-gradient-to-tr from-emerald-500 to-green-600 shadow-green-500/20"
                      : "bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20"
                }
              `}
              >
                <img
                  src="/favicon-32x32.png"
                  alt="MensajeMágico Logo"
                  width="32"
                  height="32"
                  fetchPriority="high"
                  className="w-6 h-6 md:w-7 md:h-7 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                  {siteName}
                </span>
                {isValentine && isValentineDay && (
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">
                    ¡Feliz San Valentín!
                  </span>
                )}
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <nav className="hidden lg:flex items-center gap-1.5">
                {OCCASIONS.filter((o) => isOccasionActive(o.id, currentCountry))
                  .slice(0, 6)
                  .map((o) => {
                    const localized = getLocalizedOccasion(o, currentCountry);
                    const isActive = location.pathname.startsWith(
                      `/mensajes/${o.slug}`,
                    );
                    return (
                      <Link
                        key={o.id}
                        to={`/mensajes/${o.slug}`}
                        className={`px-2 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 group
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <OccasionIcon
                          slug={o.slug}
                          className="w-4 h-4"
                          isActive={isActive}
                        />
                        {localized.name}
                      </Link>
                    );
                  })}
              </nav>
              <UserMenu />
            </div>
          </div>

          {/* Navegación Móvil Horizontal */}
          <div className="lg:hidden border-t border-slate-50 dark:border-slate-800 nav-mask">
            <nav className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-4 snap-x items-center justify-start">
              {OCCASIONS.filter((o) =>
                isOccasionActive(o.id, currentCountry),
              ).map((o) => {
                const localized = getLocalizedOccasion(o, currentCountry);
                const isActive = location.pathname.startsWith(
                  `/mensajes/${o.slug}`,
                );

                return (
                  <Link
                    key={o.id}
                    to={`/mensajes/${o.slug}`}
                    aria-label={localized.name}
                    className={`shrink-0 p-3.5 rounded-2xl border transition-all duration-300 snap-center flex items-center justify-center group
                      ${
                        isActive
                          ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/30 scale-105"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                  >
                    <OccasionIcon
                      slug={o.slug}
                      className="w-6 h-6"
                      isActive={isActive}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

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
