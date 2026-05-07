import { motion } from "motion/react";
import { useState, useRef, TouchEvent } from "react";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const EMOJI_OPTIONS = ["🫠", "🥹", "🥳", "😎", "🥰", "🤩", "🤪", "🤠", "😊", "😇", "👻", "🌈"];

const JIGGLE_VARIANTS = [
  {
    // The Classic Bounce
    rotate: [0, -20, 20, -20, 20, -10, 10, 0],
    scale: [1, 1.4, 0.7, 1.3, 0.8, 1.1, 0.9, 1],
    x: [0, -50, 50, -30, 30, -10, 10, 0],
    y: [0, -100, 50, -40, 20, -10, 0, 0],
  },
  {
    // The Super Spinner
    rotate: [0, 360, 720, 1080],
    scale: [1, 2, 0.5, 1.5, 1],
    x: 0,
    y: 0,
  },
  {
    // The Rubber Band
    rotate: 0,
    scaleX: [1, 2.5, 0.4, 1.8, 0.8, 1.2, 1],
    scaleY: [1, 0.4, 2.5, 0.8, 1.8, 0.8, 1],
    y: 0,
  },
  {
    // The Earthquake
    rotate: [0, -5, 5, -5, 5, -5, 5, 0],
    x: [0, -20, 20, -20, 20, -20, 20, 0],
    scale: 1,
    y: 0,
  },
  {
    // The Space Rocket
    y: [0, -800, 0],
    scale: [1, 0.5, 1],
    rotate: [0, 45, 0],
    x: [0, 200, 0]
  }
];

const SOUND_OPTIONS = [
  { name: "Laser", url: "https://assets.mixkit.co/active_storage/sfx/584/584-preview.mp3" },
  { name: "Pop", url: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" },
  { name: "Magic", url: "https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3" }
];

export default function App() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [jiggling, setJiggling] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);
  const [customText, setCustomText] = useState("");
  const [activeVariant, setActiveVariant] = useState(0);
  const [selectedSound, setSelectedSound] = useState(() => SOUND_OPTIONS[Math.floor(Math.random() * SOUND_OPTIONS.length)].url);
  const [zoomLevel, setZoomLevel] = useState(0.5);

  const initialPinchDistance = useRef<number | null>(null);
  const initialZoomOnPinch = useRef<number | null>(null);

  const handleRevealOrJiggle = () => {
    // Pick a random sound from the options
    const nextSoundUrl = SOUND_OPTIONS[Math.floor(Math.random() * SOUND_OPTIONS.length)].url;
    setSelectedSound(nextSoundUrl);

    if (!isRevealed) {
      setIsRevealed(true);
      // Play random sound on reveal
      const audio = new Audio(nextSoundUrl);
      audio.volume = 0.4;
      audio.play().catch(e => console.log("Audio playback blocked:", e));
      
      // Select a random emoji if it's the first time
      const randomEmoji = EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)];
      setSelectedEmoji(randomEmoji);
      setJiggling(true); // Start jiggling on reveal
      return;
    }

    if (jiggling) {
      setJiggling(false);
    } else {
      // Pick a random variant index
      const nextVariant = Math.floor(Math.random() * JIGGLE_VARIANTS.length);
      setActiveVariant(nextVariant);
      setJiggling(true);
      setTapCount(prev => prev + 1);

      // Play random sound
      const audio = new Audio(nextSoundUrl);
      audio.volume = 0.4;
      audio.play().catch(e => console.log("Audio playback blocked:", e));
    }
  };

  const handleReset = () => {
    setIsRevealed(false);
    setJiggling(false);
    setTapCount(0);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      initialPinchDistance.current = distance;
      initialZoomOnPinch.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance.current !== null && initialZoomOnPinch.current !== null) {
      const currentDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      
      const ratio = currentDistance / initialPinchDistance.current;
      const newZoom = initialZoomOnPinch.current * ratio;
      
      // Clamp between 0.1 and 1
      setZoomLevel(Math.min(Math.max(newZoom, 0.1), 1));
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistance.current = null;
    initialZoomOnPinch.current = null;
  };

  const displayContent = isRevealed ? (customText || selectedEmoji) : "🎁";

  // Calculate font size based on zoom level
  const baseSize = 800; // Large base size
  const fontSize = `${baseSize * zoomLevel}px`;

  return (
    <div 
      className="min-h-screen bg-vibrant-pink p-6 md:p-10 grid grid-rows-[auto_1fr_auto] md:grid-rows-[80px_1fr_120px] gap-8 h-screen box-border overflow-hidden select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-center z-20 gap-4">
        <div className="font-black text-2xl tracking-tighter bg-vibrant-black text-white px-4 py-2 rounded-xl shadow-[4px_4px_0_#000]">
          EMOJI.BOT
        </div>
        {isRevealed && (
          <button 
            onClick={handleReset}
            className="text-xs font-black uppercase tracking-widest bg-vibrant-yellow px-4 py-2 rounded-lg border-2 border-vibrant-black shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            Reset Mystery
          </button>
        )}
      </header>

      {/* Main Interaction Area */}
      <main className="flex flex-col items-center justify-center relative">
        {!isRevealed && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-1/4 animate-bounce font-black text-xl bg-vibrant-mint px-6 py-2 rounded-full border-3 border-vibrant-black shadow-[4px_4px_0_#000] rotate-2 z-20"
          >
            TAP TO REVEAL!
          </motion.div>
        )}
        <motion.div
          key={`${displayContent}-${activeVariant}-${tapCount}`} // Force re-render to restart animation cycle
          animate={jiggling ? JIGGLE_VARIANTS[activeVariant] : {
            rotate: -5,
            scale: 1,
            x: 0,
            y: [0, -15, 0]
          }}
          transition={jiggling ? {
            duration: 2.5, // Even slower
            ease: "easeInOut",
            repeat: 0, // No looping
            repeatType: "mirror"
          } : {
            y: {
              duration: 5.0, // Slower idle
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          onAnimationComplete={() => {
            if (jiggling) {
              setJiggling(false); // Stop jiggling after one play
            }
          }}
          style={{ fontSize }}
          onClick={handleRevealOrJiggle}
          className="cursor-pointer leading-none drop-shadow-[0_20px_0px_rgba(0,0,0,0.1)] active:scale-95 transition-[font-size] duration-300 z-10 text-center flex items-center justify-center max-w-[95vw] break-all"
        >
          {displayContent}
        </motion.div>
      </main>

      {/* Bottom Controls / Stats */}
      <nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 z-40 pb-4 sm:pb-0">
        {/* Zoom Slider */}
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border-3 border-vibrant-black shadow-[4px_4px_0_#000]">
          <span className="text-[10px] font-black uppercase text-vibrant-black/40">Zoom</span>
          <input 
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-20 sm:w-32 accent-vibrant-mint cursor-pointer"
          />
        </div>

        {/* Custom Input Field */}
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border-3 border-vibrant-black shadow-[4px_4px_0_#000] focus-within:translate-y-[-2px] focus-within:shadow-[6px_6px_0_#000] transition-all">
          <span className="text-[10px] font-black uppercase text-vibrant-black/40">Custom</span>
          <input 
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type..."
            className="w-16 sm:w-28 bg-transparent outline-none font-black text-base sm:text-lg placeholder:text-vibrant-black/10 text-vibrant-black"
          />
        </div>

        {/* Emoji Selector Dropdown */}
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border-3 border-vibrant-black shadow-[4px_4px_0_#000]">
          <span className="text-[10px] font-black uppercase text-vibrant-black/40">Emoji</span>
          <select 
            value={selectedEmoji} 
            onChange={(e) => setSelectedEmoji(e.target.value)}
            className="bg-transparent outline-none font-black text-sm sm:text-base cursor-pointer hover:text-vibrant-mint transition-colors appearance-none"
          >
            {EMOJI_OPTIONS.map((emoji) => (
              <option key={emoji} value={emoji}>{emoji}</option>
            ))}
          </select>
        </div>

        {/* Sound Selector Dropdown */}
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border-3 border-vibrant-black shadow-[4px_4px_0_#000]">
          <span className="text-[10px] font-black uppercase text-vibrant-black/40">Sfx</span>
          <select 
            value={selectedSound} 
            onChange={(e) => setSelectedSound(e.target.value)}
            className="bg-transparent outline-none font-black text-sm sm:text-base cursor-pointer hover:text-vibrant-mint transition-colors appearance-none"
          >
            {SOUND_OPTIONS.map((sound) => (
              <option key={sound.url} value={sound.url}>{sound.name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleRevealOrJiggle}
          className="bg-vibrant-mint text-vibrant-black border-3 border-vibrant-black px-8 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-black shadow-[0_8px_0_#000] active:translate-y-1 active:shadow-[0_4px_0_#000] transition-all cursor-pointer uppercase tracking-tighter"
        >
          {isRevealed ? (jiggling ? "Stop Jiggle" : "Jiggle it") : "Reveal"}
        </button>
      </nav>
    </div>
  );
}
