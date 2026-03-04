import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { OCCASIONS, TONES, RELATIONSHIPS } from '../constants';
import { Sparkles, Users, Calendar, MessageCircle, ArrowRight, X, Copy, Send, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { generateMessageStream } from '../services/geminiService';
import type { MessageConfig } from '../types';
import { Tone } from '../types';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: QuickStartConfig) => void;
}

export interface QuickStartConfig {
  relationship: string;
  occasion: string;
  tone: string;
}

const QUICK_RELATIONSHIPS = [
  { id: 'pareja', label: 'Tu pareja', icon: '❤️' },
  { id: 'amigo', label: 'Un amigo', icon: '👥' },
  { id: 'familia', label: 'Tu familia', icon: '👨‍👩‍👧‍👦' },
  { id: 'colega', label: 'Un colega', icon: '💼' },
];

const QUICK_OCCASIONS = [
  { id: 'pensamiento', label: 'Pensamiento', icon: '💭' },
  { id: 'amor', label: 'Amor', icon: '💖' },
  { id: 'birthday', label: 'Cumpleaños', icon: '🎂' },
  { id: 'perdoname', label: 'Perdóname', icon: '🙏' },
];

// Mapeo de IDs a slugs reales de ocasiones
const OCCASION_ID_TO_SLUG: Record<string, string> = {
  'pensamiento': 'pensamiento',
  'responder': 'responder',
  'amor': 'amor',
  'birthday': 'birthday',
  'anniversary': 'anniversary',
  'perdoname': 'perdoname',
};

const QUICK_TONES = [
  { id: 'profundo', label: 'Profundo', description: 'Reflexivo y significativo', icon: '🤔' },
  { id: 'formal', label: 'Formal', description: 'Profesional y respetuoso', icon: '👔' },
  { id: 'divertido', label: 'Divertido', description: 'Con humor y alegre', icon: '😄' },
];

// Mapeo de IDs de UI a valores de Tone enum
const TONE_ID_TO_ENUM: Record<string, Tone> = {
  'profundo': Tone.PROFOUND,
  'formal': Tone.FORMAL,
  'divertido': Tone.FUNNY,
};

const getCleanContent = (content: string) => {
  if (!content) return "";
  try {
    const cleanText = content.replace(/```json/g, "").replace(/```/g, "").trim();
    if (cleanText.startsWith("{")) {
      const parsed = JSON.parse(cleanText);
      if (parsed.generated_messages && Array.isArray(parsed.generated_messages)) {
        return parsed.generated_messages[0]?.content || cleanText;
      }
      if (parsed.message) return parsed.message;
    }
    return cleanText;
  } catch (e) {
    return content;
  }
};

const QuickStartModal: React.FC<QuickStartModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<Partial<QuickStartConfig>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Track modal open
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'quickstart_modal_open', {
          event_category: 'onboarding',
        });
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNext = async (key: keyof QuickStartConfig, value: string) => {
    const updatedConfig = { ...config, [key]: value };
    setConfig(updatedConfig);
    
    // Track step completion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', `quickstart_step${step}_completed`, {
        event_category: 'onboarding',
        event_label: value,
      });
    }

    if (step < 3) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsAnimating(false);
      }, 300);
    } else if (step === 3) {
      // Step 3 -> Step 4: Generate message
      setIsAnimating(true);
      setTimeout(async () => {
        setStep(4);
        setIsAnimating(false);
        await generateMessageForQuickStart(updatedConfig as QuickStartConfig);
      }, 300);
    }
  };

  const generateMessageForQuickStart = async (finalConfig: QuickStartConfig) => {
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedMessage(''); // Limpiar mensaje previo

    try {
      // Mapear ID de ocasión a slug
      const occasionSlug = OCCASION_ID_TO_SLUG[finalConfig.occasion];
      
      if (!occasionSlug) {
        throw new Error(`Ocasión inválida: ${finalConfig.occasion}`);
      }

      // Mapear ID de tono a valor de Tone enum
      const toneEnum = TONE_ID_TO_ENUM[finalConfig.tone];
      
      if (!toneEnum) {
        throw new Error(`Tono inválido: ${finalConfig.tone}`);
      }

      const messageConfig: MessageConfig = {
        occasion: occasionSlug,
        relationship: finalConfig.relationship,
        tone: toneEnum,
        contextWords: [],
      };

      // Usar streaming para mejor UX (mismo generador que Generator principal)
      const { content } = await generateMessageStream(
        messageConfig,
        (token) => {
          setGeneratedMessage((prev) => prev + token);
        }
      );

      setGeneratedMessage(getCleanContent(content));

      // Track generation success
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'quickstart_message_generated', {
          event_category: 'onboarding',
          relationship: finalConfig.relationship,
          occasion: finalConfig.occasion,
          tone: finalConfig.tone,
        });
      }

      // Mark has_generated_message for future checks
      localStorage.setItem('has_generated_message', 'true');
    } catch (error) {
      console.error('Error generating message:', error);
      setGenerationError('No pudimos generar el mensaje. Intenta de nuevo.');
      
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'quickstart_generation_error', {
          event_category: 'onboarding',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'quickstart_message_copied', {
          event_category: 'onboarding',
        });
      }
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(generatedMessage);
    window.open(`https://wa.me/?text=${text}`, '_blank');

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quickstart_message_shared_whatsapp', {
        event_category: 'onboarding',
      });
    }
  };

  const handleRegenerate = async () => {
    if (config.relationship && config.occasion && config.tone) {
      await generateMessageForQuickStart(config as QuickStartConfig);
      
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'quickstart_message_regenerated', {
          event_category: 'onboarding',
        });
      }
    }
  };

  const handleFinish = () => {
    const finalConfig = config as QuickStartConfig;
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quickstart_completed', {
        event_category: 'onboarding',
        relationship: finalConfig.relationship,
        occasion: finalConfig.occasion,
        tone: finalConfig.tone,
      });
    }

    // Store in sessionStorage for future reference
    sessionStorage.setItem('quickstart_config', JSON.stringify(finalConfig));
    
    // Set flags BEFORE emitting event so TrialOnboardingModal sees them
    sessionStorage.setItem('show_trial_after_quickstart', 'true');
    localStorage.setItem('quickstart_completed', 'true');
    localStorage.setItem('has_generated_message', 'true');
    
    // Emit custom event for TrialOnboardingModal to listen
    window.dispatchEvent(new CustomEvent('quickstart_completed'));
    
    onComplete(finalConfig);
    onClose();
  };

  const handleBack = () => {
    if (step > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quickstart_skipped', {
        event_category: 'onboarding',
        step: step,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // FORCE RENDER FOR TESTING - REMOVE LATER
  const forceRender = new URLSearchParams(window.location.search).has('force-quickstart');
  const shouldRender = isOpen || forceRender;

  const content = shouldRender && (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[109] bg-black/30 dark:bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
        aria-hidden="true"
      />
      
      {/* Modal Container - Centered in user's visible viewport */}
      <div className="pointer-events-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-[calc(100vw-1.5rem)] sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[70vh] sm:max-h-[75vh] overflow-hidden">
          {/* Header */}
          <div className="relative flex-shrink-0 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 dark:from-purple-700 dark:via-pink-700 dark:to-rose-700 px-4 sm:px-5 py-4 sm:py-5 text-white text-center overflow-hidden">
            {/* Decorative animated elements */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              <div className="p-0.5 bg-white/20 rounded">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                ¡Tu mensaje mágico!
              </h2>
            </div>
            
            {/* Progress bar */}
            <div className="relative z-10 w-full h-0.5 sm:h-1 bg-white/20 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-white transition-all duration-500 ease-out"
                style={{ inlineSize: `${progress}%` }}
              />
            </div>
            
            <p className="relative z-10 text-white/80 text-xs mt-1.5">
              Paso {step}/{totalSteps}
            </p>
          </div>

          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className={`p-4 sm:p-5 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              {step === 1 && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      ¿A quién?
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {QUICK_RELATIONSHIPS.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => handleNext('relationship', rel.id)}
                        className="group relative p-2 sm:p-3 border-2 border-gray-200 dark:border-gray-700 rounded sm:rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                          <span className="text-lg sm:text-2xl">{rel.icon}</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-center line-clamp-2">
                            {rel.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      ¿Qué ocasión?
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {QUICK_OCCASIONS.map((occ) => (
                      <button
                        key={occ.id}
                        onClick={() => handleNext('occasion', occ.id)}
                        className="group relative p-2 sm:p-3 border-2 border-gray-200 dark:border-gray-700 rounded sm:rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                          <span className="text-lg sm:text-2xl">{occ.icon}</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-center line-clamp-2">
                            {occ.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleBack}
                    className="w-full py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    &larr; Volver
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      ¿Qué tono?
                    </h3>
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    {QUICK_TONES.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => handleNext('tone', tone.id)}
                        className="group relative w-full p-2 sm:p-3 border-2 border-gray-200 dark:border-gray-700 rounded sm:rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-base sm:text-xl">{tone.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                              {tone.label}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate hidden sm:block">
                              {tone.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleBack}
                    className="w-full py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    &larr; Volver
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      ¡Aquí está tu mensaje!
                    </h3>
                  </div>

                  {/* Loading State */}
                  {isGenerating && (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400 animate-spin mb-3" />
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                        Creando tu mensaje mágico...
                      </p>
                    </div>
                  )}

                  {/* Error State */}
                  {generationError && !isGenerating && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 mb-2">
                            {generationError}
                          </p>
                          <button
                            onClick={handleRegenerate}
                            className="text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline"
                          >
                            Intentar de nuevo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success State */}
                  {generatedMessage && !isGenerating && (
                    <>
                      {/* Message Display */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                          {generatedMessage}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all duration-200"
                        >
                          {copied ? (
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                          )}
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {copied ? 'Copiado' : 'Copiar'}
                          </span>
                        </button>

                        <button
                          onClick={handleWhatsApp}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:shadow-md transition-all duration-200"
                        >
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            WhatsApp
                          </span>
                        </button>
                      </div>

                      {/* Regenerate & Finish */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleRegenerate}
                          disabled={isGenerating}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            Generar otro
                          </span>
                        </button>

                        <button
                          onClick={handleFinish}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          ¡Listo! 🎉
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer hint */}
          <div className="flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2.5 sm:p-3 text-center border border-purple-200 dark:border-purple-800/30">
              <p className="text-xs text-purple-900 dark:text-purple-200">
                💡 <button onClick={handleSkip} className="underline font-medium hover:text-purple-700 dark:hover:text-purple-300">Explorar opciones</button>
              </p>
            </div>
          </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

export default QuickStartModal;
