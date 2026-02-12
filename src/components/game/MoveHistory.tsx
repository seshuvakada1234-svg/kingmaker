'use client';
import type { Chess } from 'chess.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoveHistoryProps {
  game: Chess;
  onMoveSelect?: (moveIndex: number) => void;
}

export function MoveHistory({ game, onMoveSelect }: MoveHistoryProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const history = useMemo(() => game.history(), [game.fen()]);
  
  const movePairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < history.length; i += 2) {
      pairs.push({
        num: i / 2 + 1,
        white: history[i],
        black: history[i + 1] || '',
      });
    }
    return pairs;
  }, [history]);

  useEffect(() => {
    if (scrollAreaRef.current && isOpen) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [movePairs, isOpen]);

  const handleMoveClick = (moveIndex: number) => {
    if (onMoveSelect) {
      onMoveSelect(moveIndex);
    }
  };

  return (
    <Card className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Move History</CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="sr-only">Toggle Move History</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <ScrollArea className="h-48 w-full pr-4" ref={scrollAreaRef}>
              <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1 font-mono text-sm">
                {movePairs.map((pair, index) => (
                  <React.Fragment key={pair.num}>
                    <div className="text-muted-foreground">{pair.num}.</div>
                    <div
                      className={onMoveSelect ? 'cursor-pointer hover:underline' : ''}
                      onClick={() => handleMoveClick(index * 2)}
                    >
                      {pair.white}
                    </div>
                    {pair.black ? (
                      <div
                        className={onMoveSelect ? 'cursor-pointer hover:underline' : ''}
                        onClick={() => handleMoveClick(index * 2 + 1)}
                      >
                        {pair.black}
                      </div>
                    ) : <div />}
                  </React.Fragment>
                ))}
              </div>
              {history.length === 0 && <p className="text-muted-foreground text-sm">No moves yet.</p>}
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
