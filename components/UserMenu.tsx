import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PlanBadge from "./PlanBadge";
import { ENABLE_UPGRADES } from "../config";
import { useTheme } from "../context/ThemeContext";

const UserMenu: React.FC = () => {
  const { user, planLevel, logout, isPremium } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (theme === "light") return "☀️";
    if (theme === "dark") return "🌙";
    return "💻";
  };

  const themeLabel = theme === "light" ? "Modo Claro" : theme === "dark" ? "Modo Oscuro" : "Sistema";

  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/login"
          className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-2"
        >
          Entrar
        </Link>
        <Link
          to="/signup"
          className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-all shadow-lg shadow-slate-900/20 dark:shadow-none active:scale-95"
        >
          Empezar
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all bg-white dark:bg-slate-800"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${isPremium ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-slate-400 dark:bg-slate-600"}`}
        >
          {user.email[0].toUpperCase()}
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate hidden sm:block">
          {user.email.split("@")[0]}
        </span>
        <PlanBadge feature="monetization.show_ads" expectedValue={false} label="PRO" />
        <svg
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay oscuro para móviles */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 md:hidden animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          <div className="
            bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 z-50
            
            /* Estilos Móvil (Bottom Sheet) */
            fixed bottom-0 left-0 right-0 w-full rounded-t-[2rem] p-5 border-t shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] md:shadow-none
            max-h-[85vh] overflow-y-auto 
            animate-slide-up-mobile

            /* Estilos Escritorio (Dropdown) */
            md:absolute md:right-0 md:top-full md:mt-2 md:w-64 md:rounded-2xl md:rounded-t-2xl md:shadow-xl md:border md:p-2 md:animate-fade-in-up md:origin-top-right md:bottom-auto md:left-auto md:h-auto md:overflow-visible
          ">
          <style>{`
            @keyframes slide-up-mobile {
              0% { transform: translateY(100%); }
              100% { transform: translateY(0); }
            }
            @media (max-width: 767px) {
              .animate-slide-up-mobile {
                animation: slide-up-mobile 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            }
          `}</style>

          <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800 mb-2 md:mb-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">
              Tu Plan
            </p>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-black ${isPremium ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" : "text-slate-700 dark:text-slate-200"}`}
              >
                {planLevel === "premium" ? "Premium ✨" : "Gratis"}
              </span>
              {!isPremium && ENABLE_UPGRADES && (
                <Link
                  to="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Mejorar
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {ENABLE_UPGRADES && (
              <Link
                to="/pricing"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
              >
                <span>💎</span> Ver Planes
              </Link>
            )}
            <Link
              to="/favoritos"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
            >
              <span>❤️</span> Mis Favoritos
            </Link>
            <Link
              to="/contactos"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
            >
              <span>📒</span> Mis Contactos
            </Link>
            <Link
              to="/recordatorios"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
            >
              <span>📅</span> Recordatorios
            </Link>
            <Link
              to="/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
            >
              <span>👤</span> Mi Perfil
            </Link>
            <Link
              to="/configuracion"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
            >
              <span>⚙️</span> Configuración
            </Link>
            <button
              onClick={toggleTheme}
              type="button"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors w-full text-left"
            >
              <span>{getThemeIcon()}</span> {themeLabel}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600 dark:text-red-400 transition-colors w-full text-left"
            >
              <span>🚪</span> Cerrar Sesión
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
