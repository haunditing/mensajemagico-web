import React, { useState } from "react";
import { SharePlatform } from "../types";
import { executeShare, isNativeShareSupported } from "../services/shareService";
import { useToast } from "../context/ToastContext";

// Componentes SVG para los logos reales de las plataformas
const Icons = {
  WhatsApp: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  Instagram: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  Facebook: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Telegram: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.62 4.532-.87 5.92-.106.586-.323.782-.533.801-.456.042-.8-.3-.1.24-.782-.442-1.252-.733-1.907-1.096-1.033-.567-2.025-.878-2.92-1.536-1.157-.852.128-1.32.253-1.45.32-.33 3.016-2.77 3.07-3.003.007-.03.013-.145-.056-.205-.07-.06-.172-.04-.247-.023-.105.024-1.78 1.14-5.025 3.32-.476.327-.908.487-1.294.478-.426-.01-1.244-.241-1.853-.438-.747-.242-1.342-.37-1.29-.782.027-.215.324-.435.89-.66 3.484-1.517 5.807-2.518 6.97-3.002 3.313-1.378 4.001-1.617 4.451-1.625z" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
    </svg>
  ),
  Copy: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  Mail: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  SMS: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  Share: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  ),
};

interface ShareBarProps {
  content: string;
  platforms?: SharePlatform[];
  className?: string;
  disabled?: boolean;
  onAction?: (platform: SharePlatform) => boolean | Promise<boolean>;
  highlightedPlatform?: string | null;
}

const ShareBar: React.FC<ShareBarProps> = ({
  content,
  platforms,
  className = "",
  disabled = false,
  onAction,
  highlightedPlatform,
}) => {
  const [activeAction, setActiveAction] = useState<SharePlatform | null>(null);
  const { showToast } = useToast();

  // Configuraciones visuales por plataforma
  const platformConfig: Record<
    SharePlatform,
    { icon: React.ReactNode; label: string; color: string; bg: string }
  > = {
    [SharePlatform.WHATSAPP]: {
      icon: <Icons.WhatsApp />,
      label: "Compartir por WhatsApp",
      color: "text-[#25D366]",
      bg: "bg-[#25D366]/10 hover:bg-[#25D366]/20",
    },
    [SharePlatform.INSTAGRAM]: {
      icon: <Icons.Instagram />,
      label: "Compartir en Instagram",
      color: "text-[#E4405F]",
      bg: "bg-[#E4405F]/10 hover:bg-[#E4405F]/20",
    },
    [SharePlatform.FACEBOOK]: {
      icon: <Icons.Facebook />,
      label: "Compartir en Facebook",
      color: "text-[#1877F2]",
      bg: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20",
    },
    [SharePlatform.TELEGRAM]: {
      icon: <Icons.Telegram />,
      label: "Compartir por Telegram",
      color: "text-[#24A1DE]",
      bg: "bg-[#24A1DE]/10 hover:bg-[#24A1DE]/20",
    },
    [SharePlatform.X]: {
      icon: <Icons.X />,
      label: "Compartir en X",
      color: "text-slate-900",
      bg: "bg-slate-100 hover:bg-slate-200",
    },
    [SharePlatform.EMAIL]: {
      icon: <Icons.Mail />,
      label: "Enviar por Email",
      color: "text-slate-500",
      bg: "bg-slate-100 hover:bg-slate-200",
    },
    [SharePlatform.SMS]: {
      icon: <Icons.SMS />,
      label: "Enviar por SMS",
      color: "text-indigo-500",
      bg: "bg-indigo-50 hover:bg-indigo-100",
    },
    [SharePlatform.COPY]: {
      icon: <Icons.Copy />,
      label: "Copiar al portapapeles",
      color: "text-slate-700",
      bg: "bg-slate-100 hover:bg-slate-200",
    },
    [SharePlatform.NATIVE]: {
      icon: <Icons.Share />,
      label: "Otras opciones de envío",
      color: "text-blue-600",
      bg: "bg-blue-50 hover:bg-blue-100",
    },
  };

  const defaultPlatforms = [
    SharePlatform.WHATSAPP,
    SharePlatform.TELEGRAM,
    SharePlatform.COPY,
  ];

  if (isNativeShareSupported()) {
    defaultPlatforms.unshift(SharePlatform.NATIVE);
  }

  const activePlatforms = platforms || defaultPlatforms;

  const handleAction = async (platform: SharePlatform) => {
    if (disabled) return;

    if (onAction) {
      const shouldProceed = await onAction(platform);
      if (!shouldProceed) return;
    }

    setActiveAction(platform);
    await executeShare(platform, content);

    if (platform === SharePlatform.COPY) {
      showToast("Enlace copiado al portapapeles", "success");
    }

    setTimeout(() => setActiveAction(null), 2000);
  };

  return (
    <div
      className={`w-full ${className} ${disabled ? "opacity-40 grayscale pointer-events-none" : ""}`}
    >
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center sm:text-left">
        {disabled ? "Opciones desactivadas" : "Enviar Mensaje"}
      </p>
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
        {activePlatforms.map((platform) => {
          const config = platformConfig[platform];
          if (!config) return null;

          const isProcessing = activeAction === platform;
          const isHighlighted = highlightedPlatform && config.label.toLowerCase().includes(highlightedPlatform.toLowerCase());

          return (
            <button
              key={platform}
              disabled={disabled}
              onClick={() => handleAction(platform)}
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-90 border border-transparent shrink-0
                ${config.bg} ${config.color} 
                ${isProcessing ? "ring-2 ring-offset-1 ring-current scale-105" : ""}
                ${isHighlighted ? "ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-110 z-10" : ""}
                ${disabled ? "cursor-not-allowed" : ""}
              `}
              title={config.label}
              aria-label={config.label}
            >
              {isProcessing && platform === SharePlatform.COPY ? (
                <span className="text-lg animate-bounce">✅</span>
              ) : (
                <span className="flex items-center justify-center">
                  {config.icon}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ShareBar;
