'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
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


export default function LocalPlayPage() {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState<string | null>(null);
  
  const history = useMemo(() => game.history({verbose: false}) as string[], [game]);
  const [previewIndex, setPreviewIndex] = useState(history.length);

  const { toast } = useToast();
  const { playSound } = useSound();
  const [isUndoPossible, setIsUndoPossible] = useState(false);

  const isPreviewing = useMemo(() => previewIndex < history.length, [previewIndex, history]);

  const updateUndoState = useCallback((currentGame: Chess) => {
    setIsUndoPossible(currentGame.history().length >= 1 && !currentGame.isGameOver());
  }, []);

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

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (gameOver || isPreviewing) return false;
    
    const tempGame = new Chess();
    tempGame.loadPgn(game.pgn());
    const result = tempGame.move(move);

    if (result) {
      setGame(tempGame);
      // After a move, we are always in the live state
      setPreviewIndex(tempGame.history().length);
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
  }, [game, toast, playSound, gameOver, updateUndoState, isPreviewing]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setGameOver(null);
    setPreviewIndex(0);
    updateUndoState(newGame);
  }, [updateUndoState]);

  const handleUndo = useCallback(() => {
    if (gameOver || !isUndoPossible || isPreviewing) return;
    
    const tempGame = new Chess();
    tempGame.loadPgn(game.pgn());
    tempGame.undo();
    
    setGame(tempGame);
    setPreviewIndex(tempGame.history().length);
    setGameOver(null);
    updateUndoState(tempGame);
    playSound('move');
  }, [game, gameOver, isUndoPossible, playSound, updateUndoState, isPreviewing]);

  useEffect(() => {
    // Whenever game state changes, ensure preview doesn't point to a future that no longer exists
    if (previewIndex > history.length) {
      setPreviewIndex(history.length);
    }
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
  }, [game, playSound, gameOver, updateUndoState, previewIndex, history.length]);

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
                    <Button onClick={handlePreviewNext} variant="outline" size="icon">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
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
