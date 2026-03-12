import * as React from "react";

// Icono de campaña: megáfono minimalista mejorado, solo líneas
export default function CampaignIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2563eb" // Manteniendo el color azul existente
      strokeWidth={1.75} // Ligeramente más delgado para un aspecto más limpio
      strokeLinecap="round"
      strokeLinejoin="round"
    >
            {/* Cuerpo principal del megáfono */}
           {" "}
      <path d="M4 10.5V13.5a1.5 1.5 0 0 0 1.5 1.5H8l8.5 4.5V4.5L8 9H5.5a1.5 1.5 0 0 0-1.5 1.5z" />
                   {/* Mango */}
            <path d="M11 16l2 4a1.5 1.5 0 0 1-2.5 1.5l-1.5-3" />            {" "}
      {/* Ondas de sonido que emanan */}
            <path d="M19.5 8.5c1.1 1.1 1.1 2.9 0 4s-1.1 2.9 0 4" />
            <path d="M22.5 6.5c2.2 2.2 2.2 5.8 0 8s-2.2 5.8 0 8" />            {" "}
      {/* Pequeño círculo para representar el extremo del megáfono */}
            <circle cx="16.5" cy="12" r="1" />   {" "}
    </svg>
  );
}
