"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, RotateCcw, Star, Timer } from "lucide-react";
import useGameAudio from "@/hooks/useGameAudio";
import confetti from "canvas-confetti";

// -- TYPES --
type TargetType = "Kandang" | "Taman" | "Ember" | "Kelinci";
type ItemType = "Singa" | "Wortel" | "Kucing" | "Katak";

interface Question {
  id: number;
  text: string;
  targetCount: number;
  itemType: ItemType;     // What to drag
  targetZone: TargetType; // Where to drag
  distractors: ItemType[]; // Other items to confuse? (Optional, kept simple for now)
}

// -- DATA --
const QUESTIONS: Question[] = [
  { id: 1, text: "Masukkan 2 singa ke dalam kandang 🦁", targetCount: 2, itemType: "Singa", targetZone: "Kandang", distractors: ["Singa", "Singa", "Singa"] },
  { id: 2, text: "Berikan 3 wortel kepada kelinci 🐰", targetCount: 3, itemType: "Wortel", targetZone: "Kelinci", distractors: [] },
  { id: 3, text: "Pindahkan 2 kucing ke taman 🌳", targetCount: 2, itemType: "Kucing", targetZone: "Taman", distractors: [] },
  { id: 4, text: "Masukan 5 katak kedalam ember 🪣", targetCount: 5, itemType: "Katak", targetZone: "Ember", distractors: [] },
];

const ASSETS = {
  Singa: "/basket/basket_lion.png",
  Wortel: "/basket/basket_carrot.png",
  KelinciItem: "/basket/basket_rabbit.png", // Just in case needed as item
  Kucing: "/basket/basket_cat.png",
  Katak: "/basket/basket_frog.png",
  // Targets
  Tree: "/basket/basket_tree.png",
  RabbitTarget: "/basket/basket_rabbit.png",
};

interface DraggableItem {
  id: string;
  type: ItemType;
  image: string;
}

export default function GameTwo() {
  const { setStep, updateAnalytics } = useGameStore();
  const { playFlip, playMatch, playError, speak } = useGameAudio();
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [droppedItems, setDroppedItems] = useState<DraggableItem[]>([]); // Items in the correct zone
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Stats
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = QUESTIONS[currentQIndex];

  // -- INIT QUESTION --
  useEffect(() => {
    // Generate items: Target count + some extras? 
    // For simplicity based on screenshot: Just provide exactly 4 items for Q1 if screenshot shows 4 lions?
    // User req: "Masukan 2 singa" -> but screenshot shows 4 lions available. So user must pick 2.
    // Let's generate (Target + 2) items to make it a challenge.
    
    const countToGenerate = currentQ.targetCount + 2; 
    const newItems: DraggableItem[] = Array.from({ length: countToGenerate }).map((_, i) => ({
      id: `item-${currentQ.id}-${i}`,
      type: currentQ.itemType,
      image: ASSETS[currentQ.itemType] || ASSETS.Singa // fallback
    }));

    setItems(newItems);
    setDroppedItems([]);
    setIsCorrect(null);
    speak(currentQ.text);

  }, [currentQ, speak]);

  // -- TIMER --
  useEffect(() => {
    timerRef.current = setInterval(() => setTimeElapsed(p => p + 1), 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  // -- HANDLERS --
  const handleDragEnd = (event: any, info: any, item: DraggableItem) => {
    // Simple logic: if dropped in the MAIN target zone (we highlight strictly).
    // In this simplified version, we'll assume any drop in the general "Lower Area" or specific zone is what we check.
    // To make it precise, we'd need exact refs. 
    // Let's use a simpler approach: Validate "Check Answer" button rather than immediate drop success?
    // Screenshot shows "Periksa Jawaban" -> So we allow moving items to zones.
    // But Framer Motion drag needs visual "drop".
    
    // For this prototype: Assume there are 4 distinct zones. 
    // We need to know WHERE it was dropped.
    // Let's simplfy: The user drags from Top Container -> Bottom Container.
    
    // Actually, looking at screenshot: "Drag hewan ke zona yang benar".
    // There are 4 zone boxes.
    // If I drop "Lion" on "Kandang", it stays.
    // If I drop "Lion" on "Ember", maybe it stays too but is wrong?
    // OR we only allow dropping on the CORRECT zone to keep it simple for kids?
    // Let's try: Drop anywhere in bottom area = "placed". 
    // Then "Periksa" counts how many are in the CORRECT target box.
    
    // We'll implementation "Snap to Zone" logic would be complex without multiple refs.
    // Short cut: Simply checking if dropped roughly over the correct target index.
    // We visualize this by removing from "Pool" and adding to "Zone State".
  };

  // Improved Drop Logic:
  // Since we can't easily detect generic elements without extensive refs, 
  // we will make the target zones "Droppable" via state logic if we had DnD library.
  // With Framer Motion, we check coordinates.
  
  const zonesRef = useRef<(HTMLDivElement | null)[]>([]);
  
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

     // Map index to Zone Type
     const zones: TargetType[] = ["Kandang", "Taman", "Ember", "Kelinci"];
     const targetZoneName = zones[landedZoneIndex];

     if (landedZoneIndex !== -1) {
         // Check if this is the RIGHT zone for the current question?
         // User might put Lion in Bucket. allowed? yes, but "Periksa" will fail.
         // OR strict mode: specific zone only accepts specific item?
         // Let's do Strict for "Safety" -> If dropped on Wrong Zone, bounce back.
         
         if (targetZoneName === currentQ.targetZone) {
             playFlip();
             setItems(prev => prev.filter(i => i.id !== item.id));
             setDroppedItems(prev => [...prev, item]);
         } else {
             playError();
         }
     }
  };

  const handleCheck = () => {
      // Validate Count
      if (droppedItems.length === currentQ.targetCount) {
          playMatch();
          setIsCorrect(true);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          speak("Hebat! Jawabanmu benar!");
      } else {
          playError();
          setIsCorrect(false);
          speak(droppedItems.length < currentQ.targetCount ? "Masih kurang, ayo tambah lagi!" : "Kebanyakan! Coba kurangi.");
      }
  };

  const nextQuestion = () => {
      if (currentQIndex < QUESTIONS.length - 1) {
          setCurrentQIndex(p => p + 1);
      } else {
          setStep("summary");
      }
  };
  
  // Reset for current level if wrong too many times? Or just let them fix it.
  // We allow dragging BACK from zone to pool?
  const returnToPool = (item: DraggableItem) => {
      setDroppedItems(prev => prev.filter(i => i.id !== item.id));
      setItems(prev => [...prev, item]);
  };

  return (
    <div className="min-h-[100svh] bg-yellow-50 flex flex-col items-center p-4 font-quicksand relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-cloud-pattern" />

       {/* Header */}
       <div className="w-full max-w-md flex justify-between items-center mb-6 z-10">
            <button onClick={() => setStep("menu")} className="bg-white p-2 rounded-full shadow-md">
                <ChevronLeft className="text-gray-600" />
            </button>
             <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm text-purple-600 font-bold">
                    <Timer size={18} /> {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm text-yellow-500 font-bold">
                    <Star size={18} fill="gold" stroke="none" /> {currentQIndex * 10}
                </div>
            </div>
       </div>

       {/* Instruction Bar (Green) */}
       <motion.div 
         key={currentQ.text}
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="w-full max-w-md bg-green-500 text-white p-4 rounded-2xl shadow-lg mb-6 text-center z-10 relative overflow-hidden"
       >
           <h2 className="text-lg md:text-xl font-bold">{currentQ.text}</h2>
           {/* Progress Indicator */}
           <div className="absolute bottom-0 left-0 h-1 bg-green-700 transition-all duration-500" style={{ width: `${((currentQIndex + 1) / QUESTIONS.length) * 100}%` }} />
       </motion.div>

       {/* Game Container */}
       <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-xl border-4 border-white z-10 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4 text-gray-500 font-bold text-sm">
              <span>Tugas {currentQIndex + 1} dari {QUESTIONS.length}</span>
              <button 
                onClick={() => { setItems([...items, ...droppedItems]); setDroppedItems([]); }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                  <RotateCcw size={16} />
              </button>
          </div>

          {/* ITEM POOL */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-6 min-h-[120px] flex items-center justify-center gap-4 flex-wrap shadow-inner">
             {items.length === 0 && droppedItems.length === 0 ? (
                 <span className="text-gray-400 italic">Memuat...</span>
             ) : items.length === 0 ? (
                 <span className="text-gray-400 italic font-bold">Kosong!</span>
             ) : (
                 items.map(item => (
                     <motion.div
                        key={item.id}
                        drag
                        dragSnapToOrigin
                        dragElastic={0.1}
                        dragMomentum={false}
                        whileDrag={{ scale: 1.2, zIndex: 50, cursor: 'grabbing' }}
                        whileHover={{ scale: 1.1, cursor: 'grab' }}
                        onDragEnd={(e, info) => checkDrop(e, info, item)}
                        className="w-16 h-16 bg-white rounded-xl shadow-md border-2 border-gray-100 p-1"
                     >
                        <img src={item.image} alt={item.type} className="w-full h-full object-contain pointer-events-none" />
                     </motion.div>
                 ))
             )}
          </div>

          {/* TARGET ZONES */}
          <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { id: "Kandang", label: "Kandang", bg: "bg-orange-100", border: "border-orange-300", icon: "🏠" }, // Placeholder icon if House image fails
                { id: "Taman", label: "Taman", bg: "bg-green-100", border: "border-green-300", img: ASSETS.Tree },
                { id: "Ember", label: "Ember", bg: "bg-blue-100", border: "border-blue-300", icon: "🪣" },
                { id: "Kelinci", label: "Kelinci", bg: "bg-pink-100", border: "border-pink-300", img: ASSETS.RabbitTarget },
              ].map((zone, idx) => (
                  <div 
                    key={zone.id}
                    ref={el => { zonesRef.current[idx] = el }}
                    className={`aspect-square rounded-xl ${zone.bg} border-2 ${zone.border} ${zone.border === "border-pink-300" ? "border-dashed" : "border-dashed"} flex flex-col items-center justify-start p-1 relative pt-6 overflow-hidden transition-all duration-300 ${currentQ.targetZone === zone.id ? "ring-2 ring-offset-2 ring-green-400 scale-105" : "opacity-60 grayscale"}`}
                  >
                      {/* Background Icon/Image */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 mt-4 pointer-events-none">
                          {zone.img ? (
                              <img src={zone.img} className="w-10 h-10 object-contain" />
                          ) : (
                              <span className="text-2xl">{zone.icon}</span>
                          )}
                      </div>

                      {/* Dropped Items Stack */}
                      <div className="absolute inset-0 flex items-center justify-center">
                          {droppedItems.filter(() => currentQ.targetZone === zone.id).map((item, i) => ( // Only show in correct zone for now as logic is specific
                              <motion.div
                                key={item.id}
                                layoutId={item.id}
                                className="w-10 h-10 absolute shadow-sm"
                                style={{ marginLeft: i * 5, marginTop: i * 2 }}
                                onClick={() => returnToPool(item)}
                              >
                                  <img src={item.image} className="w-full h-full object-contain" />
                              </motion.div>
                          ))}
                           {/* Count Badge */}
                           {currentQ.targetZone === zone.id && droppedItems.length > 0 && (
                               <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                                   {droppedItems.length}
                               </div>
                           )}
                      </div>
                  </div>
              ))}
          </div>

          {/* Action Button */}
          {isCorrect === true ? (
             <motion.button
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                onClick={nextQuestion}
                className="w-full py-3 bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
             >
                 Lanjut <ChevronLeft className="rotate-180" />
             </motion.button>
          ) : (
            <button
                onClick={handleCheck}
                className={`w-full py-3 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                    droppedItems.length > 0 
                    ? "bg-green-500 text-white hover:bg-green-600" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={droppedItems.length === 0}
            >
                <CheckCircle2 size={20} /> Periksa Jawaban
            </button>
          )}

          {/* Feedback Message */}
          <AnimatePresence>
            {isCorrect === false && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-center text-red-500 font-bold mt-2 text-sm"
                >
                    Belum tepat! Coba hitung lagi ya.
                </motion.div>
            )}
          </AnimatePresence>

       </div>
    </div>
  );
}
