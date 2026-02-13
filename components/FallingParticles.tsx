import React, { useEffect, useState, useMemo } from 'react';

interface FallingParticlesProps {
  count?: number;
  emojis?: string[];
  className?: string;
  iterationCount?: number | "infinite";
}

const FallingParticles: React.FC<FallingParticlesProps> = React.memo(({ 
  count = 15, 
  emojis = ['❤️', '💖', '💘', '💝'],
  className = "",
  iterationCount = "infinite"
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: number;
    delay: number;
    duration: number;
    emoji: string;
    size: number;
    opacity: number;
  }>>([]);

  // Serializar emojis para evitar re-renderizados innecesarios si el array cambia de referencia
  const emojisKey = useMemo(() => JSON.stringify(emojis), [emojis]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10, // Entre 5 y 15 segundos de caída
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 0.5 + Math.random() * 1.5, // Tamaño entre 0.5rem y 2rem para más variedad
        opacity: 0.3 + Math.random() * 0.7 // Opacidad entre 0.3 y 1
      }))
    );
  }, [count, emojisKey]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden -z-10 ${className}`} aria-hidden="true">
      <style>
        {`
          @keyframes fall-fade {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
            10% { opacity: var(--particle-opacity); }
            80% { opacity: var(--particle-opacity); }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
        `}
      </style>
      {particles.map((p: any) => (
        <div
          key={p.id}
          className="absolute top-[-10%] dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
          style={{
            left: `${p.left}%`,
            animationName: 'fall-fade',
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}rem`,
            ['--particle-opacity' as any]: p.opacity,
            animationIterationCount: iterationCount,
            willChange: 'transform, opacity', // Optimización de GPU
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
});

export default FallingParticles;