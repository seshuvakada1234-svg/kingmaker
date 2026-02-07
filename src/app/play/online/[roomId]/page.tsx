'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Chess, type Move } from 'chess.js';
import { database } from '@/lib/firebase';
import { ref, onValue, set, get, off } from 'firebase/database';
import { Chessboard } from '@/components/game/Chessboard';
import { GameStatus } from '@/components/game/GameStatus';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { AdBanner } from '@/components/game/AdBanner';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useSound } from '@/contexts/SoundContext';

export default function OnlinePlayPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [playerSessionId] = useState(() => Math.random().toString(36).substring(2));
  const [gameExists, setGameExists] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { playSound } = useSound();
  const prevFenRef = useRef<string>(game.fen());

  useEffect(() => {
    if (!roomId) return;
    const gameRef = ref(database, `games/${roomId}`);
    
    const handleValueChange = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        if (!gameExists) setGameExists(true);
        setGame(new Chess(data.fen));

        // Assign player color
        if (!playerColor) {
          if (!data.players?.w) {
            setPlayerColor('w');
            set(ref(database, `games/${roomId}/players/w`), playerSessionId);
          } else if (!data.players?.b && data.players.w !== playerSessionId) {
            setPlayerColor('b');
            set(ref(database, `games/${roomId}/players/b`), playerSessionId);
          } else if (data.players.w === playerSessionId) {
            setPlayerColor('w');
          } else if (data.players.b === playerSessionId) {
            setPlayerColor('b');
          }
        }

      } else {
        // Game does not exist, create it
        if(gameExists === null) {
          const initialGame = new Chess();
          set(gameRef, { fen: initialGame.fen(), players: {w: playerSessionId} });
          setPlayerColor('w');
          setGameExists(true);
        }
      }
    };
    
    get(gameRef).then(snapshot => {
      if(!snapshot.exists() && gameExists === null){
        setGameExists(false); // Game doesn't exist, we will create it
      } else {
        setGameExists(true);
      }
      onValue(gameRef, handleValueChange);
    });

    return () => {
      off(gameRef, 'value', handleValueChange);
    };
  }, [roomId, playerColor, playerSessionId, gameExists]);
  
  useEffect(() => {
    const currentFen = game.fen();
    // Play sound if a move was made
    if (prevFenRef.current && prevFenRef.current !== currentFen && game.history().length > 0) {
        const lastMove = game.history({ verbose: true }).slice(-1)[0];
        if (lastMove.flags.includes('c')) {
            playSound('capture');
        } else {
            playSound('move');
        }
    }
    prevFenRef.current = currentFen;
    
    // Play sound on game over
    if (game.isGameOver()) {
        if (game.isCheckmate()) {
            playSound('win');
        } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
            playSound('draw');
        }
    }
  }, [game, playSound]);

  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (game.turn() !== playerColor) {
      toast({ title: "Not your turn!", variant: "destructive" });
      return false;
    }
    
    try {
      const tempGame = new Chess(game.fen());
      const result = tempGame.move(move);
      if (result) {
        // We don't play sound here directly. The onValue listener will trigger the useEffect.
        set(ref(database, `games/${roomId}/fen`), tempGame.fen());
        return true;
      }
    } catch(e) {
      return false;
    }
    return false;
  }, [game, playerColor, roomId, toast]);

  const resetGame = () => {
    if(playerColor !== 'w') {
      toast({ title: "Only the host (White) can reset the game.", variant: "destructive" });
      return;
    };
    const newGame = new Chess();
    set(ref(database, `games/${roomId}`), { fen: newGame.fen(), players: {w: playerSessionId} });
  };

  if (gameExists === null) {
    return <div className="flex flex-col items-center gap-4"><Skeleton className="h-96 w-96" /><p>Connecting to room...</p></div>;
  }
  
  const orientation = playerColor === 'b' ? 'black' : 'white';

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
          isInteractable={!game.isGameOver() && game.turn() === playerColor && !!playerColor}
        />
        <AdBanner />
      </div>
      <div className="w-full lg:w-64 order-3">
        <GameControls onReset={resetGame} isOnlineMode={true} roomCode={roomId}/>
      </div>
    </div>
  );
}
