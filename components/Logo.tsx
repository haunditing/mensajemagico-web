import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <img
      src="/android-chrome-512x512.png"
      alt="MensajeMágico Logo"
      className={`object-contain transition-transform duration-300 ${className}`}
    />
  );
};

export default Logo;
