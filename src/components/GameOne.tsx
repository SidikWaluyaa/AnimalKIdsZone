"use client";

import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import AnimatedCard from "./AnimatedCard";
import { motion } from "framer-motion";
import { ChevronLeft, Timer, Hand, RefreshCw, Home, Star, Trophy } from "lucide-react";
import Lottie from "lottie-react";
import useGameAudio from "@/hooks/useGameAudio";

// Placeholder Confetti for new modal
import confettiAnimation from "../../public/confetti-lottie.json"; 

const ANIMALS = [
    { name: "Beruang", image: "/animals/bear.png" },
    { name: "Kucing", image: "/animals/cat.png" },
    { name: "Anjing", image: "/animals/dog.png" },
    { name: "Tikus", image: "/animals/mouse.png" },
    { name: "Hamster", image: "/animals/hamster.png" },
    { name: "Kelinci", image: "/animals/rabbit.png" },
    { name: "Rubah", image: "/animals/fox.png" },
    { name: "Panda", image: "/animals/panda.png" }
];

interface Card {
  id: number;
  content: string; // Used for name now
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type GameState = "selecting" | "playing" | "finished";

export default function GameOne() {
  const { setStep, updateAnalytics } = useGameStore();
  const { playFlip, playMatch, playError, speak } = useGameAudio();
  const [gameState, setGameState] = useState<GameState>("selecting");
  const [level, setInternalLevel] = useState<1 | 2 | 3>(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Stats
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [repeatedClicks, setRepeatedClicks] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Game Setup ---
  const startGame = (selectedLevel: 1 | 2 | 3) => {
    setInternalLevel(selectedLevel);
    setGameState("playing");
    setTimeElapsed(0);
    setAttempts(0);
    setWrongClicks(0);
    setRepeatedClicks(0);
    setFlippedIds([]);
    setIsProcessing(false);

    // Deck Logic
    let pairCount = 1;
    if (selectedLevel === 1) pairCount = 1; // 2 cards
    else if (selectedLevel === 2) pairCount = 3; // 6 cards
    else if (selectedLevel === 3) pairCount = 4; // 8 cards

    const selectedAnimals = ANIMALS.slice(0, pairCount);
    // Shuffle
    const deck = [...selectedAnimals, ...selectedAnimals]
      .sort(() => Math.random() - 0.5)
      .map((animal, index) => ({
        id: index,
        content: animal.name,
        image: animal.image,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(deck);

    // Start Timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- Interactions ---
  const handleCardClick = (id: number) => {
    if (gameState !== "playing" || isProcessing) return;
    
    // Check if clicking already flipped/matched
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) {
        setRepeatedClicks(prev => prev + 1);
        return;
    }

    // Flip logic
    playFlip(); // SFX
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    setFlippedIds(prev => [...prev, id]);

    if (flippedIds.length === 0) {
        // First card of pair
    } else {
        // Second card
        setAttempts(prev => prev + 1);
        setIsProcessing(true);
        const firstId = flippedIds[0];
        const content1 = cards.find(c => c.id === firstId)?.content;
        const content2 = clickedCard.content;

        if (content1 === content2) {
            // Match
            playMatch(); // SFX
            speak(`Hebat! Ini ${content1}!`); // TTS
            
            setTimeout(() => {
                setCards(prev => prev.map(c => 
                    (c.id === firstId || c.id === id) ? { ...c, isMatched: true } : c
                ));
                setFlippedIds([]);
                setIsProcessing(false);
                checkWin();
            }, 500);
        } else {
            // No Match
            setTimeout(() => playError(), 200); // Slight delay for SFX
            
            setWrongClicks(prev => prev + 1);
            setTimeout(() => {
                setCards(prev => prev.map(c => 
                    (c.id === firstId || c.id === id) ? { ...c, isFlipped: false } : c
                ));
                setFlippedIds([]);
                setIsProcessing(false);
            }, 1000);
        }
    }
  };

  const checkWin = () => {
     // Check if all matched (state update is pending, so check valid cards count - 2)
     // Alternatively, wait specifically or use Effect. 
     // Simplest: check if matched count + 2 == total
  };

  useEffect(() => {
      if (gameState === "playing" && cards.length > 0 && cards.every(c => c.isMatched)) {
          clearInterval(timerRef.current!);
          setGameState("finished");
          // Update Global Analytics just in case, though this modal is specific
          updateAnalytics({ 
              wrongClicks: (useGameStore.getState().analytics.wrongClicks || 0) + wrongClicks,
              repeatedClicks: (useGameStore.getState().analytics.repeatedClicks || 0) + repeatedClicks,
          });
      }
  }, [cards, gameState, wrongClicks, repeatedClicks, updateAnalytics]);

  // --- Render Helpers ---
  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Views ---

  if (gameState === "selecting") {
      return (
          <div className="min-h-[100svh] bg-yellow-50 flex flex-col items-center p-6 font-quicksand">
              <div className="w-full max-w-md flex items-center mb-10">
                  <button onClick={() => setStep("menu")} className="bg-white p-2 rounded-full shadow-md">
                      <ChevronLeft className="text-gray-600" />
                  </button>
                  <h1 className="flex-1 text-center text-xl font-bold text-purple-600 ml-[-40px]">Box Misteri - Pilih Level</h1>
              </div>

              <div className="space-y-4 w-full max-w-xs">
                  {[1, 2, 3].map((lvl) => (
                      <motion.button
                        key={lvl}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startGame(lvl as 1|2|3)}
                        className="w-full bg-purple-400 rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-lg relative overflow-hidden"
                      >
                          <div className="flex gap-1 mb-2">
                              {Array.from({ length: lvl }).map((_, i) => (
                                  <Star key={i} fill="yellow" stroke="none" className="drop-shadow-sm" />
                              ))}
                          </div>
                          <div className="text-2xl font-bold mb-1">Level {lvl}</div>
                          <div className="text-purple-100 text-sm">
                              {lvl === 1 ? "2 kartu, 1 pasangan" : lvl === 2 ? "6 kartu, 3 pasangan" : "8 kartu, 4 pasangan"}
                          </div>
                      </motion.button>
                  ))}
              </div>
          </div>
      );
  }

  // Playing & Finished share the background
  return (
    <div className="min-h-[100svh] bg-cloud-pattern flex flex-col items-center p-4 font-quicksand">
        {/* Header */}
        <div className="w-full max-w-md flex justify-between items-center mb-6 mt-2">
            <button onClick={() => setGameState("selecting")} className="bg-white p-3 rounded-2xl shadow-lg border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 transition-all">
                <ChevronLeft size={24} className="text-purple-600" />
            </button>

            <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-lg border-b-4 border-purple-200 text-purple-600 font-bold">
                    <Timer size={20} /> {formatTime(timeElapsed)}
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-lg border-b-4 border-orange-200 text-orange-500 font-bold">
                    <Hand size={20} /> {attempts}
                </div>
            </div>
        </div>

        {/* Grid Container - Fully Responsive */}
        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
            <div className={`grid gap-3 w-full ${
                level === 1 ? 'grid-cols-2 max-w-xs mx-auto' : 
                level === 2 ? 'grid-cols-3' : 
                'grid-cols-4'
            } place-content-center`}>
                {cards.map(card => (
                    <AnimatedCard
                        key={card.id}
                        content={card.content}
                        image={card.image}
                        isFlipped={card.isFlipped}
                        isMatched={card.isMatched}
                        onClick={() => handleCardClick(card.id)}
                    />
                ))}
            </div>
        </div>

        {/* Result Modal Overlay */}
        {gameState === "finished" && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center shadow-2xl relative"
                >   
                    {/* Confetti absolute at top or simply an emoji/icon */}
                    <div className="mb-2">
                        <Trophy size={64} className="text-yellow-400 drop-shadow-md" fill="#FACC15" />
                    </div>

                    <h2 className="text-2xl font-bold text-orange-500 mb-6 flex items-center gap-2">
                        Luar Biasa! 🎉
                    </h2>

                    <div className="w-full space-y-3 mb-6">
                        <div className="flex justify-between items-center bg-orange-50 p-3 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-600 font-bold"><Timer size={16} /> Waktu</div>
                            <div className="text-orange-600 font-bold">{formatTime(timeElapsed)}</div>
                        </div>
                        <div className="flex justify-between items-center bg-orange-50 p-3 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-600 font-bold"><Hand size={16} /> Percobaan</div>
                            <div className="text-orange-600 font-bold">{attempts} kali</div>
                        </div>
                        <div className="flex justify-between items-center bg-orange-50 p-3 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-600 font-bold"><Star size={16} fill="orange" stroke="none" /> Skor</div>
                            <div className="text-orange-600 font-bold">100</div>
                        </div>
                        <div className="flex justify-between items-center bg-orange-50 p-3 rounded-xl">
                           <div className="text-gray-600 font-bold ml-1">♦♦ Daya Ingat</div>
                           <div className="text-orange-600 font-bold">Sangat Baik!</div>
                        </div>
                         <div className="flex justify-between items-center bg-orange-50 p-3 rounded-xl">
                           <div className="text-gray-600 font-bold ml-1">🎯 Fokus</div>
                           <div className="text-orange-600 font-bold">Sangat Fokus!</div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={() => startGame(level)}
                            className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                        >
                            <RefreshCw size={18} /> Main Lagi
                        </button>
                         <button 
                            onClick={() => setStep("menu")}
                            className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
                        >
                            <Home size={18} /> Menu Utama
                        </button>
                    </div>

                </motion.div>
            </div>
        )}
    </div>
  );
}
