"use client";

import { useGameStore } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, X, Gift, Star, Timer, Trophy } from "lucide-react";

export default function LearningStats() {
  const { history, setStep, userName, avatar } = useGameStore();

  const game1Total = history.filter(h => h.gameType === 'game1').reduce((acc, curr) => acc + curr.score, 0);
  const game2Count = history.filter(h => h.gameType === 'game2').length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-quicksand">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className="bg-yellow-50 rounded-[40px] w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-8 border-white relative"
      > 
        {/* Decorative Blobs */}
        <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob" />
        <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000" />

        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2 z-10 relative">
            <div className="flex flex-col">
                <h2 className="flex items-center gap-2 text-2xl font-black text-purple-600 drop-shadow-sm">
                    <Trophy className="text-yellow-400" fill="gold" size={32} />
                    Hasil Belajar
                </h2>
                <span className="text-gray-500 font-bold ml-1 text-sm">Hebat kamu, {userName}!</span>
            </div>
            
            <button 
                onClick={() => setStep('menu')}
                className="p-3 bg-white hover:bg-red-50 text-red-400 rounded-2xl shadow-md border-b-4 border-red-100 active:border-b-0 active:translate-y-1 transition-all"
            >
                <X size={24} strokeWidth={3} />
            </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 relative custom-scrollbar">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-3xl border-2 border-white shadow-lg flex flex-col items-center text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-2 opacity-20"><Gift size={48} /></div>
                    <div className="text-4xl mb-1 drop-shadow-sm">🎁</div>
                    <div className="text-3xl font-black text-purple-600 my-1">{game1Total}</div>
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-full">Skor Box</div>
                </motion.div>

                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-3xl border-2 border-white shadow-lg flex flex-col items-center text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-2 opacity-20"><BarChart3 size={48} /></div>
                    <div className="text-4xl mb-1 drop-shadow-sm">🧺</div>
                    <div className="text-3xl font-black text-emerald-600 my-1">{game2Count}</div>
                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-full">Kali Main</div>
                </motion.div>
            </div>

            {/* History List */}
            <div>
                <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-4 text-lg bg-white/50 w-fit px-4 py-1 rounded-full backdrop-blur-sm">
                    <span>📜</span> Riwayat Terbaru
                </h3>

                <div className="space-y-3 pb-4">
                    {history.length === 0 ? (
                        <div className="text-center text-gray-400 py-8 italic bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                             Belum ada permainan. <br/> <span className="text-2xl not-italic mt-2 block">🎮</span> Ayo main dulu!
                        </div>
                    ) : (
                        <AnimatePresence>
                        {[...history].reverse().slice(0, 10).map((game, index) => ( // Show last 10 reversed
                            <motion.div 
                                key={game.id} 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white border-2 border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gray-50 border border-gray-200 group-hover:scale-110 transition-transform">
                                        {game.gameType === 'game1' ? '🎁' : '🧺'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-lg leading-tight">
                                            {game.gameType === 'game1' ? 'Box Misteri' : 'Keranjang Angka'}
                                        </div>
                                        <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                            <Timer size={10} /> {formatTime(game.timeElapsed)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 font-black text-orange-500 text-xl">
                                        <Star size={16} fill="orange" stroke="none" className="animate-pulse" /> {game.score}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

        </div>

         {/* Footer Action */}
         <div className="p-4 pt-2 bg-gradient-to-t from-white/80 to-transparent z-20">
            <button 
                onClick={() => setStep('menu')}
                className="w-full py-4 rounded-3xl bg-orange-500 text-white font-black text-xl shadow-[0_6px_0_theme(colors.orange.700)] active:shadow-none active:translate-y-2 transition-all border-2 border-orange-400 hover:brightness-110"
            >
                Kembali ke Menu
            </button>
         </div>

      </motion.div>
    </div>
  );
}
