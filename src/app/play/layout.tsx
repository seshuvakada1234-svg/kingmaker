'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Download } from 'lucide-react';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="absolute top-4 left-4 right-4 z-10 flex justify-between">
        {/* Home Button */}
        <Button
          asChild
          variant="outline"
          size="icon"
          className="bg-card/80 backdrop-blur-sm"
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </Button>

        {/* Install App Button (PWA) */}
        {canInstall && (
          <Button
            onClick={handleInstall}
            variant="outline"
            className="bg-card/80 backdrop-blur-sm flex gap-2"
          >
            <Download className="h-4 w-4" />
            Install App
          </Button>
        )}
      </header>

      {/* Game Area */}
      <main className="flex items-center justify-center min-h-screen w-full p-2 sm:p-4">
        {children}
      </main>
    </div>
  );
}
