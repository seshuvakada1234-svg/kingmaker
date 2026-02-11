'use client';
import type { Chess } from 'chess.js';
import { ShieldCheck, Swords, Bot, Crown, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface GameStatusProps {
  game: Chess;
  isThinking?: boolean;
  isAiMode?: boolean;
}

interface StatusChipProps {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'warning' | 'danger';
  className?: string;
}

const StatusChip = ({ icon, label, variant = 'default', className }: StatusChipProps) => {
  const variantClasses = {
    default: 'bg-secondary text-secondary-foreground',
    warning: 'bg-accent text-accent-foreground',
    danger: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium", variantClasses[variant], className)}>
      {icon}
      <span>{label}</span>
    </div>
  );
};


export function GameStatus({ game, isThinking, isAiMode }: GameStatusProps) {
  const turn = game.turn() === 'w' ? 'White' : 'Black';
  
  if (game.isCheckmate()) {
    return (
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <StatusChip 
          icon={<Crown className="w-5 h-5" />} 
          label={`Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins.`} 
          variant="danger" 
        />
      </div>
    );
  }

  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
    let drawReason = 'Game is a Draw';
    if (game.isStalemate()) drawReason = 'Draw by Stalemate';
    else if (game.isThreefoldRepetition()) drawReason = 'Draw by Repetition';
    else if (game.isInsufficientMaterial()) drawReason = 'Draw by Insufficient Material';
    
    return (
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <StatusChip 
          icon={<Handshake className="w-5 h-5" />} 
          label={drawReason} 
        />
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center gap-2 flex-wrap h-[50px]">
      {isThinking && isAiMode ? (
        <StatusChip 
          icon={<Bot className="w-5 h-5 animate-pulse" />} 
          label="AI is thinking..." 
        />
      ) : (
        <StatusChip 
          icon={<Swords className="w-5 h-5" />} 
          label={`${turn}'s Turn`} 
        />
      )}
      
      {game.inCheck() && (
        <StatusChip 
          icon={<ShieldCheck className="w-5 h-5" />} 
          label="In Check" 
          variant="warning" 
        />
      )}
    </div>
  );
}
