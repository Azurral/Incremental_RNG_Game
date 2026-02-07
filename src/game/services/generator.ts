// src/game/services/generator.ts
import { Pet } from "../types/pet";
import { Buff } from "../types/buff";
import { Gem } from "../types/gem";
import { gemsByRarity } from "../constants/gems";
import { GemRarity } from "../types/gem";
import { PetRarity } from "../types/pet";
import { LandGrid } from "../types/land";

// Tier order for RNG
const rarityOrder: GemRarity[] = [
  "common",
  "rare",
  "epic",
  "legendary",
  "mythical",
];

// Base tier upgrade chance per pet rarity (harder for rarer pets)
const baseTierUpgradeChance: Record<PetRarity, number> = {
  common: 0.10,     // 10% chance to get rare gem
  rare: 0.075,      // 7.5% chance to get epic gem
  epic: 0.05,       // 5% chance to get legendary gem
  legendary: 0.025, // 2.5% chance to get mythical gem
  mythical: 0,      // Can't go higher
};

/**
 * Count nearby pets around a position for ECHO and CLUSTER buffs
 */
function countNearbyPets(
  grid: LandGrid,
  position: { x: number; y: number },
  radius: number,
  excludePetId?: string
): number {
  let count = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = position.x + dx;
      const y = position.y + dy;
      if (x >= 0 && x < grid.width && y >= 0 && y < grid.height) {
        const tile = grid.tiles[y][x];
        if (tile.petId && tile.petId !== excludePetId) {
          count++;
        }
      }
    }
  }
  return count;
}

/**
 * Calculate speed penalty from STABILIZER/REGULATOR buffs
 */
function calculateSpeedPenalty(
  pet: Pet,
  buffs: Buff[],
  nearbyPets?: Pet[]
): number {
  // Speed penalty calculation removed (stabilizer/regulator buffs no longer exist)
  return 0;
}

export function generateGemForPetWithBuffs(
  pet: Pet,
  buffs: Buff[] = [],
  allPets?: Pet[],
  grid?: LandGrid,
  petPosition?: { x: number; y: number }
): Gem[] {
  const now = Math.floor(Date.now() / 1000);
  
  // Calculate speed penalty from conditional buffs (affects tick timing externally)
  // This value is used by the game loop to adjust tick intervals
  const speedPenaltyMultiplier = 1 + calculateSpeedPenalty(pet, buffs, allPets);
  // Store on pet for external access (game loop needs this)
  (pet as any).currentSpeedPenalty = speedPenaltyMultiplier;
  
  // Check if pet is disabled by OVERCLOCK, BURNOUT, STRAIN, MELTDOWN, HYPERDRIVE, or FRENZY/EXHAUST cycle
  if (pet.disabledUntil && now < pet.disabledUntil) {
    return [];
  }

  // Check for SURGE skip (skip generations without disable)
  const surgeBuff = buffs.find(b => b.type === "surge");
  if (surgeBuff && surgeBuff.surgeSkipChance && surgeBuff.surgeSkipCount) {
    if (Math.random() < surgeBuff.surgeSkipChance) {
      // Skip this generation, but don't update lastGenerated (allows re-roll on next check)
      return [];
    }
  }

  // Check for no gem chance (UNSTABLE)
  const noGemChance = buffs.reduce(
    (sum, b) => sum + (b.noGemChance ?? 0),
    0
  );
  if (noGemChance > 0 && Math.random() < noGemChance) {
    pet.lastGenerated = now;
    return [];
  }

  const petRarityIndex = rarityOrder.indexOf(pet.rarity);

  // Get base tier upgrade chance for this pet's rarity
  const baseChance = baseTierUpgradeChance[pet.rarity];
  
  // Get buff effectiveness multiplier from STAR buffs (doesn't change UI, just actual effect)
  const starBuff = buffs.find(b => b.type === "star");
  const buffEffectiveness = starBuff?.buffEffectivenessBonus ? (1 + starBuff.buffEffectivenessBonus) : 1.0;
  
  // Add buff bonuses to tier chance (LUCK buffs) with effectiveness multiplier
  let tierBonus = buffs.reduce(
    (sum, b) => sum + (b.nextTierChanceBonus ?? 0) * buffEffectiveness,
    0
  );

  // Add ECHO buff bonuses (tier chance per nearby pet) with effectiveness multiplier
  if (grid && petPosition) {
    const echoBuffs = buffs.filter(b => b.type === "echo" && b.tierChancePerNearbyPet && b.areaRadius);
    for (const echoBuff of echoBuffs) {
      const nearbyPets = countNearbyPets(grid, petPosition, echoBuff.areaRadius!, pet.id);
      tierBonus += (echoBuff.tierChancePerNearbyPet ?? 0) * nearbyPets * buffEffectiveness;
    }
  }

  // Determine gem tier
  let chosenTier: GemRarity = pet.rarity;
  if (
    Math.random() < baseChance + tierBonus &&
    petRarityIndex < rarityOrder.length - 1
  ) {
    chosenTier = rarityOrder[petRarityIndex + 1] as GemRarity;
  }

  // Roll for specific gem within tier
  const tierGems = gemsByRarity[chosenTier];
  const total = tierGems.reduce((sum, g) => sum + g.tierPercentage, 0);
  const roll = Math.random() * total;

  let cumulative = 0;
  let gem: Gem = tierGems[0];
  for (const g of tierGems) {
    cumulative += g.tierPercentage;
    if (roll <= cumulative) {
      gem = g;
      break;
    }
  }

  // Apply value multipliers (LURE, REFINE, BURNOUT, MELTDOWN, HYPERDRIVE, EXHAUST)
  let valueMultiplier = 1;
  
  // LURE, REFINE, and BURNOUT buffs with effectiveness multiplier
  valueMultiplier *= buffs.reduce(
    (mul, b) => {
      if (!b.gemValueMultiplier) return mul;
      // Apply effectiveness to the bonus part only
      const bonus = b.gemValueMultiplier - 1;
      return mul * (1 + bonus * buffEffectiveness);
    },
    1
  );

  // EXHAUST buff (separate value multiplier) with effectiveness
  const exhaustBuff = buffs.find(b => b.type === "exhaust");
  if (exhaustBuff && exhaustBuff.exhaustValueMultiplier) {
    const bonus = exhaustBuff.exhaustValueMultiplier - 1;
    valueMultiplier *= (1 + bonus * buffEffectiveness);
  }

  // CLUSTER buff (value per nearby pet) with effectiveness
  if (grid && petPosition) {
    const clusterBuffs = buffs.filter(b => b.type === "cluster" && b.valuePerNearbyPet && b.areaRadius);
    for (const clusterBuff of clusterBuffs) {
      const nearbyPets = countNearbyPets(grid, petPosition, clusterBuff.areaRadius!, pet.id);
      const effectiveBonus = (clusterBuff.valuePerNearbyPet ?? 0) * buffEffectiveness;
      valueMultiplier *= Math.pow(1 + effectiveBonus, nearbyPets);
    }
  }

  // Apply value multiplier to gem
  const modifiedGem = valueMultiplier !== 1 ? {
    ...gem,
    baseValue: Math.round(gem.baseValue * valueMultiplier)
  } : gem;

  // Check for gem multipliers (additive system)
  let totalGems = 0; // Start with 0, add base 1 only if nothing triggers


  // Check for triple gem chance from TRIPLE buffs with effectiveness
  const tripleChance = buffs.reduce(
    (sum, b) => {
      if (!b.tripleGemChance || b.type === "star") return sum;
      return sum + b.tripleGemChance * buffEffectiveness;
    },
    0
  );
  if (tripleChance > 0 && Math.random() < tripleChance) {
    totalGems += 3; // Add 3 gems
  }

  // Check for double gem chance from DOUBLE buffs with effectiveness
  const doubleChance = buffs.reduce(
    (sum, b) => {
      if (!b.doubleGemChance || b.type === "star") return sum;
      return sum + b.doubleGemChance * buffEffectiveness;
    },
    0
  );
  if (doubleChance > 0 && Math.random() < doubleChance) {
    totalGems += 2; // Add 2 gems
  }

  // If no multipliers triggered, return base 1 gem
  if (totalGems === 0) {
    totalGems = 1;
  }

  // Update lastGenerated timestamp
  pet.lastGenerated = now;

  // Check all downtime/risk buff disable chances
  checkDowntimeBuffs(pet, buffs, now, allPets, grid, petPosition);

  // Return the total number of gems
  return Array(totalGems).fill(modifiedGem);
}

/**
 * Check for OVERCLOCK and other downtime buff disable mechanics
 * Includes STABILIZER and REGULATOR conditional protection
 * Tracks generation cycles for FRENZY/EXHAUST/MELTDOWN
 */
function checkDowntimeBuffs(
  pet: Pet, 
  buffs: Buff[], 
  now: number, 
  allPets?: Pet[],
  grid?: LandGrid, 
  petPosition?: { x: number; y: number }
) {
  // Initialize generation counter if not present
  if (pet.generationCount === undefined) {
    pet.generationCount = 0;
  }
  
  // Increment generation counter
  pet.generationCount++;
  
  // Get nearby pets for STABILIZER buff check
  let nearbyPets: Pet[] = [];
  if (grid && petPosition && allPets) {
    const radius = 2; // Standard check radius
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = petPosition.x + dx;
        const y = petPosition.y + dy;
        if (x >= 0 && x < grid.width && y >= 0 && y < grid.height) {
          const tile = grid.tiles[y][x];
          if (tile.petId && tile.petId !== pet.id) {
            // Find the actual pet object
            const nearbyPet = allPets.find(p => p.id === tile.petId);
            if (nearbyPet) {
              nearbyPets.push(nearbyPet);
            }
          }
        }
      }
    }
  }

  // Calculate defensive modifiers from all buffs
  let durationReduction = 0;
  // Protection buffs removed (RESILIENCE, FORTIFY, STABILIZER, REGULATOR no longer exist)
  const totalChanceReduction = 0;
  const totalDurationReduction = 0;
  
  // OVERCLOCK disable check
  checkOverclockDisable(pet, buffs, now, totalChanceReduction, totalDurationReduction);
  
  // BURNOUT disable check
  const burnoutBuff = buffs.find(b => b.type === "burnout");
  if (burnoutBuff && burnoutBuff.burnoutFailChance && burnoutBuff.burnoutDisableDuration) {
    const adjustedChance = Math.max(0, burnoutBuff.burnoutFailChance - totalChanceReduction);
    if (Math.random() < adjustedChance) {
      const adjustedDuration = Math.round(burnoutBuff.burnoutDisableDuration * (1 - totalDurationReduction));
      pet.disabledUntil = now + adjustedDuration;
    }
  }
  
  // STRAIN disable check
  const strainBuff = buffs.find(b => b.type === "strain");
  if (strainBuff && strainBuff.strainFailChance && strainBuff.strainDisableDuration) {
    const adjustedChance = Math.max(0, strainBuff.strainFailChance - totalChanceReduction);
    if (Math.random() < adjustedChance) {
      const adjustedDuration = Math.round(strainBuff.strainDisableDuration * (1 - totalDurationReduction));
      pet.disabledUntil = now + adjustedDuration;
    }
  }
  
  // HYPERDRIVE disable check
  const hyperdriveBuff = buffs.find(b => b.type === "hyperdrive");
  if (hyperdriveBuff && hyperdriveBuff.hyperdriveFailChance && hyperdriveBuff.hyperdriveDisableDuration) {
    const adjustedChance = Math.max(0, hyperdriveBuff.hyperdriveFailChance - totalChanceReduction);
    if (Math.random() < adjustedChance) {
      const adjustedDuration = Math.round(hyperdriveBuff.hyperdriveDisableDuration * (1 - totalDurationReduction));
      pet.disabledUntil = now + adjustedDuration;
    }
  }
  
  // MELTDOWN - removed (properties no longer exist)
  
  // FRENZY - removed (properties no longer exist)
  
  // EXHAUST cycle check (guaranteed disable after X generations)
  const exhaustBuff = buffs.find(b => b.type === "exhaust");
  if (exhaustBuff && exhaustBuff.exhaustGenerationCount && exhaustBuff.exhaustDisableDuration) {
    if (pet.generationCount >= exhaustBuff.exhaustGenerationCount) {
      // Cycle complete - mandatory disable
      pet.disabledUntil = now + exhaustBuff.exhaustDisableDuration;
      pet.generationCount = 0; // Reset counter
    }
  }
}

/**
 * Helper to get buff tier for conditional buff checks
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
 * Check if pet should be disabled by OVERCLOCK buff
 */
function checkOverclockDisable(
  pet: Pet, 
  buffs: Buff[], 
  currentTime: number, 
  chanceReduction: number = 0, 
  durationReduction: number = 0
): void {
  const overclockBuffs = buffs.filter(b => b.type === "overclock" && b.overclockFailChance);
  for (const buff of overclockBuffs) {
    const adjustedChance = Math.max(0, (buff.overclockFailChance ?? 0) - chanceReduction);
    if (Math.random() < adjustedChance) {
      const adjustedDuration = Math.round((buff.overclockDisableDuration ?? 0) * (1 - durationReduction));
      pet.disabledUntil = currentTime + adjustedDuration;
      break; // Only disable once per generation
    }
  }
}

/**
 * Generate multiple gems for a pet over online ticks or offline idle time.
 * Returns an array of gems.
 */
export function generateGems(
  pet: Pet,
  currentTime: number,
  buffs: Buff[] = [],
  offlineCapHours = 6,
  grid?: LandGrid,
  petPosition?: { x: number; y: number }
): Gem[] {
  if (!pet.lastGenerated) pet.lastGenerated = currentTime;

  // Check if pet is disabled by OVERCLOCK
  if (pet.disabledUntil && currentTime < pet.disabledUntil) {
    return [];
  }

  // Calculate offline duration capped
  const maxOffline = offlineCapHours * 3600;
  const offlineTime = Math.min(currentTime - pet.lastGenerated, maxOffline);

  // Calculate tick speed with buff modifiers (lower = faster)
  const tickSpeedMod = buffs.reduce(
    (mul, b) => b.tickSpeedMultiplier ? mul * b.tickSpeedMultiplier : mul,
    1
  );

  // Average tick time (modified by tick speed buffs)
  const baseAvgTick = (pet.tickTimeRange[0] + pet.tickTimeRange[1]) / 2;
  const avgTick = baseAvgTick * tickSpeedMod;

  // Number of gem generation ticks (only 1 tick per call maximum to prevent bursts)
  const ticks = Math.min(1, Math.floor(offlineTime / avgTick));

  // Only generate if at least 1 tick has passed
  if (ticks <= 0) {
    return [];
  }

  const gems: Gem[] = [];
  for (let i = 0; i < ticks; i++) {
    gems.push(...generateGemForPetWithBuffs(pet, buffs, undefined, grid, petPosition));
  }

  // Update lastGenerated to current time (reset the timer)
  pet.lastGenerated = currentTime;

  return gems;
}
