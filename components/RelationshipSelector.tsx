import React, { useMemo } from "react";
import { RELATIONSHIPS } from "../constants";
import RelationalHealthIndicator from "./RelationalHealthIndicator";

interface RelationshipSelectorProps {
  relationshipId: string;
  onRelationshipChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  contacts: any[];
  selectedContact: any;
}

const RelationshipSelector: React.FC<RelationshipSelectorProps> = ({
  relationshipId,
  onRelationshipChange,
  contacts,
  selectedContact,
}) => {
  const availableRelationships = useMemo(() => {
    if (!Array.isArray(contacts)) return RELATIONSHIPS;

    // 1. Identificar qué roles exclusivos ya están ocupados por un contacto
    const occupiedRoles = new Set<string>();
    
    contacts.forEach((c) => {
      const rel = String(c.relationship || "").toLowerCase().trim();
      if (rel === "pareja" || rel === "couple") occupiedRoles.add("couple");
      if (rel === "madre" || rel === "mother") occupiedRoles.add("mother");
      if (rel === "padre" || rel === "father") occupiedRoles.add("father");
    });

    // 2. Filtrar la lista de relaciones generales
    return RELATIONSHIPS.filter((rel) => {
      // Si el rol está ocupado, lo ocultamos SOLO si no es la selección actual.
      // Esto evita que el select salte a "+ Nuevo Contacto" mientras el useEffect hace el cambio automático de ID.
      if (occupiedRoles.has(rel.id) && relationshipId !== rel.id) return false;
      return true;
    });
  }, [contacts, relationshipId]);

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
        Destinatario
      </label>
      {selectedContact && (
        <div className="absolute top-0 right-0 z-10 -mt-1 animate-fade-in">
          <div className="relative">
            <RelationalHealthIndicator
              score={selectedContact.relationalHealth}
              minimal={true}
            />
            {selectedContact.guardianMetadata?.trained && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-pulse whitespace-nowrap">
                IA ENTRENADA
              </span>
            )}
          </div>
        </div>
      )}
      <select
        value={relationshipId}
        onChange={onRelationshipChange}
        className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
      >
        <option value="new_contact" className="font-bold text-blue-600 dark:text-blue-400">
          + Nuevo Contacto
        </option>
        {contacts.length > 0 && (
          <optgroup label="Mis Contactos">
            {contacts.map((c) => {
              const rel = String(c.relationship || "").toLowerCase().trim();
              const isExclusive = ["pareja", "couple", "madre", "mother", "padre", "father"].includes(rel);
              return (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.relationship}) {isExclusive ? "🔒" : ""} {c.relationalHealth >= 8 ? "❤️" : ""}
                </option>
              );
            })}
          </optgroup>
        )}
        <optgroup label="Relaciones Generales">
          {availableRelationships.map((rel) => (
            <option key={rel.id} value={rel.id}>
              {rel.label}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};

export default RelationshipSelector;