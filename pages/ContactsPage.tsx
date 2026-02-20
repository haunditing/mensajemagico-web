import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../context/api";
import LoadingSpinner from "../components/LoadingSpinner";
import RelationalHealthIndicator from "../components/RelationalHealthIndicator";
import RelationalHealthChart from "../components/RelationalHealthChart";
import { Link } from "react-router-dom";
import CreateContactModal from "../components/CreateContactModal";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";

interface Contact {
  _id: string;
  name: string;
  relationship: string;
  relationalHealth: number;
  lastInteraction?: string;
  history: any[];
  grammaticalGender?: string;
}

const ContactsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isFabVisible, setIsFabVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetContactId, setResetContactId] = useState<string | null>(null);
  const [resetConfirmationText, setResetConfirmationText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  // Ocultar FAB al hacer scroll hacia abajo
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsFabVisible(false); // Bajando -> Ocultar
      } else {
        setIsFabVisible(true); // Subiendo -> Mostrar
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/contacts");
      setContacts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: "¿Eliminar contacto?",
      message: "Esta acción no se puede deshacer. El Guardián olvidará todo lo aprendido sobre esta relación.",
      isDangerous: true,
      confirmText: "Sí, eliminar"
    });
    if (!isConfirmed) return;

    try {
      await api.delete(`/api/contacts/${id}`);
      showToast("Contacto eliminado. El Guardián ha olvidado esta conexión.", "success");
      fetchContacts();
      if (selectedContact?._id === id) setSelectedContact(null);
    } catch (error) {
      console.error(error);
      showToast("Error al eliminar contacto", "error");
    }
  };

  const handleReset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResetContactId(id);
    setResetConfirmationText("");
    setIsResetModalOpen(true);
  };

  const confirmReset = async () => {
    if (!resetContactId || resetConfirmationText !== "RESET") return;

    setIsResetting(true);
    try {
      await api.post(`/api/contacts/${resetContactId}/reset`, {});
      showToast("Análisis reiniciado. El Guardián empezará de cero con este contacto.", "success");
      
      const data = await api.get("/api/contacts");
      setContacts(data);
      
      if (selectedContact && selectedContact._id === resetContactId) {
        const updated = data.find((c: Contact) => c._id === resetContactId);
        if (updated) setSelectedContact(updated);
      }
      setIsResetModalOpen(false);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Error al reiniciar análisis", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const getCleanContent = (content: any) => {
    if (!content) return "";
    
    // Asegurar que trabajamos con string
    let textToParse = typeof content === 'string' ? content : JSON.stringify(content);

    try {
      // Limpiar markdown que la IA suele añadir
      const cleanText = textToParse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (cleanText.startsWith("{")) {
        const parsed = JSON.parse(cleanText);
        if (parsed.generated_messages && Array.isArray(parsed.generated_messages)) {
          const msg = parsed.generated_messages.find((m: any) => m.tone?.includes("Premium")) || parsed.generated_messages[0];
          return msg ? msg.content : "Mensaje generado";
        }
        if (parsed.message) return parsed.message;
      }
      return cleanText;
    } catch (e) {
      return textToParse;
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `Hace ${interval} año${interval === 1 ? "" : "s"}`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `Hace ${interval} mes${interval === 1 ? "" : "es"}`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `Hace ${interval} día${interval === 1 ? "" : "s"}`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `Hace ${interval} hora${interval === 1 ? "" : "s"}`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `Hace ${interval} minuto${interval === 1 ? "" : "s"}`;

    return "Hace un momento";
  };

  if (!user)
    return (
      <div className="p-10 text-center text-slate-500 dark:text-slate-400">
        Inicia sesión para ver tus contactos.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Mis Contactos</h1>
        <button
          onClick={handleCreate}
          className="hidden lg:block bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-600"
        >
          + Nuevo Contacto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Contactos */}
        <div className="lg:col-span-1 space-y-4">
          {loading ? (
            <LoadingSpinner />
          ) : (
            contacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md flex items-center justify-between group
                ${selectedContact?._id === contact._id ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-2 ring-blue-100 dark:ring-blue-900/50" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}
              `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold text-slate-500 dark:text-slate-400">
                    {contact.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{contact.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {contact.relationship}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RelationalHealthIndicator
                    score={contact.relationalHealth}
                    className="scale-75"
                  />
                  
                  {/* Acciones Desktop (Hover) */}
                  <div className="hidden lg:group-hover:flex gap-1">
                    <button
                      onClick={(e) => handleEdit(contact, e)}
                      className="p-1.5 text-slate-500 dark:text-slate- hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => handleDelete(contact._id, e)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Acciones Móvil (Menú 3 puntos) */}
                  <div className="lg:hidden relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === contact._id ? null : contact._id);
                      }}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                    
                    {openMenuId === contact._id && (
                      <div className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 min-w-[140px] overflow-hidden animate-fade-in">
                        <button onClick={(e) => { handleEdit(contact, e); setOpenMenuId(null); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
                          <span>✏️</span> Editar
                        </button>
                        <button onClick={(e) => { handleDelete(contact._id, e); setOpenMenuId(null); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors border-t border-slate-50 dark:border-slate-800">
                          <span>🗑️</span> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detalle del Contacto */}
        <div
          className={`lg:col-span-2 ${
            selectedContact
              ? "fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 p-4 overflow-y-auto lg:static lg:p-0 lg:bg-transparent lg:dark:bg-transparent lg:overflow-visible animate-fade-in"
              : "hidden lg:block"
          }`}
        >
          {selectedContact ? (
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in relative min-h-full lg:min-h-0">
              {/* Botón Cerrar (Solo Móvil) */}
              <div className="flex justify-end lg:hidden mb-2">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                    {selectedContact.name}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium capitalize">
                    {selectedContact.relationship}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <RelationalHealthIndicator
                    score={selectedContact.relationalHealth}
                  />
                  <button
                    onClick={(e) => handleReset(selectedContact._id, e)}
                    className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors font-medium"
                    title="Reiniciar análisis y ADN"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Reiniciar
                  </button>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Evolución de la Relación
                </h3>
                <RelationalHealthChart
                  currentHealth={selectedContact.relationalHealth}
                  history={selectedContact.history}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Historial de Mensajes
                </h3>
                <div className="space-y-4">
                  {selectedContact.history.slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item: any, i) => (
                      <div
                        key={i}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
                      >
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <span className="font-bold uppercase">
                            {item.occasion}
                          </span>
                          <span title={new Date(item.date).toLocaleString()}>
                            {timeAgo(item.date)}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm italic">
                          "{getCleanContent(item.content).substring(0, 100)}..."
                        </p>
                      </div>
                    ))}
                  {selectedContact.history.length === 0 && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                      Sin interacciones aún.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
              <span className="text-4xl mb-4">👈</span>
              <p className="text-center">Selecciona un contacto de la lista para ver su análisis y evolución.</p>
            </div>
          )}
        </div>
      </div>

      {/* Botón Flotante para crear contacto (Solo móvil) */}
      <button
        onClick={handleCreate}
        className={`fixed bottom-24 right-6 z-30 lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center text-3xl pb-1 hover:bg-blue-700 transition-all duration-300 active:scale-90 ${
          isFabVisible ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0 pointer-events-none"
        }`}
        aria-label="Crear contacto"
      >
        +
      </button>

      <CreateContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchContacts}
        contactToEdit={editingContact}
      />

      {/* Modal de Confirmación de Reset */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !isResetting && setIsResetModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔄</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">¿Reiniciar análisis?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Se borrará el historial de salud relacional y el ADN léxico aprendido. Esta acción es <strong>irreversible</strong>.
              </p>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Escribe <span className="text-slate-900 dark:text-white select-none">RESET</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={resetConfirmationText}
                  onChange={(e) => setResetConfirmationText(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-center font-bold uppercase tracking-widest"
                  placeholder="RESET"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setIsResetModalOpen(false)} disabled={isResetting} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={confirmReset} disabled={isResetting || resetConfirmationText !== "RESET"} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isResetting ? "Reiniciando..." : "Sí, reiniciar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;