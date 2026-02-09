import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  cancelSubscription,
  getSubscriptionStatus,
  reactivateSubscription,
} from "../services/paymentService";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { ENABLE_UPGRADES } from "../config";
import { api } from "../context/api";
import CitySelector from "../components/CitySelector";

const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  // Estado para edición de ubicación
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isSavingLoc, setIsSavingLoc] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
      if ((user as any).location) setLocationInput((user as any).location);
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getSubscriptionStatus(user._id);
      setSubscription(data.subscription);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    if (
      !window.confirm(
        "¿Estás seguro de que quieres cancelar tu suscripción? Perderás los beneficios al final del periodo actual.",
      )
    ) {
      return;
    }

    setCancelling(true);
    try {
      await cancelSubscription(user._id);
      showToast(
        "Suscripción cancelada correctamente. El acceso continuará hasta el final del periodo.",
        "success",
      );
      loadSubscription(); // Recargar estado
    } catch (error: any) {
      showToast(error.message || "Error al cancelar", "error");
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    if (!user) return;
    setReactivating(true);
    try {
      await reactivateSubscription(user._id);
      showToast("Suscripción reactivada correctamente.", "success");
      loadSubscription(); // Recargar estado
    } catch (error: any) {
      showToast(error.message || "Error al reactivar", "error");
    } finally {
      setReactivating(false);
    }
  };

  const handleSaveLocation = async () => {
    setIsSavingLoc(true);
    try {
      await api.put("/api/auth/profile", { location: locationInput });
      await refreshUser();
      setIsEditingLoc(false);
      showToast("Ubicación actualizada correctamente", "success");
    } catch (error: any) {
      showToast(error.message || "Error al actualizar ubicación", "error");
    } finally {
      setIsSavingLoc(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in-up">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Inicia sesión para ver tu perfil
        </h2>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors mt-4"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Mi Perfil</h1>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/30">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.email}</h2>
            <p className="text-slate-500 capitalize font-medium">
              Plan {user.planLevel}
            </p>
          </div>
        </div>

        {/* Sección de Ubicación */}
        <div className="border-t border-slate-100 py-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Ubicación (Modo Regional)
            </h3>
            {!isEditingLoc && (
              <button
                onClick={() => {
                  setIsEditingLoc(true);
                  setLocationInput((user as any).location || "");
                }}
                className="text-blue-600 text-sm font-bold hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {isEditingLoc ? (
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <CitySelector
                  value={locationInput}
                  onChange={setLocationInput}
                  placeholder="Ej: Cartagena, Medellín..."
                />
              </div>
              <button
                onClick={handleSaveLocation}
                disabled={isSavingLoc}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {isSavingLoc ? "..." : "Guardar"}
              </button>
              <button
                onClick={() => setIsEditingLoc(false)}
                className="text-slate-500 px-3 font-bold hover:text-slate-700"
              >
                ✕
              </button>
            </div>
          ) : (
            <p className="text-slate-600">
              {(user as any).location ? (
                <span className="flex items-center gap-2">
                  📍 {(user as any).location}
                  {user.planLevel === "premium" && (
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                      Activo ✨
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-slate-400 italic">
                  No definida (Se usará detección automática)
                </span>
              )}
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Estado de la Suscripción
          </h3>

          {loading ? (
            <div className="py-4">
              <LoadingSpinner size="md" />
            </div>
          ) : subscription ? (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Estado</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${subscription.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}
                >
                  {subscription.status === "active"
                    ? "Activa"
                    : subscription.status}
                </span>
              </div>

              {subscription.cancelAtPeriodEnd ? (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <p className="text-amber-800 text-sm mb-3">
                    ⚠️ Tu suscripción se cancelará automáticamente el{" "}
                    <strong>
                      {new Date(subscription.renewalDate).toLocaleDateString()}
                    </strong>
                    . Tienes acceso Premium hasta entonces.
                  </p>
                  <button
                    onClick={handleReactivate}
                    disabled={reactivating}
                    className="text-amber-700 text-sm font-bold hover:text-amber-900 hover:underline disabled:opacity-50 transition-colors"
                  >
                    {reactivating ? "Procesando..." : "Reactivar suscripción"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">
                      Próxima renovación
                    </span>
                    <span className="font-bold text-slate-800">
                      {new Date(subscription.renewalDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/50">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="text-red-500 text-sm font-bold hover:text-red-700 hover:underline disabled:opacity-50 transition-colors"
                    >
                      {cancelling ? "Procesando..." : "Cancelar suscripción"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : user.planLevel === "premium" ? (
            <div className="bg-green-50 p-5 rounded-xl border border-green-100 text-center">
              <p className="text-green-800 font-bold mb-2">
                ✨ Plan Premium Activo
              </p>
              <p className="text-green-700 text-sm">
                Disfrutas de todos los beneficios Premium.
                <br />
                <span className="text-xs opacity-80">
                  (No se encontró información de facturación recurrente o hubo
                  un error al cargarla)
                </span>
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 mb-4">
                No tienes una suscripción activa.
              </p>
              {ENABLE_UPGRADES && (
                <Link
                  to="/pricing"
                  className="text-blue-600 font-bold hover:underline text-sm"
                >
                  Ver planes disponibles
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={logout}
          className="text-slate-400 font-bold hover:text-red-500 transition-colors text-sm"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
