import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
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

const MagicWandIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16.5 2L15.5 4.5L13 5.5L15.5 6.5L16.5 9L17.5 6.5L20 5.5L17.5 4.5L16.5 2Z"
      fill="currentColor"
    />
    <path
      d="M6 3L5.25 4.75L3.5 5.5L5.25 6.25L6 8L6.75 6.25L8.5 5.5L6.75 4.75L6 3Z"
      fill="currentColor"
      fillOpacity="0.8"
    />
    <path
      d="M19.5 14L18.75 15.75L17 16.5L18.75 17.25L19.5 19L20.25 17.25L22 16.5L20.25 15.75L19.5 14Z"
      fill="currentColor"
      fillOpacity="0.9"
    />
    <path
      d="M4 21L14.5 10.5M14.5 10.5L16.5 8.5C17.0523 7.94772 17.0523 7.05228 16.5 6.5C15.9477 5.94772 15.0523 5.94772 14.5 6.5L12.5 8.5M14.5 10.5L12.5 8.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CountrySelector = () => {
  const { country: currentCountry, setCountry } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

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
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
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
        className={`flex items-center justify-between w-full gap-3 bg-white border rounded-xl px-4 py-3 text-xs font-bold transition-all duration-200 group shadow-sm
          ${isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-300 hover:shadow-md"}
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg leading-none">{selected.flag}</span>
          <span className="text-slate-700 group-hover:text-slate-900">
            {selected.label}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : "group-hover:text-blue-400"}`}
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

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full min-w-[200px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-fade-in-up origin-bottom">
          <div className="p-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
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
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
      )}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
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

  const triggerEasterEgg = () => {
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
      const color = isValentine
        ? "#e11d48" // rose-600
        : isChristmas
          ? "#16a34a" // green-600
          : "#2563eb"; // blue-600

      const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 2L15.5 4.5L13 5.5L15.5 6.5L16.5 9L17.5 6.5L20 5.5L17.5 4.5L16.5 2Z" fill="${color}"/><path d="M6 3L5.25 4.75L3.5 5.5L5.25 6.25L6 8L6.75 6.25L8.5 5.5L6.75 4.75L6 3Z" fill="${color}" fill-opacity="0.8"/><path d="M19.5 14L18.75 15.75L17 16.5L18.75 17.25L19.5 19L20.25 17.25L22 16.5L20.25 15.75L19.5 14Z" fill="${color}" fill-opacity="0.9"/><path d="M4 21L14.5 10.5M14.5 10.5L16.5 8.5C17.0523 7.94772 17.0523 7.05228 16.5 6.5C15.9477 5.94772 15.0523 5.94772 14.5 6.5L12.5 8.5M14.5 10.5L12.5 8.5" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

      const link = document.querySelector(
        "link[rel~='icon']",
      ) as HTMLLinkElement;
      if (link) {
        link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        document.head.appendChild(newLink);
      }
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

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <NotificationManager />
      <OfferBanner />
      {/* Header Principal */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 shadow-sm transition-all duration-300">
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
                <MagicWandIcon className="w-6 h-6 md:w-7 md:h-7 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900 leading-none">
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
                {OCCASIONS.slice(0, 6).map((o) => {
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
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
          <div className="lg:hidden border-t border-slate-50 nav-mask">
            <nav className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-4 snap-x items-center justify-start">
              {OCCASIONS.map((o) => {
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
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
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
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
          {children}
        </div>
      </main>

      <MetricsDisplay />

      <footer className="bg-white border-t border-slate-100 pt-16 pb-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 mb-6 group"
              >
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors text-white">
                  <MagicWandIcon className="w-5 h-5 transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                </div>
                <span className="font-bold text-xl tracking-tight">
                  {siteName}
                </span>
              </Link>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed mb-8 font-medium">
                Plataforma impulsada por IA para crear conexiones significativas
                a través de las palabras.
              </p>

              <div className="inline-flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Selecciona tu Región
                </span>
                <CountrySelector />
              </div>
            </div>

            <div className="grid grid-cols-2 md:col-span-7 gap-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
                  Categorías
                </h3>
                <ul className="space-y-4 text-sm font-semibold">
                  {OCCASIONS.slice(0, 4).map((o) => {
                    const localized = getLocalizedOccasion(o, currentCountry);
                    return (
                      <li key={o.id}>
                        <Link
                          to={`/mensajes/${o.slug}`}
                          className="text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          {localized.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
                  Institucional
                </h3>
                <ul className="space-y-4 text-sm font-semibold">
                  <li>
                    <Link
                      to="/privacidad"
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Aviso de Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terminos"
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Términos de Uso
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contacto"
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Centro de Contacto
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Preguntas Frecuentes
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-400 font-bold tracking-tight">
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
