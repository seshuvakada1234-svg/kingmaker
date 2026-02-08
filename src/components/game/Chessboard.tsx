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
  }, [selectedSquare, game.fen()]);

  const handleSquareClick = (square: Square) => {
    if (!isInteractable) return;

    const piece = game.get(square);
    const turn = game.turn();

    // In online mode, a player can only interact with their own pieces.
    // This is the primary guard against incorrect interaction.
    if (playerColor && piece && piece.color !== playerColor) {
      toast({
        description: "Not your piece to move.",
        variant: "destructive",
        duration: 2000,
      });
      return; // Exit immediately, preventing selection.
    }

    // No piece is selected yet, try to select one
    if (!selectedSquare) {
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
      } else if (piece) {
        // This case now primarily handles local/AI games, or if it's not the current player's turn.
        toast({
          description: "Not your piece to move.",
          variant: "destructive",
          duration: 2000,
        });
      }
      return;
    }

    // A piece is already selected.
    // Clicking the same piece again deselects it.
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // Try to make a move from the selected square to the clicked square
    const isMoveValid = game.moves({ square: selectedSquare, verbose: true }).some(m => m.to === square);

    if (isMoveValid) {
      const move = { from: selectedSquare, to: square, promotion: 'q' as 'q' };
      const success = onMove(move);
      if (success) {
        setSelectedSquare(null);
      } else {
        // Parent rejected move. In online play, this could be a sync issue.
        // We'll check if the user is attempting to select another of their valid pieces.
        if (piece && piece.color === turn && (!playerColor || piece.color === playerColor)) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null); // Deselect
        }
      }
    } else {
      // The destination is not a valid move.
      // Check if the user is trying to select a different piece of their own.
      if (piece && piece.color === turn && (!playerColor || piece.color === playerColor)) {
        setSelectedSquare(square);
      } else {
        // Clicked on an empty invalid square or an opponent piece, so deselect.
        setSelectedSquare(null);
      }
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
                  isInteractable ? 'cursor-pointer hover:brightness-125' : ''
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
