'use client';
import type { Chess } from 'chess.js';
import { ShieldCheck, Swords } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameStatusProps {
  game: Chess;
  isThinking?: boolean;
}

export function GameStatus({ game, isThinking }: GameStatusProps) {
  const turn = game.turn() === 'w' ? 'White' : 'Black';
  let statusText = `${turn}'s turn`;
  if(isThinking) statusText = 'AI is thinking...';
  
  if (game.isCheckmate()) {
    statusText = `Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins.`;
  } else if (game.isDraw()) {
    statusText = 'Draw!';
  } else if (game.isStalemate()) {
    statusText = 'Stalemate!';
  } else if (game.isThreefoldRepetition()) {
    statusText = 'Draw by repetition!';
  } else if (game.isInsufficientMaterial()) {
    statusText = 'Draw by insufficient material!';
  } else if (game.inCheck()) {
    statusText = `${turn} is in check`;
  }
  
  const Icon = game.inCheck() ? ShieldCheck : Swords;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-primary"/>
            <p className="text-lg font-medium">{statusText}</p>
        </div>
      </CardContent>
    </Card>
  );
}
