// src/game/constants/gems.ts
import { Gem, GemRarity } from "../types/gem";

// -----------------------
// Starter Gems
// tierPercentage = spawn chance within rarity (must add up to 100)
// -----------------------
export const gemsByRarity: Record<GemRarity, Gem[]> = {
  common: [
    { id: "common-1", name: "Ruststone", rarity: "common", baseValue: 100, tierPercentage: 50 },
    { id: "common-2", name: "Silvel", rarity: "common", baseValue: 125, tierPercentage: 25 },
    { id: "common-3", name: "Zincore", rarity: "common", baseValue: 150, tierPercentage: 15 },
    { id: "common-4", name: "Tin Shard", rarity: "common", baseValue: 175, tierPercentage: 10 },
  ],
  rare: [
    { id: "rare-1", name: "Quartzite", rarity: "rare", baseValue: 2025, tierPercentage: 75 },
    { id: "rare-2", name: "Glow Amber", rarity: "rare", baseValue: 2250, tierPercentage: 25 },
  ],
  epic: [
    { id: "epic-1", name: "Rift Stone", rarity: "epic", baseValue: 6750, tierPercentage: 50 },
    { id: "epic-2", name: "Ember Crystal", rarity: "epic", baseValue: 7425, tierPercentage: 35 },
    { id: "epic-3", name: "Starshine", rarity: "epic", baseValue: 8100, tierPercentage: 15 },
  ],
  legendary: [
    { id: "legendary-1", name: "Elder Core", rarity: "legendary", baseValue: 24300, tierPercentage: 50 },
    { id: "legendary-2", name: "Prismatic Pearl", rarity: "legendary", baseValue: 26325, tierPercentage: 35 },
    { id: "legendary-3", name: "Solarion Shard", rarity: "legendary", baseValue: 28350, tierPercentage: 15 },
  ],
  mythical: [
    { id: "mythical-1", name: "Eternal HeartStone", rarity: "mythical", baseValue: 85050, tierPercentage: 75 },
    { id: "mythical-2", name: "Iridescent VoidShard", rarity: "mythical", baseValue: 91125, tierPercentage: 25 },
  ]
};
