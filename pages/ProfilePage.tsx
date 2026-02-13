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
  const [neutralMode, setNeutralMode] = useState(false);
  const [isSavingNeutral, setIsSavingNeutral] = useState(false);
  const [grammaticalGender, setGrammaticalGender] = useState("neutral");
  
  // Estado para cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  useEffect(() => {
    if (user) {
      loadSubscription();
      if ((user as any).location) setLocationInput((user as any).location);
    }
  }, [user]);

  useEffect(() => {
    if (user && (user as any).preferences?.neutralMode) {
      setNeutralMode(true);
    }
    if (user && (user as any).preferences?.grammaticalGender) {
      setGrammaticalGender((user as any).preferences.grammaticalGender);
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

  const toggleNeutralMode = async () => {
    const newValue = !neutralMode;
    setNeutralMode(newValue);
    setIsSavingNeutral(true);

    try {
      await api.put("/api/auth/profile", { neutralMode: newValue });
      await refreshUser();
      showToast(newValue ? "Modo Neutro activado" : "Modo Neutro desactivado", "success");
    } catch (error: any) {
      setNeutralMode(!newValue); // Revertir en caso de error
      showToast("Error al actualizar preferencia", "error");
    } finally {
      setIsSavingNeutral(false);
    }
  };

  const handleGenderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGender = e.target.value;
    setGrammaticalGender(newGender);
    try {
      await api.put("/api/auth/profile", { grammaticalGender: newGender });
      await refreshUser();
      showToast("Preferencia de género actualizada", "success");
    } catch (error: any) {
      showToast(error.message || "Error al actualizar", "error");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Las nuevas contraseñas no coinciden", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("La nueva contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.put("/api/auth/change-password", { currentPassword, newPassword });
      showToast("Contraseña actualizada correctamente", "success");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showToast(error.message || "Error al cambiar contraseña", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "ELIMINAR") return;

    setIsDeletingAccount(true);
    try {
      await api.delete("/api/auth/delete-account");
      logout();
      showToast("Tu cuenta ha sido eliminada permanentemente", "success");
    } catch (error: any) {
      showToast(error.message || "Error al eliminar cuenta", "error");
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
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

        {/* Sección de Preferencias (Modo Neutro) */}
        {user.planLevel === 'premium' && (
          <div className="border-t border-slate-100 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Modo Neutro</h3>
                <p className="text-sm text-slate-500">Evita modismos regionales en los mensajes.</p>
              </div>
              <button 
                onClick={toggleNeutralMode}
                disabled={isSavingNeutral}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${neutralMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                title={neutralMode ? "Desactivar Modo Neutro" : "Activar Modo Neutro"}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${neutralMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Sección de Género Gramatical */}
        <div className="border-t border-slate-100 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Género Gramatical</h3>
              <p className="text-sm text-slate-500">¿Cómo quieres que la IA se dirija a ti?</p>
            </div>
            <select
              value={grammaticalGender}
              onChange={handleGenderChange}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="male">Masculino (cansado)</option>
              <option value="female">Femenino (cansada)</option>
              <option value="neutral">Prefiero no decirlo</option>
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-3 italic">
            Esto solo afecta la concordancia en los mensajes generados para ti (ej. "estoy listo" vs "estoy lista").
            No influye en la personalidad de la IA.
          </p>
        </div>

        {/* Sección de Cambio de Contraseña */}
        <div className="border-t border-slate-100 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Contraseña</h3>
              <p className="text-sm text-slate-500">Actualiza tu clave de acceso.</p>
            </div>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-blue-600 text-sm font-bold hover:underline"
              >
                Cambiar
              </button>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handleChangePassword} className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Contraseña Actual</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nueva Contraseña</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Confirmar Nueva</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1">
                  {showPasswords ? "🙈 Ocultar" : "👁️ Mostrar"} caracteres
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsChangingPassword(false)} className="px-4 py-2 text-slate-500 font-bold hover:text-slate-700 text-sm transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSavingPassword} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50">{isSavingPassword ? "Guardando..." : "Actualizar"}</button>
                </div>
              </div>
            </form>
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

              {/* Información de Promoción */}
              {(user as any).promoEndsAt && new Date((user as any).promoEndsAt) > new Date() && (
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-start gap-3">
                  <span className="text-lg">🏷️</span>
                  <div>
                    <p className="text-indigo-900 font-bold text-sm">Tarifa Promocional</p>
                    <p className="text-indigo-700 text-xs mt-0.5">
                      Tu precio especial es válido hasta el <strong>{new Date((user as any).promoEndsAt).toLocaleDateString()}</strong>.
                    </p>
                  </div>
                </div>
              )}

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

        {/* Sección de Zona de Peligro (Eliminar Cuenta) */}
        <div className="border-t border-slate-100 py-6 mt-2">
          <h3 className="text-lg font-bold text-red-600 mb-4">Zona de Peligro</h3>
          <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-red-800 font-bold text-sm">Eliminar Cuenta</p>
              <p className="text-red-600 text-xs mt-1">
                Se borrarán todos tus datos, contactos y favoritos permanentemente.
              </p>
            </div>
            <button
              onClick={() => {
                setIsDeleteModalOpen(true);
                setDeleteConfirmationText("");
              }}
              disabled={isDeletingAccount}
              className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
            >
              Eliminar Cuenta
            </button>
          </div>
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

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !isDeletingAccount && setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">¿Eliminar cuenta?</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Esta acción es <strong>irreversible</strong>. Perderás todos tus mensajes guardados, contactos y configuración.
              </p>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Escribe <span className="text-slate-900 select-none">ELIMINAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none text-center font-bold uppercase tracking-widest"
                  placeholder="ELIMINAR"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeletingAccount} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={handleDeleteAccount} disabled={isDeletingAccount || deleteConfirmationText !== "ELIMINAR"} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isDeletingAccount ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
