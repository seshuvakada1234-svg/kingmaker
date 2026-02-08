'use client';

import { useState, useMemo, type SVGProps } from 'react';
import type { Chess, Square, Piece } from 'chess.js';
import { cn } from '@/lib/utils';
import * as Pieces from '@/components/icons/ChessPieces';
import { useToast } from '@/hooks/use-toast';

type PieceComponentType = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const pieceComponents: Record<string, PieceComponentType> = {
  wP: Pieces.WhitePawn, bP: Pieces.BlackPawn,
  wR: Pieces.WhiteRook, bR: Pieces.BlackRook,
  wN: Pieces.WhiteKnight, bN: Pieces.BlackKnight,
  wB: Pieces.WhiteBishop, bB: Pieces.BlackBishop,
  wQ: Pieces.WhiteQueen, bQ: Pieces.BlackQueen,
  wK: Pieces.WhiteKing, bK: Pieces.BlackKing,
};

interface ChessboardProps {
  game: Chess;
  onMove: (move: { from: Square; to: Square; promotion?: 'q' | 'r' | 'b' | 'n' }) => boolean;
  boardOrientation?: 'white' | 'black';
  isInteractable: boolean;
  playerColor?: 'w' | 'b' | null;
}

export function Chessboard({ game, onMove, boardOrientation = 'white', isInteractable, playerColor }: ChessboardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const { toast } = useToast();

  const board = useMemo(() => game.board(), [game.fen()]);
  const history = useMemo(() => game.history({ verbose: true }), [game.fen()]);
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  const possibleMoves = useMemo(() => {
    if (!selectedSquare) return new Set();
    const moves = game.moves({ square: selectedSquare, verbose: true });
    return new Set(moves.map(move => move.to));
  }, [selectedSquare, game]);

  const handleSquareClick = (square: Square) => {
    if (!isInteractable) {
      if (!game.isGameOver()) {
        toast({
          description: "Not your turn to move.",
          variant: "destructive",
          duration: 2000,
        });
      }
      return;
    }

    const pieceOnSquare = game.get(square);

    if (selectedSquare) {
      // A piece is selected, attempt to move it.
      const isMoveValid = game.moves({ square: selectedSquare, verbose: true }).some(m => m.to === square);

      if (isMoveValid) {
        const move = { from: selectedSquare, to: square, promotion: 'q' as const };
        const success = onMove(move);
        // Deselect only on successful move. If the server rejects the move,
        // the selection remains, allowing the user to try a different move.
        if (success) {
          setSelectedSquare(null);
        }
      } else if (pieceOnSquare && playerColor && pieceOnSquare.color === playerColor) {
        // The target square is not a valid move, but it's another one of the player's pieces.
        // We switch the selection to the new piece.
        setSelectedSquare(square);
      } else {
        // The target is not a valid move and not another of the player's pieces. Deselect.
        setSelectedSquare(null);
      }
    } else {
      // No piece is selected yet. Try to select one.
      if (!pieceOnSquare) {
        return; // Clicked an empty square.
      }

      // CRITICAL: In online mode (when playerColor is set), you can only select your own pieces.
      if (playerColor && pieceOnSquare.color !== playerColor) {
        toast({
          description: `Not your piece. You play as ${playerColor === 'w' ? 'White' : 'Black'}.`,
          variant: 'destructive',
          duration: 2000,
        });
        return;
      }
      
      // Also ensure it's the correct turn, which is the main purpose of `isInteractable`,
      // but this adds another layer of safety.
      if(pieceOnSquare.color !== game.turn()) {
        toast({
          description: "Not your turn to move.",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }
      
      setSelectedSquare(square);
    }
  };

  const ranks = boardOrientation === 'white' ? '87654321' : '12345678';
  const files = boardOrientation === 'white' ? 'abcdefgh' : 'hgfedcba';

  return (
    <div className="aspect-square w-full max-w-[calc(100vh-120px)] sm:max-w-md md:max-w-lg lg:max-w-xl shadow-2xl rounded-md overflow-hidden border-4 border-card">
      {ranks.split('').map((rank, i) => (
        <div key={rank} className="flex">
          {files.split('').map((file, j) => {
            const square = (file + rank) as Square;
            const pieceOnSquare = board[i][j];
            const isLight = (i + j) % 2 !== 0;

            const PieceComponent = pieceOnSquare ? pieceComponents[`${pieceOnSquare.color}${pieceOnSquare.type.toUpperCase()}`] : null;

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={cn(
                  'relative aspect-square w-full flex items-center justify-center transition-all duration-75',
                  isLight ? 'bg-wood-light' : 'bg-wood-dark',
                  {
                    'ring-2 ring-inset ring-selection-gold': selectedSquare === square,
                  },
                  isInteractable ? 'cursor-pointer' : 'cursor-not-allowed',
                  isInteractable && 'hover:brightness-125'
                )}
              >
                {possibleMoves.has(square) && (
                  <div className="absolute w-1/3 h-1/3 rounded-full bg-black/20 pointer-events-none" />
                )}

                {PieceComponent && <PieceComponent className="relative z-10 w-full h-full" />}

                {(lastMove?.from === square || lastMove?.to === square) && (
                  <div className="absolute inset-0 bg-selection-gold/30 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
