import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PlanBadge from "./PlanBadge";
import { ENABLE_UPGRADES } from "../config";

const UserMenu: React.FC = () => {
  const { user, planLevel, logout, isPremium } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/login"
          className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-2 py-2"
        >
          Entrar
        </Link>
        <Link
          to="/signup"
          className="bg-slate-900 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
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
        className="flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-full border border-slate-200 hover:border-slate-300 transition-all bg-white"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${isPremium ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-slate-400"}`}
        >
          {user.email[0].toUpperCase()}
        </div>
        <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate hidden sm:block">
          {user.email.split("@")[0]}
        </span>
        <PlanBadge feature="monetization.show_ads" expectedValue={false} label="PRO" />
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in-up origin-top-right">
          <div className="px-3 py-2 border-b border-slate-50 mb-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
              Tu Plan
            </p>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-black ${isPremium ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" : "text-slate-700"}`}
              >
                {planLevel === "premium" ? "Premium ✨" : "Gratis"}
              </span>
              {!isPremium && ENABLE_UPGRADES && (
                <Link
                  to="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold hover:bg-blue-100 transition-colors"
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
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors"
              >
                <span>💎</span> Ver Planes
              </Link>
            )}
            <Link
              to="/favoritos"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors"
            >
              <span>❤️</span> Mis Favoritos
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-sm font-medium text-red-600 transition-colors w-full text-left"
            >
              <span>🚪</span> Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
