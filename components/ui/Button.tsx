import React from "react";
import LoadingSpinner from "../LoadingSpinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // CTA principal: gradiente de marca + glow + barrido de brillo (shine)
  primary:
    "bg-gradient-to-r from-brand-600 via-indigo-600 to-magic-to text-white shadow-magic hover:brightness-110 hover:shadow-magic focus-visible:ring-brand-300",
  secondary:
    "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:ring-brand-300 shadow-soft",
  ghost:
    "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 focus-visible:ring-brand-300",
  destructive:
    "bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-500 shadow-lg shadow-red-500/25 dark:shadow-red-900/30 focus-visible:ring-red-300",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-xs rounded-lg",
  md: "h-12 px-5 text-sm rounded-xl",
  lg: "h-14 px-8 text-base rounded-xl md:rounded-2xl",
};

/**
 * Sistema de botones (patrón de primitivas UI).
 * Unifica CTA, acciones secundarias, fantasmas y destructivas con
 * micro-interacciones consistentes: press, brillo, foco visible y loading.
 */
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  children,
  type = "button",
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`relative overflow-hidden select-none font-bold inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 disabled:pointer-events-none ${
        VARIANT_CLASSES[variant]
      } ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${
        isDisabled
          ? "opacity-50 cursor-not-allowed saturate-50"
          : "cursor-pointer"
      } ${className}`}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {/* Barrido de brillo en el CTA principal */}
      {!isDisabled && !isLoading && variant === "primary" && (
        <span
          aria-hidden="true"
          className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] animate-shine pointer-events-none"
        />
      )}

      {isLoading ? (
        <LoadingSpinner size="sm" color={variant === "primary" || variant === "destructive" ? "white" : "slate"} />
      ) : (
        leftIcon
      )}

      <span className="relative z-10">{children}</span>

      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
