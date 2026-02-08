'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Chess } from 'chess.js';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, runTransaction, type Unsubscribe, type DocumentData } from 'firebase/firestore';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { AdBanner } from '@/components/game/AdBanner';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useSound } from '@/contexts/SoundContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type GameStatusType = 'connecting' | 'waiting' | 'playing' | 'finished' | 'error' | 'full';

const CONNECTION_TIMEOUT = 10000; // 10 seconds

export default function OnlinePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;

  const [game, setGame] = useState(new Chess());
  const [gameDoc, setGameDoc] = useState<DocumentData | null>(null);
  const [status, setStatus] = useState<GameStatusType>('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { toast } = useToast();
  const { playSound } = useSound();

  const playerSessionId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const key = `kingmaker_session_${roomId}`;
    let sessionId = localStorage.getItem(key);
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2);
      localStorage.setItem(key, sessionId);
    }
    return sessionId;
  }, [roomId]);

  const myColor = useMemo<'w' | 'b' | null>(() => {
    if (!gameDoc?.players || !playerSessionId) return null;
    if (gameDoc.players.white === playerSessionId) return 'w';
    if (gameDoc.players.black === playerSessionId) return 'b';
    return null; // Spectator
  }, [gameDoc, playerSessionId]);

  useEffect(() => {
    if (!roomId || !playerSessionId) {
      return; // Wait for session and room ID to be available
    }

    const gameRef = doc(db, 'games', roomId);
    const isCreating = searchParams.get('create') === 'true';

    const connectionTimeout = setTimeout(() => {
      if (status === 'connecting') {
        setStatus('error');
        setErrorMessage('Connection timed out. Please check your internet connection and try again.');
      }
    }, CONNECTION_TIMEOUT);

    let unsubscribe: Unsubscribe | undefined;

    const setupAndListen = async () => {
      try {
        await runTransaction(db, async (transaction) => {
          const remoteGameDoc = await transaction.get(gameRef);
          
          if (isCreating) {
            if (remoteGameDoc.exists() && remoteGameDoc.data().players.white !== playerSessionId) {
              throw new Error('This room code is already in use.');
            } else if (!remoteGameDoc.exists()) {
              const newGame = new Chess();
              transaction.set(gameRef, {
                fen: newGame.fen(),
                players: { white: playerSessionId, black: null },
                status: 'waiting',
                createdAt: serverTimestamp(),
              });
            }
          } else { // Joining game
            if (!remoteGameDoc.exists()) {
              throw new Error('Room not found. Please check the code and try again.');
            }
            const gameData = remoteGameDoc.data();
            if (!gameData.players.black && gameData.players.white !== playerSessionId) {
              transaction.update(gameRef, {
                'players.black': playerSessionId,
                status: 'playing',
              });
            } else if (gameData.players.white !== playerSessionId && gameData.players.black !== playerSessionId) {
              setStatus('full');
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

      unsubscribe = onSnapshot(gameRef, (doc) => {
        clearTimeout(connectionTimeout);
        if (doc.exists()) {
          const data = doc.data();
          const currentFen = game.fen();
          setGameDoc(data);
          setGame(new Chess(data.fen));

          if (data.status === 'playing' && status !== 'playing' && data.players.black) {
             playSound('win'); // Or a "player joined" sound
          }

          if (currentFen !== data.fen) {
            const tempGame = new Chess(data.fen);
            const lastMove = tempGame.history({ verbose: true }).slice(-1)[0];
            if (lastMove?.flags.includes('c')) playSound('capture');
            else playSound('move');
          }
          
          if (['waiting', 'playing', 'finished'].includes(data.status)) {
            setStatus(data.status);
          }
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
    
    setupAndListen();

    return () => {
      clearTimeout(connectionTimeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [roomId, playerSessionId, searchParams, playSound, game, status]);


  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (!myColor || game.turn() !== myColor || status !== 'playing') {
      return false;
    }
  
    const gameCopy = new Chess(game.fen());
    if (!gameCopy.move(move)) {
      toast({ title: "Invalid Move", variant: "destructive" });
      return false; 
    }
    
    // Optimistic update
    setGame(gameCopy);
  
    const gameRef = doc(db, 'games', roomId);
    setDoc(gameRef, { fen: gameCopy.fen() }, { merge: true }).catch((e) => {
      console.error("Failed to sync move:", e);
      toast({
        title: "Sync Error",
        description: "Your move could not be saved. The game may be out of sync.",
        variant: "destructive"
      });
      setGame(new Chess(gameDoc?.fen)); // Revert on failure
    });
  
    return true;
  }, [game, myColor, roomId, status, toast, gameDoc]);

  const resetGame = async () => {
    if (myColor !== 'w') {
      toast({ title: "Only the host (White) can reset the game.", variant: "destructive" });
      return;
    }
    const newGame = new Chess();
    const gameRef = doc(db, 'games', roomId);
    await setDoc(gameRef, {
      fen: newGame.fen(),
      status: 'waiting',
      players: { white: playerSessionId, black: null }
    }, { merge: true });
  };

  const orientation = myColor === 'b' ? 'black' : 'white';
  
  if (status === 'connecting' || !playerSessionId || !gameDoc) {
    return <div className="flex flex-col items-center justify-center min-h-screen gap-4"><Skeleton className="h-96 w-96" /><p>Connecting to room {roomId}...</p></div>;
  }
  
  if (status === 'error' || status === 'full') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>{status === 'full' ? 'Room Full' : 'Error'}</CardTitle></CardHeader>
        <CardContent><p className="text-destructive">{errorMessage || 'This game room is already full.'}</p></CardContent>
      </Card>
    );
  }

  if (status === 'waiting' && myColor === 'w') {
    const inviteUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
    const handleCopy = () => {
      navigator.clipboard.writeText(inviteUrl);
      toast({ title: "Copied!", description: "Invite link copied to clipboard." });
    }
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader><CardTitle>Waiting for Opponent</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Share this invite link with a friend to play:</p>
          <div 
            className="p-2 border rounded-md bg-muted font-mono text-lg cursor-pointer hover:bg-muted/80 transition-colors" 
            onClick={handleCopy}
            title="Click to copy invite link"
          >
            {roomId}
          </div>
          <p className="text-sm text-muted-foreground">The game will begin automatically when they join.</p>
        </CardContent>
      </Card>
    );
  }
  
  const isMyTurn = status === 'playing' && game.turn() === myColor;

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <GameStatus game={game} isThinking={status === 'playing' && !isMyTurn} />
        <MoveHistory game={game} />
        {myColor && <p className="text-center text-sm mt-2 text-muted-foreground">You are playing as {orientation}.</p>}
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col items-center">
        <Chessboard
          game={game}
          onMove={handleMove}
          boardOrientation={orientation}
          playerColor={myColor}
          isInteractable={isMyTurn}
        />
        <AdBanner />
      </div>
      <div className="w-full lg:w-64 order-3">
        <GameControls onReset={resetGame} isOnlineMode={true} roomCode={roomId}/>
      </div>
    </div>
  );
}
