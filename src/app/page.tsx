
import { EventDetails } from "@/components/event-details";
import { RsvpForm } from "@/components/rsvp-form";
import { Confetti } from "@/components/confetti"; // Import the new Confetti component
import { Heart } from "lucide-react";

export default function HomePage() {
  return (
    <> {/* Use a fragment to allow Confetti to be a sibling at the top level */}
      <Confetti /> {/* Add Confetti component here */}
      <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 bg-background font-sans">
        <div className="w-full max-w-2xl space-y-8">
          <EventDetails />
          <RsvpForm />
        </div>

        <footer className="w-full max-w-2xl mt-16 mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 my-4">
            <div className="w-24 h-[2px] bg-accent" /> {/* Left Line */}
            <Heart className="w-5 h-5 text-pink-500 fill-current" /> {/* Filled Heart Icon */}
            <div className="w-24 h-[2px] bg-accent" /> {/* Right Line */}
          </div>
          <p className="text-sm text-foreground/80">
            Con cariño, La Familia Carvajal &copy; 2025
          </p>
        </footer>
      </main>
    </>
  );
}
