import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";
import { api } from "../context/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { useUpsell } from "../context/UpsellContext";
import { useNavigate, Link } from "react-router-dom";

interface Reminder {
  _id: string;
  title: string;
  date: string;
  nextOccurrence?: string;
  type: string;
  isRecurring: boolean;
  isAutomatic?: boolean;
  notes?: string;
  notificationTime?: string;
  socialPlatform?: string;
}

interface Holiday {
  title: string;
  date: string;
  type: string;
  country: string;
}

const RemindersPage: React.FC = () => {
  const { user, planLevel } = useAuth();
  const { country } = useLocalization();
  const { showToast } = useToast();
  const { triggerUpsell } = useUpsell();
  const navigate = useNavigate();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [addingHoliday, setAddingHoliday] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("custom");
  const [isRecurring, setIsRecurring] = useState(true);
  const [notes, setNotes] = useState("");
  const [notificationTime, setNotificationTime] = useState("09:00");
  const [socialPlatform, setSocialPlatform] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<Reminder | null>(null);
  const [customSnoozeDate, setCustomSnoozeDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isPremium = planLevel === "premium";

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user, country, isPremium]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      
      if (isPremium) {
        const [remindersData, holidaysData] = await Promise.all([
          api.get("/api/reminders"),
          api.get(`/api/reminders/holidays?country=${country}`),
        ]);
        setReminders(remindersData);
        setHolidays(holidaysData);
      } else {
        // Modo Teaser: Solo cargamos festivos para mostrar el valor
        const holidaysData = await api.get(`/api/reminders/holidays?country=${country}`);
        setHolidays(holidaysData);
        setReminders([]); // Sin recordatorios personales
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPremium) {
      triggerUpsell("Mejora a Premium para crear recordatorios personalizados ilimitados.");
      return;
    }
    if (!title || !date) return;

    // Validación de fecha en el pasado (solo para no recurrentes)
    if (!isRecurring) {
      const now = new Date();
      // Construir string YYYY-MM-DD local para comparar con el input date
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      if (date < todayStr) {
        showToast("La fecha no puede estar en el pasado para recordatorios únicos.", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        date,
        type,
        isRecurring,
        notes,
        notificationTime,
        socialPlatform
      };

      if (editingId) {
        await api.put(`/api/reminders/${editingId}`, payload);
        showToast("Recordatorio actualizado", "success");
      } else {
        await api.post("/api/reminders", payload);
        showToast("Recordatorio creado con éxito", "success");
      }
      
      setShowForm(false);
      resetForm();
      fetchReminders();
    } catch (error: any) {
      showToast(error.message || "Error al crear", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddHoliday = async (holiday: Holiday) => {
    if (!isPremium) {
      triggerUpsell("Activa los recordatorios automáticos de festivos con el plan Premium.");
      return;
    }
    setAddingHoliday(holiday.title);
    try {
      // Asegurar formato YYYY-MM-DD para evitar problemas de zona horaria
      const dateStr = holiday.date.toString().split('T')[0];

      await api.post("/api/reminders", {
        title: holiday.title,
        date: dateStr,
        type: "holiday",
        isRecurring: true,
        notes: `Festivo automático (${holiday.country})`,
      });
      showToast("Festivo agregado a tus recordatorios", "success");
      fetchReminders();
    } catch (error: any) {
      showToast(error.message || "Error al agregar", "error");
    } finally {
      setAddingHoliday(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este recordatorio?")) return;
    try {
      await api.delete(`/api/reminders/${id}`);
      showToast("Eliminado correctamente", "success");
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      showToast("Error al eliminar", "error");
    }
  };

  const handleEdit = (reminder: Reminder) => {
    if (!isPremium) return;
    
    setTitle(reminder.title);
    // Formatear fecha para input date (YYYY-MM-DD)
    const d = new Date(reminder.date);
    setDate(d.toISOString().split('T')[0]);
    setType(reminder.type);
    setIsRecurring(reminder.isRecurring);
    setNotes(reminder.notes || "");
    setNotificationTime(reminder.notificationTime || "09:00");
    setSocialPlatform(reminder.socialPlatform || "");
    
    setEditingId(reminder._id);
    setShowForm(true);
    // Scroll suave hacia el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSnooze = async (id: string, days?: number, date?: string) => {
    try {
      await api.post(`/api/reminders/${id}/snooze`, { days, targetDate: date });
      
      let message = "Recordatorio pospuesto";
      if (days) message = `Pospuesto ${days} día(s)`;
      else if (date) message = "Pospuesto hasta la fecha seleccionada";

      showToast(message, "success");
      setSnoozeTarget(null);
      setCustomSnoozeDate("");
      fetchReminders();
    } catch (error: any) {
      showToast(error.message || "Error al posponer", "error");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDate("");
    setType("custom");
    setIsRecurring(true);
    setNotes("");
    setNotificationTime("09:00");
    setSocialPlatform("");
    setEditingId(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return "🎂";
      case "anniversary":
        return "💍";
      case "holiday":
        return "🎉";
      default:
        return "📅";
    }
  };

  const getOccasionSlug = (type: string) => {
    switch (type) {
      case "birthday":
        return "cumpleanos";
      case "anniversary":
        return "anniversary";
      case "holiday":
        return "pensamiento-del-dia";
      default:
        return "saludo";
    }
  };

  const formatDate = (dateString: string) => {
    // Ajustar zona horaria para evitar desfases de día
    const d = new Date(dateString);
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(d.getTime() + userTimezoneOffset);

    return adjustedDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calcular el próximo evento para el contador (Solo Premium)
  const nextEvent = reminders.length > 0 ? reminders[0] : null;
  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in-up">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Inicia sesión para ver tus recordatorios
        </h2>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors mt-4"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            {isPremium ? "Mis Recordatorios" : "Agenda Mágica"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isPremium 
              ? "Tu asistente personal para fechas importantes." 
              : "Nunca más olvides un cumpleaños o fecha especial."}
          </p>
        </div>
        <button
          onClick={() => isPremium ? setShowForm(!showForm) : triggerUpsell("Crea recordatorios personalizados con Premium.")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
        >
          {showForm ? "✕ Cerrar" : isPremium ? "+ Nuevo Recordatorio" : "🔓 Desbloquear Agenda"}
        </button>
      </div>

      {/* Banner de Próximo Evento (Solo Premium con datos) */}
      {isPremium && nextEvent && (
        <div className="mb-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Próximo Evento</span>
              <h2 className="text-2xl md:text-3xl font-black mt-1">{nextEvent.title}</h2>
              <p className="text-blue-100 font-medium mt-1">
                {formatDate(nextEvent.nextOccurrence || nextEvent.date)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                {getDaysUntil(nextEvent.nextOccurrence || nextEvent.date) === 0 ? (
                  <span className="block text-3xl font-black animate-pulse">¡Es Hoy!</span>
                ) : (
                  <>
                    <span className="block text-4xl font-black">{getDaysUntil(nextEvent.nextOccurrence || nextEvent.date)}</span>
                    <span className="text-xs text-blue-200 font-bold uppercase">Días</span>
                  </>
                )}
              </div>
              <Link
                to={`/mensajes/${getOccasionSlug(nextEvent.type)}${nextEvent.socialPlatform ? `?share=${nextEvent.socialPlatform}` : ""}`}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all active:scale-95"
              >
                Preparar Mensaje
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg mb-8 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingId ? "Editar Recordatorio" : "Crear Recordatorio"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Cumpleaños de Mamá"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="custom">Personalizado</option>
                  <option value="birthday">Cumpleaños</option>
                  <option value="anniversary">Aniversario</option>
                  <option value="event">Evento</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Repetir cada año
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora de Aviso</label>
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Publicar en (Opcional)</label>
                <select
                  value={socialPlatform}
                  onChange={(e) => setSocialPlatform(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Ninguna</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="X">X (Twitter)</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Notas (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                placeholder="Ideas de regalo, planes..."
              />
            </div>

            <div className="flex justify-end pt-2 gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {submitting ? "Guardando..." : editingId ? "Actualizar" : "Guardar Recordatorio"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : !isPremium ? (
        // Estado de Venta (No Premium)
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-4 rounded-full shadow-xl mb-4 text-4xl">🔒</div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Tus Recordatorios Personales</h3>
            <p className="text-slate-600 max-w-md mb-6">
              Desbloquea el plan Premium para guardar cumpleaños, aniversarios y recibir avisos automáticos antes de que sea tarde.
            </p>
            <Link to="/pricing" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">
              Desbloquear Premium
            </Link>
          </div>
          {/* Fondo decorativo borroso */}
          <div className="opacity-30 filter blur-sm pointer-events-none select-none" aria-hidden="true">
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                    <div className="flex-1 h-4 bg-slate-200 rounded w-3/4"></div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            No tienes recordatorios
          </h3>
          <p className="text-slate-500">
            Agrega fechas importantes para recibir ayuda con tus mensajes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {Array.isArray(reminders) && reminders.map((reminder) => {
            const isHoliday =
              reminder.isAutomatic || reminder.type === "holiday";
            const displayDate = reminder.nextOccurrence || reminder.date;

            return (
              <div
                key={reminder._id}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4
                  ${isHoliday ? "bg-blue-50/50 border-blue-100" : "bg-white border-slate-200"}
                `}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
                    ${isHoliday ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"}
                  `}
                  >
                    {getIcon(reminder.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">
                        {reminder.title}
                      </h3>
                      {isHoliday && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          Festivo
                        </span>
                      )}
                      {reminder.isRecurring && !isHoliday && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                          Anual
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                      <span>🗓️ {formatDate(displayDate)}</span>
                      {reminder.notificationTime && (
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          ⏰ {reminder.notificationTime}
                        </span>
                      )}
                    </p>
                    {reminder.notes && (
                      <p className="text-slate-400 text-xs mt-2 italic">
                        "{reminder.notes}"
                      </p>
                    )}
                    {reminder.socialPlatform && (
                      <p className="text-indigo-500 text-xs mt-1 font-bold flex items-center gap-1">
                        <span>📱</span> Publicar en {reminder.socialPlatform}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end">
                  {isHoliday ? (
                    <div className="flex gap-2">
                      <Link
                        to="/mensajes/un-saludo"
                        className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                        <span>👋</span> Saludar
                      </Link>
                      <Link
                        to="/mensajes/pensamiento-del-dia"
                        className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                        <span>🧘</span> Pensamiento
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`/mensajes/${getOccasionSlug(reminder.type)}${reminder.socialPlatform ? `?share=${reminder.socialPlatform}` : ""}`}
                      className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      Escribir Mensaje
                    </Link>
                  )}
                  
                  {/* Botón de Posponer (Snooze) */}
                  {!isHoliday && (
                    <button
                      onClick={() => { setSnoozeTarget(reminder); setCustomSnoozeDate(""); }}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Posponer"
                    >
                      ⏰
                    </button>
                  )}

                  {!isHoliday && (
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(reminder._id)}
                    className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Snooze */}
      {snoozeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSnoozeTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Posponer "{snoozeTarget.title}"</h3>
            <p className="text-sm text-slate-500 mb-6">¿Cuándo quieres que te avisemos de nuevo?</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => handleSnooze(snoozeTarget._id, 1)} className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-bold text-sm transition-all flex flex-col items-center gap-1">
                <span className="text-xl">🌅</span> Mañana
              </button>
              <button onClick={() => handleSnooze(snoozeTarget._id, 3)} className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-bold text-sm transition-all flex flex-col items-center gap-1">
                <span className="text-xl">🗓️</span> 3 Días
              </button>
              <button onClick={() => handleSnooze(snoozeTarget._id, 7)} className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-bold text-sm transition-all flex flex-col items-center gap-1">
                <span className="text-xl">📅</span> 1 Semana
              </button>
              <button onClick={() => handleSnooze(snoozeTarget._id, 30)} className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-bold text-sm transition-all flex flex-col items-center gap-1">
                <span className="text-xl">📆</span> 1 Mes
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">O elige una fecha</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  onChange={(e) => setCustomSnoozeDate(e.target.value)}
                />
                <button 
                  onClick={() => customSnoozeDate && handleSnooze(snoozeTarget._id, undefined, customSnoozeDate)}
                  disabled={!customSnoozeDate}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ok
                </button>
              </div>
            </div>
            
            <button onClick={() => setSnoozeTarget(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Sección de Festivos Sugeridos */}
      {!loading && holidays.length > 0 && (
        <div className="mt-12 border-t border-slate-100 pt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span>🎉</span> Festivos Sugeridos en {country}
          </h2>
          {!isPremium && (
            <p className="text-sm text-slate-500 mb-6">
              Estos son los eventos que podríamos rastrear por ti automáticamente.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {holidays.map((holiday, idx) => {
              const isAdded = reminders.some((r) => r.title === holiday.title);
              const isProcessing = addingHoliday === holiday.title;

              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:border-blue-300 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {holiday.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {formatDate(holiday.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddHoliday(holiday)}
                    disabled={isAdded || isProcessing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isAdded
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95"
                    }`}
                  >
                    {isAdded
                      ? "Agregado"
                      : isProcessing
                        ? "..."
                        : isPremium ? "Agregar +" : "🔒 Agregar"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
