'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Volume2, VolumeX, Undo2 } from 'lucide-react';
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
  aiDifficulty?: number;
  onDifficultyChange?: (difficulty: string) => void;
  isOnlineMode?: boolean;
  roomCode?: string;
  onUndo?: () => void;
  isUndoPossible?: boolean;
}

export function GameControls({
  onReset,
  isAiMode,
  aiDifficulty,
  onDifficultyChange,
  isOnlineMode,
  roomCode,
  onUndo,
  isUndoPossible,
}: GameControlsProps) {
  const { isSoundEnabled, toggleSound } = useSound();

  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      // Optional: show a toast notification
    }
  };

  const showUndoButton = !!onUndo;
  const isUndoButtonDisabled = isOnlineMode || !isUndoPossible;

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
            <Select onValueChange={onDifficultyChange} value={aiDifficulty?.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showUndoButton && (
          <div className="space-y-2 pt-4 border-t">
            <Button 
              onClick={onUndo} 
              className="w-full" 
              variant="outline" 
              disabled={isUndoButtonDisabled}
            >
              <Undo2 className="mr-2 h-4 w-4" /> Undo Move
            </Button>
            
            {isOnlineMode ? (
              <p className="text-xs text-muted-foreground text-center">Not available in online matches.</p>
            ) : !isUndoPossible ? (
              <p className="text-xs text-muted-foreground text-center">Make a move to enable Undo.</p>
            ) : null}
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
        
        <div className="flex items-center justify-between pt-4 border-t">
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
