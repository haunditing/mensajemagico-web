import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../context/api";
import LoadingSpinner from "../components/LoadingSpinner";
import RelationalHealthIndicator from "../components/RelationalHealthIndicator";
import RelationalHealthChart from "../components/RelationalHealthChart";
import { Link } from "react-router-dom";

interface Contact {
  _id: string;
  name: string;
  relationship: string;
  relationalHealth: number;
  lastInteraction?: string;
  history: any[];
}

const ContactsPage: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowForm] = useState(false);
  const [newName, setName] = useState("");
  const [newRel, setRel] = useState("");

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/contacts", { name: newName, relationship: newRel });
      setShowForm(false);
      setName("");
      setRel("");
      fetchContacts();
    } catch (error) {
      console.error(error);
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
      <div className="p-10 text-center">
        Inicia sesión para ver tus contactos.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900">Mis Contactos</h1>
        <button
          onClick={() => setShowForm(!showCreate)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800"
        >
          {showCreate ? "Cancelar" : "+ Nuevo Contacto"}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex gap-4 items-end"
        >
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Nombre
            </label>
            <input
              value={newName}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Relación
            </label>
            <input
              value={newRel}
              onChange={(e) => setRel(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200"
              placeholder="Ej: Pareja, Jefe"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold"
          >
            Guardar
          </button>
        </form>
      )}

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
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md flex items-center justify-between
                ${selectedContact?._id === contact._id ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100" : "bg-white border-slate-200"}
              `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg font-bold text-slate-500">
                    {contact.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{contact.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">
                      {contact.relationship}
                    </p>
                  </div>
                </div>
                <RelationalHealthIndicator
                  score={contact.relationalHealth}
                  className="scale-75"
                />
              </div>
            ))
          )}
        </div>

        {/* Detalle del Contacto */}
        <div className="lg:col-span-2">
          {selectedContact ? (
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm animate-fade-in">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-1">
                    {selectedContact.name}
                  </h2>
                  <p className="text-slate-500 font-medium capitalize">
                    {selectedContact.relationship}
                  </p>
                </div>
                <RelationalHealthIndicator
                  score={selectedContact.relationalHealth}
                />
              </div>

              <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Evolución de la Relación
                </h3>
                <RelationalHealthChart
                  currentHealth={selectedContact.relationalHealth}
                  history={selectedContact.history}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Historial de Mensajes
                </h3>
                <div className="space-y-4">
                  {selectedContact.history.slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item: any, i) => (
                      <div
                        key={i}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                          <span className="font-bold uppercase">
                            {item.occasion}
                          </span>
                          <span title={new Date(item.date).toLocaleString()}>
                            {timeAgo(item.date)}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm italic">
                          "{getCleanContent(item.content).substring(0, 100)}..."
                        </p>
                      </div>
                    ))}
                  {selectedContact.history.length === 0 && (
                    <p className="text-slate-400 text-sm italic">
                      Sin interacciones aún.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 border-2 border-dashed border-slate-200 rounded-[2rem]">
              <span className="text-4xl mb-4">👈</span>
              <p>Selecciona un contacto para ver su análisis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;