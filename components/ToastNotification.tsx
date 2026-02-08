import React, { useEffect } from "react";
import { useToast } from "../context/ToastContext";

const ToastNotification: React.FC = () => {
  const { isVisible, message, type, hideToast } = useToast();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hideToast]);

  if (!isVisible) return null;

  const styles = {
    success: "bg-slate-900 text-white shadow-blue-900/20",
    error: "bg-red-500 text-white shadow-red-500/20",
    info: "bg-blue-600 text-white shadow-blue-600/20",
  };

  const icons = {
    success: "✨",
    error: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
      <div
        className={`${styles[type]} px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm border border-white/10 backdrop-blur-sm`}
      >
        <span className="text-lg">{icons[type]}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default ToastNotification;
