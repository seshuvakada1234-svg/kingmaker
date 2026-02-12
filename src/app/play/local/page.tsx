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
import { Button } from '@/components/ui/button';
import { Undo2, XCircle } from 'lucide-react';

export default function LocalPlayPage() {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [previewGame, setPreviewGame] = useState<Chess | null>(null);
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isUndoPossible, setIsUndoPossible] = useState(false);

  const updateUndoState = useCallback((currentGame: Chess) => {
    setIsUndoPossible(currentGame.history().length >= 1 && !currentGame.isGameOver());
  }, []);

  const handleMoveSelect = useCallback((moveIndex: number) => {
    const fullHistory = game.history();
    if (moveIndex < 0 || moveIndex >= fullHistory.length) return;

    const tempGame = new Chess();
    for (let i = 0; i <= moveIndex; i++) {
      tempGame.move(fullHistory[i]);
    }
    setPreviewGame(tempGame);
    playSound('move');
  }, [game, playSound]);

  const exitPreview = () => {
    setPreviewGame(null);
  };

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (gameOver || previewGame) return false;
    
    const tempGame = new Chess();
    tempGame.loadPgn(game.pgn());
    const result = tempGame.move(move);

    if (result) {
      setGame(tempGame);
      updateUndoState(tempGame);
      if (result.flags.includes('c')) {
        playSound('capture');
      } else {
        playSound('move');
      }
      return true;
    }

    toast({
      variant: "destructive",
      title: "Invalid Move",
      description: "That move is not allowed.",
    });
    return false;
  }, [game, toast, playSound, gameOver, updateUndoState, previewGame]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setGameOver(null);
    setPreviewGame(null);
    updateUndoState(newGame);
  }, [updateUndoState]);

  const handleUndo = useCallback(() => {
    if (gameOver || !isUndoPossible || previewGame) return;
    
    const tempGame = new Chess();
    tempGame.loadPgn(game.pgn());
    tempGame.undo();
    
    setGame(tempGame);
    setGameOver(null);
    updateUndoState(tempGame);
    playSound('move');
  }, [game, gameOver, isUndoPossible, playSound, updateUndoState, previewGame]);

  useEffect(() => {
    if (previewGame) return;

    updateUndoState(game);
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
    } else if (gameOver) {
        setGameOver(null);
    }
  }, [game, playSound, gameOver, updateUndoState, previewGame]);

  const displayGame = previewGame || game;
  const isPreviewing = !!previewGame;

  return (
    <div className="relative flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      {gameOver && <GameOverScreen result={gameOver as any} onNewGame={resetGame} />}
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <div className="space-y-2 mb-4">
          <Button 
            onClick={handleUndo} 
            className="w-full" 
            variant="outline" 
            disabled={!isUndoPossible || isPreviewing}
          >
            <Undo2 className="mr-2 h-4 w-4" /> Undo Move
          </Button>
          {!isUndoPossible && !isPreviewing && (
            <p className="text-xs text-muted-foreground text-center">Make a move to enable Undo.</p>
          )}
        </div>
        <MoveHistory game={game} onMoveSelect={handleMoveSelect} />
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col items-center gap-4">
        {isPreviewing && (
            <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-sm font-medium text-accent">-- Preview Mode --</p>
                <Button onClick={exitPreview} variant="outline" size="sm">
                    <XCircle className="mr-2 h-4 w-4" />
                    Back to Current Game
                </Button>
            </div>
        )}
        <GameStatus game={displayGame} />
        <Chessboard 
          game={displayGame} 
          onMove={handleMove} 
          isInteractable={!isPreviewing && !game.isGameOver()} 
        />
      </div>
      <div className="w-full lg:w-64 order-3">
        <GameControls onReset={resetGame} />
      </div>
    </div>
  );
}
