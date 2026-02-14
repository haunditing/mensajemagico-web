import React from "react";

interface LogoProps {
  className?: string;
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className = "h-12 w-12",
  withText = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <a href="/" className="group flex flex-col items-center">
        <img
          src="/android-chrome-512x512.png"
          alt="MensajeMágico Icono"
          className={`object-contain transition-transform duration-300 group-hover:rotate-12 ${className}`}
        />
      </a>
    </div>
  );
};

export default Logo;
