"use client";

import { useCallback, useRef } from 'react';

export default function useGameAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext on first user interaction (browser policy)
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, startTime = 0) => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  }, [initAudio]);

  const playFlip = useCallback(() => {
    playTone(600, 'sine', 0.1);
  }, [playTone]);

  const playMatch = useCallback(() => {
    // Happy Major Arpeggio (C5, E5, G5)
    playTone(523.25, 'sine', 0.2, 0);
    playTone(659.25, 'sine', 0.2, 0.1);
    playTone(783.99, 'sine', 0.4, 0.2);
  }, [playTone]);

  const playError = useCallback(() => {
    // Low Buzz
    playTone(150, 'sawtooth', 0.3);
  }, [playTone]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop valid prev
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.pitch = 1.2; // Slightly childlike
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { playFlip, playMatch, playError, speak };
}
