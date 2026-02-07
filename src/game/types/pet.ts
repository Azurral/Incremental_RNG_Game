// src/game/types/pet.ts
import { Buff } from "./buff";

export type PetRarity = "common" | "rare" | "epic" | "legendary" | "mythical";

export interface Pet {
  id: string;
  name: string;
  rarity: PetRarity;
  baseGemRate: number;            // gems per tick (always 1 for all rarities)
  tickTimeRange: [number, number]; // seconds min-max per gem generation
  maxGemCapacity: number;         // maximum gems this pet can store
  currentGems?: number;           // current stored gems (0 by default)
  buffs?: Buff[];                 // optional buffs affecting this pet
  lastGenerated?: number;         // timestamp of last gem generation
  generationCount?: number;       // counter for cycle buffs (FRENZY/EXHAUST/MELTDOWN)
  
  // Overclock disable mechanic
  disabledUntil?: number;         // timestamp when pet will be re-enabled (for OVERCLOCK)
  
  // Lock mechanic
  locked?: boolean;               // if true, pet cannot be dragged or sold
  
  // Merge mechanic
  merged?: boolean;               // if true, pet was created via merging (no buff limit)
  starRating?: number;            // 1-5 stars (★ to ★★★★★), earned through merging
  
  // Legacy buff pet properties (no longer used, kept for backwards compatibility)
  providesBuffs?: Buff[];         // DEPRECATED: all pets are now generators
  buffRadius?: number;            // DEPRECATED: all pets are now generators
}
