'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

type GameStatusType = 'connecting' | 'waiting' | 'playing' | 'finished' | 'error';

const CONNECTION_TIMEOUT = 10000; // 10 seconds

export default function OnlinePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;

  const [game, setGame] = useState(new Chess());
  const [gameDoc, setGameDoc] = useState<DocumentData | null>(null); // State for the entire game document
  const [status, setStatus] = useState<GameStatusType>('connecting');
  const [errorMessage, setErrorMessage] = useState('');

  // This session ID uniquely identifies the user's browser for this game room.
  const [playerSessionId] = useState(() => {
    if (typeof window === 'undefined') return Math.random().toString(36).substring(2);
    const key = `kingmaker_session_${roomId}`;
    let sessionId = localStorage.getItem(key);
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2);
        localStorage.setItem(key, sessionId);
    }
    return sessionId;
  });

  const { toast } = useToast();
  const { playSound } = useSound();
  const prevFenRef = useRef<string>(game.fen());
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Derive playerColor from the game document and session ID. This is the single source of truth.
  const playerColor = useMemo(() => {
    if (!gameDoc?.players || !playerSessionId) return null;
    if (gameDoc.players.white === playerSessionId) return 'w';
    if (gameDoc.players.black === playerSessionId) return 'b';
    return null;
  }, [gameDoc, playerSessionId]);

  useEffect(() => {
    if (!roomId) {
      setStatus('error');
      setErrorMessage('Invalid room ID.');
      return;
    }

    const gameRef = doc(db, 'games', roomId);
    const isCreating = searchParams.get('create') === 'true';

    const connectionTimeout = setTimeout(() => {
      if (status === 'connecting') {
        setStatus('error');
        setErrorMessage('Connection timed out. Please check your internet connection and try again.');
        if (unsubscribeRef.current) unsubscribeRef.current();
      }
    }, CONNECTION_TIMEOUT);

    const initAndListen = async () => {
      try {
        // Use a transaction to safely create or join the game.
        await runTransaction(db, async (transaction) => {
          const remoteGameDoc = await transaction.get(gameRef);

          if (isCreating) {
            if (remoteGameDoc.exists()) {
              // Room already exists. Check if we are the creator rejoining.
              if (remoteGameDoc.data().players.white !== playerSessionId) {
                throw new Error('This room code is already in use.');
              }
              // If we are rejoining, we do nothing in the transaction. The snapshot listener will sync state.
            } else {
              // Creating a new game. The creator is always White.
              const newGame = new Chess();
              transaction.set(gameRef, {
                fen: newGame.fen(),
                players: { white: playerSessionId, black: null },
                status: 'waiting',
                createdAt: serverTimestamp(),
              });
            }
          } else { // Joining an existing game
            if (!remoteGameDoc.exists()) {
              throw new Error('Room not found. Please check the code and try again.');
            }
            
            const gameData = remoteGameDoc.data();
            // If the black player slot is open, join as Black.
            if (!gameData.players.black && gameData.players.white !== playerSessionId) {
              transaction.update(gameRef, {
                'players.black': playerSessionId,
                status: 'playing',
              });
            } else if (gameData.players.white !== playerSessionId && gameData.players.black !== playerSessionId) {
              // If we are not white or black and both are set, the room is full.
              throw new Error('This room is full.');
            }
            // If we are already in the game (white or black), do nothing. The listener will sync.
          }
        });

      } catch (e: any) {
        setStatus('error');
        setErrorMessage(e.message || 'Failed to create or join the room.');
        clearTimeout(connectionTimeout);
        return;
      }

      // If we reach here, the transaction was successful or not needed.
      // Start listening for real-time game updates.
      if (unsubscribeRef.current) unsubscribeRef.current();
      
      unsubscribeRef.current = onSnapshot(gameRef, (doc) => {
        clearTimeout(connectionTimeout); // Stop the timeout on first successful read
        if (doc.exists()) {
          const data = doc.data();
          setGameDoc(data);
          setGame(new Chess(data.fen));
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
    
    initAndListen();

    return () => {
      clearTimeout(connectionTimeout);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  // The dependency array is intentionally sparse to only run this effect once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);


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
    // Final guard before sending to Firestore: must be playing, and your turn.
    if (!playerColor || game.turn() !== playerColor || status !== 'playing') {
      return false;
    }
  
    const gameCopy = new Chess(game.fen());
    const moveResult = gameCopy.move(move);
  
    if (!moveResult) {
      toast({ title: "Invalid Move", variant: "destructive" });
      return false; 
    }
    
    const fenBeforeMove = game.fen();
    setGame(gameCopy); // Optimistic update of local UI
  
    const gameRef = doc(db, 'games', roomId);
    // Update the FEN in Firestore.
    setDoc(gameRef, { fen: gameCopy.fen() }, { merge: true }).catch((e) => {
      console.error("Failed to sync move:", e);
      toast({
        title: "Sync Error",
        description: "Your move could not be saved. The game may be out of sync.",
        variant: "destructive"
      });
      setGame(new Chess(fenBeforeMove)); // Revert optimistic update on failure
    });
  
    return true; // Indicate success for UI purposes (e.g., deselecting piece)
  }, [game, playerColor, roomId, status, toast]);

  const resetGame = async () => {
    // Only the creator of the room (White) can reset it.
    if (playerColor !== 'w') {
      toast({ title: "Only the host (White) can reset the game.", variant: "destructive" });
      return;
    }
    const newGame = new Chess();
    const gameRef = doc(db, 'games', roomId);
    await setDoc(gameRef, {
      fen: newGame.fen(),
      status: 'waiting',
      players: { white: playerSessionId, black: null } // Reset players, kicking Black out
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

  // Waiting screen for the creator (White)
  if (status === 'waiting' && playerColor === 'w') {
    const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/play/online/${roomId}` : '';
    const handleCopy = () => {
      navigator.clipboard.writeText(inviteUrl);
      toast({ title: "Copied!", description: "Invite link copied to clipboard." });
    }
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader><CardTitle>Waiting for Opponent</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Share this room code with a friend to play:</p>
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

  const isMyTurn = !game.isGameOver() && status === 'playing' && game.turn() === playerColor;

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-start w-full max-w-7xl mx-auto">
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <GameStatus game={game} isThinking={status === 'playing' && !isMyTurn} />
        <MoveHistory game={game} />
        {playerColor && <p className="text-center text-sm mt-2 text-muted-foreground">You are playing as {orientation}.</p>}
      </div>
      <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col items-center">
        <Chessboard
          game={game}
          onMove={handleMove}
          boardOrientation={orientation}
          playerColor={playerColor} // Pass player color to enforce piece interaction rules
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
