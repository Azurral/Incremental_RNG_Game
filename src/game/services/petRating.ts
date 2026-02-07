// src/game/services/petRating.ts
import { Pet, PetRarity } from "../types/pet";
import { Buff } from "../types/buff";

/**
 * Get the maximum possible buffs for a pet rarity
 */
function getMaxBuffsForRarity(rarity: PetRarity): number {
  const maxBuffs = {
    common: 3,
    rare: 5,
    epic: 7,
    legendary: 9,
    mythical: 999, // No limit
  };
  return maxBuffs[rarity] || 0;
}

/**
 * Get buff rarity score (higher = rarer/better)
 */
function getBuffRarityScore(buff: Buff): number {
  const rarityScores: Record<string, number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    mythical: 5,
  };
  return rarityScores[buff.rarity] || 1;
}

/**
 * Extract buff level from buff name (e.g., "LURE I" -> 1)
 */
function extractBuffLevel(buff: Buff): number {
  const match = buff.name.match(/([IV]+)$/);
  if (!match) return 1;
  
  const roman = match[1];
  const romanMap: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5 };
  return romanMap[roman] || 1;
}

/**
 * Get required Level V buffs for 5-star rating based on pet rarity
 */
function getRequiredLevelVBuffs(rarity: PetRarity): number {
  const requirements = {
    common: 3,
    rare: 4,
    epic: 5,
    legendary: 7,
    mythical: 9,
  };
  return requirements[rarity] || 3;
}

/**
 * Calculate star rating based purely on buff quality
 * Star rating depends on:
 * 1. How many buffs you have (closer to required Level V count)
 * 2. Quality of those buffs (higher levels)
 */
export function calculatePetStars(pet: Pet): number {
  // Pets with no buffs get 1 star
  if (!pet.buffs || pet.buffs.length === 0) {
    return 1;
  }

  // Filter out STAR buffs - only count regular buffs for star rating
  const buffs = pet.buffs.filter(b => b.type !== "star");
  
  // If no regular buffs remain, return 1 star
  if (buffs.length === 0) {
    return 1;
  }

  const requiredLevelV = getRequiredLevelVBuffs(pet.rarity);
  
  // Count Level V buffs
  const levelVCount = buffs.filter(b => extractBuffLevel(b) === 5).length;
  
  // Calculate average buff level across all buffs
  const avgLevel = buffs.reduce((sum, b) => sum + extractBuffLevel(b), 0) / buffs.length;
  
  // Calculate progress toward required Level V buffs (0-100%)
  const buffCountProgress = buffs.length / requiredLevelV;
  
  // 5 STARS: Has required Level V buffs AND average level is high (4.5+)
  // This ensures a pet with 3 Level V + 1 Level I won't get 5 stars
  if (levelVCount >= requiredLevelV && avgLevel >= 4.5) {
    return 5;
  }
  
  // 4 STARS: Has at least 75% of required buff count AND good average level (3.5+)
  // OR has most Level V buffs needed
  if ((buffCountProgress >= 0.75 && avgLevel >= 3.5) || 
      (levelVCount >= Math.ceil(requiredLevelV * 0.75))) {
    return 4;
  }
  
  // 3 STARS: Has at least 50% of required buff count AND decent average (2.5+)
  // OR has some Level V buffs
  if ((buffCountProgress >= 0.50 && avgLevel >= 2.5) || 
      (levelVCount >= Math.ceil(requiredLevelV * 0.4))) {
    return 3;
  }
  
  // 2 STARS: Has at least 33% of required buff count AND some quality (2.0+)
  // OR has at least 2+ buffs with decent average
  if ((buffCountProgress >= 0.33 && avgLevel >= 2.0) || 
      (buffs.length >= 2 && avgLevel >= 2.0)) {
    return 2;
  }
  
  // 1 STAR: Poor quality - few buffs or low levels
  return 1;
}

/**
 * Calculate quality score for a pet's buffs (0-100) - for display purposes
 */
export function calculatePetQualityScore(pet: Pet): number {
  if (!pet.buffs || pet.buffs.length === 0) {
    return 0;
  }

  // Filter out STAR buffs - only count regular buffs for quality score
  const buffs = pet.buffs.filter(b => b.type !== "star");
  
  if (buffs.length === 0) {
    return 0;
  }

  const requiredLevelV = getRequiredLevelVBuffs(pet.rarity);
  const levelVCount = buffs.filter(b => extractBuffLevel(b) === 5).length;
  const avgLevel = buffs.reduce((sum, b) => sum + extractBuffLevel(b), 0) / buffs.length;
  
  // Score based on Level V progress (0-70 points)
  const levelVScore = Math.min(70, (levelVCount / requiredLevelV) * 70);
  
  // Score based on average level (0-30 points)
  const avgLevelScore = (avgLevel / 5) * 30;
  
  return Math.round(levelVScore + avgLevelScore);
}

/**
 * Get star rating text description
 */
export function getStarRatingText(stars: number): string {
  const ratings = {
    5: "Exceptional",
    4: "Great",
    3: "Good",
    2: "Fair",
    1: "Poor",
  };
  return ratings[stars as keyof typeof ratings] || "Unknown";
}
