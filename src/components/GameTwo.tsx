"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, RotateCcw, Star, Timer, MousePointer2 } from "lucide-react";
import useGameAudio from "@/hooks/useGameAudio";
import confetti from "canvas-confetti";

// -- TYPES --
type TargetType = "Kandang" | "Taman" | "Rumah" | "Kolam";
type ItemType = "Panda" | "Kelinci" | "Kucing" | "Beruang";

interface Question {
  id: number;
  text: string;
  targetCount: number;
  itemType: ItemType;     
  targetZone: TargetType; 
}

// -- DATA (Matched to available assets) --
const QUESTIONS: Question[] = [
  { id: 1, text: "Masukkan 2 Panda ke dalam kandang 🎋", targetCount: 2, itemType: "Panda", targetZone: "Kandang" },
  { id: 2, text: "Kumpulkan 3 Kelinci di taman 🥕", targetCount: 3, itemType: "Kelinci", targetZone: "Taman" },
  { id: 3, text: "Pindahkan 2 Kucing ke rumah 🏠", targetCount: 2, itemType: "Kucing", targetZone: "Rumah" },
  { id: 4, text: "Ajak 4 Beruang bermain di kolam 🐻", targetCount: 4, itemType: "Beruang", targetZone: "Kolam" },
];

const ASSETS = {
  Panda: "/animals/panda.png",
  Kelinci: "/animals/rabbit.png",
  Kucing: "/animals/cat.png",
  Beruang: "/animals/bear.png",
  // Fallbacks/Extras
  Fox: "/animals/fox.png", 
};

interface DraggableItem {
  id: string;
  type: ItemType;
  image: string;
  currentZone?: TargetType;
}

// Helper to get question by ID
const generateQuestion = (id: number): Question => {
  const existing = QUESTIONS.find((q) => q.id === id);
  if (existing) return existing;

  // Fallback for ID > QUESTIONS.length (e.g. question 5)
  // Reuse a previous question template but keep the new ID
  const template = QUESTIONS[(id - 1) % QUESTIONS.length];
  return { ...template, id };
};

export default function GameTwo() {
  const { setStep } = useGameStore();
  const { playFlip, playMatch, playError, speak } = useGameAudio();
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  // Initialize with the first generated question
  const [currentQ, setCurrentQ] = useState<Question>(generateQuestion(1)); 
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [droppedItems, setDroppedItems] = useState<DraggableItem[]>([]); 
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState(0); 

  const MAX_QUESTIONS = 5; 
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const zonesRef = useRef<(HTMLDivElement | null)[]>([]);

  // Removed old currentQ
 // Will be replaced by state soon


  // -- INIT QUESTION --
  useEffect(() => {
    // Generate items: Target count + 2 distractors (same type for now to test counting, or mixed?)
    // User wants "funny" -> let's mix in a distractor? 
    // For simplicity of "Count logic", let's just use the requested type but more of them.
    const countToGenerate = currentQ.targetCount + 3; 
    const newItems: DraggableItem[] = Array.from({ length: countToGenerate }).map((_, i) => ({
      id: `item-${currentQ.id}-${i}`,
      type: currentQ.itemType,
      image: ASSETS[currentQ.itemType]
    }));

    setItems(newItems.sort(() => Math.random() - 0.5));
    setDroppedItems([]);
    setIsCorrect(null);
    speak(currentQ.text);

  }, [currentQ, speak]);

  // -- TIMER --
  useEffect(() => {
    timerRef.current = setInterval(() => setTimeElapsed(p => p + 1), 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  // -- DND HANDLERS --
  const checkDrop = (e: any, info: any, item: DraggableItem) => {
     const point = info.point;
     let landedZoneIndex = -1;

     zonesRef.current.forEach((zone, idx) => {
        if (!zone) return;
        const rect = zone.getBoundingClientRect();
        if (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) {
            landedZoneIndex = idx;
        }
     });

     const zones: TargetType[] = ["Kandang", "Taman", "Rumah", "Kolam"];
     const targetZoneName = zones[landedZoneIndex];

     if (landedZoneIndex !== -1) {
         if (targetZoneName === currentQ.targetZone) {
             playFlip(); // Success sound drop
             setItems(prev => prev.filter(i => i.id !== item.id));
             setDroppedItems(prev => [...prev, { ...item, currentZone: targetZoneName }]);
         } else {
             playError(); // Wrong zone
         }
     }
  };

  const handleCheck = () => {
      if (droppedItems.length === currentQ.targetCount) {
          playMatch();
          setIsCorrect(true);
          setScore(s => s + 20); // 20 pts per question * 5 questions = 100
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          speak("Luar biasa! Kamu benar!");
      } else {
          playError();
          setIsCorrect(false);
          const msg = droppedItems.length < currentQ.targetCount ? "Masih kurang nih!" : "Wah, kebanyakan!";
          speak(msg);
      }
  };

  const nextQuestion = () => {
      if (currentQIndex < MAX_QUESTIONS - 1) { // 0 to 4
          setCurrentQIndex(p => p + 1);
          setCurrentQ(generateQuestion(currentQIndex + 2)); // Generate Next
      } else {
          useGameStore.getState().addHistory({
            gameType: 'game2',
            score: score + 20, // Add final round score
            timeElapsed: timeElapsed
          });
          useGameStore.getState().setLastPlayedGame('game2');
          setStep("summary");
      }
  };

  const returnToPool = (item: DraggableItem) => {
      setDroppedItems(prev => prev.filter(i => i.id !== item.id));
      setItems(prev => [...prev, item]);
  };

  return (
    <div className="min-h-[100svh] bg-cloud-pattern flex flex-col items-center p-4 font-quicksand relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob" />
        <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000" />

       {/* Header */}
       <div className="w-full max-w-lg flex items-center justify-between mb-2 z-10">
            <button 
                onClick={() => setStep("menu")} 
                className="bg-orange-500 text-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all"
            >
                <ChevronLeft size={32} strokeWidth={3} />
            </button>
             <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-md text-purple-600 font-bold border-b-4 border-purple-100">
                    <Timer size={18} /> {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-md text-orange-500 font-bold border-b-4 border-orange-100">
                    <Star size={18} fill="orange" stroke="none" /> {currentQIndex + 1}/{MAX_QUESTIONS}
                </div>
            </div>
       </div>

       {/* Instruction Bar */}
       <motion.div 
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="w-full max-w-lg bg-green-500 text-white p-4 rounded-3xl shadow-xl mb-4 text-center z-10 relative overflow-hidden border-b-8 border-green-700"
       >
           <h2 className="text-xl md:text-2xl font-black drop-shadow-md flex items-center justify-center gap-3">
               {currentQ.text} 
               <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>👇</motion.span>
           </h2>
       </motion.div>

       {/* Main Area */}
       <div className="w-full max-w-lg flex-1 flex flex-col z-10">
          
          {/* ITEM POOL (Upper Area) */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-4 mb-4 min-h-[140px] flex items-center justify-center gap-2 flex-wrap shadow-lg border-2 border-white/50 relative">
             <div className="absolute top-2 left-4 text-xs font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                <MousePointer2 size={12} /> Ambil dari sini
             </div>
             
             <AnimatePresence>
             {items.map(item => (
                 <motion.div
                    key={item.id}
                    layoutId={item.id}
                    drag
                    dragSnapToOrigin
                    dragElastic={0.1}
                    dragMomentum={false}
                    whileDrag={{ scale: 1.2, zIndex: 100, rotate: [0, -10, 10, 0] }}
                    whileHover={{ scale: 1.1, cursor: 'grab', rotate: [0, -5, 5, 0] }}
                    onDragEnd={(e, info) => checkDrop(e, info, item)}
                    className="w-20 h-20 bg-white rounded-2xl shadow-[0_4px_0_theme(colors.gray.200)] border-2 border-gray-100 p-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                 >
                    <img src={item.image} alt={item.type} className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm" />
                 </motion.div>
             ))}
             </AnimatePresence>
             
             {items.length === 0 && droppedItems.length === 0 && <span className="text-gray-400">Loading...</span>}
             {items.length === 0 && droppedItems.length > 0 && <span className="text-gray-400 font-bold">Kosong! Pindahkan kembali jika salah.</span>}
          </div>

          {/* TARGET ZONES (Lower Area) */}
          <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
              {[
                { id: "Kandang", bg: "bg-orange-100", border: "border-orange-300", icon: "🎋" },
                { id: "Taman", bg: "bg-green-100", border: "border-green-300", icon: "🌳" },
                { id: "Rumah", bg: "bg-blue-100", border: "border-blue-300", icon: "🏠" },
                { id: "Kolam", bg: "bg-cyan-100", border: "border-cyan-300", icon: "💧" },
              ].map((zone, idx) => (
                  <div 
                    key={zone.id}
                    ref={el => { zonesRef.current[idx] = el }}
                    className={`rounded-3xl ${zone.bg} border-4 ${zone.border} ${currentQ.targetZone === zone.id ? "ring-4 ring-yellow-400 scale-[1.02] shadow-xl bg-opacity-100 border-solid" : "opacity-70 grayscale-[0.3] border-dashed border-2"} flex flex-col items-center p-2 relative transition-all duration-300`}
                  >
                      <div className="text-sm font-bold opacity-50 mb-1 uppercase tracking-widest">{zone.id}</div>
                      <div className="text-4xl mb-2 opacity-50">{zone.icon}</div>

                      {/* Stacked Items Container */}
                      <div className="flex flex-wrap justify-center items-center content-center gap-1 w-full h-full p-1 overflow-hidden">
                          <AnimatePresence>
                          {droppedItems.filter(i => i.currentZone === zone.id).map((item) => (
                              <motion.div
                                key={item.id}
                                layoutId={item.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                onClick={() => returnToPool(item)}
                                className="w-[30%] max-w-[40px] aspect-square bg-white rounded-lg shadow-sm p-1 cursor-pointer hover:scale-110 transition-transform relative"
                              >
                                  <img src={item.image} className="w-full h-full object-contain pointer-events-none" />
                              </motion.div>
                          ))}
                          </AnimatePresence>
                      </div>
                  </div>
              ))}
          </div>

          {/* Footer Controls */}
          {isCorrect === true ? (
             <motion.button
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                onClick={nextQuestion}
                className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl shadow-[0_6px_0_theme(colors.yellow.600)] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center gap-2"
             >
                 Lanjut <ChevronLeft className="rotate-180" strokeWidth={3} />
             </motion.button>
          ) : (
            <button
                onClick={handleCheck}
                disabled={droppedItems.length === 0}
                className={`w-full py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center gap-2 ${
                    droppedItems.length > 0 
                    ? "bg-green-500 text-white shadow-[0_6px_0_theme(colors.green.700)]" 
                    : "bg-gray-200 text-gray-400"
                }`}
            >
                <CheckCircle2 size={24} strokeWidth={3} /> Periksa Jawaban
            </button>
          )}
          
          {/* Feedback Toast */}
          <AnimatePresence>
            {isCorrect === false && (
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="absolute bottom-24 left-0 right-0 mx-auto w-max bg-red-500 text-white font-bold px-6 py-2 rounded-full shadow-lg z-50 flex items-center gap-2"
                >
                    <span>🚫 Coba hitung lagi ya!</span>
                </motion.div>
            )}
            {isCorrect === true && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                    exit={{ scale: 0 }}
                    className="absolute inset-0 m-auto w-max h-max pointer-events-none z-50 text-8xl drop-shadow-2xl"
                >
                    🎉
                </motion.div>
            )}
          </AnimatePresence>

       </div>
    </div>
  );
}
