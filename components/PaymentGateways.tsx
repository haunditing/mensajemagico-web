import React from "react";
import { useLocalization } from '../context/LocalizationContext';

interface PaymentGatewaysProps {
  onSelectGateway: (gateway: string) => void;
  isLoading: boolean;
  planLevel: string;
}

const Icons = {
  MercadoPago: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.0004 22.6066L11.2933 21.8995C10.9028 21.509 10.9028 20.8758 11.2933 20.4853L12.7075 19.0711L7.05066 13.4142L5.63645 14.8284C5.24592 15.219 4.61276 15.219 4.22223 14.8284L2.10091 12.7071C1.71039 12.3166 1.71039 11.6834 2.10091 11.2929L9.17198 4.22183C9.5625 3.8313 10.1957 3.8313 10.5862 4.22183L12.0004 5.63604L13.4146 4.22183C13.8052 3.8313 14.4383 3.8313 14.8288 4.22183L21.8999 11.2929C22.2904 11.6834 22.2904 12.3166 21.8999 12.7071L19.7786 14.8284C19.3881 15.219 18.7549 15.219 18.3644 14.8284L16.9502 13.4142L11.2933 19.0711L12.7075 20.4853C13.098 20.8758 13.098 21.509 12.7075 21.8995L12.0004 22.6066ZM10.5862 7.05025L4.92934 12.7071L5.63645 13.4142L11.2933 7.75736L10.5862 7.05025ZM13.4146 7.05025L12.7075 7.75736L18.3644 13.4142L19.0715 12.7071L13.4146 7.05025Z" />
    </svg>
  ),
  Wompi: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  ),
  Stripe: () => (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
};

// Helper para obtener variables de entorno de forma segura (Vite o CRA)
const getEnv = (key: string) => {
  // @ts-ignore
  const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : undefined;
  // @ts-ignore
  const processEnv = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  return viteEnv || processEnv;
};

const PaymentGateways: React.FC<PaymentGatewaysProps> = ({ onSelectGateway, isLoading, planLevel }) => {
  const { country } = useLocalization();
  const [selectedGateway, setSelectedGateway] = React.useState<string | null>(null);

  // Configuración de pasarelas (Data-Driven para escalabilidad)
  const gateways = [
    {
      id: "mercadopago",
      name: "Mercado Pago",
      description: "Tarjetas, Efectivo, PSE",
      icon: <Icons.MercadoPago />,
      isEnabled: getEnv('VITE_ENABLE_MERCADOPAGO') !== 'false' && getEnv('REACT_APP_ENABLE_MERCADOPAGO') !== 'false',
      isAvailable: true, // MP suele gestionar la disponibilidad por país en su checkout
      badge: "Popular"
    },
    {
      id: "wompi",
      name: "Wompi",
      description: "Nequi / Bancolombia / PSE",
      icon: <Icons.Wompi />,
      isEnabled: getEnv('VITE_ENABLE_WOMPI') !== 'false' && getEnv('REACT_APP_ENABLE_WOMPI') !== 'false',
      isAvailable: country === 'CO', // Wompi específico para Colombia
      badge: "Colombia"
    },
    {
      id: "stripe",
      name: "Tarjeta de Crédito",
      description: "Pago internacional seguro",
      icon: <Icons.Stripe />,
      isEnabled: getEnv('VITE_ENABLE_STRIPE') !== 'false' && getEnv('REACT_APP_ENABLE_STRIPE') !== 'false',
      isAvailable: true, // Stripe suele ser global
    }
  ];

  const activeGateways = gateways.filter(g => g.isEnabled && g.isAvailable);

  // Auto-seleccionar la primera opción disponible
  React.useEffect(() => {
    if (activeGateways.length > 0 && !selectedGateway) {
      setSelectedGateway(activeGateways[0].id);
    }
  }, [activeGateways, selectedGateway]);

  if (planLevel === "premium") {
    return (
      <button
        disabled={true}
        className="w-full py-4 rounded-2xl font-bold text-lg bg-slate-100 text-slate-400 cursor-not-allowed relative z-10 border border-slate-200 shadow-inner flex items-center justify-center gap-2"
      >
        <span>✨</span>
        Plan Activo
      </button>
    );
  }

  if (activeGateways.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-sm border border-slate-200 shadow-sm">
        <p>No hay métodos de pago habilitados para tu región.</p>
      </div>
    );
  }

  const handlePayment = () => {
    if (selectedGateway) {
      onSelectGateway(selectedGateway);
    }
  };

  return (
    <div className="w-full relative z-10">
      <div className="space-y-3 mb-6">
        {activeGateways.map((gateway) => {
          const isSelected = selectedGateway === gateway.id;
          return (
            <div
              key={gateway.id}
              onClick={() => !isLoading && setSelectedGateway(gateway.id)}
              className={`
                relative flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group
                ${isSelected 
                  ? "border-blue-600 bg-blue-50/30 shadow-sm" 
                  : "border-slate-100 hover:border-slate-200 bg-white hover:shadow-sm"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {/* Radio Indicator */}
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
                ${isSelected ? "border-blue-600" : "border-slate-300 group-hover:border-slate-400"}
              `}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>

              {/* Icon */}
              <div className={`
                w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-slate-700 shrink-0 transition-colors
                ${isSelected ? "bg-white shadow-sm text-blue-600" : "bg-slate-50"}
              `}>
                {gateway.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold text-sm leading-tight ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                    {gateway.name}
                  </span>
                  {gateway.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                      {gateway.badge}
                    </span>
                  )}
                </div>
                {gateway.description && (
                  <p className="text-xs text-slate-400 font-medium leading-tight mt-0.5">{gateway.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading || !selectedGateway}
        className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Suscribirse Ahora</span>
          </>
        )}
      </button>
      
      <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
        Pagos procesados de forma segura. Cancelación en cualquier momento.
      </p>
    </div>
  );
};

export default PaymentGateways;
