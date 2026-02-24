import React from "react";

interface OccasionIconProps {
  slug?: string;
  icon?: string; // Fallback para cuando no hay slug o es un emoji simple
  className?: string;
  isLarge?: boolean;
  isActive?: boolean;
}

const OccasionIcon: React.FC<OccasionIconProps> = ({
  slug,
  icon,
  className = "",
  isLarge = false,
  isActive = false,
}) => {
  // Diccionario de colores temáticos
  const colors: Record<string, string> = {
    "pensamiento-del-dia": "text-indigo-500 dark:text-indigo-400",
    "responder-un-mensaje": "text-sky-500 dark:text-sky-400",
    "no-me-dejes-en-visto": "text-emerald-500 dark:text-emerald-400",
    "un-saludo": "text-orange-400 dark:text-orange-300",
    perdoname: "text-amber-500 dark:text-amber-400",
    amor: "text-rose-500 dark:text-rose-400",
    cumpleanos: "text-orange-500 dark:text-orange-400",
    anniversary: "text-cyan-500 dark:text-cyan-400",
    "dia-de-la-madre": "text-pink-500 dark:text-pink-400",
    "dia-del-padre": "text-blue-500 dark:text-blue-400",
    navidad: "text-red-500 dark:text-red-400",
    felicitacion: "text-yellow-500 dark:text-yellow-400",
  };

  const iconColorClass = isActive
    ? "text-white"
    : slug
      ? colors[slug] || "text-slate-400"
      : "text-current";
  const sizeClass = isLarge ? "w-12 h-12 md:w-16 md:h-16" : "w-6 h-6";

  // WhatsApp Icon Especial
  if (icon === "whatsapp" || slug === "no-me-dejes-en-visto") {
    const isVisto = slug === "no-me-dejes-en-visto";
    return (
      <>
        {isVisto && (
          <style>
            {`
            @keyframes shake-no {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-3px); }
              75% { transform: translateX(3px); }
            }
            .group:hover .animate-shake-no {
              animation: shake-no 0.4s ease-in-out infinite;
            }
          `}
          </style>
        )}
        <svg
          viewBox="0 0 24 24"
          className={`${sizeClass} ${iconColorClass} ${className} ${isVisto ? "animate-shake-no" : ""}`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </>
    );
  }

  // Diccionario de paths SVG
  const icons: Record<string, React.ReactNode> = {
    "pensamiento-del-dia": (
      <>
        <g className="bulb-rays opacity-0">
          <path d="M12 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4.93 4.93L7.05 7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19.07 4.93L16.95 7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M2 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
        <path
          d="M9 21H15M10 18H14M12 7C9.23858 7 7 9.23858 7 12C7 13.5 7.8 14.8 9 15.5V18H15V15.5C16.2 14.8 17 13.5 17 12C17 9.23858 14.7614 7 12 7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="bulb-body"
        />
      </>
    ),
    "responder-un-mensaje": (
      <path
        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    "un-saludo": (
      <path
        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V4a1.5 1.5 0 013 0v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    perdoname: (
      <>
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M12 6v7M9 8h6M9 11h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
    amor: (
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.77-8.77 1.06-1.06a5.5 5.5 0 0 0 0-7.78v0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    cumpleanos: (
      <>
        <path
          d="M12 7V3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3C12 3 11 1 12 0C13 1 12 3 12 3Z"
          fill="currentColor"
          className="text-yellow-400 dark:text-yellow-300"
        />
        <path
          d="M20 21H4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 21V12C18 10.8954 17.1046 10 16 10H8C6.89543 10 6 10.8954 6 12V21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 15H18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        />
      </>
    ),
    anniversary: (
      <>
        <g className="glass-left">
          <path
            d="M7 4V9C7 10.1046 7.89543 11 9 11C10.1046 11 11 10.1046 11 9V4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M9 11V19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6 19H12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <g className="glass-right">
          <path
            d="M17 4V9C17 10.1046 16.1046 11 15 11C13.8954 11 13 10.1046 13 9V4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M15 11V19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 19H18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <path
          d="M12 2L12 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="clink-spark opacity-0"
        />
      </>
    ),
    "dia-de-la-madre": (
      <>
        <path
          d="M12 22V12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="flower-head"
          d="M12 12C12 12 16 9 16 6C16 3 13 2 12 2C11 2 8 3 8 6C8 9 12 12 12 12Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M12 18L15 16M12 15L9 13.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
    "dia-del-padre": (
      <>
        <path
          d="M16 3H8L10 8L7 16L12 21L17 16L14 8L16 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M10 8L14 8" stroke="currentColor" strokeWidth="2" />
      </>
    ),
    felicitacion: (
      <>
        <path
          d="M12 15C15.866 15 19 11.866 19 8.5C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 8.5C5 11.866 8.13401 15 12 15Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 6L13 8H15L13.5 9.5L14 11.5L12 10.5L10 11.5L10.5 9.5L9 8H11L12 6Z"
          fill="currentColor"
          className="text-yellow-500 dark:text-yellow-300"
        />
      </>
    ),
    navidad: (
      <>
        <g className="snow-particles">
          <circle cx="12" cy="2" r="1" className="text-sky-200 dark:text-sky-100" fill="currentColor" />
          <circle cx="7" cy="6" r="0.8" className="text-sky-200 dark:text-sky-100" fill="currentColor" />
          <circle cx="17" cy="6" r="0.8" className="text-sky-200 dark:text-sky-100" fill="currentColor" />
          <circle cx="5" cy="11" r="0.6" className="text-sky-200 dark:text-sky-100" fill="currentColor" />
          <circle cx="19" cy="11" r="0.6" className="text-sky-200 dark:text-sky-100" fill="currentColor" />
          <circle cx="12" cy="16" r="0.6" className="text-sky-200 dark:text-sky-100" fill="currentColor" />
        </g>
        <path
          d="M12 3L5 18H19L12 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M12 18V21" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9 10H15M8 14H16"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </>
    ),
  };

  if (slug && icons[slug]) {
    const isGreeting = slug === "un-saludo";
    const isLove = slug === "amor";
    const isResponder = slug === "responder-un-mensaje";
    const isPensamiento = slug === "pensamiento-del-dia";
    const isPerdoname = slug === "perdoname";
    const isBirthday = slug === "cumpleanos";
    const isAnniversary = slug === "anniversary";
    const isChristmas = slug === "navidad";
    const isFathersDay = slug === "dia-del-padre";
    const isMothersDay = slug === "dia-de-la-madre";
    const isFelicitacion = slug === "felicitacion";

    return (
      <>
        {isGreeting && (
          <style>
            {`
            @keyframes wave {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-15deg); }
              75% { transform: rotate(10deg); }
            }
            .group:hover .animate-wave-hand {
              animation: wave 1.2s ease-in-out infinite;
              transform-origin: 70% 70%;
            }
          `}
          </style>
        )}
        {isLove && (
          <style>
            {`
            @keyframes heartbeat {
              0% { transform: scale(1); }
              14% { transform: scale(1.15); }
              28% { transform: scale(1); }
              42% { transform: scale(1.15); }
              70% { transform: scale(1); }
            }
            .group:hover .animate-heartbeat {
              animation: heartbeat 1.3s ease-in-out infinite;
              transform-origin: center;
            }
          `}
          </style>
        )}
        {isResponder && (
          <style>
            {`
            @keyframes ring {
              0% { transform: rotate(0); }
              10% { transform: rotate(15deg); }
              20% { transform: rotate(-15deg); }
              30% { transform: rotate(10deg); }
              40% { transform: rotate(-10deg); }
              50% { transform: rotate(5deg); }
              60% { transform: rotate(-5deg); }
              70% { transform: rotate(0); }
              100% { transform: rotate(0); }
            }
            .group:hover .animate-ring {
              animation: ring 1.5s ease-in-out infinite;
              transform-origin: center;
            }
          `}
          </style>
        )}
        {isPensamiento && (
          <style>
            {`
            @keyframes glow {
              0%, 100% { opacity: 0; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.1); }
            }
            .group:hover .bulb-rays {
              animation: glow 1.5s ease-in-out infinite;
              transform-origin: 12px 12px;
            }
            .group:hover .bulb-body {
              fill: currentColor;
              fill-opacity: 0.2;
              transition: fill-opacity 0.3s;
            }
          `}
          </style>
        )}
        {isPerdoname && (
          <style>
            {`
            @keyframes rock {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-10deg); }
              75% { transform: rotate(10deg); }
            }
            .group:hover .animate-rock {
              animation: rock 2s ease-in-out infinite;
              transform-origin: bottom center;
            }
          `}
          </style>
        )}
        {isAnniversary && (
          <style>
            {`
            @keyframes clink-left {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(15deg); }
            }
            @keyframes clink-right {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-15deg); }
            }
            @keyframes spark {
              0%, 100% { opacity: 0; transform: scale(0); }
              50% { opacity: 1; transform: scale(1.5); }
            }
            .group:hover .glass-left {
              animation: clink-left 1s ease-in-out infinite;
              transform-origin: 9px 19px;
            }
            .group:hover .glass-right {
              animation: clink-right 1s ease-in-out infinite;
              transform-origin: 15px 19px;
            }
            .group:hover .clink-spark {
              animation: spark 1s ease-in-out infinite;
              transform-origin: 12px 3px;
            }
          `}
          </style>
        )}
        {isChristmas && (
          <style>
            {`
            @keyframes snow {
              0% { transform: translateY(-5px); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translateY(15px); opacity: 0; }
            }
            .snow-particles circle {
              opacity: 0;
            }
            .group:hover .snow-particles circle {
              animation: snow 2s linear infinite;
            }
            .group:hover .snow-particles circle:nth-child(1) { animation-delay: 0s; }
            .group:hover .snow-particles circle:nth-child(2) { animation-delay: 0.8s; }
            .group:hover .snow-particles circle:nth-child(3) { animation-delay: 0.4s; }
            .group:hover .snow-particles circle:nth-child(4) { animation-delay: 1.2s; }
            .group:hover .snow-particles circle:nth-child(5) { animation-delay: 0.6s; }
            .group:hover .snow-particles circle:nth-child(6) { animation-delay: 1.0s; }
          `}
          </style>
        )}
        {isFathersDay && (
          <style>
            {`
            @keyframes adjust-tie {
              0%, 100% { transform: translateY(0) scale(1); }
              25% { transform: translateY(-2px) scale(1.05); }
              50% { transform: translateY(-2px) rotate(-3deg); }
              75% { transform: translateY(-2px) rotate(3deg); }
            }
            .group:hover .animate-adjust-tie {
              animation: adjust-tie 1s ease-in-out infinite;
              transform-origin: top center;
            }
          `}
          </style>
        )}
        {isMothersDay && (
          <style>
            {`
            @keyframes bloom {
              0%, 100% { transform: scale(1) rotate(0deg); }
              50% { transform: scale(1.15) rotate(5deg); }
            }
            .group:hover .flower-head {
              animation: bloom 2s ease-in-out infinite;
              transform-origin: 12px 12px;
            }
          `}
          </style>
        )}
        {isFelicitacion && (
          <style>
            {`
            @keyframes bounce-medal {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-3px); }
            }
            .group:hover .animate-bounce-medal {
              animation: bounce-medal 1s ease-in-out infinite;
            }
          `}
          </style>
        )}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`${sizeClass} ${iconColorClass} ${className} ${isGreeting ? "animate-wave-hand" : ""} ${isLove ? "animate-heartbeat" : ""} ${isResponder ? "animate-ring" : ""} ${isPerdoname ? "animate-rock" : ""} ${isChristmas ? "animate-snow" : ""} ${isFathersDay ? "animate-adjust-tie" : ""} ${isMothersDay ? "animate-bloom" : ""} ${isFelicitacion ? "animate-bounce-medal" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {icons[slug]}
        </svg>
      </>
    );
  }

  // Fallback a emoji
  return (
    <span className={`${isLarge ? "text-5xl" : "text-3xl"} ${className}`}>
      {icon}
    </span>
  );
};

export default OccasionIcon;
