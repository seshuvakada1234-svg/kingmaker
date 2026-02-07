import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <header className="absolute top-4 left-4 z-10">
        <Button asChild variant="outline" size="icon" className="bg-card/80 backdrop-blur-sm">
          <Link href="/">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </Button>
      </header>
      <main className="flex items-center justify-center min-h-screen w-full p-2 sm:p-4">
        {children}
      </main>
    </div>
  );
}
