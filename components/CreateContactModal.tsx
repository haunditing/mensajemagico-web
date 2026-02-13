import React, { useState, useEffect, useRef } from "react";
import { api } from "../context/api";
import { useToast } from "../context/ToastContext";
import { RELATIONSHIPS } from "../constants";
import LoadingSpinner from "./LoadingSpinner";

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contact: any) => void;
  contactToEdit?: any;
}

const CreateContactModal: React.FC<CreateContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contactToEdit,
}) => {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [grammaticalGender, setGrammaticalGender] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (contactToEdit) {
        setName(contactToEdit.name);
        // FIX: Buscar la relación coincidente ignorando mayúsculas/minúsculas para que el Select la reconozca
        const dbRel = contactToEdit.relationship || "";
        const matchingRel = RELATIONSHIPS.find(r => r.label.toLowerCase() === dbRel.toLowerCase());
        setRelationship(matchingRel ? matchingRel.label : dbRel);
        setGrammaticalGender(contactToEdit.grammaticalGender || "neutral");
      } else {
        setName("");
        setRelationship("");
        setGrammaticalGender("neutral");
      }
    }
  }, [isOpen, contactToEdit]);

  // Manejo de Foco (Trap Focus) y Tecla Escape
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }

        if (e.key === "Tab" && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        // Restaurar foco al cerrar
        if (previousFocus.current) {
          previousFocus.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      showToast("El nombre del contacto no puede estar vacío.", "error");
      return;
    }

    setLoading(true);
    try {
      let contact;
      if (contactToEdit) {
        contact = await api.put(`/api/contacts/${contactToEdit._id}`, { name, relationship, grammaticalGender });
        showToast("Contacto actualizado ✨", "success");
      } else {
        contact = await api.post("/api/contacts", { name, relationship, grammaticalGender });
        showToast("Contacto agregado al Guardián ✨", "success");
      }
      
      if (onSuccess) onSuccess(contact);
      onClose();
      if (!contactToEdit) {
        setName("");
        setRelationship("");
        setGrammaticalGender("neutral");
      }
    } catch (error: any) {
      showToast(error.message || "Error al guardar contacto", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{contactToEdit ? "Editar Contacto" : "Nuevo Contacto"}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">El Guardián aprenderá de tu relación con esta persona.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Nombre</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Ej: María"
              required 
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Relación</label>
            <select
              value={relationship} 
              onChange={(e) => setRelationship(e.target.value)} 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required 
            >
              <option value="" disabled>Selecciona el tipo de relación</option>
              {RELATIONSHIPS.map((rel) => (
                <option key={rel.id} value={rel.label}>{rel.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Género (Opcional)</label>
            <select
              value={grammaticalGender}
              onChange={(e) => setGrammaticalGender(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="neutral">Neutro / No especificar</option>
              <option value="female">Femenino (Ella)</option>
              <option value="male">Masculino (Él)</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="current" />
                  <span>Guardando...</span>
                </>
              ) : (
                contactToEdit ? "Actualizar" : "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContactModal;