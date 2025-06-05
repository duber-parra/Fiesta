
'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import type React from 'react';

interface MapNavigationButtonsProps {
  latitude: number;
  longitude: number;
  placeName: string;
}

export function MapNavigationButtons({ latitude, longitude, placeName }: MapNavigationButtonsProps): React.JSX.Element | null {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  // For Waze, it's better to use a query if the app isn't installed, as ll might not fall back gracefully.
  // However, ll is more precise if Waze is installed. Let's try ll first.
  const wazeUrl = `waze://?ll=${latitude},${longitude}&navigate=yes`;
  // Fallback Waze URL using query, though it might be less precise or require user interaction in Waze
  // const wazeQueryUrl = `waze://?q=${encodeURIComponent(placeName)}&navigate=yes`;


  return (
    <div className="mt-4 mb-2 flex flex-col space-y-3 md:hidden">
      <Button asChild variant="outline" className="w-full">
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
          <MapPin className="mr-2 h-5 w-5" />
          Abrir en Google Maps
        </a>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <a href={wazeUrl} target="_blank" rel="noopener noreferrer">
          <Navigation className="mr-2 h-5 w-5" />
          Abrir en Waze
        </a>
      </Button>
    </div>
  );
}
