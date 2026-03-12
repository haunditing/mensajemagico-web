// components/PostGenerator.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { usePostGenerator, SupportedPlatform } from '../hooks/usePostGenerator';
import { PostCreationPayload } from '../services/social/types';
import { useAuth } from '../context/AuthContext';
import { useUpsell } from '../context/UpsellContext';
import PlanManager from '../services/PlanManager';
import { AlertCircle, Download } from 'lucide-react';
import PublicationInstructions, { triggerPDFDownload } from './PublicationInstructions';
import CommercialGuardAlert from './CommercialGuardAlert';
import { checkCommercialIntent, CommercialGuardResult } from '../services/social/commercialGuard';
import FeatureGuard from './FeatureGuard';
import { canGenerate, recordGeneration } from '../services/usageControlService';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTelegram,
  FaWhatsapp,
  FaXTwitter,
} from 'react-icons/fa6';
import LoadingSpinner from './LoadingSpinner';

type PlatformMeta = {
  id: SupportedPlatform;
  label: string;
  hint: string;
  icon: React.ReactNode;
  card: string;
  cardSelected: string;
  resultAccent: string;
  submit: string;
};

const PLATFORM_ICON_SIZE = 18;

const PLATFORM_META: Record<SupportedPlatform, PlatformMeta> = {
  whatsapp: {
    id: 'whatsapp',
    label: 'WhatsApp',
    hint: 'Chat directo y cercano',
    icon: <FaWhatsapp size={PLATFORM_ICON_SIZE} />,
    card: 'border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400',
    cardSelected:
      'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm',
    resultAccent: 'border-emerald-300 dark:border-emerald-800/80',
    submit: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    hint: 'Caption + visual hook',
    icon: <FaInstagram size={PLATFORM_ICON_SIZE} />,
    card: 'border-fuchsia-200 dark:border-fuchsia-900/50 hover:border-fuchsia-400',
    cardSelected:
      'border-fuchsia-500 bg-fuchsia-50/80 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 shadow-sm',
    resultAccent: 'border-fuchsia-300 dark:border-fuchsia-800/80',
    submit: 'bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-600/20',
  },
  twitter: {
    id: 'twitter',
    label: 'X',
    hint: 'Hilo breve con gancho',
    icon: <FaXTwitter size={PLATFORM_ICON_SIZE} />,
    card: 'border-slate-300 dark:border-slate-700 hover:border-slate-500',
    cardSelected:
      'border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm',
    resultAccent: 'border-slate-400 dark:border-slate-700',
    submit: 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/20',
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    hint: 'Post profesional',
    icon: <FaLinkedinIn size={PLATFORM_ICON_SIZE} />,
    card: 'border-sky-200 dark:border-sky-900/50 hover:border-sky-400',
    cardSelected:
      'border-sky-500 bg-sky-50/80 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 shadow-sm',
    resultAccent: 'border-sky-300 dark:border-sky-800/80',
    submit: 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20',
  },
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    hint: 'Post social con CTA',
    icon: <FaFacebookF size={PLATFORM_ICON_SIZE} />,
    card: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-400',
    cardSelected:
      'border-blue-500 bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm',
    resultAccent: 'border-blue-300 dark:border-blue-800/80',
    submit: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
  },
  telegram: {
    id: 'telegram',
    label: 'Telegram',
    hint: 'Canal claro y rapido',
    icon: <FaTelegram size={PLATFORM_ICON_SIZE} />,
    card: 'border-cyan-200 dark:border-cyan-900/50 hover:border-cyan-400',
    cardSelected:
      'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 shadow-sm',
    resultAccent: 'border-cyan-300 dark:border-cyan-800/80',
    submit: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20',
  },
};

// --- Sub-componentes para una UI más limpia ---

const PlatformSelector = ({ value, onChange }: { value: SupportedPlatform, onChange: (p: SupportedPlatform) => void }) => {
  const platforms: PlatformMeta[] = [
    PLATFORM_META.whatsapp,
    PLATFORM_META.instagram,
    PLATFORM_META.twitter,
    PLATFORM_META.linkedin,
    PLATFORM_META.facebook,
    PLATFORM_META.telegram,
  ];

  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Plataforma objetivo</label>
      <div className="grid grid-cols-6 sm:grid-cols-2 gap-2 sm:gap-2.5">
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            type="button"
            className={`w-full flex items-center justify-center sm:justify-start sm:text-left px-1 py-3 sm:px-3 sm:py-3 rounded-xl border transition-all bg-white dark:bg-slate-900 ${value === p.id ? p.cardSelected : `${p.card} text-slate-700 dark:text-slate-300`}`}
            title={p.label}
          >
            <div className="flex items-center sm:items-start gap-2">
              <span className="text-2xl sm:text-lg leading-none sm:mt-0.5">{p.icon}</span>
              <div className="hidden sm:block">
                <div className="text-sm font-bold">{p.label}</div>
                <div className="text-xs opacity-80">{p.hint}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const PostResultDisplay = ({ post, platform }: { post: any, platform: SupportedPlatform }) => {
  if (!post) return null;

  const meta = PLATFORM_META[platform];

  return (
    <div className="mt-8 space-y-4 animate-fade-in">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Contenido listo para {meta.label} ✨</h3>
      
      {post.mainContent && (
        <div className={`p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50 ${meta.resultAccent}`}>
          <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300 mb-2">Texto Principal</h4>
          <pre className="whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200 text-sm">{post.mainContent}</pre>
        </div>
      )}
      
      {post.hashtags && post.hashtags.length > 0 && (
        <div className={`p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50 ${meta.resultAccent}`}>
          <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300 mb-2">Hashtags Sugeridos</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{post.hashtags.join(' ')}</p>
        </div>
      )}

      {post.visualSuggestion && (
        <div className={`p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50 ${meta.resultAccent}`}>
          <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300 mb-2">Idea Visual</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{post.visualSuggestion}</p>
        </div>
      )}

      {post.callToAction && (
        <div className={`p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50 ${meta.resultAccent}`}>
          <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300 mb-2">Cierre sugerido</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{post.callToAction}</p>
        </div>
      )}
    </div>
  );
};


// --- Componente Principal ---

const PostGenerator: React.FC = () => {
  const { user, planLevel } = useAuth();
  const { isLoading, error, post, generatePost, clearPost } = usePostGenerator();
  const { triggerUpsell } = useUpsell();

  // Estado local para los inputs del formulario
  const [platform, setPlatform] = useState<SupportedPlatform>('whatsapp');
  const [theme, setTheme] = useState('la superación personal');
  const [tone, setTone] = useState('divertido'); // Tono válido para todos los planes
  const [intention, setIntention] = useState('Contar una Historia');
  const [lastGeneratedPayload, setLastGeneratedPayload] =
    useState<PostCreationPayload | null>(null);
  const [lastGeneratedPlatform, setLastGeneratedPlatform] =
    useState<SupportedPlatform | null>(null);
  const [guardianBlock, setGuardianBlock] = useState<CommercialGuardResult | null>(null);
  const [dailyLimitError, setDailyLimitError] = useState<string | null>(null);
  const [guestDailyCount, setGuestDailyCount] = useState(() => {
    const dailyKey = `usage_daily_${new Date().toISOString().split('T')[0]}`;
    return Number(localStorage.getItem(dailyKey) || 0);
  });
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const guardianDismissedRef = React.useRef(false);
  const isAutoSwitchingRef = React.useRef(false);
  const selectedPlatformMeta = PLATFORM_META[platform];

  // Limpiar todo el estado de generación (Opción A)
  const clearAll = useCallback(() => {
    clearPost();
    setLastGeneratedPayload(null);
    setLastGeneratedPlatform(null);
    setInstructionsOpen(false);
  }, [clearPost]);

  // Interceptar navegación hacia atrás (botón Back del browser)
  // cuando las instrucciones están abiertas
  React.useEffect(() => {
    if (!instructionsOpen || !post) return;

    const handlePopState = (e: PopStateEvent) => {
      // Reempujar el estado para no perder la página actual
      window.history.pushState(null, '', window.location.href);
      setShowExitModal(true);
    };

    // Empujar un estado extra para capturar el popstate
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [instructionsOpen, post]);

  // Obtener tonos permitidos según el plan
  const allowedTones = useMemo(() => {
    const exclusiveTones = PlanManager.getPlanFeature(planLevel, 'access.exclusive_tones');
    // Si es "all" o array, devolvemos lo que está permitido
     // Default para guest cuando PlanManager aún no está inicializado
     const DEFAULT_GUEST_TONES = ['romántico', 'divertido', 'corto', 'formal', 'profundo'];
   
     // Si planLevel es premium, todas las opciones están permitidas
     if (planLevel === 'premium' || exclusiveTones === 'all') {
       return ['inspirador', 'reflexivo', 'divertido', 'motivador', 'formal', 'poético', 'directo', 'sincero', 'provocador'];
     }
   
     // Si es un array, devolverlo. Si es undefined o vacío, usar default de guest
     if (Array.isArray(exclusiveTones) && exclusiveTones.length > 0) {
       return exclusiveTones;
     }
   
     // Fallback: si PlanManager aún no está inicializado y el usuario es guest, usar defaults
     if (planLevel === 'guest' && !exclusiveTones) {
       return DEFAULT_GUEST_TONES;
    }
    return [];
  }, [planLevel]);

  // Obtener límite diario
  const dailyLimit = useMemo(() => {
    const configuredLimit = PlanManager.getPlanFeature(planLevel, 'access.daily_limit');
    if (typeof configuredLimit === 'number' && configuredLimit > 0) {
      return configuredLimit;
    }
    // Fallback seguro para guest cuando PlanManager aún no inicializa
    if (planLevel === 'guest') return 1;
    return 0;
  }, [planLevel]);

  // Verificar si el usuario está en el límite
  const isAtDailyLimit = useMemo(() => {
    if (!user) {
      return planLevel === 'guest' ? guestDailyCount >= dailyLimit : false;
    }
    return user.usage.generationsCount >= dailyLimit;
  }, [user, dailyLimit, planLevel, guestDailyCount]);

  // Bloquear navegación si las instrucciones están abiertas con un post activo
  // NOTA: useBlocker requiere data router; usamos popstate listener en su lugar.

  // Auto-resetear tono si el plan cambia y el tono actual ya no está permitido
  const TONE_OPTIONS = ['inspirador', 'reflexivo', 'divertido', 'motivador', 'formal', 'poético', 'directo', 'sincero', 'provocador'];
  React.useEffect(() => {
    if (planLevel === 'premium') return;
    if (allowedTones.length === 0) return; // PlanManager aún no cargado
    if (!allowedTones.includes(tone)) {
      const firstAllowed = TONE_OPTIONS.find(t => allowedTones.includes(t)) || allowedTones[0];
      setTone(firstAllowed);
      if (post) clearAll();
    }
  }, [allowedTones, planLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    try {
      const quickStartConfig = sessionStorage.getItem('quickstart_config');
      if (!quickStartConfig) return;

      const config = JSON.parse(quickStartConfig);
      if (config.occasion !== 'pensamiento') return;

      const relationshipToTheme: Record<string, string> = {
        pareja: 'amor propio y vínculos sanos',
        amigo: 'amistad, lealtad y gratitud',
        familia: 'hogar, raíces y aprendizaje',
        colega: 'crecimiento profesional con propósito',
      };

      const quickToneMap: Record<string, string> = {
        profundo: 'profundo',
        formal: 'formal',
        divertido: 'divertido',
      };

      const quickIntentionMap: Record<string, string> = {
        profundo: 'Contar una Historia',
        formal: 'Educar',
        divertido: 'Generar Debate',
      };

      setTheme(relationshipToTheme[config.relationship] || theme);
      setTone(quickToneMap[config.tone] || tone);
      setIntention(quickIntentionMap[config.tone] || intention);

      sessionStorage.removeItem('quickstart_config');
    } catch (e) {
      console.error('Error applying quickstart in PostGenerator:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación diaria para invitados (comparte contador con otras ocasiones)
    if (!user) {
      const guestCheck = canGenerate();
      if (!guestCheck.allowed) {
        setDailyLimitError(
          guestCheck.message ||
            'Has alcanzado tu límite diario. Vuelve mañana o mejora tu plan.',
        );
        if (guestCheck.message) {
          triggerUpsell(guestCheck.message);
        }
        return;
      }
    }

    // Validar límite diario
    if (isAtDailyLimit) {
      const limitMsg = PlanManager.getUpsellMessage('on_limit_reached');
      setDailyLimitError(limitMsg);
      triggerUpsell(limitMsg);
      return;
    }
    setDailyLimitError(null);

    // Validar que el tono esté permitido para el plan actual
    if (planLevel !== 'premium' && allowedTones.length > 0 && !allowedTones.includes(tone)) {
      const msg = PlanManager.getUpsellMessage('on_feature_locked') ||
        'Este tono requiere un plan superior. ¡Actualiza para desbloquearlo!';
      triggerUpsell(msg);
      return;
    }

    // Guardian: detectar intención comercial antes de generar
    if (!guardianDismissedRef.current) {
      const guardCheck = checkCommercialIntent(theme, intention);
      if (guardCheck.isCommercial) {
        setGuardianBlock(guardCheck);
        return;
      }
    }
    // Limpiar bloqueo si el usuario corrigió el tema o ya había descartado
    setGuardianBlock(null);
    guardianDismissedRef.current = false;

    const payload: PostCreationPayload = {
      theme,
      tone,
      intention,
      userContext: {
        planLevel: planLevel || 'guest',
        location: (user as any)?.location,
        essenceProfile: (user as any)?.essenceProfile,
      }
    };
    const ok = await generatePost(platform, payload);
    if (!ok) return;

    // Registrar consumo para invitados en contador local diario (global por ocasiones)
    if (!user) {
      recordGeneration();
      setGuestDailyCount((prev) => prev + 1);
    }

    setLastGeneratedPayload(payload);
    setLastGeneratedPlatform(platform);
  };

  React.useEffect(() => {
    if (!post || !lastGeneratedPayload || !lastGeneratedPlatform) return;
    if (platform === lastGeneratedPlatform) return;
    if (isLoading || isAutoSwitchingRef.current) return;

    isAutoSwitchingRef.current = true;

    generatePost(platform, lastGeneratedPayload)
      .then(() => {
        setLastGeneratedPlatform(platform);
      })
      .finally(() => {
        isAutoSwitchingRef.current = false;
      });
  }, [
    platform,
    post,
    lastGeneratedPayload,
    lastGeneratedPlatform,
    isLoading,
    generatePost,
  ]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Generador de Posts para Redes Sociales</h2>
          
          <PlatformSelector value={platform} onChange={setPlatform} />
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
            Si cambias la plataforma, adaptamos el ultimo resultado automaticamente.
          </p>

          <div>
            <label htmlFor="theme" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tema del Post</label>
            <input
              type="text"
              id="theme"
              value={theme}
              onChange={e => { setTheme(e.target.value); if (post) clearAll(); }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              placeholder="Ej: El futuro de la inteligencia artificial"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tone" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tono</label>
              <select
                id="tone"
                value={tone}
                onChange={e => { setTone(e.target.value); if (post) clearAll(); }}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {['inspirador', 'reflexivo', 'divertido', 'motivador', 'formal', 'poético', 'directo', 'sincero', 'provocador'].map((t) => {
                  const isAllowed = allowedTones.includes(t);
                  return (
                    <option key={t} value={t} disabled={!isAllowed && planLevel !== 'premium'}>
                      {t} {!isAllowed && planLevel !== 'premium' ? '🔒' : ''}
                    </option>
                  );
                })}
              </select>
              {!allowedTones.includes(tone) && planLevel !== 'premium' && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Este tono requiere plan superior
                </p>
              )}
            </div>

            <div>
              <label htmlFor="intention" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Objetivo del Post</label>
              <select
                id="intention"
                value={intention}
                onChange={e => { setIntention(e.target.value); if (post) clearAll(); }}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="Contar una Historia">Contar una Historia</option>
                <option value="Inspirar">Inspirar</option>
                <option value="Educar">Educar</option>
                <option value="Generar Debate">Generar Debate</option>
                <option value="Entretener">Entretener</option>
                <option value="Informar">Informar</option>
                <option value="Motivar">Motivar</option>
                <option value="Generar Comunidad">Generar Comunidad</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isAtDailyLimit}
            className={`w-full h-12 px-6 text-white font-bold rounded-lg flex items-center justify-center transition-colors shadow-lg disabled:bg-slate-400 ${selectedPlatformMeta.submit}`}
          >
            {isLoading ? <LoadingSpinner /> : isAtDailyLimit ? `Límite diario alcanzado (${user ? user.usage.generationsCount : guestDailyCount}/${dailyLimit})` : `Generar para ${selectedPlatformMeta.label}`}
          </button>
        </form>

        {/* Error de límite diario */}
        {dailyLimitError && (
          <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60">
            <AlertCircle size={16} className="mt-0.5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{dailyLimitError}</p>
          </div>
        )}

        {/* Guardian — bloqueo por intención comercial */}
        {guardianBlock && (
          <CommercialGuardAlert
            result={guardianBlock}
            onDismiss={() => {
              guardianDismissedRef.current = true;
              setGuardianBlock(null);
            }}
          />
        )}

        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

        <PostResultDisplay post={post} platform={platform} />

        <PublicationInstructions
          platform={platform}
          post={post}
          isPremium={planLevel === 'premium'}
          isGuest={!user}
          isOpen={instructionsOpen}
          onToggle={setInstructionsOpen}
        />
      </div>

      {/* Modal: advertencia al navegar con instrucciones abiertas */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl leading-none">📖</span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">¿Guardar instrucciones antes de salir?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Tienes las instrucciones de publicación abiertas. Puedes descargarlas como PDF antes de cambiar de sección.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (post) triggerPDFDownload(platform, post);
                  setShowExitModal(false);
                  // Dejar que el usuario navegue normalmente
                  window.history.go(-1);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-colors"
              >
                <Download size={14} />
                Descargar PDF y salir
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  window.history.go(-1);
                }}
                className="w-full px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors"
              >
                Salir sin guardar
              </button>
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="w-full px-4 py-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostGenerator;
