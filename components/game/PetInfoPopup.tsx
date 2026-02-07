// components/game/PetInfoPopup.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Pet } from "../../src/game/types/pet";
import { Buff } from "../../src/game/types/buff";
import { calculatePetValue } from "../../src/game/services/petValue";
import { calculatePetStars, getStarRatingText } from "../../src/game/services/petRating";

interface PetInfoPopupProps {
  pet: Pet;
  activeBuffs: Buff[];
  onClose: () => void;
  onSell?: (petId: string, value: number) => void;
  onHideToInventory?: (petId: string) => void;
  onToggleLock?: (petId: string) => void;
  onCollectGems?: (petId: string) => void;
  scale?: number;
  hideButtons?: boolean; // Hide action buttons and progress bars
}

// Get buff rarity color and styling based on buff rarity
const getBuffRarityStyle = (rarity: string): { bg: string; border: string; text: string; glow: string } => {
  switch (rarity) {
    case "common":
      return {
        bg: "bg-gray-700/80",
        border: "border-gray-600",
        text: "text-gray-100",
        glow: "shadow-gray-500/20"
      };
    case "rare":
      return {
        bg: "bg-blue-900/60",
        border: "border-blue-600/50",
        text: "text-blue-200",
        glow: "shadow-blue-500/30"
      };
    case "epic":
      return {
        bg: "bg-purple-900/60",
        border: "border-purple-600/50",
        text: "text-purple-200",
        glow: "shadow-purple-500/30"
      };
    case "legendary":
      return {
        bg: "bg-gradient-to-r from-yellow-900/60 to-amber-900/60",
        border: "border-yellow-600/50",
        text: "text-yellow-200",
        glow: "shadow-yellow-500/40"
      };
    case "mythical":
      return {
        bg: "bg-gradient-to-r from-red-900/60 to-orange-900/60",
        border: "border-red-600/50",
        text: "text-red-200",
        glow: "shadow-red-500/40"
      };
    default:
      return {
        bg: "bg-zinc-700/80",
        border: "border-zinc-600",
        text: "text-zinc-100",
        glow: "shadow-zinc-500/20"
      };
  }
};

// Return a solid (non-transparent) background class for buff squares by rarity
const getSolidRarityBg = (rarity: string) => {
  switch (rarity) {
    case "common": return "bg-gray-700";
    case "rare": return "bg-blue-900";
    case "epic": return "bg-purple-900";
    case "legendary": return "bg-yellow-900";
    case "mythical": return "bg-red-900";
    default: return "bg-zinc-800";
  }
};

// Get buff tier color and styling (kept for backward compatibility if needed)
const getBuffTierStyle = (buffName: string): { bg: string; border: string; text: string; glow: string } => {
  const type = buffName.split(" ")[0].toLowerCase();
  
  // Basic tier
  if (["lure", "speed", "luck", "double"].includes(type)) {
    return {
      bg: "bg-zinc-700/80",
      border: "border-zinc-600",
      text: "text-zinc-100",
      glow: "shadow-zinc-500/20"
    };
  }
  
  // Advanced tier
  if (["triple", "refine"].includes(type)) {
    return {
      bg: "bg-blue-900/60",
      border: "border-blue-600/50",
      text: "text-blue-200",
      glow: "shadow-blue-500/30"
    };
  }
  
  // Premium tier
  if (["cluster", "echo", "overclock"].includes(type)) {
    return {
      bg: "bg-purple-900/60",
      border: "border-purple-600/50",
      text: "text-purple-200",
      glow: "shadow-purple-500/30"
    };
  }
  
  // Ultimate tier
  if (["unstable", "gamble"].includes(type)) {
    return {
      bg: "bg-gradient-to-r from-orange-900/60 to-yellow-900/60",
      border: "border-yellow-600/50",
      text: "text-yellow-200",
      glow: "shadow-yellow-500/40"
    };
  }
  
  // Default
  return {
    bg: "bg-zinc-700/80",
    border: "border-zinc-600",
    text: "text-zinc-100",
    glow: "shadow-zinc-500/20"
  };
};

// Get emoji for buff type
const getBuffEmoji = (buffName: string): string => {
  const type = buffName.split(" ")[0].toLowerCase();
  
  const emojiMap: Record<string, string> = {
    speed: "⚡",
    lure: "💎",
    luck: "🍀",
    double: "✨",
    triple: "💫",
    echo: "🌐",
    cluster: "🔗",
    overclock: "⚠️",
    refine: "🔮",
    unstable: "🌀",
    gamble: "🎲",
    surge: "⚡",
    frenzy: "🔥",
    strain: "💥",
    burnout: "🌡️",
    meltdown: "☢️",
    hyperdrive: "🚀",
    exhaust: "💨",
    resilience: "🛡️",
    fortify: "🏰",
    stabilizer: "⚖️",
    regulator: "🎚️",
  };
  
  return emojiMap[type] || "❓";
};

const rarityTextColors: Record<string, string> = {
  common: "text-gray-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
  mythical: "text-red-400",
};

// Descriptions for pets (mapped by pet name)
const petDescriptionMap: Record<string, string> = {
  "Hermit Crap": "A small crustacean that scavenges for hidden gems.",
  "Tarnished Clam": "An old mollusk with a weathered shell that produces modest gems.",
  "Polished Snail": "A slow but steady gem producer with a lustrous shell.",
  "Fracture Crab": "Cracks open geodes to reveal precious gems inside.",
  "Gilded Oyster": "Produces rare pearls that shimmer with golden light.",
  "Shiny Lobster": "A gleaming crustacean that finds valuable treasures.",
  "Opaline Scallop": "A mystical cephalopod that generates purple gems.",
  "Prismatic Spidercrab": "Refracts light into crystalline gems of great value.",
  "Ancient Geodenum Turtle": "An ancient creature from the abyss, encrusted with dark crystals.",
  "Voidwyrm Isopod": "A temporal being that finds gems across time itself.",
};

const getBuffDisplays = (buff: Buff) => {
  const buffName = buff.name;
  const buffTypeKey = (buff.type || buffName.split(' ')[0]).toString().toLowerCase();
  const displays: { type: string; emoji: string; parts: Array<{text: string; color: 'positive' | 'negative' | 'neutral'}> }[] = [];
  
  // STAR buff (merge rewards) - Special display with 3 separate lines
  if (buff.type === "star" && buff.starLevel) {
    // Capacity bonus
    if (buff.capacityBonus) {
      displays.push({
        type: 'star',
        emoji: "📦",
        parts: [
          { text: `+${Math.round(buff.capacityBonus * 100)}%`, color: 'positive' },
          { text: ' Gem Capacity', color: 'neutral' }
        ]
      });
    }
    // Buff effectiveness bonus
    if (buff.buffEffectivenessBonus) {
      displays.push({
        type: 'star',
        emoji: "✨",
        parts: [
          { text: `+${Math.round(buff.buffEffectivenessBonus * 100)}%`, color: 'positive' },
          { text: ' Buff Effectiveness', color: 'neutral' }
        ]
      });
    }
    // Speed bonus
    if (buff.tickSpeedMultiplier && buff.tickSpeedMultiplier < 1) {
      displays.push({
        type: 'star',
        emoji: "⚡",
        parts: [
          { text: `+${Math.round((1 - buff.tickSpeedMultiplier) * 100)}%`, color: 'positive' },
          { text: ' Gem Production Speed', color: 'neutral' }
        ]
      });
    }
    return displays;
  }
  
  // Value multipliers (LURE, CLUSTER)
  if (buff.gemValueMultiplier && buff.gemValueMultiplier > 1) {
    displays.push({ 
      type: buffTypeKey,
      emoji: "💎", 
      parts: [
        { text: `+${Math.round((buff.gemValueMultiplier - 1) * 100)}%`, color: 'positive' },
        { text: ' Gem Value', color: 'neutral' }
      ]
    });
  }
  
  // Speed multipliers (SPEED, OVERCLOCK, REFINE)
  if (buff.tickSpeedMultiplier && buff.tickSpeedMultiplier < 1) {
    displays.push({ 
      type: buffTypeKey,
      emoji: "⚡", 
      parts: [
        { text: `+${Math.round((1 - buff.tickSpeedMultiplier) * 100)}%`, color: 'positive' },
        { text: ' Gem Production Speed', color: 'neutral' }
      ]
    });
  } else if (buff.tickSpeedMultiplier && buff.tickSpeedMultiplier > 1) {
    displays.push({ 
      emoji: "🐌", 
      type: buffTypeKey,
      parts: [
        { text: `-${Math.round((buff.tickSpeedMultiplier - 1) * 100)}%`, color: 'negative' },
        { text: ' Gem Production Speed', color: 'neutral' }
      ]
    });
  }
  
  // Tier chance (LUCK)
  if (buff.nextTierChanceBonus && !buff.tierChancePerNearbyPet) {
    displays.push({ 
      emoji: "⬆️", 
      type: buffTypeKey,
      parts: [
        { text: `+${Math.round(buff.nextTierChanceBonus * 100)}%`, color: 'positive' },
        { text: ' Gem Rarity Chance', color: 'neutral' }
      ]
    });
  }
  
  // Double chance (DOUBLE)
  if (buff.doubleGemChance && !buff.tripleGemChance) {
    displays.push({ 
      emoji: "✨", 
      type: buffTypeKey,
      parts: [
        { text: `+${buff.doubleGemChance * 100}%`, color: 'positive' },
        { text: ' Double Gem Chance', color: 'neutral' }
      ]
    });
  }
  
  // Triple chance (TRIPLE)
  if (buff.tripleGemChance && !buff.doubleGemChance) {
    displays.push({ 
      emoji: "💫", 
      type: buffTypeKey,
      parts: [
        { text: `+${buff.tripleGemChance * 100}%`, color: 'positive' },
        { text: ' Triple Gem Chance', color: 'neutral' }
      ]
    });
  }
  
  // Conditional modifiers (CLUSTER)
  if (buff.valuePerNearbyPet) {
    const gridSize = buff.areaRadius === 2 ? "5x5" : "3x3";
    const value = buff.valuePerNearbyPet * 100;
    displays.push({ 
      emoji: "🔗", 
      type: buffTypeKey,
      parts: [
        { text: `+${value}%`, color: 'positive' },
        { text: ` Gem Value per Pet Nearby [${gridSize}]`, color: 'neutral' }
      ]
    });
  }
  
  // Conditional modifiers (ECHO)
  if (buff.tierChancePerNearbyPet) {
    const gridSize = buff.areaRadius === 2 ? "5x5" : "3x3";
    displays.push({ 
      emoji: "🌐", 
      type: buffTypeKey,
      parts: [
        { text: `+${buff.tierChancePerNearbyPet * 100}%`, color: 'positive' },
        { text: ` Gem Rarity per Pet Nearby [${gridSize}]`, color: 'neutral' }
      ]
    });
  }
  
  // Gamble - removed (buff no longer exists)
  
  // Overclock
  if (buff.overclockFailChance && buff.overclockDisableDuration) {
    displays.push({ 
      emoji: "⚠️", 
      type: buffTypeKey,
      parts: [
        { text: `+${Math.round(buff.overclockFailChance * 100)}%`, color: 'negative' },
        { text: ' Chance to Disable Pet for ', color: 'neutral' },
        { text: `${buff.overclockDisableDuration}s`, color: 'negative' }
      ]
    });
  }
  
  // Burnout
  if (buff.burnoutFailChance && buff.burnoutDisableDuration) {
    displays.push({ 
      emoji: "⚠️", 
      type: buffTypeKey,
      parts: [
        { text: `+${Math.round(buff.burnoutFailChance * 100)}%`, color: 'negative' },
        { text: ' Chance to Disable Pet for ', color: 'neutral' },
        { text: `${buff.burnoutDisableDuration}s`, color: 'negative' }
      ]
    });
  }
  
  // Strain
  if (buff.strainFailChance && buff.strainDisableDuration) {
    displays.push({ 
      emoji: "⚠️", 
      type: buffTypeKey,
      parts: [
        { text: `+${Math.round(buff.strainFailChance * 100)}%`, color: 'negative' },
        { text: ' Chance to Disable Pet for ', color: 'neutral' },
        { text: `${buff.strainDisableDuration}s`, color: 'negative' }
      ]
    });
  }
  
  // Hyperdrive
  if (buff.hyperdriveFailChance && buff.hyperdriveDisableDuration) {
    displays.push({ 
      emoji: "⚠️", 
      type: buffTypeKey,
      parts: [
        { text: `+${Math.round(buff.hyperdriveFailChance * 100)}%`, color: 'negative' },
        { text: ' Chance to Disable Pet for ', color: 'neutral' },
        { text: `${buff.hyperdriveDisableDuration}s`, color: 'negative' }
      ]
    });
  }
  
  // Meltdown - removed (properties no longer exist)
  
  // Frenzy - removed (properties no longer exist)
  
  // Exhaust
  if (buff.exhaustGenerationCount && buff.exhaustDisableDuration) {
    displays.push({ 
      emoji: "⚠️", 
      type: buffTypeKey,
      parts: [
        { text: 'Disables after ', color: 'neutral' },
        { text: `${buff.exhaustGenerationCount}`, color: 'negative' },
        { text: ' generations for ', color: 'neutral' },
        { text: `${buff.exhaustDisableDuration}s`, color: 'negative' }
      ]
    });
  }
  
  // Surge
  if (buff.surgeSkipChance && buff.surgeSkipCount) {
    displays.push({ 
      emoji: "⚠️", 
      type: buffTypeKey,
      parts: [
        { text: `+${Math.round(buff.surgeSkipChance * 100)}%`, color: 'negative' },
        { text: ' Chance to Skip ', color: 'neutral' },
        { text: `${buff.surgeSkipCount}`, color: 'negative' },
        { text: ' Generations', color: 'neutral' }
      ]
    });
  }
  
  // Exhaust value multiplier
  if (buff.exhaustValueMultiplier) {
    displays.push({ 
      emoji: "💨", 
      type: buffTypeKey,
      parts: [
        { text: `+${Math.round((buff.exhaustValueMultiplier - 1) * 100)}%`, color: 'positive' },
        { text: ' Gem Value During Active Phase', color: 'neutral' }
      ]
    });
  }
  
  // Resilience - removed (property no longer exists)
  
  // Fortify - removed (property no longer exists)
  
  // Stabilizer - removed (properties no longer exist)
  
  // Regulator - removed (properties no longer exist)
  
  // Unstable (has triple, double, and no gem chance together)
  if (buff.tripleGemChance && buff.doubleGemChance && buff.noGemChance) {
    displays.push({ 
      emoji: "💫", 
      type: buffTypeKey,
      parts: [
        { text: `+${buff.tripleGemChance * 100}%`, color: 'positive' },
        { text: ' Triple Gem Chance', color: 'neutral' }
      ]
    });
    displays.push({ 
      emoji: "✨", 
      type: buffTypeKey,
      parts: [
        { text: `+${buff.doubleGemChance * 100}%`, color: 'positive' },
        { text: ' Double Gem Chance', color: 'neutral' }
      ]
    });
    displays.push({ 
      emoji: "🌀", 
      type: buffTypeKey,
      parts: [
        { text: `+${Math.round(buff.noGemChance * 100)}%`, color: 'negative' },
        { text: ' No Gem Chance', color: 'neutral' }
      ]
    });
  }
  
  if (displays.length === 0) displays.push({ type: buffTypeKey, emoji: "❓", parts: [{ text: "Unknown buff", color: 'neutral' }] });
  return displays;
};

// simple description map (can be expanded)
const petDescriptions: Record<string, string> = {};

function calculateProgress(pet: Pet, activeBuffs: Buff[] = []) {
  const now = Date.now() / 1000;
  const last = pet.lastGenerated ?? now;
  
  // Calculate base tick time
  const baseAvgTickTime = (pet.tickTimeRange[0] + pet.tickTimeRange[1]) / 2;
  
  // Apply speed modifiers from buffs (combine pet buffs + active buffs)
  const allBuffs = [...(pet.buffs || []), ...activeBuffs];
  const tickSpeedMod = allBuffs.reduce(
    (mul, b) => b.tickSpeedMultiplier ? mul * b.tickSpeedMultiplier : mul,
    1
  );
  
  // Apply speed penalty if present
  const speedPenalty = (pet as any).currentSpeedPenalty || 1.0;
  
  // Final tick time with all modifiers
  const avgTickTime = baseAvgTickTime * tickSpeedMod * speedPenalty;
  
  const elapsed = Math.max(0, now - last);
  const timeLeft = Math.max(0, avgTickTime - elapsed);
  const progress = avgTickTime > 0 ? Math.min(100, (elapsed / avgTickTime) * 100) : 100;
  return { progress, timeLeft, avgTickTime };
}



export default function PetInfoPopup({ pet, activeBuffs, onClose, onSell, onHideToInventory, onToggleLock, onCollectGems, scale = 1, hideButtons = false }: PetInfoPopupProps) {
  const [hoveredBuff, setHoveredBuff] = useState<string | null>(null);
  const [progressData, setProgressData] = useState(() => calculateProgress(pet, activeBuffs));
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const petValue = calculatePetValue(pet);
  const petStars = calculatePetStars(pet);
  const starRating = getStarRatingText(petStars);

  // Debug: Log props on mount
  useEffect(() => {
    console.log('[PetInfoPopup] Rendered for pet:', pet.id, {
      locked: pet.locked,
      hasOnSell: !!onSell,
      hasOnHideToInventory: !!onHideToInventory,
      hasOnToggleLock: !!onToggleLock,
      petValue
    });
  }, [pet.id, pet.locked, onSell, onHideToInventory, onToggleLock, petValue]);

  const petRef = useRef(pet);
  petRef.current = pet;
  
  const activeBuffsRef = useRef(activeBuffs);
  activeBuffsRef.current = activeBuffs;

  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside the popup
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      try {
        if (!rootRef.current) return;
        const target = e.target;
        if (target instanceof Node && rootRef.current.contains(target)) return;
        onClose();
      } catch (err) {
        // ignore
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [onClose]);

  useEffect(() => {
    setProgressData(calculateProgress(petRef.current, activeBuffsRef.current));
    const interval = setInterval(() => {
      setProgressData(calculateProgress(petRef.current, activeBuffsRef.current));
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 100);
    return () => clearInterval(interval);
  }, [pet.id, pet.lastGenerated]);

  const description = petDescriptionMap[pet.name] || "A mysterious creature that generates gems.";

  // Check if this is a generator pet (has buffs property)
  const isGeneratorPet = pet.buffs !== undefined;
  
  // Calculate effective capacity with STAR buff bonus
  const starBuff = (pet.buffs || []).find(b => b.type === "star");
  const capacityMultiplier = starBuff?.capacityBonus ? (1 + starBuff.capacityBonus) : 1;
  const effectiveCapacity = Math.round(pet.maxGemCapacity * capacityMultiplier);
  
  // Rarity sort order (mythical = highest, common = lowest)
  const rarityOrder: Record<string, number> = {
    'mythical': 5,
    'legendary': 4,
    'epic': 3,
    'rare': 2,
    'common': 1,
  };
  
  // Separate innate buffs from area buffs
  // Innate buffs come from pet.buffs (pet's own buffs)
  // Area buffs come from activeBuffs (buffs from placed items or nearby pets)
  const innateBuffs = isGeneratorPet 
    ? (pet.buffs || []).sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0))
    : [];
  const areaBuffs = isGeneratorPet 
    ? activeBuffs.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0))
    : activeBuffs.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));
  
  // For display and calculation, combine both innate and area buffs
  const buffsToDisplay = isGeneratorPet ? [...innateBuffs, ...areaBuffs] : activeBuffs;

  // Helper to check if buff has downtime mechanics
  const getBuffDowntimeInfo = (buff: Buff) => {
    const buffType = buff.type;
    let maxDuration = 0;
    
    // Determine max disable duration based on buff type
    if (buff.overclockDisableDuration) maxDuration = buff.overclockDisableDuration;
    else if (buff.burnoutDisableDuration) maxDuration = buff.burnoutDisableDuration;
    else if (buff.strainDisableDuration) maxDuration = buff.strainDisableDuration;
    else if (buff.hyperdriveDisableDuration) maxDuration = buff.hyperdriveDisableDuration;
    else if (buff.meltdownDisableDuration) maxDuration = buff.meltdownDisableDuration;
    else if (buff.frenzyDisableDuration) maxDuration = buff.frenzyDisableDuration;
    else if (buff.exhaustDisableDuration) maxDuration = buff.exhaustDisableDuration;
    
    if (maxDuration > 0 && pet.disabledUntil && currentTime < pet.disabledUntil) {
      const remaining = pet.disabledUntil - currentTime;
      const progress = 1 - (remaining / maxDuration); // 0 = just disabled, 1 = almost done
      return { hasDowntime: true, progress, remaining, maxDuration };
    }
    
    return { hasDowntime: false, progress: 0, remaining: 0, maxDuration: 0 };
  };

  const handleSell = (e: React.MouseEvent) => {
    console.log('[PetInfoPopup] handleSell clicked for pet:', pet.id);
    e.stopPropagation();
    if (onSell) {
      console.log('[PetInfoPopup] Calling onSell callback');
      onSell(pet.id, petValue);
      onClose();
    } else {
      console.warn('[PetInfoPopup] onSell callback is undefined!');
    }
  };

  const handleHideToInventory = (e: React.MouseEvent) => {
    console.log('[PetInfoPopup] handleHideToInventory clicked for pet:', pet.id);
    e.stopPropagation();
    if (onHideToInventory) {
      console.log('[PetInfoPopup] Calling onHideToInventory callback');
      onHideToInventory(pet.id);
      onClose();
    } else {
      console.warn('[PetInfoPopup] onHideToInventory callback is undefined!');
    }
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    console.log('[PetInfoPopup] handleToggleLock clicked for pet:', pet.id, 'current locked state:', pet.locked);
    e.stopPropagation();
    if (onToggleLock) {
      console.log('[PetInfoPopup] Calling onToggleLock callback');
      onToggleLock(pet.id);
    } else {
      console.warn('[PetInfoPopup] onToggleLock callback is undefined!');
    }
  };

  const handleCollectGems = (e: React.MouseEvent) => {
    console.log('[PetInfoPopup] handleCollectGems clicked for pet:', pet.id);
    e.stopPropagation();
    if (onCollectGems) {
      console.log('[PetInfoPopup] Calling onCollectGems callback');
      onCollectGems(pet.id);
    } else {
      console.warn('[PetInfoPopup] onCollectGems callback is undefined!');
    }
  };

 

  // Render different UI based on pet type
  if (isGeneratorPet) {
    // GENERATOR PET UI - Minecraft-style buff list
    return (
      <div ref={rootRef} className="flex flex-col gap-2">
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Main Content */}
          <div className="w-80 bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 p-4">
          {/* Header */}
          <div className="flex flex-col items-center mb-2">
            {/* Star Rating */}
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`text-5xl ${star <= petStars ? 'text-yellow-400' : 'text-zinc-600'}`}
                >
                  ★
                </span>
              ))}
            </div>
            
            {/* Name and Rarity */}
            <h2 className="text-2xl font-bold text-white">{pet.name}</h2>
            <p className={`text-sm font-semibold ${rarityTextColors[pet.rarity]} capitalize`}>{pet.rarity}</p>
          </div>
          
          {/* Description */}
          <p className="text-zinc-400 text-sm mb-4 leading-relaxed text-center">{description}</p>
          
          {/* Stats Row */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 text-center">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Exists</div>
              <div className="text-white font-bold text-lg">1</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Price</div>
              <div className="text-green-400 font-bold text-lg">${petValue.toLocaleString()}</div>
            </div>
          </div>

          <hr className="border-zinc-700 mb-3" />

          {/* Gem Production Progress Bar - Hide if hideButtons is true */}
          {!hideButtons && (
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2 text-center">
              Gem Production {pet.disabledUntil && currentTime < pet.disabledUntil ? (
                <span className="text-red-400 font-bold">(DISABLED)</span>
              ) : (
                <span className="text-white font-mono">{progressData.timeLeft.toFixed(0)}<span style={{ fontSize: '0.65em' }}>s</span></span>
              )}
            </div>
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                style={{ 
                  width: `${pet.disabledUntil && currentTime < pet.disabledUntil ? 0 : progressData.progress}%`,
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
          </div>
          )}

          {/* Downtime Disable Progress Bars - Show all downtime buffs sorted by rarity - Hide if hideButtons is true */}
          {!hideButtons && (() => {
            // Find all buffs with downtime capability
            const downtimeBuffs = buffsToDisplay.filter(buff => 
              buff.overclockDisableDuration || buff.burnoutDisableDuration || 
              buff.strainDisableDuration || buff.hyperdriveDisableDuration || 
              buff.meltdownDisableDuration || buff.frenzyDisableDuration || 
              buff.exhaustDisableDuration
            );
            
            if (downtimeBuffs.length === 0) return null;
            
            // Sort by rarity (mythical first, common last)
            const sortedDowntimeBuffs = downtimeBuffs.sort((a, b) => 
              (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0)
            );
            
            // Find which buff actually triggered the disable (if any)
            let triggeredBuffId: string | null = null;
            if (pet.disabledUntil && currentTime < pet.disabledUntil) {
              const remaining = pet.disabledUntil - currentTime;
              // Find the buff with smallest maxDuration that can contain the remaining time
              let smallestValidDuration = Infinity;
              for (const buff of downtimeBuffs) {
                const info = getBuffDowntimeInfo(buff);
                if (info.maxDuration >= remaining && info.maxDuration < smallestValidDuration) {
                  smallestValidDuration = info.maxDuration;
                  triggeredBuffId = buff.id;
                }
              }
            }
            
            return sortedDowntimeBuffs.map((downtimeBuff, index) => {
              const buffType = downtimeBuff.name.split(' ')[0];
              const isCurrentlyDisabled = pet.disabledUntil && currentTime < pet.disabledUntil;
              const info = getBuffDowntimeInfo(downtimeBuff);
              
              // Get chance percentage for this buff
              let chancePercent = 0;
              if (downtimeBuff.overclockFailChance) chancePercent = downtimeBuff.overclockFailChance * 100;
              else if (downtimeBuff.burnoutFailChance) chancePercent = downtimeBuff.burnoutFailChance * 100;
              else if (downtimeBuff.strainFailChance) chancePercent = downtimeBuff.strainFailChance * 100;
              else if (downtimeBuff.hyperdriveFailChance) chancePercent = downtimeBuff.hyperdriveFailChance * 100;
              else if (downtimeBuff.exhaustGenerationCount) chancePercent = 100; // Guaranteed after X gens
              
              // Check if this is the buff that actually triggered the disable
              const isThisBuffTriggered = downtimeBuff.id === triggeredBuffId;
              
              return (
                <div key={`downtime-${downtimeBuff.id}-${index}`} className="mt-3">
                  <div className="text-xs text-red-400 uppercase tracking-wide mb-2 text-center font-bold">
                    {buffType} {isThisBuffTriggered ? 'Duration' : 'Chance'} <span className="text-white font-mono">{isThisBuffTriggered ? <>{info.remaining.toFixed(0)}<span style={{ fontSize: '0.65em' }}>s</span></> : `${Math.round(chancePercent)}%`}</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-red-700">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400"
                      style={{ 
                        width: `${isThisBuffTriggered ? info.progress * 100 : 0}%`,
                        transition: 'width 0.1s linear'
                      }}
                    />
                  </div>
                </div>
              );
            });
          })()}

          {/* Gem Capacity Progress - Hide if hideButtons is true */}
          {!hideButtons && (
          <div className="mt-3">
            <div className="text-xs text-blue-400 uppercase tracking-wide mb-2 text-center font-bold">
              GEM CAPACITY <span className="text-white font-mono">{pet.currentGems || 0}/{effectiveCapacity}</span>
            </div>
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-blue-700">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                style={{ 
                  width: `${((pet.currentGems || 0) / effectiveCapacity) * 100}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            
            {/* Collect Button */}
            {onCollectGems && (pet.currentGems || 0) > 0 && (
              <button
                onClick={handleCollectGems}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                title="Collect gems and convert to cash"
              >
                💎 Collect ({pet.currentGems || 0} gems)
              </button>
            )}
          </div>
          )}

          {/* Action Buttons - Hide if hideButtons is true */}
          {!hideButtons && (
          <div 
            className="mt-4 flex gap-2" 
            onClick={(e) => {
              console.log('[PetInfoPopup] Button container div clicked!');
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              console.log('[PetInfoPopup] Button container div mousedown!');
              e.stopPropagation();
            }}
          >
            {pet.locked ? (
              /* When locked, only show lock button full width */
              onToggleLock && (
                <button
                  onClick={(e) => {
                    console.log('[PetInfoPopup] LOCK BUTTON CLICKED!');
                    handleToggleLock(e);
                  }}
                  onMouseDown={(e) => {
                    console.log('[PetInfoPopup] LOCK BUTTON MOUSEDOWN!');
                    e.stopPropagation();
                  }}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                  title="Unlock pet (allow dragging and selling)"
                >
                  🔒 Locked - Click to Unlock
                </button>
              )
            ) : (
              /* When unlocked, show all three buttons */
              <>
                {/* Hide to Inventory Button */}
                {onHideToInventory && (
                  <button
                    onClick={(e) => {
                      console.log('[PetInfoPopup] HIDE BUTTON CLICKED!');
                      handleHideToInventory(e);
                    }}
                    onMouseDown={(e) => {
                      console.log('[PetInfoPopup] HIDE BUTTON MOUSEDOWN!');
                      e.stopPropagation();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                    title="Remove from grid and return to inventory"
                  >
                    📦 Hide
                  </button>
                )}
                
                {/* Lock Button */}
                {onToggleLock && (
                  <button
                    onClick={(e) => {
                      console.log('[PetInfoPopup] LOCK BUTTON CLICKED!');
                      handleToggleLock(e);
                    }}
                    onMouseDown={(e) => {
                      console.log('[PetInfoPopup] LOCK BUTTON MOUSEDOWN!');
                      e.stopPropagation();
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                    title="Lock pet (prevent dragging and selling)"
                  >
                    🔓 Lock
                  </button>
                )}
                
                {/* Sell Button */}
                {onSell && (
                  <button
                    onClick={(e) => {
                      console.log('[PetInfoPopup] SELL BUTTON CLICKED!');
                      handleSell(e);
                    }}
                    onMouseDown={(e) => {
                      console.log('[PetInfoPopup] SELL BUTTON MOUSEDOWN!');
                      e.stopPropagation();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                    title="Sell pet for cash"
                  >
                    💰 Sell
                  </button>
                )}
              </>
            )}
          </div>
          )}
          </div>

          {/* Buff Squares - Right Side */}
          <div className="flex flex-row gap-2">
            {/* Innate Buffs Section */}
            {innateBuffs.length > 0 && (
              <div className="flex flex-col gap-2">
                {innateBuffs.map((buff, index) => {
                    const rarityStyle = getBuffRarityStyle(buff.rarity);
                    const emoji = getBuffEmoji(buff.name);
                    const downtimeInfo = getBuffDowntimeInfo(buff);
                    
                    return (
                      <div
                        key={`innate-${index}`}
                        className="relative"
                        onMouseEnter={() => setHoveredBuff(`innate-${index}`)}
                        onMouseLeave={() => setHoveredBuff(null)}
                      >
                        <div className={`
                          ${getSolidRarityBg(buff.rarity)} ${rarityStyle.border} ${rarityStyle.glow}
                          w-12 h-12 border-2 
                          flex items-center justify-center
                          cursor-help transition-all duration-200
                          hover:scale-110 hover:shadow-xl
                          relative overflow-hidden
                        `}>
                          <img
                            src={`/buff-icons/${(buff.type || buff.name.split(' ')[0]).toString().toUpperCase()}bufficon.png`}
                            alt={buff.name}
                            className="w-6 h-6"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                        
                        {hoveredBuff === `innate-${index}` && (
                          <div className="absolute left-full top-0 ml-2 bg-zinc-950 rounded-lg px-3 py-2 border border-yellow-500/50 shadow-2xl z-50 whitespace-nowrap">
                            <p className={`text-sm font-bold mb-1 ${buff.rarity === 'common' ? 'text-gray-400' : buff.rarity === 'rare' ? 'text-blue-400' : buff.rarity === 'epic' ? 'text-purple-400' : buff.rarity === 'legendary' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {buff.name}
                            </p>
                            {getBuffDisplays(buff).map((d, i) => (
                              <p key={i} className="text-xs">
                                {d.parts.map((part, j) => (
                                  <span 
                                    key={j} 
                                    className={part.color === 'positive' ? 'text-green-400' : part.color === 'negative' ? 'text-red-400' : 'text-white'}
                                  >
                                    {part.text}
                                  </span>
                                ))}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
            
            {/* Area Buffs Section */}
            {areaBuffs.length > 0 && (
              <div className="flex flex-col gap-2">
                {areaBuffs.map((buff, index) => {
                    const rarityStyle = getBuffRarityStyle(buff.rarity);
                    const emoji = getBuffEmoji(buff.name);
                    
                    return (
                      <div
                        key={`area-${index}`}
                        className="relative"
                        onMouseEnter={() => setHoveredBuff(`area-${index}`)}
                        onMouseLeave={() => setHoveredBuff(null)}
                      >
                        <div className={`
                          ${getSolidRarityBg(buff.rarity)} ${rarityStyle.border} ${rarityStyle.glow}
                          w-12 h-12 border-2 
                          flex items-center justify-center
                          cursor-help transition-all duration-200
                          hover:scale-110 hover:shadow-xl
                          relative overflow-hidden
                        `}>
                          <img
                            src={`/buff-icons/${(buff.type || buff.name.split(' ')[0]).toString().toUpperCase()}bufficon.png`}
                            alt={buff.name}
                            className="w-6 h-6"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                        
                        {hoveredBuff === `area-${index}` && (
                          <div className="absolute left-full top-0 ml-2 bg-zinc-950 rounded-lg px-3 py-2 border border-blue-500/50 shadow-2xl z-50 whitespace-nowrap">
                            <p className={`text-sm font-bold mb-1 ${buff.rarity === 'common' ? 'text-gray-400' : buff.rarity === 'rare' ? 'text-blue-400' : buff.rarity === 'epic' ? 'text-purple-400' : buff.rarity === 'legendary' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {buff.name}
                            </p>
                            {getBuffDisplays(buff).map((d, i) => (
                              <p key={i} className="text-xs">
                                {d.parts.map((part, j) => (
                                  <span 
                                    key={j} 
                                    className={part.color === 'positive' ? 'text-green-400' : part.color === 'negative' ? 'text-red-400' : 'text-white'}
                                  >
                                    {part.text}
                                  </span>
                                ))}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // BUFF PET UI - Original design with emoji grid
  const displays = (activeBuffs ?? []).flatMap((b) => getBuffDisplays(b));
  
  return (
    <>
        {/* Popup wrapper (fixed size independent of zoom) */}
          <div ref={rootRef} className="flex flex-col gap-1">
        {/* Top row: Info + Buffs */}
        <div className="flex gap-1 items-stretch" onClick={(e) => e.stopPropagation()}>
          {/* Information container */}
          <div className="w-52 bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 p-4">
            {/* Name */}
            <h2 className="text-xl font-bold text-white leading-tight">{pet.name}</h2>

            {/* Rarity subtitle */}
            <p className={`text-sm font-medium ${rarityTextColors[pet.rarity]} capitalize`}>{pet.rarity}</p>

            {/* Divider */}
            <hr className="my-3 border-zinc-600" />

            {/* Description */}
            <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
            <div className="mt-3">
              <div className="text-white font-bold text-lg">1 Exists</div>
            </div>

            {/* Pet Value */}
            <div className="mt-3 p-2 bg-zinc-900/50 rounded-lg border border-zinc-600">
              <div className="text-xs text-zinc-400">Pet Value</div>
              <div className="text-lg font-bold text-green-400">${petValue.toLocaleString()}</div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {pet.locked ? (
                /* When locked, only show lock button full width */
                onToggleLock && (
                  <button
                    onClick={handleToggleLock}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-2 rounded-lg transition-colors text-xs"
                    title="Unlock pet (allow dragging and selling)"
                  >
                    🔒 Locked - Click to Unlock
                  </button>
                )
              ) : (
                /* When unlocked, show all three buttons */
                <>
                  {/* Hide to Inventory Button */}
                  {onHideToInventory && (
                    <button
                      onClick={handleHideToInventory}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-2 rounded-lg transition-colors text-xs"
                      title="Remove from grid and return to inventory"
                    >
                      📦 Hide
                    </button>
                  )}
                  
                  {/* Lock Button */}
                  {onToggleLock && (
                    <button
                      onClick={handleToggleLock}
                      className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-2 rounded-lg transition-colors text-xs"
                      title="Lock pet (prevent dragging and selling)"
                    >
                      🔓 Lock
                    </button>
                  )}
                  
                  {/* Sell Button */}
                  {onSell && (
                    <button
                      onClick={handleSell}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-2 rounded-lg transition-colors text-xs"
                      title="Sell pet for cash"
                    >
                      💰 Sell
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Buff container with emojis */}
          <div className="bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 p-2 flex flex-col gap-1">
            {displays.length === 0 ? (
              <div className="w-8 h-8 bg-zinc-700 rounded border border-zinc-600 flex items-center justify-center">
                <span className="text-xs text-zinc-500">No buffs</span>
              </div>
            ) : (
              displays.map((d, index) => {
                const typeKey = (d.type || '').toString().toUpperCase();
                return (
                  <div key={index} className="w-8 h-8 bg-zinc-800 rounded border border-zinc-600 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={`/buff-icons/${typeKey}bufficon.png`}
                      alt={d.type || 'buff'}
                      className="w-5 h-5"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Progress bar */}

        <div className="bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 p-3">
          <div className="text-xs text-zinc-400 mb-1">
            <span>Gem Duration...</span>
          </div>
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              style={{ 
                width: `${progressData.progress}%`,
                transition: 'width 0.1s linear'
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
