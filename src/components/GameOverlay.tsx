"use client";

import Lottie from "lottie-react";
// Placeholder
import confettiAnimation from "../../public/confetti-lottie.json";

export default function GameOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        {/* Placeholder if file missing */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="text-9xl animate-bounce">🎉</div>
        {/* <Lottie animationData={confettiAnimation} loop={false} /> */}
    </div>
  );
}
