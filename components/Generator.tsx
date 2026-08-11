import React from "react";
import { Occasion, Relationship } from "../types";
import { APOLOGY_REASONS, PENSAMIENTO_THEMES } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useUpsell } from "../context/UpsellContext";
import { useFavorites } from "../context/FavoritesContext";
import UsageBar from "./UsageBar";
import { Link } from "react-router-dom";
import CreateContactModal from "./CreateContactModal";
import GuardianEditorModal from "./GuardianEditorModal";
import { useGenerator } from "../hooks/useGenerator";
import { useGeneratorStepper } from "../hooks/useGeneratorStepper";
import ContextInputSection from "./ContextInputSection";
import { getRegionalModeHint, getRegionalModeUpsell } from "../services/accessCopy";
import ToneSelector from "./ToneSelector";
import GeneratedMessagesList from "./GeneratedMessagesList";
import GuardianInfoModal from "./GuardianInfoModal";
import FormatSelector from "./FormatSelector";
import RelationshipSelector from "./RelationshipSelector";
import GreetingSelector from "./GreetingSelector";
import GuardianObjectiveSelector from "./GuardianObjectiveSelector";
import ReceivedMessageInput from "./ReceivedMessageInput";
import GenerateButton from "./GenerateButton";
import Button from "./ui/Button";
import { markOccasionVisited } from "../services/usageControlService";
import EssenceToggle from "./EssenceToggle";
import PostGenerator from "./PostGenerator";
// Elimina la integración del AdminCampaignGenerator para que no dependa ni se muestre en Generator

interface GeneratorProps {
  occasion: Occasion;
  initialRelationship?: Relationship;
  onRelationshipChange?: (relId: string) => void;
  onActivityChange?: (status: "idle" | "focused" | "streaming") => void;
}

const Generator: React.FC<GeneratorProps> = ({
  occasion,
  initialRelationship,
  onRelationshipChange,
  onActivityChange,
}) => {
  // --- Integration Point for the new PostGenerator ---
  if (occasion.id === 'pensamiento') {
    return <PostGenerator />;
  }

  const { user, remainingCredits, planLevel } = useAuth();
  const { triggerUpsell } = useUpsell();
  const { isFavorite } = useFavorites();
  const isPensamiento = occasion.id === "pensamiento";
  const isResponder = occasion.id === "responder";
  const isGreeting = occasion.id === "saludo";
  const isPerdoname = occasion.id === "perdoname";
  const isFelicitation = occasion.id === "felicitacion";
  const MAX_CHARS = 400;
  const STYLE_SAMPLE_MAX = 240;

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
    styleSample,
    setStyleSample,
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
    isStreaming,
    cancelGeneration,
    safetyError,
    setSafetyError,
    usageMessage,
    setUsageMessage,
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
    essenceProfile,
    essenceCompleted,
    applyEssence,
    setApplyEssence,
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
  const [showGuardianOnboarding, setShowGuardianOnboarding] =
    React.useState(false);

  const handleGenerated = React.useCallback(() => {
    if (!localStorage.getItem("guardian_onboarding_seen")) {
      localStorage.setItem("guardian_onboarding_seen", "true");
      setShowGuardianOnboarding(true);
    }
  }, []);

  const {
    steps,
    currentStep,
    isLastStep,
    canAdvance,
    isShaking,
    handleNext,
    handleBack,
    handleGenerateAndReset,
    resetStep,
  } = useGeneratorStepper({
    isPensamiento,
    isResponder,
    receivedText,
    safetyError,
    onGenerate: handleGenerate,
    onReset: resetForm,
    onGenerated: handleGenerated,
  });

  // Resetear paso al cambiar de ocasión
  const prevOccasionId = React.useRef(occasion.id);

  // Modo foco: el formulario es el protagonista al avanzar en el stepper o generar
  const isFocused = currentStep > 1 || isStreaming;

  // Reportar la actividad de la página para que el layout colapse el chrome
  React.useEffect(() => {
    if (!onActivityChange) return;
    const status = isStreaming ? "streaming" : isFocused ? "focused" : "idle";
    onActivityChange(status);
  }, [isStreaming, isFocused, onActivityChange]);

  React.useEffect(() => {
    // Marcar ocasión como visitada para ocultar el badge "Nuevo" en el futuro
    if (occasion.badge) {
      markOccasionVisited(occasion.id);
    }

    if (prevOccasionId.current !== occasion.id) {
      resetStep();
      prevOccasionId.current = occasion.id;
    }
  }, [occasion.id, occasion.badge, resetStep]);

  // Lógica para deshabilitar el botón de generación si faltan datos clave
  const isGenerationDisabled =
    isOccasionLocked || (isResponder && receivedText.trim().length === 0);

  // Botón flotante para seguir la escritura si el usuario hace scroll hacia arriba
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  React.useEffect(() => {
    if (!isStreaming) {
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
  }, [isStreaming]);

  // Seguir la escritura: mientras el usuario permanezca cerca del final de la
  // página, el scroll acompaña a la tarjeta en streaming (patrón ChatGPT).
  // Si el usuario se desplaza hacia arriba, deja de seguirlo y aparece el botón flotante.
  React.useEffect(() => {
    if (!isStreaming) return;
    const distanceToBottom =
      document.documentElement.scrollHeight -
      (window.innerHeight + window.scrollY);
    if (distanceToBottom < 200) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "auto",
      });
    }
  }, [messages, isStreaming]);

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


  return (
    <div className={`w-full ${isPensamiento ? "max-w-3xl mx-auto" : ""}`}>
      <div
        id="generator-card"
        className={`bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-soft ${isPensamiento ? "border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-900/10" : ""}`}
      >
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
                  : getRegionalModeHint(!user)
              }
              onClick={() =>
                planLevel !== "premium" &&
                triggerUpsell(getRegionalModeUpsell(!user))
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
          <div
            className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"
            aria-hidden="true"
          />

          <ol className="flex items-center justify-between w-full">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <li
                  key={step.id}
                  className="flex flex-col items-center z-10"
                  aria-current={isActive ? "step" : undefined}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 
                    ${
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110"
                        : isCompleted
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <span aria-label="Completado">✓</span>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}`}
                  >
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
                )
              ) : (
                <div className="space-y-6">
                  <FormatSelector
                    isForPost={isForPost}
                    setIsForPost={setIsForPost}
                  />

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
                </div>
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
                <ReceivedMessageInput
                  receivedText={receivedText}
                  setReceivedText={setReceivedText}
                  maxChars={MAX_CHARS}
                  safetyError={safetyError}
                  disabled={isStreaming}
                />
              )}

              <ContextInputSection
                isPensamiento={isPensamiento}
                occasionId={occasion.id}
                tone={tone as string}
                isGuest={!user}
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
            </div>
          )}

          {/* --- PASO 3: ESTILO Y GENERACIÓN --- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              {user && (
                <EssenceToggle
                  compact={isFocused}
                  essenceProfile={essenceProfile}
                  essenceCompleted={essenceCompleted}
                  applyEssence={applyEssence}
                  setApplyEssence={setApplyEssence}
                />
              )}

              {planLevel === "premium" && (
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Editor Mágico (opcional)
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pega un mensaje que hayas escrito antes para que aprenda tu chispa.
                  </p>
                  <div className="relative mt-3">
                    <textarea
                      value={styleSample}
                      onChange={(e) =>
                        setStyleSample(e.target.value.slice(0, STYLE_SAMPLE_MAX))
                      }
                      className="w-full min-h-[96px] p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none text-slate-800 dark:text-slate-200 leading-relaxed text-sm bg-white dark:bg-slate-900"
                      placeholder="Ej: ey, me acordé de ti... ¿todo bien? jaja"
                    />
                    <div className={`absolute bottom-2 right-3 text-[10px] font-bold ${styleSample.length >= STYLE_SAMPLE_MAX ? "text-red-500" : "text-slate-400"}`}>
                      {styleSample.length} / {STYLE_SAMPLE_MAX}
                    </div>
                  </div>
                </div>
              )}
              <ToneSelector
                isPensamiento={isPensamiento}
                isGreeting={isGreeting}
                isFelicitation={isFelicitation}
                tone={tone}
                setTone={setTone}
                availableTones={availableTones}
                guardianWarning={guardianWarning}
              />

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
            <Button
              variant="secondary"
              size="md"
              onClick={handleBack}
              className="flex-none md:px-6"
              aria-label="Volver al paso anterior"
              leftIcon={
                <svg
                  className="w-5 h-5 md:hidden"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              }
            >
              <span className="hidden md:inline">Atrás</span>
            </Button>
          )}

          {isLastStep ? (
            <div className="flex-1 flex gap-3">
              <div className="flex-1">
                <GenerateButton
                  onClick={handleGenerateAndReset}
                  isLoading={isStreaming}
                  safetyError={safetyError}
                  user={user}
                  remainingCredits={remainingCredits}
                  isOccasionLocked={isOccasionLocked}
                  isPensamiento={isPensamiento}
                  isGreeting={isGreeting}
                  disabled={isGenerationDisabled}
                  disabledLabel="Falta el mensaje a responder"
                  isPremium={planLevel === "premium"}
                />
              </div>

              {/* Cancelación del stream en curso (patrón ChatGPT/Claude) */}
              {isStreaming && (
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={cancelGeneration}
                  className="flex-none w-14 md:w-auto md:px-5"
                  aria-label="Detener la generación"
                  leftIcon={
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  }
                >
                  <span className="hidden md:inline">Detener</span>
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant={canAdvance ? "primary" : "secondary"}
              size="md"
              onClick={handleNext}
              className={`flex-1 ${!canAdvance ? "cursor-not-allowed opacity-70" : ""} ${isShaking ? "animate-shake" : ""}`}
              rightIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              }
            >
              Siguiente
            </Button>
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
        isStreaming={isStreaming}
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

      <GuardianInfoModal
        isOpen={showGuardianOnboarding}
        onClose={() => setShowGuardianOnboarding(false)}
      />
    </div>
  );
};
export default Generator;
