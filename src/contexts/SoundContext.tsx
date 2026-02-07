'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { sounds } from '@/lib/sounds';

type SoundType = 'move' | 'capture' | 'win' | 'draw';

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playSound: (sound: SoundType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [audio, setAudio] = useState<Record<SoundType, HTMLAudioElement | null> | null>(null);

  useEffect(() => {
    // This code runs only on the client
    const storedSoundPreference = localStorage.getItem('kingmaker-sound-enabled');
    if (storedSoundPreference !== null) {
      setIsSoundEnabled(JSON.parse(storedSoundPreference));
    }
    
    // Preload audio
    const moveAudio = new Audio(sounds.move);
    const captureAudio = new Audio(sounds.capture);
    const winAudio = new Audio(sounds.win);
    const drawAudio = new Audio(sounds.draw);
    
    moveAudio.preload = 'auto';
    captureAudio.preload = 'auto';
    winAudio.preload = 'auto';
    drawAudio.preload = 'auto';

    setAudio({
      move: moveAudio,
      capture: captureAudio,
      win: winAudio,
      draw: drawAudio,
    });
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => {
      const newState = !prev;
      localStorage.setItem('kingmaker-sound-enabled', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const playSound = useCallback((sound: SoundType) => {
    if (isSoundEnabled && audio && audio[sound]) {
      const soundToPlay = audio[sound];
      // readyState > 2 means the browser has at least HAVE_FUTURE_DATA.
      // This check prevents errors if the sound file failed to load or is not ready.
      if (soundToPlay && soundToPlay.readyState > 2) {
        soundToPlay.currentTime = 0;
        soundToPlay.play().catch(() => {
          // Fail silently if playback is interrupted or fails for any reason.
        });
      }
    }
  }, [isSoundEnabled, audio]);

  const contextValue = useMemo(() => ({
    isSoundEnabled,
    toggleSound,
    playSound
  }), [isSoundEnabled, toggleSound, playSound]);

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
