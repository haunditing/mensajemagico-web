import React, { useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";

interface GeneratorStepperDeps {
  isPensamiento: boolean;
  isResponder: boolean;
  receivedText: string;
  safetyError: string | null;
  onGenerate: () => Promise<boolean>;
  onReset: () => void;
  onGenerated?: () => void;
}

interface GeneratorStep {
  id: number;
  label: string;
}

/**
 * Wizard de "Divulgación Progresiva" del Generador.
 * Encapsula la navegación entre pasos (Destinatario → Contexto → Estilo),
 * las validaciones para avanzar y el flujo "Generar → reset → siguiente ocasión".
 * Aplica composición de hooks (Container/Presentational) para mantener el
 * componente de UI delgado y con una sola responsabilidad.
 */
export const useGeneratorStepper = ({
  isPensamiento,
  isResponder,
  receivedText,
  safetyError,
  onGenerate,
  onReset,
  onGenerated,
}: GeneratorStepperDeps) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isShaking, setIsShaking] = useState(false);

  const steps = useMemo<GeneratorStep[]>(() => {
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

  const canAdvance = useMemo(() => {
    if (safetyError) return false;
    if (!isPensamiento && currentStep === 2 && isResponder) {
      return receivedText.trim().length > 0;
    }
    return true;
  }, [safetyError, isPensamiento, currentStep, isResponder, receivedText]);

  const handleNext = () => {
    if (!canAdvance) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (safetyError) {
        showToast(
          "Hay una advertencia de seguridad pendiente. Por favor revísala.",
          "error",
        );
      } else if (
        !isPensamiento &&
        currentStep === 2 &&
        isResponder &&
        !receivedText.trim()
      ) {
        showToast(
          "Por favor, escribe el mensaje que recibiste para continuar.",
          "error",
        );
      }
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    document
      .getElementById("generator-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerateAndReset = async () => {
    const success = await onGenerate();
    if (success) {
      setCurrentStep(1);
      onReset();
      onGenerated?.();
    }
  };

  const resetStep = () => setCurrentStep(1);

  return {
    steps,
    currentStep,
    totalSteps,
    isLastStep,
    canAdvance,
    isShaking,
    handleNext,
    handleBack,
    handleGenerateAndReset,
    resetStep,
  };
};
