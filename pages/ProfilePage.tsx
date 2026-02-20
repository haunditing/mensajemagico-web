import React, { useEffect, useState, useRef } from "react";
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
import { api, BASE_URL } from "../context/api";
import CitySelector from "../components/CitySelector";
import { useConfirm } from "../context/ConfirmContext";
import Cropper from "react-easy-crop";
import UserAvatar, { AVATAR_COLORS } from "../components/UserAvatar";

const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const { confirm } = useConfirm();

  // Estado para Nombre y Foto
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para Cropper
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Estado para edición de ubicación
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isSavingLoc, setIsSavingLoc] = useState(false);
  const [neutralMode, setNeutralMode] = useState(false);
  const [isSavingNeutral, setIsSavingNeutral] = useState(false);
  const [grammaticalGender, setGrammaticalGender] = useState("neutral");
  const [avatarColor, setAvatarColor] = useState("blue");
  
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
      if ((user as any).name) setNameInput((user as any).name);

      // Cargar color o derivar del género si no existe
      if ((user as any).preferences?.avatarColor) {
        setAvatarColor((user as any).preferences.avatarColor);
      } else if ((user as any).preferences?.grammaticalGender) {
        const g = (user as any).preferences.grammaticalGender;
        if (g === "female") setAvatarColor("pink");
        else if (g === "male") setAvatarColor("cyan");
      }
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
    const isConfirmed = await confirm({
      title: "¿Cancelar suscripción?",
      message: "¿Estás seguro? Perderás los beneficios Premium al final del periodo actual.",
      confirmText: "Sí, cancelar",
      isDangerous: true
    });
    if (!isConfirmed) return;

    setCancelling(true);
    try {
      await cancelSubscription(user._id);
      showToast(
        "Entendido. Tu suscripción ha sido cancelada, pero seguiremos aquí hasta el final del periodo.",
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
      showToast("¡Qué alegría tenerte de vuelta! Tu suscripción está activa.", "success");
      loadSubscription(); // Recargar estado
    } catch (error: any) {
      showToast(error.message || "Error al reactivar", "error");
    } finally {
      setReactivating(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    try {
      await api.put("/api/auth/profile", { name: nameInput });
      await refreshUser();
      setIsEditingName(false);
      showToast("Nombre actualizado correctamente", "success");
    } catch (error: any) {
      showToast(error.message || "Error al actualizar nombre", "error");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeletePhoto = async () => {
    const isConfirmed = await confirm({
      title: "¿Eliminar foto?",
      message: "¿Estás seguro de que quieres eliminar tu foto de perfil?",
      confirmText: "Sí, eliminar",
      isDangerous: true
    });
    if (!isConfirmed) return;

    setIsUploadingPhoto(true);
    try {
      await api.put("/api/auth/profile", { deleteProfilePicture: true });
      await refreshUser();
      showToast("Foto de perfil eliminada", "success");
    } catch (error: any) {
      showToast(error.message || "Error al eliminar foto", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setIsUploadingPhoto(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
      
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir imagen");

      await refreshUser();
      showToast("Foto de perfil actualizada", "success");
      setImageSrc(null); // Cerrar modal
    } catch (error: any) {
      showToast(error.message || "Error al subir imagen", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("La imagen no debe superar los 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
    });
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveLocation = async () => {
    setIsSavingLoc(true);
    try {
      await api.put("/api/auth/profile", { location: locationInput });
      await refreshUser();
      setIsEditingLoc(false);
      showToast("Tu ubicación se ha actualizado. Ahora estamos más cerca.", "success");
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

  const handleColorChange = async (color: string) => {
    setAvatarColor(color);
    try {
      await api.put("/api/auth/profile", { avatarColor: color });
      await refreshUser();
    } catch (error: any) {
      showToast("Error al guardar el color", "error");
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
      showToast("Tu contraseña se ha actualizado. Tu cuenta está segura.", "success");
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
      showToast("Tu cuenta ha sido eliminada. Esperamos volver a verte algún día.", "success");
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Inicia sesión para ver tu perfil
        </h2>
        <Link
          to="/login"
          className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors mt-4"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Mi Perfil</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 text-center md:text-left">
          <div className="relative group">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="w-20 h-20 rounded-full overflow-hidden focus:ring-4 focus:ring-blue-500 focus:outline-none transition-all relative"
              aria-label="Cambiar foto de perfil"
            >
              <UserAvatar user={user} className="w-full h-full text-3xl" />
              
              {/* Overlay de edición al pasar el mouse */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">
                  {isUploadingPhoto ? "..." : "📷"}
                </span>
              </div>
            </button>
            {(user as any).profilePicture && (
              <button
                onClick={handleDeletePhoto}
                disabled={isUploadingPhoto}
                className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 text-red-500 dark:text-red-400 p-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors z-10"
                title="Eliminar foto"
                aria-label="Eliminar foto de perfil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
            />
          </div>

          <div className="flex-1 min-w-0 w-full md:w-auto">
            {isEditingName ? (
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none w-full max-w-[200px]"
                  placeholder="Tu nombre"
                  autoFocus
                />
                <button onClick={handleSaveName} disabled={isSavingName} className="text-green-600 hover:text-green-700 p-1">
                  {isSavingName ? "..." : "✓"}
                </button>
                <button onClick={() => setIsEditingName(false)} className="text-red-500 hover:text-red-600 p-1">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center md:justify-start group">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {(user as any).name || "Usuario sin nombre"}
                </h2>
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-400 hover:text-blue-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1"
                  aria-label="Editar nombre"
                >
                  ✏️
                </button>
              </div>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            <p className="text-slate-500 dark:text-slate-400 capitalize font-medium">
              Plan {user.planLevel}
            </p>
          </div>
        </div>

        {/* Sección de Ubicación */}
        <div className="border-t border-slate-100 dark:border-slate-800 py-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ubicación (Modo Regional)
            </h3>
            {!isEditingLoc && (
              <button
                onClick={() => {
                  setIsEditingLoc(true);
                  setLocationInput((user as any).location || "");
                }}
                className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {isEditingLoc ? (
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-start">
              <div className="flex-1 w-full md:w-auto">
                <CitySelector
                  value={locationInput}
                  onChange={setLocationInput}
                  placeholder="Ej: Cartagena, Medellín..."
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleSaveLocation}
                  disabled={isSavingLoc}
                  className="flex-1 md:flex-none bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSavingLoc ? "..." : "Guardar"}
                </button>
                <button
                  onClick={() => setIsEditingLoc(false)}
                  className="flex-1 md:flex-none text-slate-500 dark:text-slate-400 px-3 font-bold hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl md:border-0"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-300">
              {(user as any).location ? (
                <span className="flex items-center gap-2">
                  📍 {(user as any).location}
                  {user.planLevel === "premium" && (
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                      Activo ✨
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 italic">
                  No definida (Se usará detección automática)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Sección de Preferencias (Modo Neutro) */}
        {user.planLevel === 'premium' && (
          <div className="border-t border-slate-100 dark:border-slate-800 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Modo Neutro</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Evita modismos regionales en los mensajes.</p>
              </div>
              <button 
                onClick={toggleNeutralMode}
                disabled={isSavingNeutral}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${neutralMode ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                title={neutralMode ? "Desactivar Modo Neutro" : "Activar Modo Neutro"}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${neutralMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Sección de Género Gramatical */}
        <div className="border-t border-slate-100 dark:border-slate-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Género Gramatical</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">¿Cómo quieres que la IA se dirija a ti?</p>
            </div>
            <select
              value={grammaticalGender}
              onChange={handleGenderChange}
              className="w-full md:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="male">Masculino (cansado)</option>
              <option value="female">Femenino (cansada)</option>
              <option value="neutral">Prefiero no decirlo</option>
            </select>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
            Esto solo afecta la concordancia en los mensajes generados para ti (ej. "estoy listo" vs "estoy lista").
            No influye en la personalidad de la IA.
          </p>
        </div>

        {/* Sección de Color de Avatar */}
        <div className="border-t border-slate-100 dark:border-slate-800 py-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Color de Fondo</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(AVATAR_COLORS).map(([key, gradientClass]) => (
              <button
                key={key}
                onClick={() => handleColorChange(key)}
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientClass} transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 ${
                  avatarColor === key ? "ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-slate-900 scale-110" : ""
                }`}
                aria-label={`Seleccionar color ${key}`}
              />
            ))}
          </div>
        </div>

        {/* Sección de Cambio de Contraseña */}
        <div className="border-t border-slate-100 dark:border-slate-800 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contraseña</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Actualiza tu clave de acceso.</p>
            </div>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
              >
                Cambiar
              </button>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handleChangePassword} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Contraseña Actual</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Nueva Contraseña</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Confirmar Nueva</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between pt-2 gap-4 md:gap-0">
                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium flex items-center gap-1 w-full md:w-auto justify-center md:justify-start">
                  {showPasswords ? "🙈 Ocultar" : "👁️ Mostrar"} caracteres
                </button>
                <div className="flex gap-3 w-full md:w-auto">
                  <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 md:flex-none px-4 py-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-slate-200 text-sm transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSavingPassword} className="flex-1 md:flex-none bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">{isSavingPassword ? "Guardando..." : "Actualizar"}</button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Estado de la Suscripción
          </h3>

          {loading ? (
            <div className="py-4">
              <LoadingSpinner size="md" />
            </div>
          ) : subscription ? (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Estado</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${subscription.status === "active" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
                >
                  {subscription.status === "active"
                    ? "Activa"
                    : subscription.status}
                </span>
              </div>

              {/* Información de Promoción */}
              {(user as any).promoEndsAt && new Date((user as any).promoEndsAt) > new Date() && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
                  <span className="text-lg">🏷️</span>
                  <div>
                    <p className="text-indigo-900 dark:text-indigo-200 font-bold text-sm">Tarifa Promocional</p>
                    <p className="text-indigo-700 dark:text-indigo-300 text-xs mt-0.5">
                      Tu precio especial es válido hasta el <strong>{new Date((user as any).promoEndsAt).toLocaleDateString()}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {subscription.cancelAtPeriodEnd ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30">
                  <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
                    {subscription.provider === "wompi" ? (
                      <>
                        ⚠️ Tu plan no se renueva automáticamente. Tienes acceso Premium hasta el{" "}
                        <strong>{new Date(subscription.renewalDate).toLocaleDateString()}</strong>.
                      </>
                    ) : (
                      <>
                        ⚠️ Tu suscripción se cancelará automáticamente el{" "}
                        <strong>{new Date(subscription.renewalDate).toLocaleDateString()}</strong>. Tienes acceso Premium hasta entonces.
                      </>
                    )}
                  </p>
                  {subscription.provider === "wompi" ? (
                    <Link
                      to="/pricing"
                      state={{ interval: subscription.interval }}
                      className="text-amber-700 dark:text-amber-400 text-sm font-bold hover:text-amber-900 dark:hover:text-amber-300 hover:underline transition-colors"
                    >
                      Renovar ahora
                    </Link>
                  ) : (
                    <button onClick={handleReactivate} disabled={reactivating} className="text-amber-700 dark:text-amber-400 text-sm font-bold hover:text-amber-900 dark:hover:text-amber-300 hover:underline disabled:opacity-50 transition-colors">
                      {reactivating ? "Procesando..." : "Reactivar suscripción"}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Próxima renovación
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {new Date(subscription.renewalDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="text-red-500 dark:text-red-400 text-sm font-bold hover:text-red-700 dark:hover:text-red-300 hover:underline disabled:opacity-50 transition-colors"
                    >
                      {cancelling ? "Procesando..." : "Cancelar suscripción"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : user.planLevel === "premium" ? (
            <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-100 dark:border-green-900/30 text-center">
              <p className="text-green-800 dark:text-green-200 font-bold mb-2">
                ✨ Plan Premium Activo
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm">
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
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No tienes una suscripción activa.
              </p>
              {ENABLE_UPGRADES && (
                <Link
                  to="/pricing"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-sm"
                >
                  Ver planes disponibles
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sección de Zona de Peligro (Eliminar Cuenta) */}
        <div className="border-t border-slate-100 dark:border-slate-800 py-6 mt-2">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Zona de Peligro</h3>
          <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-red-800 dark:text-red-200 font-bold text-sm">Eliminar Cuenta</p>
              <p className="text-red-600 dark:text-red-300 text-xs mt-1">
                Se borrarán todos tus datos, contactos y favoritos permanentemente.
              </p>
            </div>
            <button
              onClick={() => {
                setIsDeleteModalOpen(true);
                setDeleteConfirmationText("");
              }}
              disabled={isDeletingAccount}
              className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-600 dark:hover:bg-red-700 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
            >
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={logout}
          className="text-slate-500 dark:text-slate-400 font-bold hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !isDeletingAccount && setIsDeleteModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">¿Eliminar cuenta?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Esta acción es <strong>irreversible</strong>. Perderás todos tus mensajes guardados, contactos y configuración.
              </p>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Escribe <span className="text-slate-900 dark:text-white select-none">ELIMINAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none text-center font-bold uppercase tracking-widest"
                  placeholder="ELIMINAR"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeletingAccount} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={handleDeleteAccount} disabled={isDeletingAccount || deleteConfirmationText !== "ELIMINAR"} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 shadow-lg shadow-red-600/20 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isDeletingAccount ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recorte de Imagen */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Ajustar Foto</h3>
              <button onClick={() => setImageSrc(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
            </div>
            
            <div className="relative h-64 sm:h-80 w-full bg-slate-100 dark:bg-slate-800">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setImageSrc(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUploadCroppedImage}
                  disabled={isUploadingPhoto}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isUploadingPhoto ? "Guardando..." : "Guardar Foto"}
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

// Utilidades para recortar imagen
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
}
