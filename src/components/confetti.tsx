// src/components/confetti.tsx
'use client';

import type { CSSProperties } from 'react';
import { useState, useEffect } from 'react';

interface ConfettiParticle {
  id: number;
  style: CSSProperties;
  colorClass: string; // For Tailwind classes
}

// Define color options, allowing either a Tailwind class or a direct backgroundColor
interface ColorOption {
  className?: string;
  backgroundColor?: string;
}

const confettiColors: ColorOption[] = [
  { className: 'bg-slate-300' },    // Silver
  { className: 'bg-gray-300' },      // Light Gray (Silver tone)
  { className: 'bg-slate-400' },    // Darker Silver
  { backgroundColor: '#c8b086' },  // Custom gold/beige
  { backgroundColor: '#d4c096' },  // A slightly lighter version of custom gold for variety
  { className: 'bg-white opacity-90' }, // White (can look like silver highlights)
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
        const selectedColorOption = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        
        const particleBaseStyle: CSSProperties = {
          left: `${Math.random() * 100}vw`, // Horizontal position
          width: `${Math.random() * 8 + 5}px`, // Width between 5px and 13px
          height: `${Math.random() * 12 + 8}px`, // Height between 8px and 20px
          transform: `rotate(${Math.random() * 360}deg)`, // Initial rotation
          animationDuration: `${Math.random() * 4 + 3}s`, // Fall duration: 3s to 7s
          animationDelay: `${Math.random() * 5}s`, // Stagger start: 0s to 5s
          opacity: Math.random() * 0.6 + 0.4, // Opacity: 0.4 to 1.0
        };

        const particleFinalStyle: CSSProperties = { ...particleBaseStyle };
        if (selectedColorOption.backgroundColor) {
          particleFinalStyle.backgroundColor = selectedColorOption.backgroundColor;
        }

        newParticles.push({
          id: i,
          style: particleFinalStyle,
          colorClass: selectedColorOption.className || '', // Use className if provided, otherwise empty
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
