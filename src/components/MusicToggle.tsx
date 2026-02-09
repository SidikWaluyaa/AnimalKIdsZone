"use client";

import { useEffect, useState } from "react";
import useGameAudio from "@/hooks/useGameAudio";
import { Music, Music2 } from "lucide-react";

export default function MusicToggle() {
  const { toggleBackgroundMusic, playBackgroundMusic, isMusicPlaying } = useGameAudio();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      playBackgroundMusic();
      setPlaying(true);
      // Clean up after first interaction
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    // Try playing immediately (might work if user has already interacted)
    playBackgroundMusic();
    if (isMusicPlaying()) {
      setPlaying(true);
    } else {
      // Otherwise wait for interaction
      window.addEventListener('click', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);
    }

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [playBackgroundMusic, isMusicPlaying]);

  const handleToggle = () => {
    const newState = toggleBackgroundMusic();
    setPlaying(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`fixed top-4 right-4 z-[100] p-3 rounded-full shadow-lg transition-all duration-300 ${
        playing 
          ? "bg-white/80 text-orange-500 scale-100 hover:scale-110" 
          : "bg-gray-200/50 text-gray-500 scale-95 opacity-80"
      } backdrop-blur-sm border-2 ${playing ? "border-orange-200" : "border-gray-300"}`}
      aria-label="Toggle Background Music"
    >
      {playing ? (
        <Music className="w-6 h-6 animate-bounce" />
      ) : (
        <Music2 className="w-6 h-6" />
      )}
    </button>
  );
}
