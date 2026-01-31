"use client";

import { motion } from "framer-motion";

interface DragAnimalProps {
  id: string;
  type: string; // Emoji
  onDropResult: (id: string, success: boolean) => void;
}

export default function DragAnimal({ id, type, onDropResult }: DragAnimalProps) {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      whileDrag={{ scale: 1.2, zIndex: 50, cursor: "grabbing" }}
      onDragEnd={(event, info) => {
        // Simple logic: If dragged far enough (simulating drop), we trigger interaction.
        // In a real implementation, we need to check collision with drop zones.
        // For this demo, we'll assume the parent handles the logic via checking cursor position 
        // or we use a library. However, to keep it simple with pure Framer Motion:
        // We can check info.point relative to window.
        
        // Placeholder logic: fail always unless implemented with positions
        onDropResult(id, false); 
      }}
      className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center text-5xl cursor-grab active:cursor-grabbing select-none"
    >
      {type}
    </motion.div>
  );
}
