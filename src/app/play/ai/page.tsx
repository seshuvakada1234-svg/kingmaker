'use client';
import { useState, useCallback, useEffect } from 'react';
import { Chess, type Move, type Piece } from 'chess.js';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { GameOverScreen } from '@/components/game/GameOverScreen';

/**
 * Determines the AI's next move based on the current game state and difficulty level.
 * @param game The current chess.js game instance.
 * @param level The AI difficulty level, from 1 to 10.
 * @returns A valid move object from chess.js, or null if no moves are available.
 */
const getAiMove = (game: Chess, level: number): Move | null => {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    return null; // Game is over, no more moves.
  }

  // Level 1-2: Purely random moves.
  if (level <= 2) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Level 3-4: Prefer captures, otherwise random.
  if (level <= 4) {
    const captureMoves = moves.filter((m) => m.flags.includes('c'));
    if (captureMoves.length > 0) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Level 5-6: Prefer captures and checks, otherwise random.
  if (level <= 6) {
    const captureMoves = moves.filter((m) => m.flags.includes('c'));
    // A move is a checking move if the SAN string includes a '+' or '#'
    const checkMoves = moves.filter((m) => m.san.includes('+') || m.san.includes('#'));
    const goodMoves = [...new Set([...captureMoves, ...checkMoves])];
    if (goodMoves.length > 0) {
      return goodMoves[Math.floor(Math.random() * goodMoves.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // For levels 7+, we need an evaluation function.
  const pieceValues: { [key in Piece['type']]: number } = { p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0 };
  
  const evaluateBoard = (board: (Piece | null)[][]) => {
    let score = 0;
    for (const row of board) {
      for (const piece of row) {
        if (piece) {
          const value = pieceValues[piece.type];
          if (piece.color === 'w') {
            score += value;
          } else {
            score -= value;
          }
        }
      }
    }
    return score;
  };
  
  const isWhiteTurn = game.turn() === 'w';

  // For levels 7-8, find the best move with depth 1 search.
  if (level <= 8) {
    let bestMove: Move | null = null;
    let bestValue = isWhiteTurn ? -Infinity : Infinity;

    for (const move of moves) {
      const gameCopy = new Chess(game.fen());
      gameCopy.move(move);
      
      // If this move is checkmate, it's the best one.
      if (gameCopy.isCheckmate()) {
          return move;
      }
      
      const boardValue = evaluateBoard(gameCopy.board());

      if (isWhiteTurn) {
        if (boardValue > bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      } else { // Black's turn
        if (boardValue < bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      }
    }
    return bestMove || moves[0];
  }

  // For levels 9-10, choose from the top 3 best moves.
  if (level <= 10) {
      const moveEvaluations: {move: Move, score: number}[] = [];
      for (const move of moves) {
        const gameCopy = new Chess(game.fen());
        gameCopy.move(move);

        if (gameCopy.isCheckmate()) {
          return move; // Immediate win is best
        }
        
        moveEvaluations.push({move, score: evaluateBoard(gameCopy.board())});
      }

      // Sort by score (desc for white, asc for black)
      moveEvaluations.sort((a, b) => isWhiteTurn ? b.score - a.score : a.score - b.score);

      const topMoves = moveEvaluations.slice(0, 3).map(m => m.move);
      if (topMoves.length === 0) return moves[Math.floor(Math.random() * moves.length)];
      
      // At level 10, 80% chance to pick the absolute best move.
      if (level === 10 && Math.random() > 0.2) { 
          return topMoves[0];
      }
      
      // For level 9 (and 20% of level 10), pick randomly from the top 3.
      return topMoves[Math.floor(Math.random() * topMoves.length)];
  }
  
  // Fallback for any case not covered.
  return moves[Math.floor(Math.random() * moves.length)];
};


export default function AiPlayPage() {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [playerColor] = useState<'w' | 'b'>('w');
  const [aiLevel, setAiLevel] = useState<number>(1);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const { toast } = useToast();
  const { playSound } = useSound();
  const MAX_UNDOS = 10;

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (gameOver || game.turn() !== playerColor) return false;
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
  }, [game, playerColor, toast, playSound, gameOver]);

  const resetGame = useCallback(() => {
    setGame(new Chess());
    setGameOver(null);
    setUndoCount(0);
  }, []);
  
  const handleDifficultyChange = (newLevel: string) => {
    setAiLevel(parseInt(newLevel, 10));
    resetGame();
  }
  
  const handleUndo = useCallback(() => {
    if (gameOver || game.turn() !== playerColor || isAiThinking) return;

    if (undoCount >= MAX_UNDOS) {
      toast({
        variant: "destructive",
        title: "Undo limit reached",
        description: "You have used all your undos for this match.",
      });
      return;
    }
    
    // There must be at least one full turn (player + AI) to undo.
    if (game.history().length < 2) {
      toast({
        variant: "destructive",
        title: "Cannot Undo",
        description: "There are no moves to undo.",
      });
      return;
    }

    if (undoCount >= 1) {
      toast({
        title: "Rewarded Ad Required",
        description: "In a real app, an ad would play now. For now, your undo is granted!",
        duration: 4000,
      });
    }

    const gameCopy = new Chess(game.fen());
    gameCopy.undo(); // Undo AI's move
    gameCopy.undo(); // Undo player's move
    
    setGame(gameCopy);
    setUndoCount(prev => prev + 1);
    playSound('move');

  }, [game, gameOver, playerColor, isAiThinking, undoCount, toast, playSound]);

  useEffect(() => {
    if (game.isGameOver()) {
      if (!gameOver) {
        if (game.isCheckmate()) {
          playSound('win');
          setGameOver(game.turn() === 'b' ? 'white_win' : 'black_win');
        } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
          playSound('draw');
          setGameOver('draw');
        }
      }
      return;
    }

    if (game.turn() === playerColor) {
      return;
    }

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const gameCopy = new Chess(game.fen());
      const aiMove = getAiMove(gameCopy, aiLevel);
      
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
  }, [game, playerColor, aiLevel, playSound, gameOver]);

  return (
    <div className="relative flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      {gameOver && <GameOverScreen result={gameOver as any} onNewGame={resetGame} />}
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <GameStatus game={game} isThinking={isAiThinking} isAiMode={true} />
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
          aiDifficulty={aiLevel}
          onDifficultyChange={handleDifficultyChange}
          onUndo={handleUndo}
          undoCount={undoCount}
          maxUndos={MAX_UNDOS}
        />
      </div>
    </div>
  );
}
