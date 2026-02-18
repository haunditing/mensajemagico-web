import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Mis Contactos</h1>
        <button
          onClick={handleCreate}
          className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-600"
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
                  <div className="hidden group-hover:flex gap-1">
                    <button
                      onClick={(e) => handleEdit(contact, e)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => handleDelete(contact._id, e)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detalle del Contacto */}
        <div className="lg:col-span-2">
          {selectedContact ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                    {selectedContact.name}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium capitalize">
                    {selectedContact.relationship}
                  </p>
                </div>
                <RelationalHealthIndicator
                  score={selectedContact.relationalHealth}
                />
              </div>

              <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Evolución de la Relación
                </h3>
                <RelationalHealthChart
                  currentHealth={selectedContact.relationalHealth}
                  history={selectedContact.history}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
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
                        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-2">
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
                    <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                      Sin interacciones aún.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
              <span className="text-4xl mb-4">👈</span>
              <p>Selecciona un contacto para ver su análisis.</p>
            </div>
          )}
        </div>
      </div>

      <CreateContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchContacts}
        contactToEdit={editingContact}
      />
    </div>
  );
};

export default ContactsPage;