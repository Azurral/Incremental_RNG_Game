// src/game/services/star.ts
import { Buff } from "../types/buff";
import { buffs } from "../constants/buffs";

/**
 * Get the appropriate star buff based on star rating
 */
export function getStarBuff(starRating: number): Buff | null {
  if (starRating < 2 || starRating > 5) {
    return null;
  }
  
  const buffId = `buff-star-${starRating}`;
  const starBuff = buffs.find(b => b.id === buffId);
  
  return starBuff || null;
}

/**
 * Add or update a star buff on a pet based on its star rating
 */
export function addStarBuffToPet(pet: any, starRating: number): void {
  if (!pet.buffs) {
    pet.buffs = [];
  }
  
  // Remove any existing star buffs
  pet.buffs = pet.buffs.filter((b: Buff) => b.type !== "star");
  
  // Add new star buff if applicable
  if (starRating >= 2) {
    const starBuff = getStarBuff(starRating);
    if (starBuff) {
      pet.buffs.unshift(starBuff); // Add at beginning so it displays first
    }
  }
}

/**
 * Calculate the effective max gem capacity with star buff bonuses
 */
export function calculateEffectiveCapacity(baseCapacity: number, buffs: Buff[]): number {
  const starBuff = buffs.find(b => b.type === "star");
  if (!starBuff || !starBuff.capacityBonus) {
    return baseCapacity;
  }
  
  return Math.round(baseCapacity * (1 + starBuff.capacityBonus));
}

/**
 * Get the buff effectiveness multiplier from star buffs
 */
export function getBuffEffectivenessMultiplier(buffs: Buff[]): number {
  const starBuff = buffs.find(b => b.type === "star");
  if (!starBuff || !starBuff.buffEffectivenessBonus) {
    return 1.0;
  }
  
  return 1.0 + starBuff.buffEffectivenessBonus;
}
