import React from "react";
import { Link } from "react-router-dom";

const PaymentErrorPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-red-100 dark:shadow-none max-w-lg w-full text-center border border-red-50 dark:border-red-900/30 relative overflow-hidden">
        <div className="text-6xl mb-6">💔</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Algo salió mal
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
          Hubo un pequeño tropiezo con el pago. A veces la tecnología falla o los bancos se protegen de más. No te preocupes, tu dinero está seguro. ¿Intentamos de nuevo?
        </p>

        <div className="space-y-4">
          <Link
            to="/pricing"
            className="block w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-all active:scale-[0.98] text-lg"
          >
            Intentar de nuevo
          </Link>
          
          <Link
            to="/contacto"
            className="block w-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            Contactar Soporte
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Si el problema persiste, intenta con otro método de pago.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorPage;