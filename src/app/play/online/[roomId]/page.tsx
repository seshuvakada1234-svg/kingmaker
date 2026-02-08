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
    if (newGameData && newGameData.fen && game.fen() !== newGameData.fen) {
      const updatedGame = new Chess(newGameData.fen);
      setGame(updatedGame);
    }
    if (newGameData && newGameData.status) {
      // Only update status if it's different, to avoid re-renders
      setStatus(prevStatus => prevStatus !== newGameData.status ? newGameData.status : prevStatus);
    }
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
        await runTransaction(db, async (transaction) => {
          const gameDoc = await transaction.get(gameRef);

          if (isCreating) {
            if (gameDoc.exists()) {
              // A player is trying to create a room that already exists.
              // This can happen if they refresh the page. We let them rejoin if they were white.
              const gameData = gameDoc.data();
              if (gameData.players.white === playerSessionId) {
                setPlayerColor('w');
              } else {
                 // The room is taken by another white player.
                throw new Error('This room code is already in use.');
              }
            } else {
              // Room doesn't exist, create it as the white player.
              const newGame = new Chess();
              const gameData = {
                fen: newGame.fen(),
                players: { white: playerSessionId, black: null },
                status: 'waiting',
                createdAt: serverTimestamp(),
              };
              transaction.set(gameRef, gameData);
              setPlayerColor('w');
            }
          } else {
            // This player is joining an existing room.
            if (!gameDoc.exists()) {
              throw new Error('Room not found. Please check the code and try again.');
            }
            
            const gameData = gameDoc.data();
            const { players } = gameData;

            if (players.white === playerSessionId) {
              setPlayerColor('w'); // Rejoining as white
            } else if (players.black === playerSessionId) {
              setPlayerColor('b'); // Rejoining as black
            } else if (!players.black) {
              // The black spot is open, so join as the black player.
              transaction.update(gameRef, { 
                'players.black': playerSessionId,
                status: 'playing',
              });
              setPlayerColor('b');
            } else {
              // Both spots are taken by other players.
              throw new Error('This room is full.');
            }
          }
        });

      } catch (e: any) {
        setStatus('error');
        setErrorMessage(e.message || 'Failed to create or join the room.');
        clearTimeout(connectionTimeout);
        return;
      }

      if (unsubscribeRef.current) unsubscribeRef.current();
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
        console.error("Firestore snapshot error:", error);
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
  // The dependency array is intentionally sparse to only run this effect once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, playerSessionId]);

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

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (!playerColor || game.turn() !== playerColor || status !== 'playing') {
      toast({ title: "Cannot make move", description: "It's not your turn or the game isn't active.", variant: "destructive" });
      return false;
    }
  
    const gameCopy = new Chess(game.fen());
    const moveResult = gameCopy.move(move);
  
    if (!moveResult) {
      // This case should be rare since the board UI validates moves, but it's a good safeguard.
      toast({ title: "Invalid Move", variant: "destructive" });
      return false; 
    }
    
    // Optimistic UI update
    const fenBeforeMove = game.fen();
    setGame(gameCopy);
  
    // Sync with Firestore
    const gameRef = doc(db, 'games', roomId);
    setDoc(gameRef, { fen: gameCopy.fen() }, { merge: true }).catch((e) => {
      console.error("Failed to sync move:", e);
      toast({
        title: "Sync Error",
        description: "Your move could not be saved to the server. The game may be out of sync.",
        variant: "destructive"
      });
      // Revert the optimistic update on failure
      setGame(new Chess(fenBeforeMove));
    });
  
    return true;
  }, [game, playerColor, roomId, status, toast]);

  const resetGame = async () => {
    if (playerColor !== 'w') {
      toast({ title: "Only the host (White) can reset the game.", variant: "destructive" });
      return;
    }
    const newGame = new Chess();
    const gameRef = doc(db, 'games', roomId);
    // Reset the game, keeping the original white player and setting black to null.
    await setDoc(gameRef, {
      fen: newGame.fen(),
      players: { white: playerSessionId, black: null },
      status: 'waiting',
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
    const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/play/online/${roomId}` : '';
    const handleCopy = () => {
      navigator.clipboard.writeText(inviteUrl);
      toast({ title: "Copied!", description: "Invite link copied to clipboard." });
    }
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader><CardTitle>Waiting for Opponent</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Share this room code with a friend:</p>
          <div 
            className="p-2 border rounded-md bg-muted font-mono text-lg cursor-pointer hover:bg-muted/80 transition-colors" 
            onClick={handleCopy}
            title="Click to copy invite link"
          >
            {roomId}
          </div>
          <p className="text-sm text-muted-foreground">Or share the full invite link. The game will begin automatically when they join.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <GameStatus game={game} isThinking={status === 'playing' && game.turn() !== playerColor} />
        <MoveHistory game={game} />
        <p className="text-center text-sm mt-2 text-muted-foreground">You are playing as {orientation}.</p>
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col items-center">
        <Chessboard
          game={game}
          onMove={handleMove}
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
