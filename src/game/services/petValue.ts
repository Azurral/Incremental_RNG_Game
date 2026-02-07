// src/game/services/petValue.ts
import { Pet } from "../types/pet";
import { Buff } from "../types/buff";

// Base pet values by specific pet ID
const basePetValues: Record<string, number> = {
  // COMMON CRATE - Generator Pets
  "pet-hermit-crab": 400,              // 50% drop - Fastest common
  "pet-sea-urchin": 1500,              // 30% drop - Balanced
  "pet-tarnished-clam": 3400,          // 20% drop - Highest capacity common

  // RARE CRATE - Generator Pets
  "pet-polished-snail": 40000,         // 35% drop - Speedy rare
  "pet-tide-crawler": 50000,           // 25% drop - Volatile rare
  "pet-fracture-crab": 70000,          // 20% drop - Premium rare

  // EPIC CRATE - Generator Pets
  "pet-gilded-oyster": 300000,         // 35% drop - Fast epic
  "pet-pearl-nautilus": 425000,        // 18% drop - Balanced epic
  "pet-shiny-lobster": 600000,         // 12% drop - Premium epic

  // LEGENDARY CRATE - Generator Pets
  "pet-opaline-scallop": 3000000,             // 20% drop - Speed legendary
  "pet-crystalline-mantis-shrimp": 6500000,   // 12% drop - High stakes legendary
  "pet-prismatic-spider-crab": 12000000,      // 8% drop - Quality legendary

  // MYTHICAL CRATE - Generator Pets
  "pet-ancient-geodenum-turtle": 30000000,    // 10% drop - Reliable mythical
  "pet-cosmic-trilobite": 75000000,           // 6% drop - Balanced mythical
  "pet-voidwyrm-isopod": 135000000,           // 4% drop - ULTIMATE PET
};

// Buff values by type and level (base values before rarity multiplier)
const buffLevelValues: Record<string, number[]> = {
  // Basic Tier (I-V)
  speed: [1000, 2500, 10000, 250000, 8000000],
  luck: [1000, 2500, 15000, 400000, 12000000],
  double: [1000, 5000, 20000, 500000, 15000000],
  
  // Advanced Tier (I-V)
  triple: [5000, 25000, 750000, 18000000, 35000000],
  burst: [10000, 35000, 800000, 3000000, 22000000],
  fortune: [12000, 600000, 2500000, 20000000, 25000000],
  
  // Premium Tier (I-V)
  jackpot: [1500000, 4000000, 25000000, 38000000, 48000000],
  overdrive: [2000000, 5000000, 28000000, 40000000, 47000000],
  overclock: [15000, 900000, 3500000, 24000000, 42000000],
  
  // Ultimate Tier (I-V)
  unstable: [1200000, 3800000, 23000000, 32000000, 40000000],
  surge: [800000, 2800000, 19000000, 28000000, 38000000],
  frenzy: [1500000, 4500000, 26000000, 34000000, 44000000],
  
  // God Tier (I-V) - Highest tier buffs
  meltdown: [26000000, 33000000, 41000000, 45000000, 49000000],
  hyperdrive: [30000000, 36000000, 42000000, 44000000, 50000000],
};

/**
 * Get value multiplier based on pet rarity
 * Lower rarity pets get reduced value from high-level buffs
 */
function getBuffValueMultiplier(petRarity: string, buffLevel: number): number {
  // Multiplier decreases for lower rarities with higher buff levels
  const multipliers: Record<string, number[]> = {
    // Common: extremely nerfed for high levels (1% at V)
    common: [1.0, 0.4, 0.15, 0.05, 0.01], // Level I-V
    
    // Rare: heavily nerfed for high levels (10% at V)
    rare: [1.0, 0.7, 0.4, 0.2, 0.10], // Level I-V
    
    // Epic: moderately nerfed for high levels (25% at V)
    epic: [1.0, 0.8, 0.55, 0.35, 0.25], // Level I-V
    
    // Legendary: slightly nerfed for high levels (50% at V)
    legendary: [1.0, 0.9, 0.75, 0.60, 0.50], // Level I-V
    
    // Mythical: no nerfs, full value
    mythical: [1.0, 1.0, 1.0, 1.0, 1.0], // Level I-V
  };
  
  const rarityMultipliers = multipliers[petRarity] || multipliers.common;
  return rarityMultipliers[buffLevel - 1] || 1.0;
}

/**
 * Get the base value of a pet (without buffs)
 */
function getBasePetValue(petId: string): number {
  // Pet IDs are in format: "pet-name-words" + optional "-timestamp-randomid"
  // We need to match against the template keys in basePetValues
  // Try to find the longest matching key in basePetValues
  for (const templateId of Object.keys(basePetValues)) {
    if (petId.startsWith(templateId)) {
      return basePetValues[templateId];
    }
  }
  
  // Fallback: no matching template found
  console.warn('[PetValue] No base value found for pet ID:', petId);
  return 0;
}

/**
 * Get the value of a single buff (with rarity multiplier)
 */
function getBuffValue(buff: Buff, petRarity: string): number {
  // Extract buff type and level from buff name
  // e.g., "SPEED I" -> type: "speed", level: 1
  const nameParts = buff.name.split(" ");
  if (nameParts.length < 2) return 0;
  
  const type = nameParts[0].toLowerCase();
  const romanLevel = nameParts[1];
  
  const romanToNum: Record<string, number> = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
  };
  
  const level = romanToNum[romanLevel];
  if (!level) return 0;
  
  const values = buffLevelValues[type];
  if (!values) return 0;
  
  const baseValue = values[level - 1] || 0;
  const multiplier = getBuffValueMultiplier(petRarity, level);
  
  return Math.round(baseValue * multiplier);
}

/**
 * Calculate the total value of a pet
 */
export function calculatePetValue(pet: Pet): number {
  let total = getBasePetValue(pet.id);
  
  // Get pet rarity for buff value multiplier
  const petRarity = pet.rarity;
  
  // Add innate buff values (for generator pets)
  if (pet.buffs) {
    for (const buff of pet.buffs) {
      total += getBuffValue(buff, petRarity);
    }
  }
  
  // Add provided buff values (for buff pets)
  if (pet.providesBuffs) {
    for (const buff of pet.providesBuffs) {
      total += getBuffValue(buff, petRarity);
    }
  }
  
  return total;
}
