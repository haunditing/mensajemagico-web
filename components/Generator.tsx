import React from "react";
import { Occasion, Relationship } from "../types";
import { useLocalization } from "../context/LocalizationContext";
import { useAuth } from "../context/AuthContext";
import { useUpsell } from "../context/UpsellContext";
import { useFavorites } from "../context/FavoritesContext";
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
  const { country } = useLocalization(); // Necesario para pasar a GeneratedMessagesList
  const isPensamiento = occasion.id === "pensamiento";
  const isResponder = occasion.id === "responder";
  const isGreeting = occasion.id === "saludo";
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
    isForPost,
    setIsForPost,
    userLocation,
    guardianDescription,
    shareParam,
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
  } = useGenerator(occasion, initialRelationship, onRelationshipChange);

  return (
    <div className={`w-full ${isPensamiento ? "max-w-3xl mx-auto" : ""}`}>
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm ${isPensamiento ? "border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-900/10" : ""}`}
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

        <div className="space-y-6 mb-8">
          {/* --- SECCIÓN SUPERIOR PARA PENSAMIENTOS (Jerarquía Visual) --- */}
          {isPensamiento && (
            <div className="space-y-6">
              {/* Selector de Formato */}
              <FormatSelector
                isForPost={isForPost}
                setIsForPost={setIsForPost}
              />

              {/* Input de Reflexión (Movido arriba) */}
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
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destinatario Select (Oculto para Pensamiento) */}
            {!isPensamiento && (
              <RelationshipSelector
                relationshipId={relationshipId}
                onRelationshipChange={handleRelChange}
                contacts={contacts}
                selectedContact={selectedContact}
              />
            )}

            {isGreeting && (
              <GreetingSelector
                greetingMoment={greetingMoment}
                setGreetingMoment={setGreetingMoment}
                suggestedGreeting={suggestedGreeting}
              />
            )}

            <ToneSelector
              isPensamiento={isPensamiento}
              isGreeting={isGreeting}
              tone={tone}
              setTone={setTone}
              availableTones={availableTones}
              guardianWarning={guardianWarning}
            />
          </div>

          {/* --- UI: OBJETIVO DEL GUARDIÁN --- */}
          <GuardianObjectiveSelector
            intention={intention}
            setIntention={setIntention}
            setManualIntentionOverride={setManualIntentionOverride}
            planLevel={planLevel}
            manualIntentionOverride={manualIntentionOverride}
            guardianDescription={guardianDescription}
          />

          {isResponder ? (
            <>
              <ReceivedMessageInput
                receivedText={receivedText}
                setReceivedText={setReceivedText}
                maxChars={MAX_CHARS}
                safetyError={safetyError}
                disabled={isLoading}
              />
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
            </>
          ) : (
            !isPensamiento && (
              // Si no es responder ni pensamiento, mostramos el input de contexto aquí
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
            )
          )}
        </div>

        {/* Toggle Regalos */}
        {(!isPensamiento || !isForPost) && (
          <div
            className="flex items-center gap-3 mb-6 cursor-pointer group w-fit mx-auto md:mx-0"
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

        <GenerateButton
          onClick={handleGenerate}
          isLoading={isLoading}
          safetyError={safetyError}
          user={user}
          remainingCredits={remainingCredits}
          isOccasionLocked={isOccasionLocked}
          isPensamiento={isPensamiento}
          isGreeting={isGreeting}
        />
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
        isLoading={isLoading}
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
      />

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
        onSuccess={handleContactCreated}
      />
    </div>
  );
};

export default Generator;
