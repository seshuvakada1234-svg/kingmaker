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

const CONNECTION_TIMEOUT = 10000; // 10 seconds

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
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const handleGameUpdate = useCallback((newGameData: any) => {
    if (newGameData.fen && game.fen() !== newGameData.fen) {
      setGame(new Chess(newGameData.fen));
    }
    setStatus(newGameData.status);
  }, [game]);

  useEffect(() => {
    if (!roomId || !playerSessionId) {
      setStatus('error');
      setErrorMessage('Invalid room or session.');
      return;
    }

    const gameRef = doc(db, 'games', roomId);
    const isCreating = searchParams.get('create') === 'true';

    const connectionTimeout = setTimeout(() => {
      if (status === 'connecting') {
        setStatus('error');
        setErrorMessage('Connection timed out. Please check your internet connection and try again.');
      }
    }, CONNECTION_TIMEOUT);

    const initAndListen = async () => {
      try {
        if (isCreating) {
          await runTransaction(db, async (transaction) => {
            const gameDoc = await transaction.get(gameRef);
            if (!gameDoc.exists()) {
              const newGame = new Chess();
              const gameData = {
                fen: newGame.fen(),
                players: { white: playerSessionId, black: null },
                status: 'waiting',
                createdAt: serverTimestamp(),
              };
              transaction.set(gameRef, gameData);
              setPlayerColor('w');
            } else {
              // Game already exists, try to join as black if possible
              const gameData = gameDoc.data();
              if (gameData.players.white === playerSessionId) {
                 setPlayerColor('w');
              } else if (!gameData.players.black) {
                transaction.update(gameRef, { 
                  'players.black': playerSessionId,
                  status: 'playing',
                });
                setPlayerColor('b');
              } else {
                 throw new Error('This room is full.');
              }
            }
          });
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
        clearTimeout(connectionTimeout);
        return;
      }

      unsubscribeRef.current = onSnapshot(gameRef, (doc) => {
        clearTimeout(connectionTimeout);
        if (doc.exists()) {
          handleGameUpdate(doc.data());
        } else {
          setStatus('error');
          setErrorMessage('The game room was deleted.');
        }
      }, (error) => {
        clearTimeout(connectionTimeout);
        setStatus('error');
        setErrorMessage('Lost connection to game room.');
      });
    };
    
    initAndListen();

    return () => {
      clearTimeout(connectionTimeout);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [roomId, playerSessionId, searchParams, handleGameUpdate, status]);

  useEffect(() => {
    const currentFen = game.fen();
    if (prevFenRef.current !== currentFen && game.history().length > 0) {
      const lastMove = game.history({ verbose: true }).slice(-1)[0];
      if (lastMove.flags.includes('c')) playSound('capture');
      else playSound('move');
    }
    prevFenRef.current = currentFen;
    if (game.isGameOver()) {
      if (game.isCheckmate()) playSound('win');
      else playSound('draw');
    }
  }, [game, playSound]);

  const handleMove = useCallback(async (move: { from: string; to: string; promotion?: string }): Promise<boolean> => {
    if (game.turn() !== playerColor || status !== 'playing') {
      toast({ title: "Not your turn or game not active!", variant: "destructive" });
      return false;
    }
    
    const gameRef = doc(db, 'games', roomId);
    try {
      await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) throw new Error("Game not found!");
        const currentGame = new Chess(gameDoc.data().fen);
        const result = currentGame.move(move);
        if (result) {
          transaction.update(gameRef, { fen: currentGame.fen() });
        } else {
          throw new Error("Invalid move.");
        }
      });
      return true;
    } catch(e: any) {
      toast({ title: "Move Error", description: e.message || "An unknown error occurred.", variant: "destructive" });
      return false;
    }
  }, [game, playerColor, roomId, toast, status]);

  const resetGame = async () => {
    if (playerColor !== 'w') {
      toast({ title: "Only the host (White) can reset the game.", variant: "destructive" });
      return;
    }
    const newGame = new Chess();
    const gameRef = doc(db, 'games', roomId);
    await setDoc(gameRef, {
      fen: newGame.fen(),
      players: { white: playerSessionId, black: null },
      status: 'waiting',
      createdAt: serverTimestamp(),
    }, { merge: true });
  };

  const orientation = playerColor === 'b' ? 'black' : 'white';

  if (status === 'connecting') {
    return <div className="flex flex-col items-center justify-center min-h-screen gap-4"><Skeleton className="h-96 w-96" /><p>Connecting to room {roomId}...</p></div>;
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
