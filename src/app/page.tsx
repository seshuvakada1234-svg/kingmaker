import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Users, Bot, Globe } from 'lucide-react';
import { OnlineGameForm } from '@/components/game/OnlineGameForm';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      <header className="mb-10 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Crown className="w-16 h-16 text-primary" />
          <h1 className="text-6xl font-headline font-bold text-primary">
            kingmaker
          </h1>
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card className="hover:shadow-lg hover:border-accent transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary"/>
              Play with Friends
            </CardTitle>
            <CardDescription>Challenge a friend on the same device. The classic way to play.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/play/local">Play Local</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:border-accent transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary"/>
              Play with AI
            </CardTitle>
            <CardDescription>Test your skills against our AI opponent. Choose your difficulty.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/play/ai">Play AI</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg hover:border-accent transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="text-primary"/>
              Join a Room
            </CardTitle>
            <CardDescription>Create a room or challenge a friend anywhere in the world.</CardDescription>
          </CardHeader>
          <CardContent>
            <OnlineGameForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
