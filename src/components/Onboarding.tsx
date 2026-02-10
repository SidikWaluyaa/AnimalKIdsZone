"use client";

import { useState, useEffect } from "react";
import { useGameStore, AvatarType } from "@/store/useGameStore";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { Play, Volume2, CheckCircle2 } from "lucide-react";

// Placeholder Lottie JSON (You would replace this with actual file)
// For now, we'll try to load from a public URL or use a simple object in a real app
// Here we will expect a file at /animations/welcome.json
import welcomeAnimation from "../../public/welcome-lottie.json"; 

const avatars: { type: AvatarType; emoji: string; color: string }[] = [
  { type: "Lion", emoji: "🦁", color: "bg-orange-200" },
  { type: "Rabbit", emoji: "🐰", color: "bg-pink-200" },
  { type: "Cat", emoji: "🐱", color: "bg-yellow-200" },
];

export default function Onboarding() {
  const { setUserName, setAvatar, setStep, setLevel } = useGameStore();
  const [inputName, setInputName] = useState("");
  const [selectedAvatar, setSelected] = useState<AvatarType | null>(null);
  const [wobble, setWobble] = useState(false);

  // Load Lottie animation if available, otherwise explicit null handle
  // We will assume the user puts a file there or we use a fallback
  
  const handleStart = () => {
    if (!inputName.trim() || !selectedAvatar) {
      setWobble(true);
      setTimeout(() => setWobble(false), 500);
      return;
    }

    setUserName(inputName);
    setAvatar(selectedAvatar);

    // Speech Synthesis
    const speech = new SpeechSynthesisUtterance();
    speech.text = `Halo ${inputName}, ayo kita bermain bersama ${translateAvatar(selectedAvatar)}!`;
    speech.lang = "id-ID";
    speech.pitch = 1.3;
    speech.rate = 1.0;
    
    // Choose a voice if available (optional optimization)
    // const voices = window.speechSynthesis.getVoices();
    // speech.voice = voices.find(v => v.lang.includes('id')) || null;

    window.speechSynthesis.speak(speech);

    // Delay slighty to let speech start
    setTimeout(() => {
      setStep("menu"); 
    }, 2000);
  };

  const translateAvatar = (type: AvatarType) => {
    switch (type) {
      case "Lion": return "Singa";
      case "Rabbit": return "Kelinci";
      case "Cat": return "Kucing";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 py-10 relative overflow-hidden font-quicksand">
        {/* Decorative Circles removed for simplification */}

        {/* Header Animation */}
        <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-40 h-40 mb-2 relative z-10"
        >
            <div className="absolute inset-0 flex items-center justify-center text-8xl drop-shadow-2xl animate-bounce">
                🎪
            </div>
        </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 text-center z-10"
      >
        <h1 className="text-4xl font-black text-purple-600 mb-2 drop-shadow-sm tracking-tight">
          Dunia Hewan Ceria!
        </h1>

        <div className="space-y-6">
          <div className="text-left group">
            <label className="block text-purple-700 font-bold mb-2 ml-4 text-lg">Siapa namamu?</label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Tulis nama disini..."
              className="w-full h-16 rounded-full border-4 border-purple-200 px-8 text-2xl text-purple-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all font-bold placeholder:text-purple-300 bg-white shadow-lg"
            />
          </div>

          <div className="text-left">
            <label className="block text-purple-700 font-bold mb-2 ml-4 text-lg">Pilih teman main:</label>
            <div className="grid grid-cols-3 gap-4">
              {avatars.map((ava, i) => (
                <motion.button
                  key={ava.type}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  onClick={() => setSelected(ava.type)}
                  className={`aspect-square rounded-3xl flex items-center justify-center text-5xl border-b-8 transition-all relative overflow-hidden ${
                    selectedAvatar === ava.type
                      ? "border-purple-500 bg-white shadow-xl scale-110 ring-4 ring-purple-300 z-10"
                      : "border-transparent " + ava.color + " opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className="drop-shadow-md filter">{ava.emoji}</span>
                  {selectedAvatar === ava.type && (
                      <motion.div layoutId="check" className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-0.5 shadow-sm">
                          <CheckCircle2 size={16} strokeWidth={4} />
                      </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <motion.button
            animate={wobble ? { x: [-10, 10, -10, 10, 0] } : {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className={`w-full py-5 rounded-full text-2xl font-bold shadow-xl flex items-center justify-center gap-3 transition-all ${
                inputName && selectedAvatar 
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-purple-300 hover:shadow-purple-400"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
            <Play fill="currentColor" size={28} /> Mulai Main
        </motion.button>
      </motion.div>
    </div>
  );
}
