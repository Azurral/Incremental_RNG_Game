// src/game/services/crate.ts
import { Pet, PetRarity } from "../types/pet";
import { Buff } from "../types/buff";
import { CrateRarity, CrateDrop } from "../types/crate";
import { crateDrops } from "../constants/crates";
import { generatorPetTemplates } from "../constants/pets";
import { buffs as allBuffs } from "../constants/buffs";

/**
 * Roll for a random buff level based on pet rarity
 * Lower rarity pets have much lower chances of getting high level buffs
 */
function rollBuffLevel(petRarity: PetRarity): number {
  const roll = Math.random();
  
  switch (petRarity) {
    case "common":
      // Common: heavily weighted toward Level I
      if (roll < 0.70) return 1; // 70%
      if (roll < 0.90) return 2; // 20%
      if (roll < 0.97) return 3; // 7%
      if (roll < 0.995) return 4; // 2.5%
      return 5; // 0.5%
      
    case "rare":
      // Rare: good chance for I-II, low for high levels
      if (roll < 0.50) return 1; // 50%
      if (roll < 0.80) return 2; // 30%
      if (roll < 0.93) return 3; // 13%
      if (roll < 0.98) return 4; // 5%
      return 5; // 2%
      
    case "epic":
      // Epic: Level I focused, lower Level V chance
      if (roll < 0.40) return 1; // 40%
      if (roll < 0.62) return 2; // 22%
      if (roll < 0.80) return 3; // 18%
      if (roll < 0.95) return 4; // 15%
      return 5; // 5%
      
    case "legendary":
      // Legendary: Level I focused, moderate high level chance
      if (roll < 0.35) return 1; // 35%
      if (roll < 0.56) return 2; // 21%
      if (roll < 0.76) return 3; // 20%
      if (roll < 0.925) return 4; // 16.5%
      return 5; // 7.5%
      
    case "mythical":
      // Mythical: Level I focused, balanced distribution
      if (roll < 0.30) return 1; // 30%
      if (roll < 0.50) return 2; // 20%
      if (roll < 0.70) return 3; // 20%
      if (roll < 0.90) return 4; // 20%
      return 5; // 10%
      
    default:
      // Fallback to old system
      if (roll < 0.50) return 1;
      if (roll < 0.75) return 2;
      if (roll < 0.90) return 3;
      if (roll < 0.97) return 4;
      return 5;
  }
}

/**
 * Get a buff by type and level
 */
function getBuffByTypeAndLevel(type: string, level: number): Buff | null {
  const buffId = `buff-${type}-${level}`;
  return allBuffs.find(b => b.id === buffId) || null;
}

/**
 * Get available buff levels for a buff type
 */
function getMaxBuffLevel(type: string): number {
  // All buff types now have 5 levels
  return 5;
}

/**
 * Roll a random buff with appropriate level cap based on pet rarity
 */
function rollRandomBuff(type: string, petRarity: PetRarity): Buff | null {
  const maxLevel = getMaxBuffLevel(type);
  let level = rollBuffLevel(petRarity);
  level = Math.min(level, maxLevel); // Cap at max available level
  return getBuffByTypeAndLevel(type, level);
}

/**
 * Determine how many buffs a pet gets based on rarity
 * Common: 1-3, Rare: 1-4, Epic: 1-5, Legendary: 1-6, Mythical: 1-7
 * (No buff limit after merging, but initial generation follows these limits)
 */
function rollBuffCount(petRarity: PetRarity): number {
  const roll = Math.random() * 100;
  
  switch (petRarity) {
    case "common":
      // 1-3 buffs
      if (roll < 50) return 1; // 50%
      if (roll < 85) return 2; // 35%
      return 3; // 15%
      
    case "rare":
      // 1-4 buffs
      if (roll < 30) return 1; // 30%
      if (roll < 60) return 2; // 30%
      if (roll < 85) return 3; // 25%
      return 4; // 15%
      
    case "epic":
      // 1-5 buffs
      if (roll < 20) return 1; // 20%
      if (roll < 45) return 2; // 25%
      if (roll < 70) return 3; // 25%
      if (roll < 90) return 4; // 20%
      return 5; // 10%
      
    case "legendary":
      // 1-6 buffs
      if (roll < 15) return 1; // 15%
      if (roll < 35) return 2; // 20%
      if (roll < 55) return 3; // 20%
      if (roll < 75) return 4; // 20%
      if (roll < 90) return 5; // 15%
      return 6; // 10%
      
    case "mythical":
      // 1-7 buffs
      if (roll < 10) return 1; // 10%
      if (roll < 25) return 2; // 15%
      if (roll < 42) return 3; // 17%
      if (roll < 60) return 4; // 18%
      if (roll < 78) return 5; // 18%
      if (roll < 92) return 6; // 14%
      return 7; // 8%
      
    default:
      return 1;
  }
}

/**
 * Get all available buff types (except those already on pet)
 */
function getAvailableBuffTypes(existingTypes: string[]): string[] {
  const allTypes = ["speed", "lure", "luck", "double", "triple", "echo", "cluster", "overclock", "refine", "unstable", "gamble", "surge", "frenzy", "strain", "burnout", "meltdown", "hyperdrive", "exhaust", "resilience", "fortify", "stabilizer", "regulator"];
  return allTypes.filter(t => !existingTypes.includes(t));
}

/**
 * Categorize buff types by power tier
 */
function getBuffTier(buffType: string): "basic" | "advanced" | "premium" | "ultimate" | "extreme" | "defensive" | "conditional" {
  const tiers = {
    basic: ["lure", "speed", "luck", "double"],
    advanced: ["triple", "refine"],
    premium: ["cluster", "echo", "overclock"],
    ultimate: ["unstable", "gamble"],
    extreme: ["surge", "frenzy", "strain", "burnout", "meltdown", "hyperdrive", "exhaust"],
    defensive: ["resilience", "fortify"],
    conditional: ["stabilizer", "regulator"],
  };
  
  if (tiers.basic.includes(buffType)) return "basic";
  if (tiers.advanced.includes(buffType)) return "advanced";
  if (tiers.premium.includes(buffType)) return "premium";
  if (tiers.ultimate.includes(buffType)) return "ultimate";
  if (tiers.defensive.includes(buffType)) return "defensive";
  if (tiers.conditional.includes(buffType)) return "conditional";
  return "extreme";
}

/**
 * Get weight for a buff type based on pet rarity
 */
function getBuffTypeWeight(buffType: string, petRarity: PetRarity): number {
  const tier = getBuffTier(buffType);
  
  switch (petRarity) {
    case "common":
      // Common pets: heavily favor basic buffs
      if (tier === "basic") return 100;
      if (tier === "advanced") return 5;
      if (tier === "premium") return 1;
      if (tier === "ultimate") return 0.1;
      if (tier === "defensive") return 2; // Defensive buffs uncommon
      if (tier === "conditional") return 0; // Conditional buffs impossible
      return 0; // Extreme buffs impossible
      
    case "rare":
      // Rare pets: good chance for basic/advanced, low for premium
      if (tier === "basic") return 70;
      if (tier === "advanced") return 25;
      if (tier === "premium") return 4;
      if (tier === "ultimate") return 1;
      if (tier === "defensive") return 5; // Defensive buffs low chance
      if (tier === "conditional") return 0.1; // Conditional buffs extremely rare
      return 0.1; // Extreme buffs extremely rare
      
    case "epic":
      // Epic pets: balanced, decent chance for all
      if (tier === "basic") return 40;
      if (tier === "advanced") return 30;
      if (tier === "premium") return 25;
      if (tier === "ultimate") return 4;
      if (tier === "defensive") return 8; // Defensive buffs decent chance
      if (tier === "conditional") return 5; // Conditional buffs uncommon
      return 1; // Extreme buffs rare
      
    case "legendary":
      // Legendary pets: favor advanced/premium/extreme
      if (tier === "basic") return 15;
      if (tier === "advanced") return 25;
      if (tier === "premium") return 30;
      if (tier === "ultimate") return 20;
      if (tier === "defensive") return 12; // Defensive buffs good chance
      if (tier === "conditional") return 10; // Conditional buffs decent chance
      return 10; // Extreme buffs decent chance
      
    case "mythical":
      // Mythical pets: best chance for premium/ultimate/extreme
      if (tier === "basic") return 5;
      if (tier === "advanced") return 15;
      if (tier === "premium") return 30;
      if (tier === "ultimate") return 30;
      if (tier === "defensive") return 15; // Defensive buffs common
      if (tier === "conditional") return 15; // Conditional buffs common
      return 20; // Extreme buffs common
      
    default:
      return 1;
  }
}

/**
 * Select a random buff type with weighted probabilities based on pet rarity
 */
function selectWeightedBuffType(availableTypes: string[], petRarity: PetRarity): string {
  const weights = availableTypes.map(type => getBuffTypeWeight(type, petRarity));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < availableTypes.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return availableTypes[i];
  }
  
  // Fallback (shouldn't happen)
  return availableTypes[0];
}

/**
 * Generate random buffs for a pet (NO innate buffs, pure RNG)
 */
function generateRandomBuffs(petRarity: PetRarity): Buff[] {
  const buffCount = rollBuffCount(petRarity);
  console.log('[BuffGen] Rarity:', petRarity, '- Rolling for', buffCount, 'buffs');
  const buffs: Buff[] = [];
  const usedTypes: string[] = [];
  
  for (let i = 0; i < buffCount; i++) {
    const available = getAvailableBuffTypes(usedTypes);
    if (available.length === 0) {
      console.log('[BuffGen] No more buff types available');
      break; // Max 25 unique buff types
    }
    
    // Use weighted selection based on pet rarity
    const randomType = selectWeightedBuffType(available, petRarity);
    const buff = rollRandomBuff(randomType, petRarity);
    if (buff) {
      console.log('[BuffGen] Added buff:', buff.name);
      buffs.push(buff);
      usedTypes.push(randomType);
    } else {
      console.log('[BuffGen] Failed to get buff for type:', randomType);
    }
  }
  
  // Ensure at least 1 buff is always generated
  if (buffs.length === 0) {
    console.log('[BuffGen] No buffs generated, adding fallback SPEED I buff');
    const fallbackBuff = getBuffByTypeAndLevel('speed', 1);
    if (fallbackBuff) {
      buffs.push(fallbackBuff);
    }
  }
  
  console.log('[BuffGen] Final buff count:', buffs.length, '/', buffCount);
  return buffs;
}

/**
 * Create a generator pet with only random buffs (no innate buffs)
 */
function createGeneratorPet(petId: string): Pet {
  const template = generatorPetTemplates[petId];
  if (!template) throw new Error(`Unknown pet ID: ${petId}`);
  
  console.log('[CreatePet] Creating pet:', template.name, '(', template.rarity, ')');
  
  // Roll random buffs based on pet rarity (no innate buffs)
  const randomBuffs = generateRandomBuffs(template.rarity);
  
  console.log('[CreatePet] Pet', template.name, 'created with', randomBuffs.length, 'buffs:', randomBuffs.map(b => b.name).join(', '));
  
  const now = Math.floor(Date.now() / 1000);
  return {
    ...template,
    id: `${petId}-${Date.now()}-${Math.random()}`,
    buffs: randomBuffs,
    lastGenerated: now,
    currentGems: 0, // Start with empty capacity
  };
}

/**
 * Open a crate and get a pet (recursive for downgrades)
 */
export function openCrate(crateRarity: CrateRarity): Pet {
  const drops = crateDrops[`crate-${crateRarity}`];
  if (!drops) throw new Error(`Unknown crate: ${crateRarity}`);
  
  // Calculate total weight
  const totalWeight = drops.reduce((sum, drop) => sum + drop.weight, 0);
  const roll = Math.random() * totalWeight;
  
  // Select drop
  let cumulative = 0;
  for (const drop of drops) {
    cumulative += drop.weight;
    if (roll <= cumulative) {
      // Check if downgrade
      if (drop.type === "downgrade" && drop.downgradeTo) {
        return openCrate(drop.downgradeTo);
      }
      
      // Create generator pet (all pets are now generators)
      if (drop.petId) {
        return createGeneratorPet(drop.petId);
      }
    }
  }
  
  // Fallback (shouldn't happen)
  throw new Error("Failed to open crate");
}
