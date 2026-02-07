'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSound } from '@/contexts/SoundContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const { isSoundEnabled, toggleSound } = useSound();

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
            <Label className="text-sm font-medium text-muted-foreground">AI Difficulty</Label>
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
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="sound-toggle" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground">
            {isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            <span>Sound</span>
          </Label>
          <Switch
            id="sound-toggle"
            checked={isSoundEnabled}
            onCheckedChange={toggleSound}
          />
        </div>
      </CardContent>
    </Card>
  );
}
