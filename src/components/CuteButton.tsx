"use client";

import { motion } from "framer-motion";
import useGameAudio from "@/hooks/useGameAudio";

interface CuteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "info";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function CuteButton({
  variant = "primary",
  size = "md",
  icon,
  children,
  onClick,
  className = "",
  disabled,
  ...props
}: CuteButtonProps) {
  const { playFlip } = useGameAudio(); // Reuse flip sound as a generic click sound for now

  // Color mappings
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-400 border-orange-700 text-white shadow-orange-200",
    secondary: "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-gray-200",
    danger: "bg-red-500 hover:bg-red-400 border-red-700 text-white shadow-red-200",
    success: "bg-green-500 hover:bg-green-400 border-green-700 text-white shadow-green-200",
    info: "bg-blue-400 hover:bg-blue-300 border-blue-600 text-white shadow-blue-200",
  };

  const sizes = {
    sm: "py-2 px-4 text-sm rounded-xl border-b-[3px]",
    md: "py-3 px-6 text-base rounded-2xl border-b-[5px]",
    lg: "py-4 px-8 text-xl rounded-3xl border-b-[6px]",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      playFlip();
      onClick?.(e);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, y: 3 }}
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        font-black flex items-center justify-center gap-2 
        shadow-lg transition-all active:border-b-0 active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {icon && <span className="drop-shadow-sm">{icon}</span>}
      <span className="drop-shadow-sm">{children}</span>
    </motion.button>
  );
}
