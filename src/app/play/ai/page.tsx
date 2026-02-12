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
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// --- AI Logic ---

const pieceValues: { [key in Piece['type']]: number } = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-Square Tables (from White's perspective) give bonuses based on piece position.
const pawnPST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];
const knightPST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];
const bishopPST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];
const rookPST = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0
];
const queenPST = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0,  0,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];
const kingPST = [ // Mid-game king safety
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

/**
 * Evaluates the board state and returns a score.
 * Positive scores favor White, negative scores favor Black.
 * @param game The current chess.js game instance.
 * @returns A number representing the board score.
 */
const evaluateBoard = (game: Chess): number => {
  if (game.isCheckmate()) {
      return game.turn() === 'w' ? -Infinity : Infinity;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
      return 0;
  }

  let score = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
          const piece = board[i][j];
          if (piece) {
              const value = pieceValues[piece.type];
              let pst;
              switch(piece.type) {
                  case 'p': pst = pawnPST; break;
                  case 'n': pst = knightPST; break;
                  case 'b': pst = bishopPST; break;
                  case 'r': pst = rookPST; break;
                  case 'q': pst = queenPST; break;
                  case 'k': pst = kingPST; break;
                  default: pst = [];
              }

              const squareIndex = i * 8 + j;
              // For black pieces, the PST is mirrored vertically.
              const pstIndex = piece.color === 'w' ? squareIndex : 63 - squareIndex;
              const pstValue = pst[pstIndex] || 0;

              const pieceScore = piece.color === 'w' ? value + pstValue : -(value + pstValue);
              score += pieceScore;
          }
      }
  }

  // Add a simple mobility score (number of legal moves)
  const mobility = game.moves().length;
  const mobilityScore = game.turn() === 'w' ? mobility : -mobility;
  score += mobilityScore;

  return score;
};

/**
 * The recursive Minimax function with Alpha-Beta pruning.
 */
const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number => {
  if (depth === 0 || game.isGameOver()) {
      return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  if (isMaximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
          game.move(move.san);
          const evalScore = minimax(game, depth - 1, alpha, beta, false);
          game.undo();
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) {
              break; // Beta cutoff
          }
      }
      return maxEval;
  } else {
      let minEval = Infinity;
      for (const move of moves) {
          game.move(move.san);
          const evalScore = minimax(game, depth - 1, alpha, beta, true);
          game.undo();
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) {
              break; // Alpha cutoff
          }
      }
      return minEval;
  }
};

/**
 * Determines the AI's next move based on the current game state and difficulty level.
 * @param game The current chess.js game instance.
 * @param level The AI difficulty level, from 1 to 10.
 * @returns A valid move object from chess.js, or null if no moves are available.
 */
const getAiMove = (game: Chess, level: number): Move | null => {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    return null;
  }

  // Level 1: Purely random moves.
  if (level <= 1) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Level 2: Prefer captures, otherwise random.
  if (level <= 2) {
    const captureMoves = moves.filter((m) => m.flags.includes('c'));
    if (captureMoves.length > 0) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }
  
  // Map difficulty level to search depth for Minimax
  let depth = 2; // Default for Levels 3-4
  if (level >= 5) depth = 3; // Levels 5-7
  if (level >= 8) depth = 4; // Levels 8-10

  const isMaximizingPlayer = game.turn() === 'w';
  const allMovesWithScores: {move: Move, score: number}[] = [];

  for (const move of moves) {
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    gameCopy.move(move.san);

    // If a move is an immediate checkmate, take it.
    if (gameCopy.isCheckmate()) {
      return move;
    }

    // Call the minimax function to evaluate the position after this move.
    const boardValue = minimax(gameCopy, depth - 1, -Infinity, Infinity, !isMaximizingPlayer);
    allMovesWithScores.push({ move, score: boardValue });
  }

  // Sort moves based on score (descending for white, ascending for black)
  allMovesWithScores.sort((a, b) => isMaximizingPlayer ? b.score - a.score : a.score - b.score);
  
  if (allMovesWithScores.length === 0) {
    return moves[Math.floor(Math.random() * moves.length)]; // Fallback
  }

  // For lower levels, introduce randomness by picking from a pool of good moves.
  if (level <= 4) { // Levels 3-4: Pick from top 5 rated moves
      const topMoves = allMovesWithScores.slice(0, 5).map(m => m.move);
      return topMoves[Math.floor(Math.random() * topMoves.length)] || moves[0];
  }
  if (level <= 7) { // Levels 5-7: Pick from top 3 rated moves
      const topMoves = allMovesWithScores.slice(0, 3).map(m => m.move);
      return topMoves[Math.floor(Math.random() * topMoves.length)] || moves[0];
  }
  
  // Levels 8-10: 90% chance to pick the best move, 10% for the second best.
  if (Math.random() > 0.1 || allMovesWithScores.length < 2) {
      return allMovesWithScores[0].move;
  }
  return allMovesWithScores[1].move;
};


export default function AiPlayPage() {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState<string | null>(null);

  const history = useMemo(() => game.history({verbose: false}) as string[], [game]);
  const [previewIndex, setPreviewIndex] = useState(history.length);

  const [playerColor] = useState<'w' | 'b'>('w');
  const [aiLevel, setAiLevel] = useState<number>(1);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isUndoPossible, setIsUndoPossible] = useState(false);

  const isPreviewing = useMemo(() => previewIndex < history.length, [previewIndex, history]);

  const handleMoveSelect = useCallback((moveIndex: number) => {
    if (moveIndex >= 0 && moveIndex < history.length) {
      setPreviewIndex(moveIndex);
      playSound('move');
    }
  }, [history, playSound]);

  const exitPreview = useCallback(() => {
    setPreviewIndex(history.length);
  }, [history]);

  const handlePreviewPrevious = () => {
    if (previewIndex > 0) {
        setPreviewIndex(prev => prev - 1);
        playSound('move');
    }
  };

  const handlePreviewNext = () => {
    if (previewIndex < history.length) {
      setPreviewIndex(prev => prev + 1);
      playSound('move');
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
      setPreviewIndex(tempGame.history().length);
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
    setPreviewIndex(0);
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
    setPreviewIndex(gameCopy.history().length);
    setGameOver(null);
    updateUndoState(gameCopy);
    playSound('move');
  
    // This is crucial to prevent the AI from moving again immediately.
    setTimeout(() => setIsUndoing(false), 0);
  }, [game, gameOver, isAiThinking, isUndoPossible, playSound, updateUndoState, isUndoing, isPreviewing]);
  
  useEffect(() => {
    if (isUndoing || isPreviewing) return;
    
    if (previewIndex > history.length) {
      setPreviewIndex(history.length);
    }

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
        setPreviewIndex(gameCopy.history().length);
        if (result && result.flags.includes('c')) {
          playSound('capture');
        } else {
          playSound('move');
        }
      }
      
      setIsAiThinking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [game, playerColor, aiLevel, playSound, gameOver, updateUndoState, isUndoing, isPreviewing, history.length, previewIndex]);

  const displayGame = useMemo(() => {
    if (isPreviewing) {
      const previewGameInstance = new Chess();
      for (let i = 0; i <= previewIndex; i++) {
        previewGameInstance.move(history[i]);
      }
      return previewGameInstance;
    }
    return game;
  }, [game, history, previewIndex, isPreviewing]);

  return (
    <div className="relative flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      {gameOver && <GameOverScreen result={gameOver as any} onNewGame={resetGame} />}
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <div className="flex flex-col items-center gap-2 text-center mb-4 h-[76px] justify-center">
          {history.length > 0 && (
            <>
              <div className="h-5">
                {isPreviewing && (
                  <p className="text-sm font-medium text-accent">-- Preview Mode --</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                  <Button onClick={handlePreviewPrevious} variant="outline" size="icon" disabled={previewIndex === 0}>
                      <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button onClick={exitPreview} variant="outline" size="sm" disabled={!isPreviewing}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Back to Game
                  </Button>
                  <Button onClick={handlePreviewNext} variant="outline" size="icon" disabled={previewIndex === history.length}>
                      <ChevronRight className="h-4 w-4" />
                  </Button>
              </div>
            </>
          )}
        </div>
        <Card>
          <CardHeader className="p-4">
            <Button 
              onClick={handleUndo} 
              className="w-full" 
              variant="outline" 
              disabled={!isUndoPossible || isPreviewing || !!gameOver}
            >
              <Undo2 className="mr-2 h-4 w-4" /> Undo Move
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {!isUndoPossible && !isPreviewing && !gameOver && (
              <p className="text-xs text-muted-foreground text-center">Make a move to enable Undo.</p>
            )}
          </CardContent>
        </Card>
        <MoveHistory game={game} onMoveSelect={handleMoveSelect} />
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col items-center gap-4">
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
