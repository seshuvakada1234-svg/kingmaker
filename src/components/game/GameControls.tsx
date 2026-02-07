'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GameControlsProps {
  onReset: () => void;
  isAiMode?: boolean;
  aiDifficulty?: 'easy' | 'hard';
  onDifficultyChange?: (difficulty: 'easy' | 'hard') => void;
  isOnlineMode?: boolean;
  roomCode?: string;
}

export function GameControls({
  onReset,
  isAiMode,
  aiDifficulty,
  onDifficultyChange,
  isOnlineMode,
  roomCode,
}: GameControlsProps) {
  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      // Optional: show a toast notification
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={onReset} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" /> New Game
        </Button>
        {isAiMode && onDifficultyChange && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">AI Difficulty</label>
            <Select onValueChange={onDifficultyChange} value={aiDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {isOnlineMode && roomCode && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Room Code:</p>
            <Button variant="outline" onClick={handleCopyRoomCode} className="w-full font-mono text-lg tracking-widest">
              {roomCode}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
