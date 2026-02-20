import React, { useState, useEffect } from "react";
import { BASE_URL } from "../context/api";

export const AVATAR_COLORS: Record<string, string> = {
  blue: "from-blue-500 to-indigo-600",
  cyan: "from-blue-600 to-cyan-600",
  pink: "from-pink-500 to-rose-500",
  purple: "from-purple-500 to-violet-600",
  orange: "from-orange-500 to-amber-600",
  green: "from-emerald-500 to-teal-600",
  red: "from-red-500 to-rose-600",
  slate: "from-slate-500 to-slate-700",
};

interface UserAvatarProps {
  user: any;
  className?: string;
  showStatus?: boolean; // Para mostrar badge de premium u online si se desea futuro
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = "", showStatus = false }) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  // Resetear error si cambia la foto del usuario
  useEffect(() => {
    setImageLoadError(false);
  }, [user.profilePicture]);

  // Determinar color
  let gradientClass = AVATAR_COLORS.blue;
  const prefColor = user.preferences?.avatarColor;
  const gender = user.preferences?.grammaticalGender;

  if (prefColor && AVATAR_COLORS[prefColor]) {
    gradientClass = AVATAR_COLORS[prefColor];
  } else if (gender === "female") {
    gradientClass = AVATAR_COLORS.pink;
  } else if (gender === "male") {
    gradientClass = AVATAR_COLORS.cyan;
  }

  // Clases base
  const containerClasses = `relative rounded-full overflow-hidden flex items-center justify-center ${className}`;

  // 1. Si tiene foto y no ha fallado, mostrar imagen
  if (user.profilePicture && !imageLoadError) {
    return (
      <div className={containerClasses}>
        <img
          src={
            user.profilePicture.startsWith("data:")
              ? user.profilePicture
              : `${BASE_URL || "http://localhost:3000"}${user.profilePicture}`
          }
          alt={`Avatar de ${user.name || "usuario"}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn("Error cargando avatar:", e.currentTarget.src);
            setImageLoadError(true);
          }}
        />
      </div>
    );
  }

  // 2. Fallback: Avatar generado (Gradiente + Icono/Inicial)
  return (
    <div className={`${containerClasses} bg-gradient-to-br ${gradientClass}`}>
      {gender === "female" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[60%] h-[60%] text-white opacity-90"
        >
          <path d="M12 2c-2.21 0-4 1.79-4 4 0 1.3.64 2.45 1.62 3.17-.83.7-1.44 1.67-1.59 2.78C6.1 12.56 4 14.53 4 17v2h16v-2c0-2.47-2.1-4.44-4.03-5.05-.15-1.11-.76-2.08-1.59-2.78C15.36 8.45 16 7.3 16 6c0-2.21-1.79-4-4-4z" />
        </svg>
      ) : gender === "male" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[60%] h-[60%] text-white opacity-90"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ) : (
        <span className="text-white font-bold text-[40%]">
          {(user.name ? user.name[0] : user.email[0]).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;