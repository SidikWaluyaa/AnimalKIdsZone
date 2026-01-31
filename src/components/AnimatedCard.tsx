"use client";

import { motion } from "framer-motion";

interface AnimatedCardProps {
  content?: string;
  image?: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export default function AnimatedCard({ content, image, isFlipped, isMatched, onClick }: AnimatedCardProps) {
  return (
    <div className="relative w-full aspect-square perspective-1000 cursor-pointer" onClick={onClick}>
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front (Cover) */}
        <div
            className="absolute inset-0 w-full h-full rounded-xl bg-purple-500 shadow-md border-b-4 border-purple-700 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
            <div className="flex gap-1 transform rotate-45">
                <div className="w-6 h-6 bg-black flex items-center justify-center text-white font-bold text-xs transform -rotate-45">?</div>
                <div className="w-6 h-6 bg-black flex items-center justify-center text-white font-bold text-xs transform -rotate-45">?</div>
            </div>
        </div>

        {/* Back (Content) */}
        <div
            className={`absolute inset-0 w-full h-full rounded-xl bg-white shadow-md border-b-4 border-gray-200 flex items-center justify-center p-2 ${
                isMatched ? "ring-4 ring-orange-300 bg-orange-50" : ""
            }`}
             style={{ 
                 backfaceVisibility: "hidden", 
                 WebkitBackfaceVisibility: "hidden", 
                 transform: "rotateY(180deg)" 
             }}
        >
            {image ? (
                <div className="relative w-full h-full p-2">
                    <img 
                        src={image} 
                        alt={content || "animal"} 
                        className="w-full h-full object-contain drop-shadow-sm" 
                    />
                </div>
            ) : (
                <span className="text-5xl">{content}</span>
            )}
        </div>
      </motion.div>
    </div>
  );
}
