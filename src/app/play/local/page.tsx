'use client';
import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { GameOverScreen } from '@/components/game/GameOverScreen';

export default function LocalPlayPage() {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState<string | null>(null);
  const { toast } = useToast();
  const { playSound } = useSound();

  const isUndoPossible = game.history().length > 0;

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (gameOver) return false;
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
  }, [game, toast, playSound, gameOver]);

  const resetGame = () => {
    setGame(new Chess());
    setGameOver(null);
  }

  const handleUndo = useCallback(() => {
    if (gameOver || !isUndoPossible) return;
    
    const gameCopy = new Chess(game.fen());
    gameCopy.undo(); // Revert the last move
    
    setGame(gameCopy);
    playSound('move');
  }, [game, gameOver, isUndoPossible, playSound]);

  useEffect(() => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        playSound('win');
        setGameOver(game.turn() === 'b' ? 'white_win' : 'black_win');
      } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
        playSound('draw');
        setGameOver('draw');
      }
    }
  }, [game, playSound]);

  return (
    <div className="relative flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      {gameOver && <GameOverScreen result={gameOver as any} onNewGame={resetGame} />}
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <MoveHistory game={game} />
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col items-center gap-4">
        <GameStatus game={game} />
        <Chessboard 
          game={game} 
          onMove={handleMove as (move: any) => boolean} 
          isInteractable={!game.isGameOver()} 
        />
      </div>
      <div className="w-full lg:w-64 order-3">
        <GameControls onReset={resetGame} onUndo={handleUndo} isUndoPossible={isUndoPossible} />
      </div>
    </div>
  );
}
