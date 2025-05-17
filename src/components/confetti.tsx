// src/components/confetti.tsx
'use client';

import type { CSSProperties } from 'react';
import { useState, useEffect } from 'react';

interface ConfettiParticle {
  id: number;
  style: CSSProperties;
  colorClass: string;
}

// Using Tailwind classes for colors to leverage the existing theme and add some festive variety
const confettiColorClasses = [
  'bg-primary',     // From your theme (Warm orange)
  'bg-accent',      // From your theme (Vibrant yellow)
  'bg-rose-400',    // A festive pink
  'bg-sky-400',     // A light blue
  'bg-lime-400',    // A light green
  'bg-purple-400',  // A festive purple
];

const NUM_PARTICLES = 150; // Number of confetti particles

export function Confetti() {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // This effect runs only on the client after hydration
    const generateParticles = () => {
      const newParticles: ConfettiParticle[] = [];
      for (let i = 0; i < NUM_PARTICLES; i++) {
        newParticles.push({
          id: i,
          style: {
            left: `${Math.random() * 100}vw`, // Horizontal position
            width: `${Math.random() * 8 + 5}px`, // Width between 5px and 13px
            height: `${Math.random() * 12 + 8}px`, // Height between 8px and 20px
            transform: `rotate(${Math.random() * 360}deg)`, // Initial rotation
            animationDuration: `${Math.random() * 4 + 3}s`, // Fall duration: 3s to 7s
            animationDelay: `${Math.random() * 5}s`, // Stagger start: 0s to 5s
            opacity: Math.random() * 0.6 + 0.4, // Opacity: 0.4 to 1.0
          },
          colorClass: confettiColorClasses[Math.floor(Math.random() * confettiColorClasses.length)],
        });
      }
      setParticles(newParticles);
    };

    generateParticles();

    // Automatically hide the confetti component after animations likely complete
    const cleanupTimer = setTimeout(() => {
      setIsVisible(false);
    }, 12000); // Max animation duration (7s) + max delay (5s) = 12s

    return () => clearTimeout(cleanupTimer);
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[9999] overflow-hidden"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute animate-fall rounded-sm ${particle.colorClass}`}
          style={particle.style}
        />
      ))}
    </div>
  );
}
