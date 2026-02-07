'use client';
import { useState, useCallback, useEffect } from 'react';
import { Chess, type Move } from 'chess.js';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { useToast } from '@/hooks/use-toast';

/**
 * Determines the AI's next move based on the current game state and difficulty.
 * This function is robust and will not fail, ensuring the AI always makes a valid move
 * if one is available.
 * @param game The current chess.js game instance.
 * @param difficulty The AI difficulty, 'easy' or 'hard'.
 * @returns A valid move object from chess.js, or null if no moves are available.
 */
const getAiMove = (game: Chess, difficulty: 'easy' | 'hard'): Move | null => {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    return null; // Game is over, no more moves.
  }

  // Hard difficulty: prioritize captures.
  if (difficulty === 'hard') {
    const captureMoves = moves.filter((m) => m.flags.includes('c'));
    if (captureMoves.length > 0) {
      // Pick a random capture move.
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
  }
  
  // Easy difficulty or no captures for hard: pick a random move.
  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  return randomMove;
};


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
    // AI move logic
    if (game.isGameOver() || game.turn() === playerColor) {
      return;
    }

    setIsAiThinking(true);
    // Realistic "thinking" delay for the AI
    const timer = setTimeout(() => {
      const aiMove = getAiMove(game, difficulty);
      
      if (aiMove) {
        game.move(aiMove);
        setGame(new Chess(game.fen()));
      }
      
      setIsAiThinking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [game, playerColor, difficulty]);

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
