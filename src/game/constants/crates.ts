// src/game/constants/crates.ts
import { Crate, CrateDrop } from "../types/crate";

export const crates: Crate[] = [
  {
    id: "crate-common",
    name: "Common Crate",
    rarity: "common",
    cost: 10000,
    description: "A basic crate containing common pets and buff creatures.",
  },
  {
    id: "crate-rare",
    name: "Rare Crate",
    rarity: "rare",
    cost: 150000,
    description: "An improved crate with a chance for rare pets.",
  },
  {
    id: "crate-epic",
    name: "Epic Crate",
    rarity: "epic",
    cost: 3200000,
    description: "A valuable crate with powerful epic pets inside.",
  },
  {
    id: "crate-legendary",
    name: "Legendary Crate",
    rarity: "legendary",
    cost: 25000000,
    description: "A legendary crate containing extremely rare pets.",
  },
  {
    id: "crate-mythical",
    name: "Mythical Crate",
    rarity: "mythical",
    cost: 120000000,
    description: "The ultimate crate with a chance at mythical pets!",
  },
];

// Crate drop tables
export const crateDrops: Record<string, CrateDrop[]> = {
  // COMMON: Fast pets = common, Quality pets = rare
  "crate-common": [
    { type: "pet", petId: "pet-hermit-crab", weight: 50 },      // Fast (8-12s) - Most common
    { type: "pet", petId: "pet-sea-urchin", weight: 30 },       // Medium (10-15s) - Common
    { type: "pet", petId: "pet-tarnished-clam", weight: 20 },   // Slow (15-20s, +3% tier) - Rarest
  ],
  // RARE: Fast pets = common, Volatile = medium, Quality pets = rare
  "crate-rare": [
    { type: "downgrade", downgradeTo: "common", weight: 20 },
    { type: "pet", petId: "pet-polished-snail", weight: 35 },   // Fast (12-18s) - Most common
    { type: "pet", petId: "pet-tide-crawler", weight: 25 },     // Volatile (10-30s, +1.5% tier) - Medium
    { type: "pet", petId: "pet-fracture-crab", weight: 20 },    // Slow (25-35s, +2.5% tier) - Rarest
  ],
  // EPIC: Fast pets = common, Balanced = medium, Quality pets = rare
  "crate-epic": [
    { type: "downgrade", downgradeTo: "rare", weight: 35 },
    { type: "pet", petId: "pet-gilded-oyster", weight: 35 },    // Fast (20-30s) - Most common
    { type: "pet", petId: "pet-pearl-nautilus", weight: 18 },   // Medium (30-40s, +1% tier) - Medium
    { type: "pet", petId: "pet-shiny-lobster", weight: 12 },    // Slow (40-50s, +2% tier) - Rarest
  ],
  // LEGENDARY: Fast pets = common, Balanced = medium, Quality pets = rare
  "crate-legendary": [
    { type: "downgrade", downgradeTo: "epic", weight: 60 },
    { type: "pet", petId: "pet-opaline-scallop", weight: 20 },           // Fast (35-50s) - Most common
    { type: "pet", petId: "pet-crystalline-mantis-shrimp", weight: 12 }, // Medium (45-65s, +0.8% tier) - Medium
    { type: "pet", petId: "pet-prismatic-spider-crab", weight: 8 },      // Slow (60-80s, +1.5% tier) - Rarest
  ],
  // MYTHICAL: Fast pets = common, Balanced = medium, Quality pets = rare
  "crate-mythical": [
    { type: "downgrade", downgradeTo: "legendary", weight: 80 },
    { type: "pet", petId: "pet-ancient-geodenum-turtle", weight: 10 },  // Moderate (60-90s) - Most common
    { type: "pet", petId: "pet-cosmic-trilobite", weight: 6 },          // Medium (70-100s, +0.5% tier) - Medium
    { type: "pet", petId: "pet-voidwyrm-isopod", weight: 4 },           // Slow (90-120s, +1% tier) - Rarest
  ],
};
