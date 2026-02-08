import React from "react";
import { Link, useLocation } from "react-router-dom";
import { OCCASIONS } from "../constants";
import { getLocalizedOccasion } from "../services/localizationService";
import { CountryCode } from "../types";
import { useLocalization } from "../context/LocalizationContext";
import { CONFIG } from "../config";
import MetricsDisplay from "./MetricsDisplay";
import CookieBanner from "./CookieBanner";
import OccasionIcon from "./OccasionIcon";
import UserMenu from "./UserMenu";

const MagicWandIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16.5 2L15.5 4.5L13 5.5L15.5 6.5L16.5 9L17.5 6.5L20 5.5L17.5 4.5L16.5 2Z"
      fill="white"
    />
    <path
      d="M6 3L5.25 4.75L3.5 5.5L5.25 6.25L6 8L6.75 6.25L8.5 5.5L6.75 4.75L6 3Z"
      fill="white"
      fillOpacity="0.8"
    />
    <path
      d="M19.5 14L18.75 15.75L17 16.5L18.75 17.25L19.5 19L20.25 17.25L22 16.5L20.25 15.75L19.5 14Z"
      fill="white"
      fillOpacity="0.9"
    />
    <path
      d="M4 21L14.5 10.5M14.5 10.5L16.5 8.5C17.0523 7.94772 17.0523 7.05228 16.5 6.5C15.9477 5.94772 15.0523 5.94772 14.5 6.5L12.5 8.5M14.5 10.5L12.5 8.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { country: currentCountry, setCountry } = useLocalization();
  const siteName = CONFIG.SEO.BASE_TITLE;

  const countries: { code: CountryCode; label: string; flag: string }[] = [
    { code: "MX", label: "México", flag: "🇲🇽" },
    { code: "CO", label: "Colombia", flag: "🇨🇴" },
    { code: "AR", label: "Argentina", flag: "🇦🇷" },
    { code: "CL", label: "Chile", flag: "🇨🇱" },
    { code: "PE", label: "Perú", flag: "🇵🇪" },
    { code: "VE", label: "Venezuela", flag: "🇻🇪" },
    { code: "GENERIC", label: "LATAM", flag: "🌎" },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Header Principal */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-screen-2xl mx-auto">
          {/* Fila Superior: Logo y Controles */}
          <div className="px-4 sm:px-6 lg:px-8 flex h-16 md:h-20 items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none group"
              aria-label={`Ir al inicio de ${siteName}`}
            >
              <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
                <MagicWandIcon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900">
                {siteName}
              </span>
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
                      className={`px-2 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2
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
            <nav className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-4 snap-x items-center justify-center">
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
                    className={`shrink-0 p-3.5 rounded-2xl border transition-all duration-300 snap-center flex items-center justify-center
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
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors">
                  <MagicWandIcon className="w-5 h-5" />
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
                <div className="relative inline-block">
                  <select
                    value={currentCountry}
                    onChange={(e) => setCountry(e.target.value as CountryCode)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:bg-slate-100"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
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
