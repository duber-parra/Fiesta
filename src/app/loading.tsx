// src/app/loading.tsx
import { Playfair_Display } from 'next/font/google';

// Configure the Playfair Display font for the number "95"
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'], // Using a bold weight for prominence
  variable: '--font-playfair-display', // CSS variable for easy use
});

export default function Loading() {
  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-300 ease-in-out animate-in fade-in-0 ${playfairDisplay.variable}`}
    >
      <div className="relative text-center p-6">
        <span
          className="font-playfair-display text-8xl sm:text-9xl font-bold text-primary animate-pulse-slow-scale"
        >
          95
        </span>
        <p className="mt-4 text-lg sm:text-xl text-foreground/90">
          Celebrando una vida extraordinaria
        </p>
        <p className="mt-2 text-sm text-muted-foreground animate-pulse">
          Preparando la celebración...
        </p>
      </div>
    </div>
  );
}
