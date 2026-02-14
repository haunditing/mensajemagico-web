import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../context/api";
import { useToast } from "../context/ToastContext";
import { Link } from "react-router-dom";

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [browserPermission, setBrowserPermission] = useState(Notification.permission);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNotificationsEnabled((user as any).preferences?.notificationsEnabled !== false);
    }
  }, [user]);

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    setLoading(true);

    try {
      await api.put("/api/auth/profile", { notificationsEnabled: newValue });
      await refreshUser();
      
      if (newValue) {
        showToast("¡Listo! Te avisaremos de los momentos importantes.", "success");
        // Si el usuario las activa y el navegador está en 'default', pedimos permiso
        if (browserPermission === "default") {
          const result = await Notification.requestPermission();
          setBrowserPermission(result);
        }
      } else {
        showToast("Entendido. Silenciaremos los avisos por ahora.", "info");
      }
    } catch (error) {
      setNotificationsEnabled(!newValue); // Revertir en caso de error
      showToast("Error al guardar configuración", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in-up">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Configuración</h2>
        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Inicia sesión para configurar tu cuenta</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Configuración</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Notificaciones</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gestiona cómo y cuándo te contactamos.</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Control Principal */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Recordatorios en el navegador</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1">
                Recibe avisos visuales cuando llegue una fecha importante (cumpleaños, festivos).
              </p>
            </div>
            <button
              onClick={toggleNotifications}
              disabled={loading}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                notificationsEnabled ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Estado del Navegador */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Estado del Navegador</span>
              {browserPermission === "granted" && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">Permitido ✅</span>}
              {browserPermission === "denied" && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">Bloqueado 🚫</span>}
              {browserPermission === "default" && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">Preguntar ❓</span>}
            </div>
            
            {browserPermission === "denied" && (
              <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                Has bloqueado las notificaciones en tu navegador. Para recibir recordatorios, debes hacer clic en el icono de candado 🔒 en la barra de dirección y permitir las notificaciones para este sitio.
              </p>
            )}
            {browserPermission === "granted" && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tu navegador permite notificaciones. Puedes desactivarlas temporalmente usando el interruptor de arriba sin cambiar la configuración del navegador.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;