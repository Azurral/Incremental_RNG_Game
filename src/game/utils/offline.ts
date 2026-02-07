// src/game/utils/offline.ts
// NOTE: This file now just re-exports from generator.ts for offline calculations
// The main generator handles both online and offline gem generation

import { Pet } from "../types/pet";
import { Gem } from "../types/gem";
import { Buff } from "../types/buff";
import { generateGems } from "../services/generator";

/**
 * Calculate offline gems - delegates to the main generator
 * Kept for backwards compatibility
 */
export function calculateOfflineGemsWithBuffs(
  pet: Pet,
  currentTime: number,
  buffs: Buff[] = [],
  offlineCapHours = 6
): Gem[] {
  return generateGems(pet, currentTime, buffs, offlineCapHours);
}
