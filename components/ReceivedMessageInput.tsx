import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";

const EXAMPLES = [
  "Ej: 'Tenemos que hablar...'",
  "Ej: 'No sé qué siento por ti ahora mismo.'",
  "Ej: 'Hola, perdido.'",
  "Ej: '¿Estás libre el viernes?'",
  "Ej: 'Me dejaste en visto ayer.'",
  "Ej: 'Feliz cumpleaños, pásala bien.'",
  "Ej: 'Ok.'",
  "Ej: 'Te extraño.'",
];

interface ReceivedMessageInputProps {
  receivedText: string;
  setReceivedText: (value: string) => void;
  maxChars: number;
  safetyError: string | null;
}

const ReceivedMessageInput: React.FC<ReceivedMessageInputProps> = ({
  receivedText,
  setReceivedText,
  maxChars,
  safetyError,
}) => {
  const { showToast } = useToast();
  const [placeholder, setPlaceholder] = useState(() => EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);

  useEffect(() => {
    if (receivedText.length > 0) return;

    const interval = setInterval(() => {
      setPlaceholder(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [receivedText]);

  return (
    <div className="animate-fade-in-up space-y-4">
      <div>
        <label htmlFor="received-text" className="block text-sm font-bold text-slate-700 mb-2">
          Mensaje que recibiste
        </label>
        <div className="relative">
          <textarea
            id="received-text"
            value={receivedText}
            onChange={(e) => {
              // Limpieza: eliminar caracteres invisibles (zero-width spaces) que a veces vienen al pegar
              const cleanText = e.target.value.replace(/[\u200B-\u200D\uFEFF]/g, "");

              if (cleanText.length > maxChars) {
                // Si la diferencia es mayor a 1, asumimos que fue un pegado y avisamos para no molestar al escribir
                if (cleanText.length - receivedText.length > 1) {
                  showToast(`El texto se recortó a ${maxChars} caracteres.`, "info");
                }
              }
              
              let slicedText = cleanText.slice(0, maxChars);
              // Evitar romper emojis (pares sustitutos) al final si el corte cae en medio
              if (/[\uD800-\uDBFF]$/.test(slicedText)) {
                slicedText = slicedText.slice(0, -1);
              }
              setReceivedText(slicedText);
            }}
            placeholder={placeholder}
            className={`w-full p-4 pr-10 bg-blue-50/30 border ${safetyError ? "border-red-400 ring-2 ring-red-50" : "border-blue-100"} rounded-xl font-medium text-slate-800 focus:ring-2 ${safetyError ? "focus:ring-red-400" : "focus:ring-blue-500"} outline-none transition-all resize-none min-h-[120px]`}
          />
          {receivedText.length > 0 && (
            <button
              onClick={() => setReceivedText("")}
              className="absolute top-3 right-3 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
              title="Borrar todo"
            >
              ✕
            </button>
          )}
          <div className={`absolute bottom-3 right-3 text-[10px] font-bold ${receivedText.length >= maxChars ? "text-red-500" : "text-slate-400"}`}>
            {receivedText.length} / {maxChars}
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 italic">
          🔐 Respetamos tu privacidad: no almacenamos el contenido que pegas.
        </p>
      </div>
    </div>
  );
};

export default ReceivedMessageInput;