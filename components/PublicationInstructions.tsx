// components/PublicationInstructions.tsx
import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Copy, Download, Lock, Lightbulb, CheckCircle2 } from 'lucide-react';
import { SupportedPlatform } from '../hooks/usePostGenerator';
import { StructuredPost } from '../services/social/types';
import { useUpsell } from '../context/UpsellContext';
import { getPublicationGuideUpsell, getLockedOccasionBadge } from '../services/accessCopy';

// ─────────────────────────────────────────────────────────
// Tipos de datos
// ─────────────────────────────────────────────────────────

type InjectKey = 'mainContent' | 'hashtags' | 'callToAction' | 'visualSuggestion';

interface PublicationStep {
  icon: string;
  title: string;
  description: string;
  inject?: InjectKey;
  /** Fragmento destacado si inject no aplica a todo el campo, solo a parte del texto */
  injectTransform?: (value: string) => string;
}

interface PublicationGuide {
  bestTime: string;
  proTip: string;
  frequencySuggestion: string;
  steps: PublicationStep[];
}

// ─────────────────────────────────────────────────────────
// Guías por plataforma — estrategia de marketing real
// ─────────────────────────────────────────────────────────

const GUIDES: Record<SupportedPlatform, PublicationGuide> = {
  instagram: {
    bestTime: 'Martes y miércoles · 9am–11am o 6pm–8pm',
    proTip:
      'Responde los primeros comentarios dentro de los 30 min posteriores a la publicación — el algoritmo de Instagram amplifica el alcance si hay actividad temprana.',
    frequencySuggestion: '4–5 veces por semana para feeds, 1–2 Stories diarias',
    steps: [
      {
        icon: '🖼️',
        title: 'Prepara el recurso visual',
        description:
          'Selecciona o crea la imagen/video antes de subir. La idea visual recomendada para este post es:',
        inject: 'visualSuggestion',
      },
      {
        icon: '📱',
        title: 'Abre Instagram y toca "+"',
        description:
          'En la barra inferior de la app, toca el ícono "+" y elige "Publicación" (feed) o "Reel". Para mayor alcance orgánico, los Reels tienen prioridad en el algoritmo actual.',
      },
      {
        icon: '✏️',
        title: 'Escribe el caption',
        description:
          'En el campo de descripción, pega el siguiente caption generado. Deja el texto exactamente como aparece — incluye saltos de línea para mejor legibilidad:',
        inject: 'mainContent',
      },
      {
        icon: '#️⃣',
        title: 'Agrega los hashtags',
        description:
          'Pega los hashtags al final del caption (separados con un salto de línea) o en tu primer comentario para mantener el caption limpio visualmente:',
        inject: 'hashtags',
      },
      {
        icon: '📍',
        title: 'Configura contexto adicional',
        description:
          'Agrega ubicación si aplica (aumenta el descubrimiento local). Si tienes colaboradores o marcas etiquetadas, añádelos en "Etiquetar personas". Considera activar el texto alternativo (Alt text) en Opciones avanzadas para accesibilidad.',
      },
      {
        icon: '🔔',
        title: 'CTA de cierre',
        description: 'Termina el caption con este llamado a la acción para maximizar la interacción:',
        inject: 'callToAction',
      },
      {
        icon: '✅',
        title: 'Publica o programa',
        description:
          'Si publicas ahora, toca "Compartir". Si quieres programar, usa Instagram Creator Studio o Meta Business Suite para elegir la hora óptima.',
      },
    ],
  },

  whatsapp: {
    bestTime: 'Lunes a viernes · 7am–9am y 7pm–9pm',
    proTip:
      'El Estado de WhatsApp tiene mayor apertura en horario nocturno. Para grupos, limita los mensajes a 2–3 por semana para no saturar.',
    frequencySuggestion: 'Estado: 1 vez al día. Grupos: 2–3 veces por semana',
    steps: [
      {
        icon: '🎯',
        title: 'Define tu destino',
        description:
          'Decide si enviarás este mensaje a: ① un contacto directo, ② un grupo, o ③ tu Estado de WhatsApp. Cada opción tiene un alcance diferente.',
      },
      {
        icon: '📱',
        title: 'Abre WhatsApp',
        description:
          'En tu teléfono o WhatsApp Web. Navega al contacto o grupo destino, o toca el ícono de tu foto en "Estado".',
      },
      {
        icon: '✏️',
        title: 'Escribe o pega el mensaje',
        description: 'Pega el siguiente mensaje en el campo de texto:',
        inject: 'mainContent',
      },
      {
        icon: '😊',
        title: 'Añade un emoji de apertura',
        description:
          'Coloca un emoji relevante al inicio del mensaje — capta la atención visual en la vista previa de la conversación y humaniza el tono.',
      },
      {
        icon: '📎',
        title: 'Adjunta media (opcional)',
        description:
          'Si tienes una imagen o video relacionado, adjúntalo. Los mensajes con media visible tienen mayor tasa de lectura completa.',
      },
      {
        icon: '✅',
        title: 'Envía o publica',
        description:
          'Para Estado: escribe el texto, adjunta media y toca "Enviar al Estado". Para chat: toca el ícono de enviar. Recuerda que el Estado dura 24 horas.',
      },
    ],
  },

  facebook: {
    bestTime: 'Miércoles 11am · Viernes 1pm–3pm',
    proTip:
      'Los posts con imagen o video tienen 3× más engagement que texto solo. Si compartes un enlace, carga una imagen manualmente — la vista previa automática suele ser de menor calidad.',
    frequencySuggestion: '3–5 veces por semana en páginas, 1–2 en perfil personal',
    steps: [
      {
        icon: '💻',
        title: 'Abre Facebook y crea el post',
        description:
          'En tu perfil o página, haz clic en "¿Qué estás pensando?" (perfil) o "Crear publicación" (página de negocios).',
      },
      {
        icon: '✏️',
        title: 'Escribe el contenido',
        description:
          'Pega el siguiente texto en el cuadro de publicación. Incluye saltos de línea tal como aparece:',
        inject: 'mainContent',
      },
      {
        icon: '📷',
        title: 'Agrega imagen o video',
        description:
          'Toca el ícono de "Foto/Video" y sube un recurso visual relacionado con el tema del post.',
      },
      {
        icon: '#️⃣',
        title: 'Incluye los hashtags',
        description: 'Pega los hashtags al final del texto para mejorar el descubrimiento:',
        inject: 'hashtags',
      },
      {
        icon: '🌐',
        title: 'Configura la audiencia',
        description:
          'Selecciona "Público" para máximo alcance, "Amigos" para contenido personal, o elige un "Grupo" específico si el contenido es de nicho.',
      },
      {
        icon: '🔗',
        title: 'CTA de cierre',
        description: 'Asegúrate de incluir este llamado a la acción al final del post:',
        inject: 'callToAction',
      },
      {
        icon: '✅',
        title: 'Publica o programa',
        description:
          'Para publicar ahora, haz clic en "Publicar". Para programar, haz clic en la flecha junto a "Publicar" → "Programar publicación" y elige la fecha y hora óptimas.',
      },
    ],
  },

  twitter: {
    bestTime: 'Lunes a jueves · 9am–10am y 7pm–9pm',
    proTip:
      'El primer tweet/post define el gancho del hilo. Deja la parte más reveladora para el final para obtener más clics en "Ver más". Responde rápido a las replicas en la primera hora.',
    frequencySuggestion: '3–7 tweets por día para cuentas activas',
    steps: [
      {
        icon: '🐦',
        title: 'Abre X y toca "Publicar"',
        description:
          'En la barra lateral (web) o en el ícono de pluma (móvil), inicia un nuevo tweet. Si el contenido es extenso, usa "Agregar otro tweet" para crear un hilo.',
      },
      {
        icon: '✏️',
        title: 'Escribe o pega el contenido',
        description:
          'Pega el texto en el campo de composición. X tiene un límite de 280 caracteres por tweet (2200 con X Premium):',
        inject: 'mainContent',
      },
      {
        icon: '🖼️',
        title: 'Agrega imagen o GIF',
        description:
          'Adjunta un recurso visual (imagen, GIF o video). Los tweets con imagen reciben 150% más interacciones que los de solo texto.',
      },
      {
        icon: '🔗',
        title: '¿Añadir link?',
        description:
          'Si incluyes un enlace, X lo acortará automáticamente (23 caracteres). Colócalo al final del tweet para no interrumpir la lectura.',
      },
      {
        icon: '📣',
        title: 'CTA de cierre',
        description: 'Cierra el hilo o el tweet con este llamado a la acción:',
        inject: 'callToAction',
      },
      {
        icon: '✅',
        title: 'Publica o programa',
        description:
          'Haz clic en "Publicar". Para programar, toca el ícono de reloj debajo del campo de texto antes de publicar.',
      },
    ],
  },

  linkedin: {
    bestTime: 'Martes, miércoles y jueves · 8am–10am y 12pm',
    proTip:
      'LinkedIn favorece el contenido nativo (sin links externos). La estructura Hook + 3 puntos de valor + CTA funciona muy bien. Responde comentarios en las primeras 2 horas para ampliar el alcance.',
    frequencySuggestion: '3–5 veces por semana es suficiente para mantener visibilidad',
    steps: [
      {
        icon: '💼',
        title: 'Abre LinkedIn y crea el post',
        description:
          'En la barra principal, haz clic en "Crear un post" o "Iniciar una publicación". Para mayor alcance, considera usar el formato "Artículo" para contenido extenso.',
      },
      {
        icon: '🎯',
        title: 'Escribe el gancho inicial',
        description:
          'La primera línea es crucial — debe generar curiosidad y motivar a hacer clic en "Ver más". El contenido completo generado es:',
        inject: 'mainContent',
      },
      {
        icon: '📎',
        title: 'Agrega multimedia',
        description:
          'Sube una imagen, video o documento PDF adjunto. Los posts con documento (carrusel) tienen el mayor alcance orgánico en LinkedIn actualmente.',
      },
      {
        icon: '#️⃣',
        title: 'Agrega hashtags al final',
        description:
          'Añade entre 3 y 5 hashtags relevantes. Evita usar demasiados — LinkedIn penaliza el spam de hashtags:',
        inject: 'hashtags',
      },
      {
        icon: '🌐',
        title: 'Configura la visibilidad',
        description:
          'Selecciona "Todos" (público + red) para el máximo alcance. Usa "Solo tu red" únicamente para contenido muy específico de tu industria.',
      },
      {
        icon: '📣',
        title: 'CTA de cierre',
        description:
          'Termina el post con una pregunta o este llamado a la acción para fomentar comentarios (el mayor indicador de alcance en LinkedIn):',
        inject: 'callToAction',
      },
      {
        icon: '✅',
        title: 'Publica o programa',
        description:
          'Haz clic en "Publicar" o usa la flecha desplegable para programar hasta con 3 meses de anticipación. Responde comentarios durante las primeras 2 horas.',
      },
    ],
  },

  telegram: {
    bestTime: 'Cualquier día · 7pm–9pm (hora local de la audiencia)',
    proTip:
      'Telegram entrega el 100% de los mensajes sin filtro de algoritmo. Puedes programar mensajes con clic prolongado en el botón de enviar. Fija el mensaje con contenido importante al tope del canal.',
    frequencySuggestion: '1–2 publicaciones diarias en canales, sin límite predefinido en grupos',
    steps: [
      {
        icon: '📲',
        title: 'Abre Telegram',
        description:
          'Ve a tu canal o grupo en la app de Telegram. Si publicas en un canal, asegúrate de tener permisos de administrador.',
      },
      {
        icon: '✏️',
        title: 'Escribe o pega el mensaje',
        description:
          'Toca el campo de texto y pega el siguiente contenido. Telegram soporta formato Markdown — usa **negrita** y _cursiva_ si quieres destacar partes:',
        inject: 'mainContent',
      },
      {
        icon: '#️⃣',
        title: 'Agrega los hashtags al final',
        description:
          'En Telegram los hashtags son clicables y ayudan a indexar tu contenido dentro del canal:',
        inject: 'hashtags',
      },
      {
        icon: '📎',
        title: 'Adjunta media (opcional)',
        description:
          'Toca el ícono de adjuntar para agregar imagen, video o documento. Telegram admite archivos de hasta 2GB.',
      },
      {
        icon: '✅',
        title: 'Envía o programa',
        description:
          'Toca el ícono de enviar para publicar ahora. Para programar, mantén presionado el botón de enviar y selecciona "Programar mensaje".',
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────
// Función exportada: generar y abrir PDF con instrucciones
// ─────────────────────────────────────────────────────────

export const triggerPDFDownload = (platform: SupportedPlatform, post: StructuredPost): void => {
  const guide = GUIDES[platform];
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

  const stepsHtml = guide.steps
    .map((step, i) => {
      const injectedValue =
        step.inject === 'hashtags' && post.hashtags
          ? post.hashtags.join(' ')
          : step.inject
            ? (post[step.inject as keyof StructuredPost] as string | undefined) ?? ''
            : '';
      const contentBlock =
        step.inject && injectedValue
          ? `<pre class="content-block">${injectedValue.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
          : '';
      return `<div class="step">
        <div class="step-header"><span class="step-num">${i + 1}</span>${step.icon} ${step.title}</div>
        <p>${step.description}</p>
        ${contentBlock}
      </div>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Instrucciones de publicación · ${platformLabel}</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;max-width:680px;margin:0 auto;padding:32px;font-size:13px}
    h1{font-size:18px;color:#4f46e5;margin:0 0 4px}
    .meta{font-size:11px;color:#94a3b8;margin-bottom:20px}
    .info-row{display:flex;gap:24px;flex-wrap:wrap;background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:20px;font-size:11px}
    .step{margin-bottom:14px;padding-left:14px;border-left:2px solid #c7d2fe}
    .step-header{font-weight:700;font-size:12px;margin-bottom:3px}
    .step-num{display:inline-block;width:18px;height:18px;background:#e0e7ff;border-radius:50%;text-align:center;line-height:18px;font-size:10px;color:#4f46e5;margin-right:6px}
    p{color:#475569;margin:2px 0 4px;line-height:1.5}
    .content-block{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:10px;font-size:11px;white-space:pre-wrap;color:#1e293b;margin-top:6px;font-family:inherit}
    .tip{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px;margin-top:20px;color:#92400e}
    .footer{margin-top:28px;font-size:10px;color:#94a3b8;text-align:center;border-top:1px solid #f1f5f9;padding-top:12px}
    @media print{body{padding:0}}
  </style>
</head>
<body>
  <h1>📋 Instrucciones de publicación · ${platformLabel}</h1>
  <div class="meta">Generado con MensajeMágico · ${new Date().toLocaleDateString('es', { dateStyle: 'long' })}</div>
  <div class="info-row">
    <span>🕐 <strong>Mejor horario:</strong> ${guide.bestTime}</span>
    <span>📅 <strong>Frecuencia:</strong> ${guide.frequencySuggestion}</span>
  </div>
  ${stepsHtml}
  <div class="tip">💡 <strong>Pro Tip:</strong> ${guide.proTip}</div>
  <div class="footer">MensajeMágico Premium · mensajemagico.com</div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    // Fallback si el popup fue bloqueado
    const a = document.createElement('a');
    a.href = url;
    a.download = `instrucciones-${platform}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

// ─────────────────────────────────────────────────────────
// Sub-componente: Bloque de contenido inyectado
// ─────────────────────────────────────────────────────────

const InjectedContent = ({
  label,
  value,
  transform,
}: {
  label: string;
  value: string;
  transform?: (v: string) => string;
}) => {
  const [copied, setCopied] = useState(false);
  const display = transform ? transform(value) : value;

  if (!display) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-2 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-900/20 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-100/80 dark:bg-indigo-900/40 border-b border-indigo-200 dark:border-indigo-800/60">
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 size={12} />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
        {display}
      </pre>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Sub-componente: Un paso individual
// ─────────────────────────────────────────────────────────

const StepItem = ({
  step,
  index,
  post,
}: {
  step: PublicationStep;
  index: number;
  post: StructuredPost;
}) => {
  const injectedValue =
    step.inject === 'hashtags' && post.hashtags
      ? post.hashtags.join(' ')
      : step.inject
        ? (post[step.inject] as string | undefined) ?? ''
        : '';

  const injectLabel: Record<InjectKey, string> = {
    mainContent: 'Texto generado',
    hashtags: 'Hashtags',
    callToAction: 'CTA',
    visualSuggestion: 'Idea visual',
  };

  return (
    <div className="flex gap-3">
      {/* Número de paso + línea conectora */}
      <div className="flex flex-col items-center">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700 flex items-center justify-center">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{index + 1}</span>
        </div>
        <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />
      </div>

      {/* Contenido del paso */}
      <div className="pb-5 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base leading-none">{step.icon}</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{step.title}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
        {step.inject && injectedValue && (
          <InjectedContent
            label={injectLabel[step.inject]}
            value={injectedValue}
            transform={step.injectTransform}
          />
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Componente Principal Exportado
// ─────────────────────────────────────────────────────────

interface PublicationInstructionsProps {
  platform: SupportedPlatform;
  post: StructuredPost | null;
  isPremium: boolean;
  isGuest?: boolean;
  /** Modo controlado: estado externo del acordeón */
  isOpen?: boolean;
  /** Modo controlado: callback al abrir/cerrar */
  onToggle?: (open: boolean) => void;
}

const PublicationInstructions: React.FC<PublicationInstructionsProps> = ({
  platform,
  post,
  isPremium,
  isGuest = false,
  isOpen: controlledOpen,
  onToggle,
}) => {
  const { triggerUpsell } = useUpsell();
  const [internalOpen, setInternalOpen] = useState(false);

  // Modo controlado si se pasan props externas, de lo contrario modo interno
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (onToggle) onToggle(val);
    else setInternalOpen(val);
  };

  if (!post) return null;

  const guide = GUIDES[platform];

  const handleToggle = () => {
    if (!isPremium) {
      triggerUpsell(getPublicationGuideUpsell(isGuest));
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4">
      {/* Cabecera / Botón de toggle */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
          isPremium
            ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/40'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <BookOpen
            size={16}
            className={isPremium ? 'text-indigo-500' : 'text-slate-400'}
          />
          <div className="text-left">
            <div
              className={`text-sm font-bold ${
                isPremium
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Instrucciones de publicación
            </div>
            {!isPremium && (
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Guía paso a paso · {isGuest ? 'Disponible al crear tu cuenta' : 'Solo Premium'}
              </div>
            )}
          </div>
          {!isPremium && (
            <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              {getLockedOccasionBadge(isGuest)}
            </span>
          )}
        </div>
        <div className="text-slate-400 dark:text-slate-500">
          {!isPremium ? (
            <Lock size={15} />
          ) : isOpen ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>
      </button>

      {/* Contenido expandido (solo premium) */}
      {isPremium && isOpen && (
        <div className="mt-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-900 overflow-hidden">
          {/* Cabecera con mejores prácticas */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 border-b border-indigo-100 dark:border-indigo-900/50">
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🕐</span>
                <span><strong className="text-slate-700 dark:text-slate-300">Mejor horario:</strong> {guide.bestTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">📅</span>
                <span><strong className="text-slate-700 dark:text-slate-300">Frecuencia:</strong> {guide.frequencySuggestion}</span>
              </div>
            </div>
          </div>

          {/* Pasos */}
          <div className="px-4 pt-5 pb-2">
            {guide.steps.map((step, i) => (
              <StepItem key={i} step={step} index={i} post={post} />
            ))}
          </div>

          {/* Pro Tip */}
          <div className="mx-4 mb-3 flex gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60">
            <Lightbulb size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Pro Tip:</strong> {guide.proTip}
            </p>
          </div>

          {/* Botón Descargar PDF */}
          <div className="mx-4 mb-4">
            <button
              type="button"
              onClick={() => triggerPDFDownload(platform, post)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold transition-colors"
            >
              <Download size={14} />
              Descargar instrucciones como PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationInstructions;
