'use client';
import type { Chess } from 'chess.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useMemo, useRef, useEffect } from 'react';

interface MoveHistoryProps {
  game: Chess;
}

export function MoveHistory({ game }: MoveHistoryProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [movePairs]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Move History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 w-full pr-4" ref={scrollAreaRef}>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1 font-mono text-sm">
            {movePairs.map(pair => (
              <React.Fragment key={pair.num}>
                <div className="text-muted-foreground">{pair.num}.</div>
                <div>{pair.white}</div>
                <div>{pair.black}</div>
              </React.Fragment>
            ))}
          </div>
          {history.length === 0 && <p className="text-muted-foreground text-sm">No moves yet.</p>}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
