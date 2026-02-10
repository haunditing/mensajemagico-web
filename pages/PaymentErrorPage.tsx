import React from "react";
import { Link } from "react-router-dom";

const PaymentErrorPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in-up">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-red-100 max-w-lg w-full text-center border border-red-50 relative overflow-hidden">
        <div className="text-6xl mb-6">💔</div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          Algo salió mal
        </h1>
        <p className="text-slate-600 mb-8 text-lg leading-relaxed">
          No pudimos procesar tu pago. Puede deberse a fondos insuficientes, un
          bloqueo de seguridad de tu banco o un error temporal.
        </p>

        <div className="space-y-4">
          <Link
            to="/pricing"
            className="block w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] text-lg"
          >
            Intentar de nuevo
          </Link>
          
          <Link
            to="/contacto"
            className="block w-full bg-white text-slate-600 font-bold py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Contactar Soporte
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Si el problema persiste, intenta con otro método de pago.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorPage;