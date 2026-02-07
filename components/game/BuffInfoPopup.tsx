// components/game/BuffInfoPopup.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { PlacedBuff } from "../../src/game/types/buff";

interface BuffInfoPopupProps {
  buff: PlacedBuff;
  onClose: () => void;
  scale?: number;
}

const rarityTextColors: Record<string, string> = {
  common: "text-gray-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
  mythical: "text-red-400",
};

// Descriptions for buffs (mapped by base buff ID)
const buffDescriptions: Record<string, string> = {
  "buff-lure": "Increases the value of gems produced by nearby pets.",
  "buff-speed": "Increases the production speed of nearby pets.",
  "buff-luck": "Increases the chance to get higher rarity gems.",
  "buff-double": "Chance to double the gems produced.",
  "buff-triple": "Chance to triple the gems produced.",
  "buff-sync": "Increases gem rarity chance based on nearby pets.",
  "buff-cluster": "Increases gem value based on nearby pets.",
  "buff-overclock": "Greatly increases speed but risks disabling the pet.",
  "buff-refine": "Greatly increases gem value but slows production.",
  "buff-unstable": "High multiplier chances but also risk of no gems.",
  "buff-gamble": "All or nothing - huge value boost or no gems at all.",
};

const getBuffDisplay = (buff: PlacedBuff) => {
  // Return the most prominent buff effect
  // STAR buffs always show first
  if (buff.type === "star" && buff.starLevel) {
    return { emoji: "⭐", description: `Merged Pet Bonus` };
  }
  // Check UNSTABLE (triple + double + noGem)
  if (buff.tripleGemChance && buff.doubleGemChance && buff.noGemChance) {
    return { emoji: "⚠️", description: `Unstable Multi-Gem Buff` };
  }
  // Check combo buffs (JACKPOT, OVERDRIVE, etc.)
  if (buff.tripleGemChance && buff.doubleGemChance) {
    return { emoji: "🎆", description: `Combo Multiplier Buff` };
  }
  if (buff.gemValueMultiplier && buff.gemValueMultiplier > 1) {
    return { emoji: "💎", description: `+${Math.round((buff.gemValueMultiplier - 1) * 100)}% Gem Value` };
  }
  if (buff.tickSpeedMultiplier && buff.tickSpeedMultiplier < 1) {
    return { emoji: "⚡", description: `+${Math.round((1 - buff.tickSpeedMultiplier) * 100)}% Gem Production Speed` };
  }
  if (buff.nextTierChanceBonus) {
    return { emoji: "⬆️", description: `+${Math.round(buff.nextTierChanceBonus * 100)}% Gem Rarity Chance` };
  }
  if (buff.tripleGemChance) {
    return { emoji: "💫", description: `+${(buff.tripleGemChance * 100).toFixed(1)}% Triple Gem Chance` };
  }
  if (buff.doubleGemChance) {
    return { emoji: "✨", description: `+${(buff.doubleGemChance * 100).toFixed(1)}% Double Gem Chance` };
  }
  return { emoji: "❓", description: "Unknown buff" };
};

const getBuffDisplays = (buff: PlacedBuff) => {
  console.log('[BuffInfoPopup] getBuffDisplays called with buff:', buff);
  console.log('[BuffInfoPopup] Buff type:', buff.type);
  console.log('[BuffInfoPopup] Buff id:', buff.id);
  console.log('[BuffInfoPopup] Buff name:', buff.name);
  
  const displays: { emoji: string; description: string }[] = [];
  const buffName = buff.name;
  
  // Helper to format with color
  const green = (text: string) => `<span class="text-green-400">${text}</span>`;
  const red = (text: string) => `<span class="text-red-400">${text}</span>`;
  
  // STAR buff (merge rewards) - Always display first
  if (buff.type === "star" && buff.starLevel) {
    console.log('[BuffInfoPopup] STAR buff detected:', buff);
    console.log('[BuffInfoPopup] capacityBonus:', buff.capacityBonus);
    console.log('[BuffInfoPopup] buffEffectivenessBonus:', buff.buffEffectivenessBonus);
    console.log('[BuffInfoPopup] tickSpeedMultiplier:', buff.tickSpeedMultiplier);
    
    // First line: Buff name only
    displays.push({ emoji: "⭐", description: `${buffName}` });
    // Remaining lines: Each effect on its own line
    if (buff.capacityBonus) {
      displays.push({ emoji: "📦", description: `${green(`+${Math.round(buff.capacityBonus * 100)}% Gem Capacity`)}` });
    }
    if (buff.buffEffectivenessBonus) {
      displays.push({ emoji: "✨", description: `${green(`+${Math.round(buff.buffEffectivenessBonus * 100)}% Buff Effectiveness`)}` });
    }
    if (buff.tickSpeedMultiplier && buff.tickSpeedMultiplier < 1) {
      displays.push({ emoji: "⚡", description: `${green(`+${Math.round((1 - buff.tickSpeedMultiplier) * 100)}% Gem Production Speed`)}` });
    }
    console.log('[BuffInfoPopup] STAR displays:', displays);
  }
  
  // Value multipliers (LURE, REFINE, BURNOUT, EXHAUST)
  if (buff.gemValueMultiplier && buff.gemValueMultiplier > 1) {
    displays.push({ emoji: "💎", description: `${buffName} (${green('+' + Math.round((buff.gemValueMultiplier - 1) * 100) + '% Gem Value')})` });
  }
  
  // Speed multipliers (SPEED, OVERCLOCK, REFINE, BURST, OVERDRIVE, SURGE, FRENZY, HYPERDRIVE) - Skip if star buff
  if (buff.type !== "star" && buff.tickSpeedMultiplier && buff.tickSpeedMultiplier < 1) {
    displays.push({ emoji: "⚡", description: `${buffName} (${green('+' + Math.round((1 - buff.tickSpeedMultiplier) * 100) + '% Speed')})` });
  } else if (buff.type !== "star" && buff.tickSpeedMultiplier && buff.tickSpeedMultiplier > 1) {
    displays.push({ emoji: "🐌", description: `${buffName} (${red('-' + Math.round((buff.tickSpeedMultiplier - 1) * 100) + '% Speed')})` });
  }
  
  // Tier chance (LUCK, FORTUNE, STRAIN, HYPERDRIVE)
  if (buff.nextTierChanceBonus && !buff.tierChancePerNearbyPet) {
    displays.push({ emoji: "⬆️", description: `${buffName} (${green('+' + Math.round(buff.nextTierChanceBonus * 100) + '% Tier Upgrade')})` });
  }
  
  // GAMBLE, QUADRUPLE - removed (buffs no longer exist)
  
  // UNSTABLE (triple, double, and NO GEM chance) - Check before individual multipliers
  if (buff.tripleGemChance && buff.doubleGemChance && buff.noGemChance) {
    displays.push({ emoji: "⚠️", description: `${buffName} (${green('+' + (buff.tripleGemChance * 100).toFixed(1) + '% Triple')}, ${green('+' + (buff.doubleGemChance * 100).toFixed(1) + '% Double')}, ${red('+' + Math.round(buff.noGemChance * 100) + '% No Gems')})` });
  }
  // Combo buffs with multiple gem chances (JACKPOT, OVERDRIVE)
  else if (buff.tripleGemChance && buff.doubleGemChance) {
    let parts: string[] = [];
    if (buff.tripleGemChance) parts.push(green('+' + (buff.tripleGemChance * 100).toFixed(1) + '% Triple'));
    if (buff.doubleGemChance) parts.push(green('+' + (buff.doubleGemChance * 100).toFixed(1) + '% Double'));
    displays.push({ emoji: "🎆", description: `${buffName} (${parts.join(', ')})` });
  }
  // Triple chance alone (TRIPLE)
  else if (buff.tripleGemChance) {
    displays.push({ emoji: "💫", description: `${buffName} (${green('+' + (buff.tripleGemChance * 100).toFixed(1) + '% Triple Gems')})` });
  }
  // Double chance alone (DOUBLE)
  else if (buff.doubleGemChance) {
    displays.push({ emoji: "✨", description: `${buffName} (${green('+' + (buff.doubleGemChance * 100).toFixed(1) + '% Double Gems')})` });
  }
  
  // ECHO buff (tier chance per nearby pet)
  if (buff.tierChancePerNearbyPet) {
    const gridSize = buff.areaRadius === 2 ? "5x5" : "3x3";
    displays.push({ emoji: "🌐", description: `${buffName} (${green('+' + (buff.tierChancePerNearbyPet * 100).toFixed(1) + '% Tier per Pet')} in ${gridSize})` });
  }
  
  // CLUSTER buff (value per nearby pet)
  if (buff.valuePerNearbyPet) {
    const gridSize = buff.areaRadius === 2 ? "5x5" : "3x3";
    displays.push({ emoji: "🔗", description: `${buffName} (${green('+' + (buff.valuePerNearbyPet * 100).toFixed(0) + '% Value per Pet')} in ${gridSize})` });
  }
  
  // OVERCLOCK (disable risk)
  if (buff.overclockFailChance && buff.overclockDisableDuration) {
    displays.push({ emoji: "💢", description: `${buffName} (${red(Math.round(buff.overclockFailChance * 100) + '% Disable ' + buff.overclockDisableDuration + 's')})` });
  }
  
  // SURGE (skip risk)
  if (buff.surgeSkipChance && buff.surgeSkipCount) {
    displays.push({ emoji: "🌪️", description: `${buffName} (${red(Math.round(buff.surgeSkipChance * 100) + '% Skip ' + buff.surgeSkipCount + ' Gens')})` });
  }
  
  // BURNOUT (disable risk)
  if (buff.burnoutFailChance && buff.burnoutDisableDuration) {
    displays.push({ emoji: "🔥", description: `${buffName} (${red(Math.round(buff.burnoutFailChance * 100) + '% Disable ' + buff.burnoutDisableDuration + 's')})` });
  }
  
  // STRAIN (disable risk)
  if (buff.strainFailChance && buff.strainDisableDuration) {
    displays.push({ emoji: "😰", description: `${buffName} (${red(Math.round(buff.strainFailChance * 100) + '% Disable ' + buff.strainDisableDuration + 's')})` });
  }
  
  // HYPERDRIVE (disable risk)
  if (buff.hyperdriveFailChance && buff.hyperdriveDisableDuration) {
    displays.push({ emoji: "🚀", description: `${buffName} (${red(Math.round(buff.hyperdriveFailChance * 100) + '% Disable ' + buff.hyperdriveDisableDuration + 's')})` });
  }
  
  // MELTDOWN - removed (properties no longer exist)
  
  // FRENZY - removed (properties no longer exist)
  
  // EXHAUST (cycle with value boost)
  if (buff.exhaustGenerationCount && buff.exhaustDisableDuration && buff.exhaustValueMultiplier) {
    displays.push({ emoji: "💤", description: `${buffName} (${green(buff.exhaustGenerationCount + ' Gens')}, then ${red('Disable ' + buff.exhaustDisableDuration + 's')})` });
  }
  
  if (displays.length === 0) displays.push({ emoji: "❓", description: "Unknown buff" });
  return displays;
};

export default function BuffInfoPopup({ buff, onClose, scale = 1 }: BuffInfoPopupProps) {
  const [progressData, setProgressData] = useState(() => {
    const now = Date.now() / 1000;
    const last = buff.lastMoved ?? now;
    const total = buff.moveInterval || 0;
    const elapsed = Math.max(0, now - last);
    const timeLeft = Math.max(0, total - elapsed);
    const progress = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100;
    return { progress, timeLeft, total };
  });

  const buffRef = useRef(buff);
  buffRef.current = buff;

  useEffect(() => {
    const update = () => {
      const now = Date.now() / 1000;
      const last = buffRef.current.lastMoved ?? now;
      const total = buffRef.current.moveInterval || 0;
      if (total <= 0) {
        setProgressData({ progress: 100, timeLeft: 0, total });
        return;
      }
      const elapsed = Math.max(0, now - last);
      const timeLeft = Math.max(0, total - elapsed);
      const progress = Math.min(100, (elapsed / total) * 100);
      setProgressData({ progress, timeLeft, total });
    };

    update();
    const iv = setInterval(update, 100);
    return () => clearInterval(iv);
  }, [buff.instanceId]);

  const display = getBuffDisplay(buff);
  const [hoveredBuff, setHoveredBuff] = useState<string | null>(null);
  const displays = getBuffDisplays(buff);

  // Extract base buff type from ID (e.g., "buff-lure-1" -> "buff-lure")
  const baseBuffType = buff.id.split("-").slice(0, 2).join("-");
  const desc = buffDescriptions[baseBuffType] ?? display.description;

  return (
    <>
      {/* Popup wrapper (fixed size independent of zoom) */}
      <div className="flex flex-col gap-1 cursor-pointer" onClick={onClose}>
        {/* Top row: Info + Buffs */}
        <div className="flex gap-1 items-stretch">
          {/* Information container */}
          <div className="w-52 bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 p-4">
            {/* Name */}
            <h2 className="text-xl font-bold text-white leading-tight">
              {buff.name}
            </h2>
            
            {/* Rarity subtitle */}
            <p className={`text-sm font-medium ${rarityTextColors[buff.rarity]} capitalize`}>
              {buff.rarity}
            </p>

            {/* Divider */}
            <hr className="my-3 border-zinc-600" />

                      {/* Description */}
                      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>

                      {/* Existence stat (placeholder) */}
                      <div className="mt-3">
                        <div className="text-white font-bold text-lg">1 Exists</div>
                      </div>
          </div>

          {/* Buffs container */}
          <div className="bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 p-2 flex flex-col gap-1">
            {displays.length === 0 ? (
              <div className="w-8 h-8 bg-zinc-700 rounded border border-zinc-600 flex items-center justify-center">
                <span className="text-xs text-zinc-500">No buffs</span>
              </div>
            ) : (
              displays.map((d, index) => {
                return (
                  <div
                    key={index}
                    className="relative"
                    onMouseEnter={() => setHoveredBuff(`buff-${index}`)}
                    onMouseLeave={() => setHoveredBuff(null)}
                  >
                    <div className="w-8 h-8 bg-zinc-700 rounded border border-zinc-600 flex items-center justify-center cursor-help hover:bg-zinc-600 transition-colors">
                      <span className="text-xs">{d.emoji}</span>
                    </div>

                    {/* Buff tooltip */}
                    {hoveredBuff === `buff-${index}` && (
                      <div className="absolute left-full top-0 ml-1 bg-zinc-900 rounded-lg px-2 py-1 border border-zinc-600 shadow-lg z-10 whitespace-nowrap">
                        <p 
                          className="text-xs text-white font-semibold"
                          dangerouslySetInnerHTML={{ __html: d.description }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Progress bar container */}
        <div className="bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 p-3">
          <div className="text-xs text-zinc-400 mb-1">
            <span>Buff Duration...</span>
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
