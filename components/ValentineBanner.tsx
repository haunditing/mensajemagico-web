import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

const ValentineBanner: React.FC = () => {
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    const checkDate = () => {
      const now = new Date();
      // Febrero es el mes 1 (0-indexado)
      if (now.getMonth() === 1 && now.getDate() === 14) {
        setIsToday(true);
      }
    };
    checkDate();
  }, []);

  // Efecto de confeti al cargar si es el día correcto
  useEffect(() => {
    if (isToday) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Lanza confeti desde dos puntos aleatorios en la parte superior
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isToday]);

  if (!isToday) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mb-10 animate-fade-in-up px-4">
      <div className="bg-gradient-to-r from-rose-500 via-red-500 to-pink-600 dark:from-rose-600 dark:via-red-600 dark:to-pink-700 rounded-2xl p-1 shadow-xl shadow-rose-500/20 dark:shadow-rose-900/30 transform hover:scale-[1.01] transition-transform duration-300">
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 dark:bg-black/20 p-3 rounded-full backdrop-blur-md">
              <span className="text-3xl animate-pulse">💘</span>
            </div>
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                ¡Feliz San Valentín!
              </h2>
              <p className="text-rose-100 dark:text-rose-50 text-sm sm:text-base font-medium leading-tight">
                Hoy es el día. Sorprende a quien amas.
              </p>
            </div>
          </div>

          <Link
            to="/mensajes/amor"
            className="relative z-10 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 px-6 py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:bg-rose-50 dark:hover:bg-slate-800 hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
          >
            Crear Carta Ahora →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ValentineBanner;
