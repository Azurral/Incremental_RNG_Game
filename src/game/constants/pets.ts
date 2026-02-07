// src/game/constants/pets.ts
import { Pet } from "../types/pet";

// Base pet definitions (without buffs - those are added when opened from crates)
// These are templates, actual pets are created with random buffs

// GENERATOR PETS (produce gems)
// Within each rarity: varied stats for uniqueness, rarest drops are generally best
export const generatorPetTemplates: Record<string, Omit<Pet, "id" | "buffs">> = {
  // ===== COMMON TIER (1 gem per tick) =====
  // Hermit Crap - Most common (50% drop) - Fast & consistent
  "pet-hermit-crab": {
    name: "Hermit Crap",
    rarity: "common",
    baseGemRate: 1,
    tickTimeRange: [45, 55],       // ~50s avg (864 ticks in 12h)
    maxGemCapacity: 650,           // Good for active play
  },
  // Sea Urchin - Common (30% drop) - Balanced
  "pet-sea-urchin": {
    name: "Sea Urchin",
    rarity: "common",
    baseGemRate: 1,
    tickTimeRange: [55, 65],       // ~60s avg (720 ticks in 12h)
    maxGemCapacity: 720,           // Standard capacity
  },
  // Tarnished Clam - Rare (20% drop) - Slow but high capacity
  "pet-tarnished-clam": {
    name: "Tarnished Clam",
    rarity: "common",
    baseGemRate: 1,
    tickTimeRange: [65, 75],       // ~70s avg (617 ticks in 12h)
    maxGemCapacity: 800,           // Best for AFK/offline
  },

  // ===== RARE TIER (1 gem per tick) =====
  // Polished Snail - Most common (35% drop) - Speedy
  "pet-polished-snail": {
    name: "Polished Snail",
    rarity: "rare",
    baseGemRate: 1,
    tickTimeRange: [95, 105],      // ~100s avg (432 ticks in 12h)
    maxGemCapacity: 400,
  },
  // Tide Crawler - Medium (25% drop) - Volatile/unpredictable
  "pet-tide-crawler": {
    name: "Tide Crawler",
    rarity: "rare",
    baseGemRate: 1,
    tickTimeRange: [80, 120],      // ~100s avg, wide variance
    maxGemCapacity: 450,           // Higher capacity for variance
  },
  // Fracture Crab - Rare (20% drop) - Premium quality
  "pet-fracture-crab": {
    name: "Fracture Crab",
    rarity: "rare",
    baseGemRate: 1,
    tickTimeRange: [115, 125],     // ~120s avg (360 ticks in 12h)
    maxGemCapacity: 500,           // Highest rare capacity
  },

  // ===== EPIC TIER (1 gem per tick) =====
  // Gilded Oyster - Most common (35% drop) - Fast miner
  "pet-gilded-oyster": {
    name: "Gilded Oyster",
    rarity: "epic",
    baseGemRate: 1,
    tickTimeRange: [200, 220],     // ~210s avg (206 ticks in 12h)
    maxGemCapacity: 200,
  },
  // Pearl Nautilus - Medium (18% drop) - Balanced elegance
  "pet-pearl-nautilus": {
    name: "Pearl Nautilus",
    rarity: "epic",
    baseGemRate: 1,
    tickTimeRange: [230, 250],     // ~240s avg (180 ticks in 12h)
    maxGemCapacity: 220,
  },
  // Shiny Lobster - Rare (12% drop) - Premium hunter
  "pet-shiny-lobster": {
    name: "Shiny Lobster",
    rarity: "epic",
    baseGemRate: 1,
    tickTimeRange: [260, 280],     // ~270s avg (160 ticks in 12h)
    maxGemCapacity: 250,           // Highest epic capacity
  },

  // ===== LEGENDARY TIER (1 gem per tick) =====
  // Opaline Scallop - Most common (20% drop) - Speed demon
  "pet-opaline-scallop": {
    name: "Opaline Scallop",
    rarity: "legendary",
    baseGemRate: 1,
    tickTimeRange: [350, 370],     // ~360s avg (120 ticks in 12h)
    maxGemCapacity: 120,
  },
  // Crystallized Mantis Shrimp - Medium (12% drop) - High stakes gambler
  "pet-crystalline-mantis-shrimp": {
    name: "Crystallized Mantis Shrimp",
    rarity: "legendary",
    baseGemRate: 1,
    tickTimeRange: [390, 410],     // ~400s avg (108 ticks in 12h)
    maxGemCapacity: 130,
  },
  // Prismatic Spider Crab - Rare (8% drop) - Quality perfection
  "pet-prismatic-spider-crab": {
    name: "Prismatic Spider Crab",
    rarity: "legendary",
    baseGemRate: 1,
    tickTimeRange: [430, 450],     // ~440s avg (98 ticks in 12h)
    maxGemCapacity: 140,           // Highest legendary capacity
  },

  // ===== MYTHICAL TIER (1 gem per tick) =====
  // Ancient Geodenum Turtle - Most common (10% drop) - The reliable grinder
  "pet-ancient-geodenum-turtle": {
    name: "Ancient Geodenum Turtle",
    rarity: "mythical",
    baseGemRate: 1,
    tickTimeRange: [540, 580],     // ~560s avg (77 ticks in 12h)
    maxGemCapacity: 80,
  },
  // Cosmic Trilobite - Medium (6% drop) - Balanced cosmic power
  "pet-cosmic-trilobite": {
    name: "Cosmic Trilobite",
    rarity: "mythical",
    baseGemRate: 1,
    tickTimeRange: [560, 600],     // ~580s avg (74 ticks in 12h)
    maxGemCapacity: 90,
  },
  // Voidwyrm Isopod - Rarest (4% drop) - THE ULTIMATE PET
  "pet-voidwyrm-isopod": {
    name: "Voidwyrm Isopod",
    rarity: "mythical",
    baseGemRate: 1,
    tickTimeRange: [480, 520],     // ~500s avg (86 ticks in 12h) - FASTEST mythical
    maxGemCapacity: 100,           // HIGHEST mythical capacity
  },
};

// Legacy buff pet templates removed - all pets are now generators

// Legacy export for backwards compatibility (empty array, use crate system instead)
export const pets: Pet[] = [];
