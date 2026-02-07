'use client';
import { useState, useCallback, useEffect } from 'react';
import { Chess, type Move } from 'chess.js';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

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
  const { playSound } = useSound();

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (game.turn() !== playerColor) return false;
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
      toast({ variant: "destructive", title: "Invalid Move" });
      return false;
    }
    return false;
  }, [game, playerColor, toast, playSound]);

  const resetGame = useCallback(() => {
    setGame(new Chess());
  }, []);
  
  const handleDifficultyChange = (newDifficulty: 'easy' | 'hard') => {
    setDifficulty(newDifficulty);
    resetGame();
  }

  useEffect(() => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        playSound('win');
      } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
        playSound('draw');
      }
      return;
    }

    // AI move logic
    if (game.turn() === playerColor) {
      return;
    }

    setIsAiThinking(true);
    // Realistic "thinking" delay for the AI
    const timer = setTimeout(() => {
      const gameCopy = new Chess(game.fen());
      const aiMove = getAiMove(gameCopy, difficulty);
      
      if (aiMove) {
        const result = gameCopy.move(aiMove);
        setGame(gameCopy);
        if (result && result.flags.includes('c')) {
          playSound('capture');
        } else {
          playSound('move');
        }
      }
      
      setIsAiThinking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [game, playerColor, difficulty, playSound]);

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
