"use client";

import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import AnimatedCard from "./AnimatedCard";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // -- OPTIMIZATION STATE --
  const [combo, setCombo] = useState(0);
  const [lastMatchTime, setLastMatchTime] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [hintId, setHintId] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // -- Game Setup --
  const startGame = (selectedLevel: 1 | 2 | 3) => {
    setInternalLevel(selectedLevel);
    setGameState("playing");
    setTimeElapsed(0);
    setAttempts(0);
    setWrongClicks(0);
    setRepeatedClicks(0);
    setFlippedIds([]);
    setIsProcessing(false);
    
    // Reset Optimization State
    setCombo(0);
    setLastMatchTime(0);
    setHintId(null);

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
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // -- IDLE HINT SYSTEM --
  const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      setHintId(null);
      
      if (gameState === "playing") {
          idleTimerRef.current = setTimeout(() => {
              // Find a non-matched, non-flipped card to hint
              const available = cards.filter(c => !c.isMatched && !c.isFlipped);
              if (available.length > 0) {
                  const randomCard = available[Math.floor(Math.random() * available.length)];
                  setHintId(randomCard.id);
                  // Optional: SFX for hint?
              }
          }, 8000); // 8 seconds idle
      }
  };

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [gameState, cards, flippedIds]); // Reset on interaction

  // --- Interactions ---
  const handleCardClick = (id: number) => {
    if (gameState !== "playing" || isProcessing) return;
    
    resetIdleTimer(); // User interacted

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
            
            // COMBO LOGIC
            const now = Date.now();
            if (now - lastMatchTime < 5000 && lastMatchTime !== 0) { // 5 seconds window
                setCombo(c => c + 1);
                setShowCombo(true);
                setTimeout(() => setShowCombo(false), 2000);
            } else {
                setCombo(1); // Start Combo
            }
            setLastMatchTime(now);

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
            setCombo(0); // Reset combo
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
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState("finished");
          
          const finalScore = 100;
          useGameStore.getState().addHistory({
              gameType: 'game1',
              score: finalScore,
              timeElapsed: timeElapsed
          });
          
          useGameStore.getState().setLastPlayedGame('game1');
          updateAnalytics({ 
              wrongClicks: (useGameStore.getState().analytics.wrongClicks || 0) + wrongClicks,
              repeatedClicks: (useGameStore.getState().analytics.repeatedClicks || 0) + repeatedClicks,
              attempts: attempts
          });
          setStep("summary");
      }
  }, [cards, gameState, timeElapsed, wrongClicks, repeatedClicks, updateAnalytics, attempts, setStep]);

  // --- Render Helpers ---
  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Views ---

  if (gameState === "selecting") {
      return (
          <div className="min-h-[100svh] bg-cloud-pattern flex flex-col items-center p-6 font-quicksand relative overflow-hidden">
             {/* Decorative Blobs removed */}

              <div className="w-full max-w-md flex items-center justify-between mb-8 mt-4 relative z-10 px-2">
                  <button 
                    onClick={() => setStep("menu")} 
                    className="bg-orange-500 text-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all"
                  >
                      <ChevronLeft size={32} strokeWidth={3} />
                  </button>
                  <h1 className="absolute left-0 right-0 text-center text-3xl font-black text-purple-600 drop-shadow-sm pointer-events-none">Pilih Level</h1>
                  <div className="w-12" /> {/* Spacer for centering */}
              </div>

              <div className="space-y-4 w-full max-w-xs z-10">
                  {[
                      { lvl: 1, color: "from-blue-400 to-cyan-400", border: "border-blue-600", shadow: "shadow-blue-200", icon: "👶", label: "Mudah" },
                      { lvl: 2, color: "from-purple-400 to-fuchsia-400", border: "border-purple-600", shadow: "shadow-purple-200", icon: "👦", label: "Sedang" },
                      { lvl: 3, color: "from-orange-400 to-red-400", border: "border-orange-600", shadow: "shadow-orange-200", icon: "🧠", label: "Sulit" }
                  ].map((item) => (
                      <motion.button
                        key={item.lvl}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startGame(item.lvl as 1|2|3)}
                        className={`w-full bg-gradient-to-r ${item.color} rounded-3xl p-4 flex items-center justify-between text-white shadow-xl ${item.shadow} border-b-4 ${item.border} active:border-b-0 active:translate-y-1 transition-all relative overflow-hidden group`}
                      >
                           {/* Shine Effect */}
                           <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

                          <div className="flex flex-col items-start">
                              <div className="flex gap-1 mb-1">
                                  {Array.from({ length: item.lvl }).map((_, i) => (
                                      <Star key={i} fill="yellow" stroke="none" className="drop-shadow-sm w-5 h-5 animate-pulse" />
                                  ))}
                              </div>
                              <div className="text-2xl font-black">{item.label}</div>
                              <div className="text-white/90 text-xs font-bold">
                                  {item.lvl === 1 ? "2 Kartu" : item.lvl === 2 ? "6 Kartu" : "8 Kartu"}
                              </div>
                          </div>
                          <div className="text-5xl drop-shadow-md">{item.icon}</div>
                      </motion.button>
                  ))}
              </div>
          </div>
      );
  }

  // Playing view
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
        <div className="w-full max-w-md flex-1 flex flex-col justify-center relative">
            
            {/* Combo Popups */}
            <AnimatePresence>
                {showCombo && combo > 1 && (
                    <motion.div 
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1.5, rotate: 0 }}
                        exit={{ scale: 0 }}
                        className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-yellow-400 border-4 border-yellow-600 text-yellow-900 font-black px-6 py-2 rounded-full shadow-xl text-2xl rotate-[-5deg]">
                            COMBO x{combo}!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`grid gap-3 w-full ${
                level === 1 ? 'grid-cols-2 max-w-[200px] mx-auto' : 
                level === 2 ? 'grid-cols-3 max-w-[300px] mx-auto' : 
                'grid-cols-4 max-w-[340px] mx-auto'
            } place-content-center`}>
                {cards.map(card => (
                    <AnimatedCard
                        key={card.id}
                        content={card.content}
                        image={card.image}
                        isFlipped={card.isFlipped}
                        isMatched={card.isMatched}
                        isHint={card.id === hintId}
                        onClick={() => handleCardClick(card.id)}
                    />
                ))}
            </div>
        </div>
    </div>
  );
}
