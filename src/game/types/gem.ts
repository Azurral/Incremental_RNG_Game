// src/game/types/gem.ts

export type GemRarity = "common" | "rare" | "epic" | "legendary" | "mythical";

export interface Gem {
  id: string;              // unique per rarity
  name: string;
  rarity: GemRarity;
  baseValue: number;       // money value when sold
  tierPercentage: number;  // spawn chance within rarity
}
