import React, { useState, useEffect, forwardRef } from "react";
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
  disabled?: boolean;
}

const ReceivedMessageInput = forwardRef<HTMLTextAreaElement, ReceivedMessageInputProps>(({
  receivedText,
  setReceivedText,
  maxChars,
  safetyError,
  disabled = false,
}, ref) => {
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
        <label htmlFor="received-text" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          Mensaje que recibiste
        </label>
        <div className="relative">
          <textarea
            id="received-text"
            ref={ref}
            value={receivedText}
            onChange={(e) => {
              // Limpieza: eliminar caracteres invisibles (zero-width spaces) que a veces vienen al pegar
              const cleanText = e.target.value.replace(/[\u200B-\u200D\uFEFF]/g, "");

              if (cleanText.length > maxChars) {
                // Si la diferencia es mayor a 1, asumimos que fue un pegado y avisamos para no molestar al escribir
                if (cleanText.length - receivedText.length > 1) {
                  showToast(`Para mantener la magia, hemos ajustado el texto a ${maxChars} caracteres.`, "info");
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
            disabled={disabled}
            className={`w-full p-4 pr-10 bg-blue-50/30 dark:bg-blue-900/20 border ${safetyError ? "border-red-400 ring-2 ring-red-50 dark:ring-red-900/30" : "border-blue-100 dark:border-blue-900/30"} rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:ring-2 ${safetyError ? "focus:ring-red-400" : "focus:ring-blue-500"} outline-none transition-all resize-none min-h-[120px] disabled:opacity-60 disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-500 dark:disabled:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
          />
          {receivedText.length > 0 && !disabled && (
            <button
              onClick={() => setReceivedText("")}
              className="absolute top-3 right-3 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-all"
              title="Borrar todo"
            >
              ✕
            </button>
          )}
          <div className={`absolute bottom-3 right-3 text-[10px] font-bold ${receivedText.length >= maxChars ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>
            {receivedText.length} / {maxChars}
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">
          🔐 Respetamos tu privacidad: no almacenamos el contenido que pegas.
        </p>
      </div>
    </div>
  );
});

ReceivedMessageInput.displayName = "ReceivedMessageInput";

export default ReceivedMessageInput;