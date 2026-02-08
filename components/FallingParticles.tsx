import React, { useEffect, useState } from 'react';

interface FallingParticlesProps {
  count?: number;
  emojis?: string[];
  className?: string;
}

const FallingParticles: React.FC<FallingParticlesProps> = ({ 
  count = 15, 
  emojis = ['❤️', '💖', '💘', '💝'],
  className = ""
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: number;
    delay: number;
    duration: number;
    emoji: string;
    size: number;
  }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10, // Entre 5 y 15 segundos de caída
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 0.8 + Math.random() * 1.2 // Tamaño entre 0.8rem y 2rem
      }))
    );
  }, [count, emojis]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden -z-10 ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-10%] animate-fall opacity-60"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}rem`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};

export default FallingParticles;