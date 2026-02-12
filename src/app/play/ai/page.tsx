'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Chess, type Move, type Piece } from 'chess.js';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { Button } from '@/components/ui/button';
import { Undo2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      const gameCopy = new Chess();
      gameCopy.loadPgn(game.pgn());
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
        const gameCopy = new Chess();
        gameCopy.loadPgn(game.pgn());
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
  const [previewGame, setPreviewGame] = useState<Chess | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [playerColor] = useState<'w' | 'b'>('w');
  const [aiLevel, setAiLevel] = useState<number>(1);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isUndoPossible, setIsUndoPossible] = useState(false);

  const isPreviewing = useMemo(() => previewIndex !== null, [previewIndex]);

  const handleMoveSelect = useCallback((moveIndex: number) => {
    const fullHistory = game.history();
    if (moveIndex < 0 || moveIndex >= fullHistory.length) return;

    const tempGame = new Chess();
    for (let i = 0; i <= moveIndex; i++) {
      tempGame.move(fullHistory[i]);
    }
    setPreviewGame(tempGame);
    setPreviewIndex(moveIndex);
    playSound('move');
  }, [game, playSound]);

  const exitPreview = () => {
    setPreviewGame(null);
    setPreviewIndex(null);
  };
  
  const handlePreviewPrevious = () => {
    if (previewIndex !== null && previewIndex > 0) {
        handleMoveSelect(previewIndex - 1);
    }
  };

  const handlePreviewNext = () => {
    if (previewIndex !== null && previewIndex < game.history().length - 1) {
        handleMoveSelect(previewIndex + 1);
    }
  };

  const updateUndoState = useCallback((currentGame: Chess) => {
    // In AI mode, we undo both player and AI move, so we need at least 2 moves in history.
    // The game must also not be over.
    setIsUndoPossible(currentGame.history().length >= 2 && !currentGame.isGameOver());
  }, []);

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (gameOver || game.turn() !== playerColor || isAiThinking || isPreviewing) return false;
    
    // Create a new game instance from the PGN to preserve history
    const tempGame = new Chess();
    tempGame.loadPgn(game.pgn());
    const result = tempGame.move(move);
    
    if (result) {
      setGame(tempGame);
      // Undo state will be updated after the AI moves.
      if (result.flags.includes('c')) {
        playSound('capture');
      } else {
        playSound('move');
      }
      return true;
    }

    toast({ variant: "destructive", title: "Invalid Move" });
    return false;
  }, [game, playerColor, toast, playSound, gameOver, isAiThinking, isPreviewing]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setGameOver(null);
    setPreviewGame(null);
    setPreviewIndex(null);
    updateUndoState(newGame);
  }, [updateUndoState]);
  
  const handleDifficultyChange = (newLevel: string) => {
    setAiLevel(parseInt(newLevel, 10));
    resetGame();
  }
  
  const handleUndo = useCallback(() => {
    if (gameOver || !isUndoPossible || isAiThinking || isUndoing || isPreviewing) return;
  
    setIsUndoing(true);
  
    // Create a new game instance from PGN to correctly handle history
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
  
    // In AI mode, undo both the AI's move and the player's move.
    gameCopy.undo();
    gameCopy.undo();
  
    setGame(gameCopy);
    setGameOver(null);
    updateUndoState(gameCopy);
    playSound('move');
  
    // This is crucial to prevent the AI from moving again immediately.
    setTimeout(() => setIsUndoing(false), 0);
  }, [game, gameOver, isAiThinking, isUndoPossible, playSound, updateUndoState, isUndoing, isPreviewing]);
  
  useEffect(() => {
    if (isUndoing || isPreviewing) return;

    const currentGame = new Chess();
    currentGame.loadPgn(game.pgn());

    // Always update the undo state first based on the current game object.
    updateUndoState(currentGame);

    if (currentGame.isGameOver()) {
      if (!gameOver) {
        if (currentGame.isCheckmate()) {
          playSound('win');
          setGameOver(currentGame.turn() === 'b' ? 'white_win' : 'black_win');
        } else if (currentGame.isDraw() || currentGame.isStalemate() || currentGame.isThreefoldRepetition() || currentGame.isInsufficientMaterial()) {
          playSound('draw');
          setGameOver('draw');
        }
      }
      return; // Game is over, no more logic to run. Undo state is already updated.
    } else if (gameOver) {
        setGameOver(null);
    }

    if (currentGame.turn() === playerColor) {
      return; // It's player's turn, do nothing.
    }

    // It's AI's turn.
    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const gameCopy = new Chess();
      gameCopy.loadPgn(game.pgn());
      const aiMove = getAiMove(gameCopy, aiLevel);
      
      if (aiMove) {
        const result = gameCopy.move(aiMove);
        setGame(gameCopy); // This will trigger useEffect again.
        if (result && result.flags.includes('c')) {
          playSound('capture');
        } else {
          playSound('move');
        }
      }
      
      setIsAiThinking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [game, playerColor, aiLevel, playSound, gameOver, updateUndoState, isUndoing, isPreviewing]);

  const displayGame = previewGame || game;

  return (
    <div className="relative flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      {gameOver && <GameOverScreen result={gameOver as any} onNewGame={resetGame} />}
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <Card>
          <CardHeader>
            <Button 
              onClick={handleUndo} 
              className="w-full" 
              variant="outline" 
              disabled={!isUndoPossible || isPreviewing}
            >
              <Undo2 className="mr-2 h-4 w-4" /> Undo Move
            </Button>
          </CardHeader>
          <CardContent>
            {!isUndoPossible && !isPreviewing && (
              <p className="text-xs text-muted-foreground text-center">Make a move to enable Undo.</p>
            )}
          </CardContent>
        </Card>
        <MoveHistory game={game} onMoveSelect={handleMoveSelect} />
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col items-center gap-4">
        {isPreviewing && (
            <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-sm font-medium text-accent">-- Preview Mode --</p>
                <div className="flex items-center gap-4">
                    <Button onClick={handlePreviewPrevious} variant="outline" size="icon" disabled={previewIndex === 0}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button onClick={exitPreview} variant="outline" size="sm">
                        <XCircle className="mr-2 h-4 w-4" />
                        Back to Current Game
                    </Button>
                    <Button onClick={handlePreviewNext} variant="outline" size="icon" disabled={previewIndex === game.history().length - 1}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}
        <GameStatus game={displayGame} isThinking={isPreviewing ? false : isAiThinking} isAiMode={true} />
        <Chessboard 
          game={displayGame} 
          onMove={handleMove} 
          boardOrientation={playerColor === 'w' ? 'white' : 'black'}
          isInteractable={!isPreviewing && !game.isGameOver() && game.turn() === playerColor && !isAiThinking}
        />
      </div>
      <div className="w-full lg:w-64 order-3">
        <GameControls 
          onReset={resetGame} 
          isAiMode={true} 
          aiDifficulty={aiLevel}
          onDifficultyChange={handleDifficultyChange}
        />
      </div>
    </div>
  );
}
