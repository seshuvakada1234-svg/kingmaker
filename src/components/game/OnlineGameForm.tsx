'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';

export function OnlineGameForm() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleOnlinePlay = () => {
    try {
      const roomToJoin = roomId.trim();
      if (roomToJoin) {
        // Attempting to join a specific room
        router.push(`/play/online/${roomToJoin}`);
      } else {
        // Creating a new room
        const newRoomId = nanoid(6);
        router.push(`/play/online/${newRoomId}?create=true`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Could not navigate to the game room.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Enter room code (optional)"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="text-center bg-background"
      />
      <Button onClick={handleOnlinePlay} className="w-full">
        Create / Join Room
      </Button>
    </div>
  );
}
