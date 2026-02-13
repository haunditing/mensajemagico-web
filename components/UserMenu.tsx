import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  // Detectar cambio de tamaño de ventana para renderizado condicional
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInsideMain = menuRef.current && menuRef.current.contains(target);
      const isClickInsideMobile = mobileMenuRef.current && mobileMenuRef.current.contains(target);

      if (!isClickInsideMain && !isClickInsideMobile) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bloquear scroll del body en móvil cuando el menú está abierto
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

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

  const themeLabel =
    theme === "light"
      ? "Modo Claro"
      : theme === "dark"
        ? "Modo Oscuro"
        : "Sistema";

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
        <PlanBadge
          feature="monetization.show_ads"
          expectedValue={false}
          label="PRO"
        />
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

      {isOpen &&
        (() => {
          const MenuContent = (
            <div
              ref={isMobile ? mobileMenuRef : null}
              className={`
              bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 z-[70]
              ${
                isMobile
                  ? "fixed bottom-0 left-0 right-0 w-full rounded-t-[2.5rem] border-t shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)] max-h-[85vh] flex flex-col animate-slide-up-mobile pb-8"
                  : "absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-xl border p-2 animate-fade-in-up origin-top-right"
              }
            `}
            >
              <style>{`
              @keyframes slide-up-mobile {
                0% { transform: translateY(100%); }
                100% { transform: translateY(0); }
              }
              .animate-slide-up-mobile {
                animation: slide-up-mobile 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}</style>

              {/* Drag Handle - Solo Móvil */}
              {isMobile && (
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-4 shrink-0" />
              )}

              {/* Contenedor con Scroll Interno */}
              <div
                className={`overflow-y-auto ${isMobile ? "px-6 pb-4" : "p-2 overflow-visible"}`}
              >
                <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">
                    Tu Plan
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-black ${isPremium ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-200"}`}
                    >
                      {planLevel === "premium" ? "Premium ✨" : "Gratis"}
                    </span>
                    {!isPremium && ENABLE_UPGRADES && (
                      <Link
                        to="/pricing"
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-bold hover:bg-blue-700 transition-colors"
                      >
                        Mejorar
                      </Link>
                    )}
                  </div>
                </div>

                <nav className="flex flex-col gap-1">
                  {ENABLE_UPGRADES && (
                    <Link
                      to="/pricing"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300"
                    >
                      <span>💎</span> Ver Planes
                    </Link>
                  )}
                  <Link
                    to="/favoritos"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    <span>❤️</span> Mis Favoritos
                  </Link>
                  <Link
                    to="/contactos"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    <span>📒</span> Mis Contactos
                  </Link>
                  <Link
                    to="/recordatorios"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    <span>📅</span> Recordatorios
                  </Link>
                  <Link
                    to="/perfil"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    <span>👤</span> Mi Perfil
                  </Link>
                  <Link
                    to="/configuracion"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    <span>⚙️</span> Configuración
                  </Link>

                  <button
                    onClick={toggleTheme}
                    type="button"
                    className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 w-full text-left"
                  >
                    <span>{getThemeIcon()}</span> {themeLabel}
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold text-red-600 dark:text-red-400 w-full text-left"
                  >
                    <span>🚪</span> Cerrar Sesión
                  </button>
                </nav>
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

export default UserMenu;
