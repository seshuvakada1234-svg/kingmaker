'use client';
import { useState, useCallback } from 'react';
import { Chess, type Move } from 'chess.js';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { useToast } from '@/hooks/use-toast';

export default function LocalPlayPage() {
  const [game, setGame] = useState(new Chess());
  const { toast } = useToast();

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen())); // Force re-render by creating a new instance
        return true;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid Move",
        description: "That move is not allowed.",
      });
      return false;
    }
    return false;
  }, [game, toast]);

  const resetGame = () => {
    setGame(new Chess());
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <GameStatus game={game} />
        <MoveHistory game={game} />
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex justify-center">
        <Chessboard 
          game={game} 
          onMove={handleMove as (move: any) => boolean} 
          isInteractable={!game.isGameOver()} 
        />
      </div>
      <div className="w-full lg:w-64 order-3">
        <GameControls onReset={resetGame} />
      </div>
    </div>
  );
}
