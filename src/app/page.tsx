"use client";

import { useGameStore } from "@/store/useGameStore";
import Onboarding from "@/components/Onboarding";
import GameMenu from "@/components/GameMenu";
import GameOne from "@/components/GameOne";
import GameTwo from "@/components/GameTwo";
import AssessmentModal from "@/components/AssessmentModal";
import LearningStats from "@/components/LearningStats";
import MusicToggle from "@/components/MusicToggle";

export default function Home() {
  const currentStep = useGameStore((state) => state.currentStep);

  return (
    <main className="min-h-[100svh] w-full overflow-hidden bg-sky-50 relative">
      {currentStep === "onboarding" && <Onboarding />}
      {currentStep === "menu" && <GameMenu />}
      {currentStep === "game1" && <GameOne />}
      {currentStep === "game2" && <GameTwo />}
      
      {/* Overlay Screens */}
      {currentStep === "stats" && <LearningStats />}
      <AssessmentModal />
      <MusicToggle />
    </main>
  );
}
