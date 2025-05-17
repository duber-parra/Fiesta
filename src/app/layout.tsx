import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fiesta Confirm - 95 Años Jorge Enrique',
  description: 'Invitación y confirmación de asistencia para la celebración de los 95 años de Jorge Enrique Carvajal.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es"> {/* Changed lang to Spanish */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}> {/* Added font-sans for fallback */}
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
