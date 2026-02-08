import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ValentineCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();

      // Verificar si es hoy (Mes es 0-indexado, 1 = Febrero)
      if (now.getMonth() === 1 && now.getDate() === 14) {
        setIsToday(true);
        setTimeLeft(null);
        return;
      }

      setIsToday(false);
      let targetDate = new Date(currentYear, 1, 14); // 14 de Febrero

      // Si ya pasó este año, apuntar al siguiente
      if (now.getTime() > targetDate.getTime()) {
        targetDate = new Date(currentYear + 1, 1, 14);
      }

      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isToday) {
    // El día 14 mostramos el ValentineBanner en su lugar
    return null;
  }

  if (!timeLeft) return null;

  return (
    <Link to="/mensajes/amor" className="flex justify-center gap-3 sm:gap-4 mb-8 text-rose-600 font-bold animate-fade-in-up hover:scale-105 transition-transform">
      <TimeUnit value={timeLeft.days} label="Días" />
      <TimeUnit value={timeLeft.hours} label="Hs" />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <TimeUnit value={timeLeft.seconds} label="Seg" />
    </Link>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-xl shadow-sm border border-rose-100 min-w-[60px] sm:min-w-[70px]">
    <span className="text-xl sm:text-3xl font-black tabular-nums">{value}</span>
    <span className="text-[10px] sm:text-xs uppercase tracking-wider text-rose-400 font-semibold">
      {label}
    </span>
  </div>
);

export default ValentineCountdown;
