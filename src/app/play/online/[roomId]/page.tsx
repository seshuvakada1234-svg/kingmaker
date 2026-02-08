'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Chess } from 'chess.js';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, runTransaction, type Unsubscribe } from 'firebase/firestore';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { AdBanner } from '@/components/game/AdBanner';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useSound } from '@/contexts/SoundContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type GameStatusType = 'connecting' | 'waiting' | 'playing' | 'finished' | 'error';

export default function OnlinePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;

  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [playerSessionId] = useState(() => Math.random().toString(36).substring(2));
  const [status, setStatus] = useState<GameStatusType>('connecting');
  const [errorMessage, setErrorMessage] = useState('');

  const { toast } = useToast();
  const { playSound } = useSound();
  const prevFenRef = useRef<string>(game.fen());

  const initGame = useCallback(async (): Promise<Unsubscribe | null> => {
    if (!roomId || !playerSessionId) return null;

    const gameRef = doc(db, 'games', roomId);
    const isCreating = searchParams.get('create') === 'true';

    try {
      if (isCreating) {
        const newGame = new Chess();
        const gameData = {
          fen: newGame.fen(),
          players: { white: playerSessionId, black: null },
          status: 'waiting',
          createdAt: serverTimestamp(),
        };
        await setDoc(gameRef, gameData);
        setPlayerColor('w');
      } else {
        await runTransaction(db, async (transaction) => {
          const gameDoc = await transaction.get(gameRef);
          if (!gameDoc.exists()) {
            throw new Error('Room not found. Please check the code and try again.');
          }

          const gameData = gameDoc.data();
          const { players } = gameData;

          if (players.white === playerSessionId) {
            setPlayerColor('w');
          } else if (players.black === playerSessionId) {
            setPlayerColor('b');
          } else if (!players.black) {
            transaction.update(gameRef, {
              'players.black': playerSessionId,
              status: 'playing',
            });
            setPlayerColor('b');
          } else {
            throw new Error('This room is full.');
          }
        });
      }
    } catch (e: any) {
      setStatus('error');
      setErrorMessage(e.message || 'Failed to create or join the room.');
      return null;
    }

    // Set up the real-time listener
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.fen && game.fen() !== data.fen) {
          setGame(new Chess(data.fen));
        }
        setStatus(data.status);
      } else {
        setStatus('error');
        setErrorMessage('The game room was deleted.');
      }
    }, (error) => {
      setStatus('error');
      setErrorMessage('Lost connection to game room.');
    });

    return unsubscribe;
  }, [roomId, playerSessionId, searchParams]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    
    const setupGame = async () => {
      unsubscribe = await initGame();
    }
    
    setupGame();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initGame]);

  useEffect(() => {
    const currentFen = game.fen();
    if (prevFenRef.current !== currentFen && game.history().length > 0) {
      const lastMove = game.history({ verbose: true }).slice(-1)[0];
      if (lastMove.flags.includes('c')) {
        playSound('capture');
      } else {
        playSound('move');
      }
    }
    prevFenRef.current = currentFen;

    if (game.isGameOver()) {
      if (game.isCheckmate()) playSound('win');
      else playSound('draw');
    }
  }, [game, playSound]);

  const handleMove = useCallback(async (move: { from: string; to: string; promotion?: string }): Promise<boolean> => {
    if (game.turn() !== playerColor) {
      toast({ title: "Not your turn!", variant: "destructive" });
      return false;
    }
    
    try {
      const tempGame = new Chess(game.fen());
      const result = tempGame.move(move);
      if (result) {
        await runTransaction(db, async (transaction) => {
          transaction.update(doc(db, 'games', roomId), { fen: tempGame.fen() });
        });
        return true;
      }
    } catch(e) {
      // Invalid move, chess.js throws an error
      return false;
    }
    return false;
  }, [game, playerColor, roomId, toast]);

  const resetGame = async () => {
    if (playerColor !== 'w') {
      toast({ title: "Only the host (White) can reset the game.", variant: "destructive" });
      return;
    }
    const newGame = new Chess();
    await setDoc(doc(db, 'games', roomId), {
      fen: newGame.fen(),
      players: { white: playerSessionId, black: null },
      status: 'waiting',
      createdAt: serverTimestamp(),
    });
  };

  const orientation = playerColor === 'b' ? 'black' : 'white';

  if (status === 'connecting') {
    return <div className="flex flex-col items-center justify-center min-h-screen gap-4"><Skeleton className="h-96 w-96" /><p>Connecting to room...</p></div>;
  }
  
  if (status === 'error') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Error</CardTitle></CardHeader>
        <CardContent><p className="text-destructive">{errorMessage}</p></CardContent>
      </Card>
    );
  }

  if (status === 'waiting') {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader><CardTitle>Waiting for Opponent</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Share this room code with a friend:</p>
          <div className="p-2 border rounded-md bg-muted font-mono text-lg">{roomId}</div>
          <p className="text-sm text-muted-foreground">The game will begin automatically when they join.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <GameStatus game={game} />
        <MoveHistory game={game} />
        <p className="text-center text-sm mt-2 text-muted-foreground">You are playing as {orientation}.</p>
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col items-center">
        <Chessboard
          game={game}
          onMove={handleMove as (move: any) => boolean}
          boardOrientation={orientation}
          isInteractable={!game.isGameOver() && game.turn() === playerColor && !!playerColor && status === 'playing'}
        />
        <AdBanner />
      </div>
      <div className="w-full lg:w-64 order-3">
        <GameControls onReset={resetGame} isOnlineMode={true} roomCode={roomId}/>
      </div>
    </div>
  );
}
