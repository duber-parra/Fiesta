
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock3, MapPin, Gift } from "lucide-react";
import Image from 'next/image'; // Import next/image

export function EventDetails() {
  const eventLocationUrl = "https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d127224.59614033248!2d-75.77886649628904!3d4.809744220402923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x8e387a4d9d3740fd%3A0x364642def000b8d6!2sLa%20Virginia-Cerritos%2C%20entrada%2012%2C%20Pereira%2C%20Risaralda!3m2!1d4.79694!2d-75.856409!5e0!3m2!1sen!2sco!4v1747468925504!5m2!1sen!2sco";

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-2"> {/* Changed mb-4 to mb-2 */}
          <Image
            src="https://i.postimg.cc/QCKSRcXw/portadaa.png"
            alt="Jorge Enrique Carvajal - Portada Celebración 95 Años"
            width={192} // Scaled by 1.2 from 160
            height={192} // Scaled by 1.2 from 160
            className="object-cover" // Removed rounded-full and shadow-md
            priority // Optional: if the image is above the fold
            data-ai-hint="portrait person"
          />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">🎉 ¡Estás Invitado! 🎉</CardTitle>
        <CardDescription className="text-lg text-foreground/80 mt-2">
          Celebración de los 95 Años de Jorge Enrique Carvajal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-center text-foreground/90">
          Con inmensa alegría, te invitamos a celebrar un hito muy especial: ¡los 95 años de vida de nuestro querido Jorge Enrique Carvajal!
        </p>
        <p className="text-center text-foreground/90">
          Acompáñanos a festejar su admirable trayectoria, sus enseñanzas y el cariño que siempre nos ha brindado. Será un momento inolvidable para honrar su vida y compartir juntos.
        </p>
        
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xl font-semibold text-center text-primary mb-3">Detalles del Evento:</h3>
          <div className="flex items-start space-x-3">
            <CalendarDays className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <p><span className="font-semibold">Fecha:</span> Domingo, 23 de Junio de 2025</p>
          </div>
          <div className="flex items-start space-x-3">
            <Clock3 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <p><span className="font-semibold">Hora:</span> 3:00 PM</p>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
                <p><span className="font-semibold">Lugar:</span> Cabañas Cafeteras Cerritos, Pereira.</p>
            </div>
          </div>
        </div>

        <div className="aspect-w-16 aspect-h-9 mt-6 overflow-hidden shadow-md">
          <iframe
            src={eventLocationUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación del evento"
          ></iframe>
        </div>
        
        <div className="text-center pt-6 border-t border-border">
            <div className="flex justify-center items-center mb-2">
                <Gift className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-primary">¡Confirma tu Asistencia!</p>
            <p className="text-foreground/90">
            Tu presencia es el mejor regalo. Por favor, ayúdanos a organizar este día especial confirmando tu asistencia y la de tus acompañantes a más tardar el <span className="font-semibold">1 de Junio de 2025</span>.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
