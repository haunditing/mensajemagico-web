import React from "react";
import { Occasion, Relationship } from "../types";
import { APOLOGY_REASONS, PENSAMIENTO_THEMES } from "../constants";
import { useLocalization } from "../context/LocalizationContext";
import { useAuth } from "../context/AuthContext";
import { useUpsell } from "../context/UpsellContext";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
import UsageBar from "./UsageBar";
import { Link } from "react-router-dom";
import CreateContactModal from "./CreateContactModal";
import GuardianEditorModal from "./GuardianEditorModal";
import { useGenerator } from "../hooks/useGenerator";
import ContextInputSection from "./ContextInputSection";
import ToneSelector from "./ToneSelector";
import GeneratedMessagesList from "./GeneratedMessagesList";
import FormatSelector from "./FormatSelector";
import RelationshipSelector from "./RelationshipSelector";
import GreetingSelector from "./GreetingSelector";
import GuardianObjectiveSelector from "./GuardianObjectiveSelector";
import ReceivedMessageInput from "./ReceivedMessageInput";
import GenerateButton from "./GenerateButton";
import { useOnboarding } from "../context/OnboardingContext";
import OnboardingTooltip, { TooltipColor } from "./OnboardingTooltip";

interface GeneratorProps {
  occasion: Occasion;
  initialRelationship?: Relationship;
  onRelationshipChange?: (relId: string) => void;
}

const Generator: React.FC<GeneratorProps> = ({
  occasion,
  initialRelationship,
  onRelationshipChange,
}) => {
  const { user, remainingCredits, planLevel } = useAuth();
  const { triggerUpsell } = useUpsell();
  const { isFavorite } = useFavorites();
  const { showToast } = useToast();
  const { country } = useLocalization(); // Necesario para pasar a GeneratedMessagesList
  const isPensamiento = occasion.id === "pensamiento";
  const isResponder = occasion.id === "responder";
  const isGreeting = occasion.id === "saludo";
  const isPerdoname = occasion.id === "perdoname";
  const MAX_CHARS = 400;

  const {
    relationshipId,
    setRelationshipId,
    contacts,
    setContacts,
    isContactModalOpen,
    setIsContactModalOpen,
    selectedContactId,
    setSelectedContactId,
    editingMessageId,
    setEditingMessageId,
    showHandAnimation,
    guardianWarning,
    selectedContact,
    currentRelType,
    availableTones,
    suggestedGreeting,
    tone,
    setTone,
    greetingMoment,
    setGreetingMoment,
    receivedMessageType,
    setReceivedMessageType,
    receivedText,
    setReceivedText,
    contextWords,
    setContextWords,
    currentWord,
    setCurrentWord,
    intention,
    setIntention,
    manualIntentionOverride,
    setManualIntentionOverride,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    safetyError,
    setSafetyError,
    usageMessage,
    setUsageMessage,
    showGifts,
    setShowGifts,
    giftBudget,
    setGiftBudget,
    isForPost,
    setIsForPost,
    userLocation,
    guardianDescription,
    shareParam,
    apologyReason,
    setApologyReason,
    isContextLocked,
    MAX_CONTEXT,
    isOccasionLocked,
    handleRelChange,
    addContextWord,
    removeContextWord,
    handleTrendingTopicClick,
    handleKeyDown,
    handleGenerate,
    handleShareAction,
    handleToggleFavorite,
    handleMessageUpdate,
    handleContactCreated,
    handleClearHistory,
    handleMarkAsUsed,
    resetForm,
    handleRegenerate,
  } = useGenerator(occasion, initialRelationship, onRelationshipChange);

  // --- STEPPER LOGIC (Progressive Disclosure) ---
  const [currentStep, setCurrentStep] = React.useState(1);

  // Resetear paso al cambiar de ocasión
  React.useEffect(() => {
    setCurrentStep(1);
  }, [occasion.id]);

  const steps = React.useMemo(() => {
    if (isPensamiento) {
      return [
        { id: 1, label: "Formato" },
        { id: 2, label: "Contexto" },
        { id: 3, label: "Estilo" },
      ];
    }
    return [
      { id: 1, label: "Destinatario" },
      { id: 2, label: "Contexto" },
      { id: 3, label: "Estilo" },
    ];
  }, [isPensamiento]);

  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps;

  // --- ONBOARDING: Lógica del Tour Completo ---
  const { activeTour, currentStepIndex, nextStep } = useOnboarding();
  
  React.useEffect(() => {
    if (activeTour === 'onboarding_tour') {
      // Si viene de la Home (Paso 0), avanzar automáticamente al Paso 1
      if (currentStepIndex === 0) {
        nextStep();
      }
      
      // Sincronizar UI del Generador con el paso del Tour
      // Ahora ambos flujos tienen 3 pasos, la lógica es uniforme
      if (currentStepIndex === 1 && currentStep !== 1) setCurrentStep(1);
      if (currentStepIndex === 2 && currentStep !== 2) setCurrentStep(2);
      if (currentStepIndex === 3 && currentStep !== 3) setCurrentStep(3);
    }
  }, [activeTour, currentStepIndex, isPensamiento, nextStep, currentStep]);

  const canAdvance = React.useMemo(() => {
    if (safetyError) return false;
    if (!isPensamiento && currentStep === 2 && isResponder) {
      return receivedText.trim().length > 0;
    }
    return true;
  }, [safetyError, isPensamiento, currentStep, isResponder, receivedText]);

  // Estado para la animación de sacudida
  const [isShaking, setIsShaking] = React.useState(false);

  const handleNext = () => {
    // Validaciones antes de avanzar
    if (!canAdvance) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Feedback específico
      if (safetyError) {
        showToast("Hay una advertencia de seguridad pendiente. Por favor revísala.", "error");
      } else if (!isPensamiento && currentStep === 2 && isResponder && !receivedText.trim()) {
        showToast("Por favor, escribe el mensaje que recibiste para continuar.", "error");
      }
      return;
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    // Scroll suave al inicio del contenedor para mantener el foco
    document.getElementById("generator-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerateAndReset = async () => {
    const success = await handleGenerate();
    if (success) {
      setCurrentStep(1);
      resetForm();
    }
  };

  // Botón flotante para seguir la escritura si el usuario hace scroll hacia arriba
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      setShowScrollButton(false);
      return;
    }

    const handleScroll = () => {
      const distanceToBottom =
        document.documentElement.scrollHeight -
        (window.innerHeight + window.scrollY);
      setShowScrollButton(distanceToBottom > 150); // Mostrar si está a más de 150px del final
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading]);

  // Estado para controlar qué contacto se está editando
  const [contactToEdit, setContactToEdit] = React.useState<any>(null);

  const handleEditContact = () => {
    if (selectedContact) {
      setContactToEdit(selectedContact);
      setIsContactModalOpen(true);
    }
  };

  const handleEditContactFromMessage = (contactId: string) => {
    const contact = contacts.find((c) => c._id === contactId);
    if (contact) {
      setContactToEdit(contact);
      setIsContactModalOpen(true);
    }
  };

  // Textos dinámicos para el tour según la ocasión
  const getStep1Text = () => {
    if (isPensamiento) return "Define el formato y el tema central de tu reflexión.";
    if (isResponder) return "¿Quién te escribió? El Guardián analizará vuestra relación.";
    if (isGreeting) return "¿A quién quieres saludar hoy?";
    return "Primero, dinos a quién le escribes. El Guardián adaptará el mensaje a vuestra relación.";
  };

  const getStep2Text = () => {
    if (isPensamiento) return "Añade detalles o palabras clave para enriquecer tu reflexión.";
    if (isResponder) return "Pega aquí el mensaje que recibiste. La IA lo analizará para responderte.";
    if (isGreeting) return "Añade contexto si quieres (ej: 'hace tiempo no hablamos').";
    return "Danos contexto. Escribe palabras clave (ej: 'cena', 'ayer') o usa las sugerencias.";
  };

  const getStep3Text = () => {
    if (isPensamiento) return "Elige la emoción que quieres transmitir en tu reflexión.";
    if (isResponder) return "Elige la intención de tu respuesta (ej. Cortante, Amable).";
    if (isGreeting) return "Elige el estilo de tu saludo (ej. Dulce, Formal).";
    return "Elige el tono emocional perfecto. El Guardián adaptará el mensaje a tu elección.";
  };

  const getStep4Text = () => {
    if (isPensamiento) return "¡Listo! Crea tu reflexión mágica.";
    if (isResponder) return "¡Listo! Generar respuesta inteligente.";
    return "¡Listo! Pulsa aquí para que la IA cree tu mensaje mágico.";
  };

  // Determinar color del tooltip según la ocasión
  const getTooltipColor = (): TooltipColor => {
    if (isPensamiento) return "indigo";
    if (isResponder) return "sky";
    if (isGreeting) return "orange";
    if (isPerdoname) return "amber";
    if (occasion.id === "amor") return "rose";
    if (occasion.id === "birthday") return "orange";
    if (occasion.id === "anniversary") return "cyan";
    if (occasion.id === "mothers_day") return "pink";
    if (occasion.id === "fathers_day") return "blue";
    if (occasion.id === "christmas") return "red";
    if (occasion.id === "visto") return "emerald";
    return "indigo";
  };

  const tooltipColor = getTooltipColor();

  return (
    <div className={`w-full ${isPensamiento ? "max-w-3xl mx-auto" : ""}`}>
      <div
        id="generator-card"
        className={`bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm ${isPensamiento ? "border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-900/10" : ""}`}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}</style>
        {/* Barra de Uso de Créditos */}
        <UsageBar />

        {/* Indicador de Ubicación */}
        {userLocation && (
          <div className="flex justify-end mb-4 -mt-2 animate-fade-in">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-help ${
                planLevel === "premium"
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700"
              }`}
              title={
                planLevel === "premium"
                  ? "Modo Regional Activo"
                  : "Ubicación detectada (Mejora a Premium para activar el modo regional)"
              }
              onClick={() =>
                planLevel !== "premium" &&
                triggerUpsell(
                  "Mejora a Premium para activar el Tono Regional y personalizar tus mensajes según tu ciudad.",
                )
              }
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{userLocation}</span>
              {planLevel === "premium" && <span>✨</span>}
            </div>
          </div>
        )}

        {/* --- STEPPER INDICATOR (Móvil First) --- */}
        <nav aria-label="Progreso" className="relative mb-8 px-2">
          {/* Línea de progreso de fondo */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" aria-hidden="true" />
          
          <ol className="flex items-center justify-between w-full">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <li key={step.id} className="flex flex-col items-center z-10" aria-current={isActive ? "step" : undefined}>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 
                    ${isActive 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110" 
                      : isCompleted 
                        ? "bg-green-600 border-green-600 text-white" 
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"}`}
                  >
                    {isCompleted ? <span aria-label="Completado">✓</span> : step.id}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}`}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="space-y-6 mb-8">
          {/* --- PASO 1: DESTINATARIO / FORMATO --- */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-6">
              {!isPensamiento ? (
                !occasion.fixedRelation && (
                  <OnboardingTooltip
                    tourId="onboarding_tour"
                    stepIndex={1}
                    content={getStep1Text()}
                    position="bottom"
                    color={tooltipColor}
                  >
                    <div className="relative group">
                      <RelationshipSelector
                        relationshipId={relationshipId}
                        onRelationshipChange={handleRelChange}
                        contacts={contacts}
                        selectedContact={selectedContact}
                      />
                      {selectedContact && (
                        <button
                          onClick={handleEditContact}
                          className="absolute right-2 bottom-2 md:bottom-3 p-1.5 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:opacity-0 md:group-hover:opacity-100"
                          title="Editar nombre del contacto"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </OnboardingTooltip>
                )
              ) : (
                <>
                  <OnboardingTooltip
                    tourId="onboarding_tour"
                    stepIndex={1}
                    content="Define el destino: ¿Es para un chat privado o para publicar en tus redes (Post)?"
                    position="bottom"
                    color={tooltipColor}
                  >
                    <FormatSelector
                      isForPost={isForPost}
                      setIsForPost={setIsForPost}
                    />
                  </OnboardingTooltip>

                  <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Tema Central
                    </label>
                    <select
                      value={relationshipId}
                      onChange={handleRelChange}
                      className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {PENSAMIENTO_THEMES.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* --- PASO 2: CONTEXTO --- */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              {isGreeting && (
                <GreetingSelector
                  greetingMoment={greetingMoment}
                  setGreetingMoment={setGreetingMoment}
                  suggestedGreeting={suggestedGreeting}
                />
              )}

              {isPerdoname && (
                <div className="animate-fade-in-up">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    ¿Por qué pides perdón?
                  </label>
                  <select
                    value={apologyReason}
                    onChange={(e) => setApologyReason(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">Selecciona un motivo...</option>
                    {APOLOGY_REASONS.map((reason) => (
                      <option key={reason.id} value={reason.label}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isResponder && (
                <OnboardingTooltip
                  tourId="onboarding_tour"
                  stepIndex={2}
                  content={getStep2Text()}
                  position="top"
                  color={tooltipColor}
                >
                  <ReceivedMessageInput
                    receivedText={receivedText}
                    setReceivedText={setReceivedText}
                    maxChars={MAX_CHARS}
                    safetyError={safetyError}
                    disabled={isLoading}
                  />
                </OnboardingTooltip>
              )}

              {isResponder ? (
                <ContextInputSection
                  isPensamiento={isPensamiento}
                  occasionId={occasion.id}
                  tone={tone as string}
                  isContextLocked={isContextLocked}
                  maxContext={MAX_CONTEXT}
                  currentWord={currentWord}
                  onCurrentWordChange={setCurrentWord}
                  onKeyDown={handleKeyDown}
                  contextWords={contextWords}
                  onAddWord={addContextWord}
                  onRemoveWord={removeContextWord}
                  onTrendingTopicClick={handleTrendingTopicClick}
                  showHandAnimation={showHandAnimation}
                  onTriggerUpsell={triggerUpsell}
                />
              ) : (
                <OnboardingTooltip
                  tourId="onboarding_tour"
                  stepIndex={2}
                  content={getStep2Text()}
                  position="top"
                  color={tooltipColor}
                >
                  <ContextInputSection
                    isPensamiento={isPensamiento}
                    occasionId={occasion.id}
                    tone={tone as string}
                    isContextLocked={isContextLocked}
                    maxContext={MAX_CONTEXT}
                    currentWord={currentWord}
                    onCurrentWordChange={setCurrentWord}
                    onKeyDown={handleKeyDown}
                    contextWords={contextWords}
                    onAddWord={addContextWord}
                    onRemoveWord={removeContextWord}
                    onTrendingTopicClick={handleTrendingTopicClick}
                    showHandAnimation={showHandAnimation}
                    onTriggerUpsell={triggerUpsell}
                  />
                </OnboardingTooltip>
              )}
            </div>
          )}

          {/* --- PASO 3: ESTILO Y GENERACIÓN --- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <OnboardingTooltip
                tourId="onboarding_tour"
                stepIndex={3}
                content={getStep3Text()}
                position="top"
                color={tooltipColor}
              >
                <ToneSelector
                  isPensamiento={isPensamiento}
                  isGreeting={isGreeting}
                  tone={tone}
                  setTone={setTone}
                  availableTones={availableTones}
                  guardianWarning={guardianWarning}
                />
              </OnboardingTooltip>

              <GuardianObjectiveSelector
                intention={intention}
                setIntention={setIntention}
                setManualIntentionOverride={setManualIntentionOverride}
                planLevel={planLevel}
                manualIntentionOverride={manualIntentionOverride}
                guardianDescription={guardianDescription}
              />
            </div>
          )}
        </div>

        {/* Toggle Regalos */}
        {isLastStep && !isPensamiento && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div
              className="flex items-center gap-3 cursor-pointer group w-fit"
              onClick={() => setShowGifts(!showGifts)}
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${showGifts ? "bg-blue-600 border-blue-600" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-blue-400 dark:group-hover:border-blue-500"}`}
              >
                {showGifts && (
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors select-none flex items-center gap-2">
                🎁 Ver sugerencias de regalos
              </span>
            </div>

            {showGifts && (
              <div className="flex items-center gap-2 animate-fade-in pl-8 sm:pl-0">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Presupuesto:</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  {(['low', 'medium', 'high'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setGiftBudget(b)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${giftBudget === b ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      title={b === 'low' ? 'Económico' : b === 'medium' ? 'Estándar' : 'Lujo'}
                    >
                      {b === 'low' ? '$' : b === 'medium' ? '$$' : '$$$'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {safetyError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg animate-fade-in-up"
          >
            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-start gap-2">
              <span className="text-sm">🚫</span>
              <span>{safetyError}</span>
            </p>
          </div>
        )}

        {usageMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-xl animate-fade-in-up"
          >
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-start gap-3">
              <span className="text-xl">⏳</span>
              <span>{usageMessage}</span>
            </p>
          </div>
        )}

        {/* --- NAVEGACIÓN DEL STEPPER --- */}
        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-none w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700 md:border-0"
              aria-label="Volver al paso anterior"
            >
              <svg className="w-5 h-5 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden md:inline">Atrás</span>
            </button>
          )}
          
          {isLastStep ? (
            <div className="flex-1">
              <OnboardingTooltip
                tourId="onboarding_tour"
                stepIndex={4}
                content={getStep4Text()}
                position="top"
                color={tooltipColor}
                isLast
              >
                <GenerateButton
                  onClick={handleGenerateAndReset}
                  isLoading={isLoading}
                  safetyError={safetyError}
                  user={user}
                  remainingCredits={remainingCredits}
                  isOccasionLocked={isOccasionLocked}
                  isPensamiento={isPensamiento}
                  isGreeting={isGreeting}
                />
              </OnboardingTooltip>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className={`flex-1 h-14 md:h-auto md:py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                !canAdvance
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 shadow-lg active:scale-95"
              } ${isShaking ? "animate-shake" : ""}`}
            >
              <span>Siguiente</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Banner de Registro para usuarios no logueados */}
      {!user && messages.length > 0 && (
        <div className="mt-8 mb-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden animate-fade-in-up">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-black mb-2">
                ¿Te gustó el resultado? ✨
              </h3>
              <p className="text-indigo-100 font-medium text-sm max-w-md">
                Crea una cuenta gratuita para acceder a tonos exclusivos,
                guardar tus favoritos y eliminar límites diarios.
              </p>
            </div>
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-all active:scale-95 whitespace-nowrap"
            >
              Crear cuenta gratis
            </Link>
          </div>

          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      )}

      <GeneratedMessagesList
        messages={messages}
        isLoading={isLoading && messages.length === 0}
        showGifts={showGifts}
        country={country}
        isPensamiento={isPensamiento}
        occasion={occasion}
        shareParam={shareParam}
        onShareAction={handleShareAction}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isFavorite}
        onEditMessage={setEditingMessageId}
        onClearHistory={handleClearHistory}
        onMarkAsUsed={handleMarkAsUsed}
        onRegenerate={handleRegenerate}
        onEditContact={handleEditContactFromMessage}
      />

      {showScrollButton && (
        <button
          onClick={() =>
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: "smooth",
            })
          }
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-slate-700/90 backdrop-blur text-white px-5 py-2.5 rounded-full shadow-xl z-50 animate-fade-in-up text-xs font-bold flex items-center gap-2 border border-slate-700/50"
        >
          <span>⬇️</span>
          <span>Ver escribiendo...</span>
        </button>
      )}

      {editingMessageId && (
        <GuardianEditorModal
          isOpen={!!editingMessageId}
          onClose={() => setEditingMessageId(null)}
          initialText={
            messages.find((m) => m.id === editingMessageId)?.content || ""
          }
          contactId={selectedContactId}
          isPremium={planLevel === "premium"}
          relationalHealth={selectedContact?.relationalHealth}
          onSave={(newText) => handleMessageUpdate(editingMessageId, newText)}
        />
      )}

      <CreateContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSuccess={(updatedContact) => {
          if (contactToEdit) {
            // Actualizar lista si es edición
            setContacts(
              contacts.map((c) =>
                c._id === updatedContact._id ? updatedContact : c,
              ),
            );
            setContactToEdit(null);
          } else {
            handleContactCreated(updatedContact);
          }
        }}
        contactToEdit={contactToEdit}
      />
    </div>
  );
};

export default Generator;
