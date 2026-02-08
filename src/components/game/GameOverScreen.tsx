'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Handshake, Home, RotateCcw } from 'lucide-react';

interface GameOverScreenProps {
  result: 'white_win' | 'black_win' | 'draw';
  onNewGame: () => void;
}

export function GameOverScreen({ result, onNewGame }: GameOverScreenProps) {
  let titleText = '';
  let Icon = Handshake;

  if (result === 'white_win') {
    titleText = 'White Wins!';
    Icon = Trophy;
  } else if (result === 'black_win') {
    titleText = 'Black Wins!';
    Icon = Trophy;
  } else {
    titleText = 'Game is a Draw!';
    Icon = Handshake;
  }

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
      <Card className="max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95">
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-4">
            <Icon className="w-20 h-20 text-primary" />
            <span className="text-4xl font-headline">{titleText}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 mt-4">
          <Button onClick={onNewGame} size="lg">
            <RotateCcw className="mr-2" />
            Play Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
                <Home className="mr-2" />
                Back to Lobby
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
