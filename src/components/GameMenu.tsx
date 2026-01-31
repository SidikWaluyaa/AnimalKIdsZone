"use client";

import { useGameStore } from "@/store/useGameStore";
import { motion } from "framer-motion";
import { Gift, Calculator, BarChart3 } from "lucide-react";
import useGameAudio from "@/hooks/useGameAudio";

export default function GameMenu() {
  const { setStep } = useGameStore();
  const { playFlip } = useGameAudio();

  const handleNav = (step: any) => {
      playFlip();
      setStep(step);
  }

  return (
    <div className="flex flex-col items-center min-h-[100svh] w-full bg-orange-50 px-6 py-10 font-quicksand">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="text-6xl mb-2">🦁</div>
        <h1 className="text-3xl font-bold text-orange-600 text-center">Dunia Hewan Ceria</h1>
        <p className="text-orange-400 font-semibold flex items-center gap-2">Belajar sambil bermain! 🎉</p>
      </motion.div>

      {/* Menu Cards */}
      <div className="w-full max-w-md space-y-6 flex-1 flex flex-col justify-center">
        
        {/* Game 1: Box Misteri (Purple) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNav("game1")}
          className="w-full h-48 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <Gift size={80} />
            </div>
            <div className="z-10 flex flex-col items-center">
                <div className="text-5xl mb-3 drop-shadow-md">🎁</div>
                <h2 className="text-2xl font-bold mb-1">Box Misteri</h2>
                <p className="text-purple-100 text-sm mb-4">Tebak hewan yang sama!</p>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">Daya Ingat</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">Fokus</span>
                </div>
            </div>
        </motion.button>

        {/* Game 2: Keranjang Angka (Green) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNav("game2")}
          className="w-full h-48 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden group"
        >
             <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <Calculator size={80} />
            </div>
            <div className="z-10 flex flex-col items-center">
                <div className="text-5xl mb-3 drop-shadow-md">🧺</div>
                <h2 className="text-2xl font-bold mb-1">Keranjang Angka</h2>
                <p className="text-green-100 text-sm mb-4">Hitung dan pindahkan hewan!</p>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">Menghitung</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">Bilangan</span>
                </div>
            </div>
        </motion.button>
      </div>

      {/* Footer Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setStep("summary")} // Or separate stats page
        className="mt-8 bg-white px-8 py-4 rounded-full shadow-lg text-orange-600 font-bold flex items-center gap-3 border-2 border-orange-100"
      >
        <BarChart3 size={20} /> Lihat Hasil Belajar
      </motion.button>
    </div>
  );
}
