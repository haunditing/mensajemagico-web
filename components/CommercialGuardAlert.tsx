// components/CommercialGuardAlert.tsx
import React from 'react';
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommercialGuardResult } from '../services/social/commercialGuard';

interface CommercialGuardAlertProps {
  result: CommercialGuardResult;
  /** Permite al usuario indicar que el tema no es una campaña y forzar continuar */
  onDismiss: () => void;
}

const CommercialGuardAlert: React.FC<CommercialGuardAlertProps> = ({ result, onDismiss }) => {
  const isHard = result.confidence === 'high';

  return (
    <div
      className={`mt-6 rounded-xl border overflow-hidden animate-fade-in ${
        isHard
          ? 'border-orange-300 dark:border-orange-800/60 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
          : 'border-yellow-300 dark:border-yellow-800/60 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
      }`}
    >
      {/* Cabecera estilo Guardian */}
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b ${
          isHard
            ? 'border-orange-200 dark:border-orange-800/50 bg-orange-100/60 dark:bg-orange-900/30'
            : 'border-yellow-200 dark:border-yellow-800/50 bg-yellow-100/60 dark:bg-yellow-900/30'
        }`}
      >
        <span className="text-2xl select-none" aria-hidden="true">🦁</span>
        <div>
          <div
            className={`text-sm font-black uppercase tracking-wider ${
              isHard
                ? 'text-orange-800 dark:text-orange-300'
                : 'text-yellow-800 dark:text-yellow-300'
            }`}
          >
            Guardián detectó intención comercial
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Análisis de contenido · Protegiendo tu experiencia
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-4 py-4 space-y-3">
        {/* Mensaje principal */}
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {isHard
            ? 'Lo que describes parece una campaña publicitaria o acción comercial. Esta herramienta está diseñada para crear mensajes personales y contenido orgánico para redes sociales — no para generar campañas de marketing o publicidad commercial.'
            : 'Tu tema tiene algunas señales de contenido comercial. Si lo que buscas es crear publicidad o campañas de venta, esta herramienta no es la indicada.'}
        </p>

        {/* Señales detectadas */}
        {result.matchedSignals.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 self-center font-medium">
              Detectado:
            </span>
            {result.matchedSignals.map((signal) => (
              <span
                key={signal}
                className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                  isHard
                    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60'
                    : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60'
                }`}
              >
                {signal}
              </span>
            ))}
          </div>
        )}

        {/* CTA Plan Empresarial */}
        <div
          className={`flex items-start gap-2.5 p-3 rounded-lg border ${
            isHard
              ? 'bg-white/60 dark:bg-slate-800/50 border-orange-200 dark:border-orange-800/50'
              : 'bg-white/60 dark:bg-slate-800/50 border-yellow-200 dark:border-yellow-800/50'
          }`}
        >
          <AlertTriangle
            size={15}
            className={`mt-0.5 flex-shrink-0 ${isHard ? 'text-orange-500' : 'text-yellow-500'}`}
          />
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              ¿Necesitas campañas comerciales y publicidad en redes?
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Contamos con un <strong>Plan Empresarial</strong> diseñado para gestores de
              redes, agencias y marcas que necesitan generar campañas comerciales,
              copies publicitarios y contenido de conversión. Escríbenos y te
              contamos cómo funciona.
            </p>
            <Link
              to="/contacto"
              className={`inline-flex items-center gap-1.5 text-xs font-bold mt-1 transition-colors ${
                isHard
                  ? 'text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200'
                  : 'text-yellow-700 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-200'
              }`}
            >
              Consultar Plan Empresarial
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Pie — opción de forzar si el Guard fue falso positivo */}
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={onDismiss}
          className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <RotateCcw size={11} />
          No es una campaña, mi tema es orgánico — continuar de todos modos
        </button>
      </div>
    </div>
  );
};

export default CommercialGuardAlert;
