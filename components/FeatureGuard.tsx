import React, { cloneElement, ReactElement } from "react";
import { useAuth } from "../context/AuthContext";
import { useUpsell } from "../context/UpsellContext";
import PlanManager from "../services/PlanManager";

interface FeatureGuardProps {
  children: ReactElement;
  featureKey: string;
  type: "tone" | "occasion";
}

const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  featureKey,
  type,
}) => {
  const { planLevel } = useAuth();
  const { triggerUpsell } = useUpsell();

  // 1. Determinar si está permitido antes de renderizar
  let isAllowed = false;
  let upsellKey = "";

  if (planLevel === "premium") {
    isAllowed = true;
  } else {
    if (type === "tone") {
      const allowedTones = PlanManager.getPlanFeature(
        planLevel,
        "access.exclusive_tones",
      );
      if (
        allowedTones === "all" ||
        (Array.isArray(allowedTones) &&
          (allowedTones.includes("all") || allowedTones.includes(featureKey)))
      ) {
        isAllowed = true;
      } else {
        upsellKey = "on_locked_tone";
      }
    } else if (type === "occasion") {
      const allowedOccasions = PlanManager.getPlanFeature(
        planLevel,
        "access.occasions",
      );
      if (
        allowedOccasions === "all" ||
        (Array.isArray(allowedOccasions) &&
          (allowedOccasions.includes("all") ||
            allowedOccasions.includes(featureKey)))
      ) {
        isAllowed = true;
      } else {
        upsellKey = "on_locked_occasion";
      }
    }
  }

  const handleAction = (e: React.MouseEvent) => {
    if (isAllowed) {
      children.props.onClick?.(e);
    } else {
      e.preventDefault();
      e.stopPropagation();
      const msg = PlanManager.getUpsellMessage(upsellKey);
      triggerUpsell(msg);
    }
  };

  const child = cloneElement(children, { onClick: handleAction });

  if (isAllowed) return child;

  return (
    <div className="relative inline-flex">
      {child}
      <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 p-0.5 z-10 pointer-events-none">
        <span className="text-[10px]">🔒</span>
      </div>
    </div>
  );
};

export default FeatureGuard;
