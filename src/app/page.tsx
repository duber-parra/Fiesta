import { EventDetails } from "@/components/event-details";
import { RsvpForm } from "@/components/rsvp-form";
import { Toaster } from "@/components/ui/toaster";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 bg-background font-sans">
      <div className="w-full max-w-2xl space-y-8">
        <EventDetails />
        <RsvpForm />
      </div>
      <Toaster />
    </main>
  );
}
