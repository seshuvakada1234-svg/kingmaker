'use client';
import { useState, useCallback, useEffect } from 'react';
import { Chess, type Move } from 'chess.js';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

export default function LocalPlayPage() {
  const [game, setGame] = useState(new Chess());
  const { toast } = useToast();
  const { playSound } = useSound();

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    try {
      const tempGame = new Chess(game.fen());
      const result = tempGame.move(move);
      if (result) {
        setGame(tempGame);
        if (result.flags.includes('c')) {
          playSound('capture');
        } else {
          playSound('move');
        }
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
  }, [game, toast, playSound]);

  const resetGame = () => {
    setGame(new Chess());
  }

  useEffect(() => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        playSound('win');
      } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
        playSound('draw');
      }
    }
  }, [game, playSound]);

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
