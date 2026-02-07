// src/game/types/crate.ts

export type CrateRarity = "common" | "rare" | "epic" | "legendary" | "mythical";

export interface Crate {
  id: string;
  name: string;
  rarity: CrateRarity;
  cost: number; // in cash
  description: string;
}

export interface CrateDrop {
  type: "pet" | "downgrade"; // downgrade = opens lower tier crate
  petId?: string; // if type is "pet"
  downgradeTo?: CrateRarity; // if type is "downgrade"
  weight: number; // for weighted random selection
}
