"use client";

import { useGameStore, AvatarType } from "@/store/useGameStore";
import { motion } from "framer-motion";
import { Gift, Calculator, BarChart3, Star } from "lucide-react";
import useGameAudio from "@/hooks/useGameAudio";

const avatars: Record<AvatarType, string> = {
  Lion: "🦁",
  Rabbit: "🐰",
  Cat: "🐱",
};

export default function GameMenu() {
  const { setStep, avatar, userName } = useGameStore();
  const { playFlip } = useGameAudio();

  const handleNav = (step: any) => {
      playFlip();
      setStep(step);
  }

  // Fallback if no avatar selected (e.g. dev mode skip)
  const currentAvatarEmoji = avatar ? avatars[avatar] : "🦁";

  return (
    <div className="flex flex-col items-center min-h-[100svh] w-full bg-cloud-pattern px-6 py-8 font-quicksand relative overflow-hidden">
        {/* Decorative Blobs removed */}

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center mb-6 z-10 w-full"
      >
        <div className="bg-white p-4 rounded-full shadow-lg border-4 border-orange-100 mb-2">
            <div className="text-6xl animate-bounce">{currentAvatarEmoji}</div>
        </div>
        <h1 className="text-3xl font-black text-orange-600 text-center drop-shadow-sm mb-1">Dunia Hewan Ceria</h1>
        <p className="text-orange-500 font-bold bg-white/60 px-4 py-1 rounded-full backdrop-blur-sm">
            Halo, {userName || "Teman"}! 👋
        </p>
      </motion.div>

      {/* Menu Cards */}
      <div className="w-full max-w-sm space-y-5 flex-1 flex flex-col justify-center z-10 pb-4">
        
        {/* Game 1: Box Misteri */}
        <motion.button
          whileHover={{ scale: 1.03, rotate: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNav("game1")}
          className="w-full h-40 rounded-[32px] bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-purple-200 flex items-center justify-between px-6 relative overflow-hidden group border-b-8 border-violet-700 active:border-b-0 active:translate-y-2 transition-all"
        >
             {/* Background Decoration */}
            <div className="absolute right-[-20px] top-[-20px] bg-white/10 w-32 h-32 rounded-full" />
            
            <div className="flex flex-col items-start text-left">
                <div className="flex items-center gap-2 mb-1">
                     <Gift className="text-white" size={24} />
                     <span className="font-bold text-violet-100 uppercase tracking-wider text-xs">Game 1</span>
                </div>
                <h2 className="text-2xl font-black mb-1">Box Misteri</h2>
                <div className="flex gap-1 flex-wrap">
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Ingatan</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Suara</span>
                </div>
            </div>
            <div className="text-6xl drop-shadow-md group-hover:scale-110 transition-transform">🎁</div>
        </motion.button>

        {/* Game 2: Keranjang Angka */}
        <motion.button
          whileHover={{ scale: 1.03, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNav("game2")}
          className="w-full h-40 rounded-[32px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-teal-200 flex items-center justify-between px-6 relative overflow-hidden group border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2 transition-all"
        >
             {/* Background Decoration */}
             <div className="absolute right-[-20px] bottom-[-20px] bg-white/10 w-32 h-32 rounded-full" />

            <div className="flex flex-col items-start text-left">
                <div className="flex items-center gap-2 mb-1">
                     <Calculator className="text-white" size={24} />
                     <span className="font-bold text-emerald-100 uppercase tracking-wider text-xs">Game 2</span>
                </div>
                <h2 className="text-2xl font-black mb-1">Keranjang Angka</h2>
                <div className="flex gap-1 flex-wrap">
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Berhitung</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Logika</span>
                </div>
            </div>
            <div className="text-6xl drop-shadow-md group-hover:scale-110 transition-transform">🧺</div>
        </motion.button>
      </div>

      {/* Footer Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setStep("stats")}
        className="mb-4 bg-white px-8 py-4 rounded-full shadow-lg text-orange-500 font-bold flex items-center gap-3 border-b-4 border-orange-100 active:border-b-0 active:translate-y-1 z-10"
      >
        <Star size={24} fill="orange" stroke="none" /> Lihat Prestasi Saya
      </motion.button>
    </div>
  );
}
