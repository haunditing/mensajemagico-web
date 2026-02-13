import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../context/api";
import { useLocalization } from "../context/LocalizationContext";

const NotificationManager: React.FC = () => {
  const { user } = useAuth();
  const { country } = useLocalization();
  const [permission, setPermission] = useState(() => {
    if (typeof Notification !== "undefined") {
      return Notification.permission;
    }
    return "denied"; // Asumimos denegado si no existe la API para evitar crashes
  });
  const [isVisible, setIsVisible] = useState(true); // Para cerrar el banner manualmente
  const notificationsEnabled = (user as any)?.preferences?.notificationsEnabled !== false;
  const [nextAlert, setNextAlert] = useState<string | null>(null);

  useEffect(() => {
    // Verificación de seguridad adicional para 'Notification'
    if (!user || permission !== "granted" || !notificationsEnabled || typeof Notification === "undefined") return;

    const checkReminders = async () => {
      try {
        // Obtenemos los recordatorios (incluyendo festivos calculados por el backend)
        const reminders: any[] = await api.get(`/api/reminders?country=${country}`);
        
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let closestTrigger: Date | null = null;

        reminders.forEach((reminder: any) => {
          // Determinar la fecha relevante (próxima ocurrencia o fecha base)
          const reminderDate = new Date(reminder.nextOccurrence || reminder.date);
          reminderDate.setHours(0, 0, 0, 0);

          // Si la fecha es HOY
          if (reminderDate.getTime() === today.getTime()) {
            
            let triggerTime = new Date(today);

            // Verificar si ya es la hora de la notificación
            if (reminder.notificationTime) {
              const [hours, minutes] = reminder.notificationTime.split(':').map(Number);
              triggerTime.setHours(hours, minutes, 0, 0);
            } else {
              // Default a las 9:00 AM si no tiene hora
              triggerTime.setHours(9, 0, 0, 0);
            }

            // Si aún no es la hora programada
            if (now < triggerTime) {
              if (!closestTrigger || triggerTime < closestTrigger) {
                closestTrigger = triggerTime;
              }
              return; // No notificamos todavía
            }

            // Usamos localStorage para asegurar que solo notificamos una vez al día por evento
            // FIX: Incluir la hora en la clave para permitir re-notificar si el usuario cambia la hora
            const key = `notified_${reminder._id}_${today.toDateString()}_${reminder.notificationTime || '09:00'}`;
            
            let isNotified = false;
            try {
              isNotified = !!localStorage.getItem(key);
            } catch {}

            if (!isNotified) {
              // Disparar notificación nativa
              try {
                new Notification("✨ Recordatorio Mágico", {
                  body: `Hoy es: ${reminder.title}. ¡Entra y crea un mensaje especial!`,
                  icon: "/favicon.ico",
                  tag: key, // Tag evita duplicados visuales
                  requireInteraction: true // Mantiene la notificación visible hasta que el usuario interactúe
                });
              } catch (e) {
                console.error("Error mostrando notificación:", e);
              }
              
              // Marcar como notificado
              try {
                localStorage.setItem(key, "true");
              } catch {}
            }
          }
        });

        if (closestTrigger) {
          const diffMs = (closestTrigger as Date).getTime() - now.getTime();
          const diffMins = Math.ceil(diffMs / 60000);
          setNextAlert(`Próxima alarma en ${diffMins} min`);
        } else {
          setNextAlert(null);
        }

      } catch (error) {
        console.error("Error verificando recordatorios locales", error);
      }
    };

    // Verificar al montar y luego cada minuto para mayor precisión
    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(interval);
  }, [user, permission, country, notificationsEnabled]);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  return (
    <>
      {/* Banner de Permisos */}
      {user && permission === "default" && isVisible && notificationsEnabled && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900 flex items-center gap-4 max-w-sm relative">
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600"
            >✕</button>
            <div className="text-2xl">🔔</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Activa las notificaciones</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Te avisaremos en tu navegador cuando llegue una fecha importante.</p>
            </div>
            <button 
              onClick={requestPermission}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
            >
              Activar
            </button>
          </div>
        </div>
      )}

      {/* Indicador de Próxima Alarma */}
      {nextAlert && notificationsEnabled && (
        <div className="fixed bottom-4 left-4 z-40 animate-fade-in bg-slate-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 border border-white/10 pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {nextAlert}
        </div>
      )}
    </>
  );
};

export default NotificationManager;