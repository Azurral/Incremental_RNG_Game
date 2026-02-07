// src/game/types/buff.ts

export type BuffRarity = "common" | "rare" | "epic" | "legendary" | "mythical";
export type BuffType = "lure" | "speed" | "luck" | "double" | "triple" | "echo" | "cluster" | "overclock" | "refine" | "unstable" | "surge" | "frenzy" | "strain" | "burnout" | "meltdown" | "hyperdrive" | "exhaust" | "burst" | "fortune" | "jackpot" | "overdrive" | "star";

export interface Buff {
  id: string;
  name: string;
  rarity: BuffRarity;
  type: BuffType;
  baseValue: number;                // Buff's sell/buy value
  
  // Value modifiers
  gemValueMultiplier?: number;      // e.g., 1.10 = +10% gem value (LURE)
  
  // Speed modifiers
  tickSpeedMultiplier?: number;     // e.g., 0.9 = 10% faster ticks (SPEED)
  
  // Rarity/Tier modifiers
  nextTierChanceBonus?: number;     // e.g., 0.05 = +5% chance to generate next-tier gems (LUCK)
  
  // Multiplier chances
  doubleGemChance?: number;         // e.g., 0.05 = 5% chance to double gems (DOUBLE)
  tripleGemChance?: number;         // e.g., 0.025 = 2.5% chance to triple gems (TRIPLE)
  noGemChance?: number;             // e.g., 0.15 = 15% chance to get no gems (UNSTABLE)
  
  // Conditional modifiers
  valuePerNearbyPet?: number;       // e.g., 0.05 = +5% value per nearby pet (CLUSTER)
  tierChancePerNearbyPet?: number;  // e.g., 0.025 = +2.5% tier chance per nearby pet (ECHO)
  
  // Overclock mechanic
  overclockFailChance?: number;     // e.g., 0.10 = 10% chance to disable pet (OVERCLOCK)
  overclockDisableDuration?: number; // e.g., 80 = disable for 80 seconds (OVERCLOCK)
  
  // Surge mechanic
  surgeSkipChance?: number;         // e.g., 0.15 = 15% chance to skip next generations (SURGE)
  surgeSkipCount?: number;          // e.g., 2 = skip 2 generations (SURGE)
  
  // Frenzy mechanic - guaranteed double with disable risk
  frenzyDisableChance?: number;     // e.g., 0.20 = 20% chance to disable (FRENZY)
  frenzyDisableDuration?: number;   // e.g., 45 = disable for 45 seconds (FRENZY)

  // Generic disable fields used by some buff definitions/scripts
  disableChance?: number;           // e.g., 0.10 = 10% chance to disable (generic)
  disableMinDuration?: number;      // e.g., 60 = minimum disable duration in seconds
  disableMaxDuration?: number;      // e.g., 80 = maximum disable duration in seconds
  
  // Strain mechanic
  strainFailChance?: number;        // e.g., 0.25 = 25% chance to disable (STRAIN)
  strainDisableDuration?: number;   // e.g., 90 = disable for 90 seconds (STRAIN)
  
  // Burnout mechanic
  burnoutFailChance?: number;       // e.g., 0.20 = 20% chance to disable (BURNOUT)
  burnoutDisableDuration?: number;  // e.g., 90 = disable for 90 seconds (BURNOUT)
  
  // Star buff mechanic (merge rewards)
  starLevel?: number;               // 2-5 stars (★★ to ★★★★★)
  capacityBonus?: number;           // e.g., 0.25 = +25% max capacity
  buffEffectivenessBonus?: number;  // e.g., 0.15 = +15% to all buff values
  
  // Meltdown mechanic - guaranteed triple with disable risk
  meltdownDisableChance?: number;   // e.g., 0.30 = 30% chance to disable (MELTDOWN)
  meltdownDisableDuration?: number; // e.g., 90 = disable for 90 seconds (MELTDOWN)
  
  // Hyperdrive mechanic
  hyperdriveFailChance?: number;    // e.g., 0.30 = 30% chance to disable (HYPERDRIVE)
  hyperdriveDisableDuration?: number; // e.g., 180 = disable for 180 seconds (HYPERDRIVE)
  
  // Exhaust mechanic
  exhaustGenerationCount?: number;  // e.g., 5 = disable every 5th generation (EXHAUST)
  exhaustDisableDuration?: number;  // e.g., 45 = disable for 45 seconds (EXHAUST)
  exhaustValueMultiplier?: number;  // e.g., 2.0 = 2x value (EXHAUST)
  
  areaRadius?: number;              // 1 = 3x3, 2 = 5x5 (buff is center), undefined/0 = no AOE
  moveInterval: number;             // Seconds between teleports
}

// Buff instance placed on grid
export interface PlacedBuff extends Buff {
  instanceId: string;               // Unique instance ID
  position?: { x: number; y: number }; // Current position on grid (undefined = in inventory)
  lastMoved?: number;               // Timestamp of last movement
}
