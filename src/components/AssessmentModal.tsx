"use client";

import { useGameStore } from "@/store/useGameStore";
import { motion } from "framer-motion";
import { RotateCw, Home, Timer, Star, Calculator, Target, BookOpen } from "lucide-react";
import CuteButton from "./CuteButton";

export default function AssessmentModal() {
  const { currentStep, resetGame, userName, lastPlayedGame, setStep, history, analytics } = useGameStore();

  if (currentStep !== "summary") return null;

  // Get latest game data from history to ensure accurate Time/Score
  const latestGame = history.length > 0 ? history[0] : null;
  const timeElapsed = latestGame ? latestGame.timeElapsed : 0;
  const score = latestGame ? latestGame.score : 0;

  // Helper to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isGame2 = lastPlayedGame === 'game2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-quicksand">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden ring-8 ring-white/50"
      >
        {/* Background blobs for cuteness */}
        <div className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-yellow-100 rounded-full opacity-50 pointer-events-none" />
        <div className="absolute bottom-[-10px] right-[-10px] w-32 h-32 bg-orange-100 rounded-full opacity-50 pointer-events-none" />

        {/* Confetti / Title */}
        <div className="flex flex-col items-center mb-6 relative z-10">
             {isGame2 ? (
                 <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-7xl mb-2 drop-shadow-md"
                 >
                    🧮
                 </motion.div> 
             ) : (
                 <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-7xl mb-2 drop-shadow-md"
                 >
                    🏆
                 </motion.div>
             )}
            <h2 className="text-3xl font-black text-orange-500 mb-1 drop-shadow-sm">
                {isGame2 ? "Pintar Sekali! 🎉" : `Hebat, ${userName}!`}
            </h2>
        </div>

        {/* Metrics Container */}
        <div className="space-y-3 mb-8 relative z-10">
            {/* Time */}
            <div className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100">
                <div className="flex items-center gap-3 text-gray-500 font-bold">
                    <Timer size={20} className="text-gray-400" /> Waktu
                </div>
                <div className="text-orange-500 font-black text-xl">
                    {formatTime(timeElapsed)}
                </div>
            </div>

            {/* Score */}
            <div className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100">
                <div className="flex items-center gap-3 text-gray-500 font-bold">
                    <Star size={20} className="text-yellow-400 fill-yellow-400" /> Skor
                </div>
                <div className="text-orange-500 font-black text-xl">
                    {score}/100
                </div>
            </div>

            {/* Game 2 Specifics (Mocked based on reference) */}
            {isGame2 ? (
                <>
                    <div className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-3 text-gray-500 font-bold">
                            <Calculator size={20} className="text-blue-400" /> Menghitung
                        </div>
                        <div className="text-orange-500 font-bold text-lg">Sangat Baik!</div>
                    </div>
                    <div className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-3 text-gray-500 font-bold">
                            <Target size={20} className="text-red-400" /> Fokus
                        </div>
                        <div className="text-orange-500 font-bold text-lg">Sangat Fokus!</div>
                    </div>
                    <div className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-3 text-gray-500 font-bold">
                            <BookOpen size={20} className="text-green-400" /> Hafal Bilangan
                        </div>
                        <div className="text-orange-500 font-bold text-lg">Hafal!</div>
                    </div>
                </>
            ) : (
                // Game 1 Specifics
                <>
                    <div className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-3 text-gray-500 font-bold">
                             {/* Icon for Attempts */}
                            <Target size={20} className="text-purple-400" /> Percobaan
                        </div>
                        <div className="text-orange-500 font-bold text-lg">{analytics.attempts || 0} kali</div>
                    </div>
                    <div className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-3 text-gray-500 font-bold">
                             {/* Icon for Memory */}
                            <BookOpen size={20} className="text-blue-400" /> Daya Ingat
                        </div>
                        <div className="text-orange-500 font-bold text-lg">Sangat Baik!</div>
                    </div>
                    <div className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-3 text-gray-500 font-bold">
                            <Target size={20} className="text-red-400" /> Fokus
                        </div>
                        <div className="text-orange-500 font-bold text-lg">Sangat Fokus!</div>
                    </div>
                </>
            )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 relative z-10 w-full">
             <CuteButton
                onClick={resetGame}
                size="lg"
                icon={<RotateCw size={24} />}
                className="w-full"
            >
                Main Lagi
            </CuteButton>
            
            <CuteButton
                variant="secondary"
                onClick={() => setStep("menu")}
                size="md"
                icon={<Home size={20} />}
                className="w-full"
            >
                Menu Utama
            </CuteButton>
        </div>

      </motion.div>
    </div>
  );
}
