import React from "react";
import { ExtendedGeneratedMessage } from "../hooks/useGenerator";
import { Occasion, SharePlatform } from "../types";
import { AI_ERROR_FALLBACK } from "../services/geminiService";
import ShareBar from "./ShareBar";
import GuardianInsight from "./GuardianInsight";
import GiftRecommendations from "./GiftRecommendations";

interface GeneratedMessagesListProps {
  messages: ExtendedGeneratedMessage[];
  isLoading: boolean;
  showGifts: boolean;
  country: string;
  isPensamiento: boolean;
  occasion: Occasion;
  shareParam: string | null;
  onShareAction: (platform: SharePlatform) => boolean;
  onToggleFavorite: (msg: ExtendedGeneratedMessage) => void;
  isFavorite: (content: string) => boolean;
  onEditMessage: (id: string) => void;
  onClearHistory?: () => void;
  onMarkAsUsed?: (msg: ExtendedGeneratedMessage) => void;
}

const GeneratedMessagesList: React.FC<GeneratedMessagesListProps> = ({
  messages,
  isLoading,
  showGifts,
  country,
  isPensamiento,
  occasion,
  shareParam,
  onShareAction,
  onToggleFavorite,
  isFavorite,
  onEditMessage,
  onClearHistory,
  onMarkAsUsed,
}) => {
  return (
    <div id="results-section" className="mt-6 space-y-6">
      {isLoading && showGifts && (
        <GiftRecommendations gifts={[]} country={country} isLoading={true} />
      )}

      {messages.map((msg) => {
        const isError = msg.content === AI_ERROR_FALLBACK;
        const isFav = isFavorite(msg.content);

        return (
          <div
            key={msg.id}
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 animate-fade-in-up shadow-sm relative overflow-hidden ${
              isPensamiento ? "text-center border-blue-200 dark:border-blue-700" : ""
            }`}
          >
            <div className="mb-8 relative z-10 group">
              <p
                className={`text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap ${
                  isPensamiento
                    ? "text-xl md:text-2xl italic text-center"
                    : "text-base md:text-lg"
                } ${msg.isError ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30" : ""}`}
              >
                {msg.content}
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-5 ml-1 align-middle bg-blue-600 dark:bg-blue-400 animate-pulse" />
                )}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {msg.usedLexicalDNA && (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 animate-fade-in select-none">
                    <span className="text-xs">✨</span>
                    <span>Este mensaje incluye tu toque personal</span>
                  </div>
                )}
                {msg.isUsed && (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full border border-green-100 dark:border-green-800 animate-fade-in select-none">
                    <span className="text-xs">✓</span>
                    <span>Usado</span>
                  </div>
                )}
              </div>

              {!isError && (
                <button
                  onClick={() => onEditMessage(msg.id)}
                  className="absolute top-0 right-0 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                  title="Editar mensaje"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <ShareBar
                  content={msg.content}
                  platforms={occasion.allowedPlatforms}
                  onAction={(platform) => {
                    if (onMarkAsUsed) onMarkAsUsed(msg);
                    return onShareAction(platform);
                  }}
                  disabled={isError || isLoading}
                  className="animate-fade-in-up flex-1"
                  highlightedPlatform={shareParam}
                />

                {!isError && (
                  <button
                    onClick={() => onToggleFavorite(msg)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isFav
                        ? "bg-red-50 text-red-500"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-400"
                    }`}
                    title="Guardar en favoritos"
                  >
                    <span
                      className={`text-2xl ${isFav ? "scale-110" : "scale-100"}`}
                    >
                      {isFav ? "❤️" : "🤍"}
                    </span>
                  </button>
                )}
              </div>

              {!isPensamiento && (
                <div className="mt-6 flex flex-col gap-1 w-full text-left">
                  <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                    Aviso legal
                  </span>
                  <p className="text-[10px] text-slate-300 dark:text-slate-600 leading-tight">
                    Tú decides cómo usar este mensaje. No somos responsables de
                    las consecuencias sociales de su envío.
                  </p>
                </div>
              )}

              {/* Guardian Insight Component */}
              {msg.guardianInsight && (
                <GuardianInsight insight={msg.guardianInsight} />
              )}

              {/* Sección de Regalos */}
              {msg.gifts && msg.gifts.length > 0 && (
                <GiftRecommendations gifts={msg.gifts} country={country} />
              )}
            </div>
          </div>
        );
      })}

      {messages.length > 0 && onClearHistory && (
        <div className="flex justify-center mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
          <button
            onClick={onClearHistory}
            className="text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <span>🗑️</span> Limpiar historial
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneratedMessagesList;