"use client";

import { useGameStore } from "@/store/useGameStore";
import Onboarding from "@/components/Onboarding";
import GameMenu from "@/components/GameMenu";
import GameOne from "@/components/GameOne";
import GameTwo from "@/components/GameTwo";
import AssessmentModal from "@/components/AssessmentModal";

export default function Home() {
  const currentStep = useGameStore((state) => state.currentStep);

  return (
    <main className="min-h-[100svh] w-full overflow-hidden bg-yellow-50 relative">
      {currentStep === "onboarding" && <Onboarding />}
      {currentStep === "menu" && <GameMenu />}
      {currentStep === "game1" && <GameOne />}
      {currentStep === "game2" && <GameTwo />}
      
      {/* Summary is overlay or separate step. In store definition 'summary' is a step. */}
      {/* AssessmentModal handles its own visibility based on store, but we can also just render it here conditionally */}
      <AssessmentModal />
    </main>
  );
}
