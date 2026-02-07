'use client';
import { useState, useCallback, useEffect } from 'react';
import { Chess, type Move } from 'chess.js';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { useToast } from '@/hooks/use-toast';
import { suggestMove } from '@/ai/flows/suggest-move';

export default function AiPlayPage() {
  const [game, setGame] = useState(new Chess());
  const [playerColor] = useState<'w' | 'b'>('w');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const { toast } = useToast();

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (game.turn() !== playerColor) return false;
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        return true;
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Invalid Move" });
      return false;
    }
    return false;
  }, [game, playerColor, toast]);

  const resetGame = useCallback(() => {
    setGame(new Chess());
  }, []);
  
  const handleDifficultyChange = (newDifficulty: 'easy' | 'hard') => {
    setDifficulty(newDifficulty);
    resetGame();
  }

  useEffect(() => {
    const makeAiMove = async () => {
      if (!game.isGameOver() && game.turn() !== playerColor) {
        setIsAiThinking(true);
        try {
          const result = await suggestMove({
            boardState: game.fen(),
            difficulty,
          });
          game.move(result.suggestedMove);
          setGame(new Chess(game.fen()));
        } catch (error) {
          console.error("AI move failed:", error);
          toast({ variant: "destructive", title: "AI Error", description: "The AI failed to make a move." });
        } finally {
          setIsAiThinking(false);
        }
      }
    };
    // Add a small delay for better UX
    const timer = setTimeout(makeAiMove, 500);
    return () => clearTimeout(timer);
  }, [game, playerColor, difficulty, toast]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <GameStatus game={game} isThinking={isAiThinking} />
        <MoveHistory game={game} />
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex justify-center">
        <Chessboard 
          game={game} 
          onMove={handleMove as (move: any) => boolean} 
          boardOrientation={playerColor === 'w' ? 'white' : 'black'}
          isInteractable={!game.isGameOver() && game.turn() === playerColor && !isAiThinking}
        />
      </div>
      <div className="w-full lg:w-64 order-3">
        <GameControls 
          onReset={resetGame} 
          isAiMode={true} 
          aiDifficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
        />
      </div>
    </div>
  );
}
