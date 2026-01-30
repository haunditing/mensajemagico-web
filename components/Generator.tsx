
import React, { useState, useEffect } from 'react';
import { Occasion, Relationship, Tone, GeneratedMessage } from '../types';
import { RELATIONSHIPS, TONES, RECEIVED_MESSAGE_TYPES, PENSAMIENTO_THEMES, EMOTIONAL_STATES } from '../constants';
import { generateMessage } from '../services/geminiService';
import { containsOffensiveWords, SAFETY_ERROR_MESSAGE } from '../services/safetyService';
import { canGenerate, recordGeneration } from '../services/usageControlService';
import { incrementGlobalCounter } from '../services/metricsService';
import ShareBar from './ShareBar';
import AdBanner from './AdBanner';

interface GeneratorProps {
  occasion: Occasion;
  initialRelationship?: Relationship;
  onRelationshipChange?: (relId: string) => void;
}

const Generator: React.FC<GeneratorProps> = ({ occasion, initialRelationship, onRelationshipChange }) => {
  const isPensamiento = occasion.id === 'pensamiento';
  const isResponder = occasion.id === 'responder';

  const [relationshipId, setRelationshipId] = useState<string>(
    initialRelationship?.id || (isPensamiento ? PENSAMIENTO_THEMES[0].id : RELATIONSHIPS[0].id)
  );
  const [tone, setTone] = useState<Tone>(isPensamiento ? Tone.PROFOUND : Tone.ROMANTIC);
  const [receivedMessageType, setReceivedMessageType] = useState<string>(RECEIVED_MESSAGE_TYPES[0].label);
  const [receivedText, setReceivedText] = useState("");
  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [usageMessage, setUsageMessage] = useState<string | null>(null);

  const MAX_CHARS = 400;

  useEffect(() => {
    if (isResponder && receivedText.trim() !== "") {
      if (containsOffensiveWords(receivedText)) {
        setSafetyError(SAFETY_ERROR_MESSAGE);
      } else {
        setSafetyError(null);
      }
    } else {
      setSafetyError(null);
    }
  }, [receivedText, isResponder]);

  const handleRelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setRelationshipId(newId);
    if (onRelationshipChange) onRelationshipChange(newId);
  };

  const handleGenerate = async () => {
    if (safetyError || isLoading) return;
    
    const check = canGenerate();
    if (!check.allowed) {
      setUsageMessage(check.message || null);
      return;
    }

    setIsLoading(true);
    setUsageMessage(null);

    if (check.delay) {
      await new Promise(resolve => setTimeout(resolve, check.delay));
    }
    
    let relLabel = "";
    if (isPensamiento) {
      relLabel = PENSAMIENTO_THEMES.find(t => t.id === relationshipId)?.label || 'la vida';
    } else {
      relLabel = RELATIONSHIPS.find(r => r.id === relationshipId)?.label || 'alguien';
    }
    
    const text = await generateMessage({
      occasion: occasion.name,
      relationship: relLabel,
      tone: isPensamiento ? (EMOTIONAL_STATES.find(s => s.id === relationshipId)?.label as any || tone) : tone,
      receivedMessageType: isResponder ? receivedMessageType : undefined,
      receivedText: isResponder ? receivedText : undefined
    });
    
    const newMessage: GeneratedMessage = {
      id: Math.random().toString(36).substr(2, 9),
      content: text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [newMessage, ...prev]);
    setIsLoading(false);
    recordGeneration(); 
    incrementGlobalCounter();
    
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className={`w-full ${isPensamiento ? 'max-w-3xl mx-auto' : ''}`}>
      <div className={`bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 p-6 md:p-10 shadow-sm ${isPensamiento ? 'border-blue-100 bg-blue-50/10' : ''}`}>
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="rel-select" className="block text-sm font-bold text-slate-700 mb-2">
                {isPensamiento ? '¿Sobre qué quieres reflexionar?' : 'Destinatario'}
              </label>
              <select 
                id="rel-select"
                value={relationshipId}
                onChange={handleRelChange}
                className="w-full h-12 md:h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {isPensamiento 
                  ? PENSAMIENTO_THEMES.map(theme => <option key={theme.id} value={theme.id}>{theme.label}</option>)
                  : RELATIONSHIPS.map(rel => <option key={rel.id} value={rel.id}>{rel.label}</option>)
                }
              </select>
            </div>

            <div>
              <label htmlFor="tone-select" className="block text-sm font-bold text-slate-700 mb-2">
                {isPensamiento ? 'Estado emocional' : 'Tono'}
              </label>
              <select 
                id="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full h-12 md:h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {isPensamiento 
                  ? EMOTIONAL_STATES.map(state => <option key={state.id} value={state.id}>{state.label}</option>)
                  : TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)
                }
              </select>
            </div>
          </div>

          {isResponder && (
            <div className="animate-fade-in-up space-y-4">
              <div>
                <label htmlFor="received-text" className="block text-sm font-bold text-slate-700 mb-2">
                  Mensaje que recibiste
                </label>
                <div className="relative">
                  <textarea 
                    id="received-text"
                    value={receivedText}
                    onChange={(e) => setReceivedText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Pega el mensaje aquí..."
                    className={`w-full p-4 bg-blue-50/30 border ${safetyError ? 'border-red-400 ring-2 ring-red-50' : 'border-blue-100'} rounded-xl font-medium text-slate-800 focus:ring-2 ${safetyError ? 'focus:ring-red-400' : 'focus:ring-blue-500'} outline-none transition-all resize-none min-h-[120px]`}
                  />
                  <div className={`absolute bottom-3 right-3 text-[10px] font-bold ${receivedText.length >= MAX_CHARS ? 'text-red-500' : 'text-slate-400'}`}>
                    {receivedText.length} / {MAX_CHARS}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  🔐 Respetamos tu privacidad: no almacenamos el contenido que pegas.
                </p>
                {safetyError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg animate-fade-in-up">
                    <p className="text-xs font-bold text-red-600 flex items-start gap-2">
                      <span className="text-sm">🚫</span> 
                      <span>{safetyError}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {usageMessage && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in-up">
            <p className="text-sm font-bold text-amber-700 flex items-start gap-3">
              <span className="text-xl">⏳</span>
              <span>{usageMessage}</span>
            </p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isLoading || !!safetyError}
          className={`w-full h-14 md:h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
            ${(isLoading || safetyError)
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]'
            }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span>{isPensamiento ? 'Mezclando pensamientos...' : 'Generando magia...'}</span>
            </div>
          ) : (
            <span>{safetyError ? 'Contenido bloqueado' : isPensamiento ? 'Obtener mi pensamiento' : 'Generar Mensaje Mágico'}</span>
          )}
        </button>
      </div>

      {/* Inventario Valioso: El AdBanner intermedio solo se muestra si hay al menos 1 mensaje generado */}
      <AdBanner position="middle" hasContent={messages.length > 0} />

      <div id="results-section" className="mt-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`bg-white border border-slate-200 rounded-2xl p-6 md:p-8 animate-fade-in-up shadow-sm relative overflow-hidden ${isPensamiento ? 'text-center border-blue-200' : ''}`}>
            <p className={`text-slate-800 leading-relaxed font-medium mb-8 relative z-10 ${isPensamiento ? 'text-xl md:text-2xl italic' : 'text-base md:text-lg'}`}>
              {msg.content}
            </p>
            
            <div className="pt-6 border-t border-slate-100 relative z-10">
              <ShareBar 
                content={msg.content} 
                platforms={occasion.allowedPlatforms}
                className="animate-fade-in-up"
              />
              
              {!isPensamiento && (
                <div className="mt-6 flex flex-col gap-1 w-full text-left">
                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Aviso legal</span>
                   <p className="text-[10px] text-slate-300 leading-tight">
                     Tú decides cómo usar este mensaje. No somos responsables de las consecuencias sociales de su envío.
                   </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Generator;
