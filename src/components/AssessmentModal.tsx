"use client";

import { useGameStore } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw } from "lucide-react";

export default function AssessmentModal() {
  const { currentStep, analytics, resetGame, userName } = useGameStore();

  if (currentStep !== "summary") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border-4 border-yellow-400 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400" />
        
        <h2 className="text-3xl font-bold text-purple-600 mb-2 font-quicksand">Hebat, {userName}!</h2>
        <p className="text-gray-500 mb-6 text-lg">Kamu sudah menyelesaikan semua permainan!</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-pink-100 p-4 rounded-2xl">
                <div className="text-sm text-pink-600 font-bold mb-1">Daya Ingat</div>
                <div className="text-2xl font-black text-pink-800">
                    {analytics.wrongClicks === 0 ? "Sempurna!" : `${analytics.wrongClicks} Salah`}
                </div>
            </div>
            <div className="bg-blue-100 p-4 rounded-2xl">
                <div className="text-sm text-blue-600 font-bold mb-1">Fokus</div>
                <div className="text-2xl font-black text-blue-800">
                    {analytics.wrongClicks < 5 ? "Tinggi" : "Sedang"}
                </div>
            </div>
             <div className="bg-purple-100 p-4 rounded-2xl">
                <div className="text-sm text-purple-600 font-bold mb-1">Kesabaran</div>
                <div className="text-2xl font-black text-purple-800">
                    {analytics.repeatedClicks === 0 ? "Sabar" : "Cukup"}
                </div>
            </div>
            <div className="bg-green-100 p-4 rounded-2xl">
                <div className="text-sm text-green-600 font-bold mb-1">Berhitung</div>
                <div className="text-2xl font-black text-green-800">OK</div>
            </div>
            <div className="bg-orange-100 p-4 rounded-2xl">
                <div className="text-sm text-orange-600 font-bold mb-1">Waktu</div>
                <div className="text-2xl font-black text-orange-800">Cepat!</div>
            </div>
        </div>

        <p className="text-xl font-bold text-gray-700 italic mb-8">"Terus Berlatih ya!"</p>

        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="w-full py-4 rounded-full bg-yellow-400 text-yellow-900 text-xl font-bold shadow-lg flex items-center justify-center gap-2"
        >
            <RotateCw /> Main Lagi
        </motion.button>
      </motion.div>
    </div>
  );
}
