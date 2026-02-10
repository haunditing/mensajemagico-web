import React, { useState } from "react";
import { api } from "../context/api";
import { useToast } from "../context/ToastContext";

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contact: any) => void;
}

const CreateContactModal: React.FC<CreateContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      showToast("El nombre del contacto no puede estar vacío.", "error");
      return;
    }

    setLoading(true);
    try {
      const contact = await api.post("/api/contacts", { name, relationship });
      showToast("Contacto agregado al Guardián ✨", "success");
      if (onSuccess) onSuccess(contact);
      onClose();
      setName("");
      setRelationship("");
    } catch (error: any) {
      showToast(error.message || "Error al crear contacto", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Nuevo Contacto</h3>
        <p className="text-sm text-slate-500 mb-4">El Guardián aprenderá de tu relación con esta persona.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nombre</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Ej: María"
              required 
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Relación</label>
            <input 
              value={relationship} 
              onChange={(e) => setRelationship(e.target.value)} 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Ej: Pareja, Jefe, Amigo"
              required 
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50">{loading ? "..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContactModal;