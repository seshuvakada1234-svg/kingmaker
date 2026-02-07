'use client';

import { useState, useMemo, type SVGProps } from 'react';
import type { Chess, Square, Piece, Move } from 'chess.js';
import { cn } from '@/lib/utils';
import * as Pieces from '@/components/icons/ChessPieces';

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
}

export function Chessboard({ game, onMove, boardOrientation = 'white', isInteractable }: ChessboardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

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

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      const move = { from: selectedSquare, to: square, promotion: 'q' as 'q' };
      
      const isMoveValid = game.moves({ square: selectedSquare, verbose: true }).some(m => m.to === square);
      
      if (isMoveValid) {
        const success = onMove(move);
        if (success) {
          setSelectedSquare(null);
        } else {
          // If move is invalid from parent, maybe it's another piece to select
          const piece = game.get(square);
          if (piece && piece.color === game.turn()) {
            setSelectedSquare(square);
          } else {
            setSelectedSquare(null);
          }
        }
      } else {
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
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
            const piece = board[i][j];
            const isLight = (i + j) % 2 !== 0;

            const PieceComponent = piece ? pieceComponents[`${piece.color}${piece.type.toUpperCase()}`] : null;

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={cn(
                  'relative aspect-square w-full flex items-center justify-center cursor-pointer transition-colors',
                  isLight ? 'bg-primary/10' : 'bg-primary/40',
                  {
                    'bg-accent/60': selectedSquare === square,
                    'hover:bg-accent/40': isInteractable,
                  }
                )}
              >
                {possibleMoves.has(square) && (
                  <div className="absolute w-1/3 h-1/3 rounded-full bg-accent/50" />
                )}

                {PieceComponent && <PieceComponent className="relative z-10 w-4/5 h-4/5" />}

                {(lastMove?.from === square || lastMove?.to === square) && (
                  <div className="absolute inset-0 bg-accent/30" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
