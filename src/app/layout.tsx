import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SoundProvider } from '@/contexts/SoundContext';

export const metadata: Metadata = {
  title: 'kingmaker – chess',
  description: 'Your modern hub for local, AI, and online chess.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" 
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="font-body antialiased">
        <SoundProvider>
          {children}
        </SoundProvider>
        <Toaster />
      </body>
    </html>
  );
}
