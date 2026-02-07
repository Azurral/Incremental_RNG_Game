// src/game/constants/buffPetDefinitions.ts
// Innate buff types for each buff pet (levels are randomized on crate open)

export type BuffPetInnateBuffs = {
  buffTypes: string[]; // e.g., ["speed"], ["lure", "speed"]
  moveInterval: number; // seconds between movements
  moveType: "random" | "smart"; // movement pattern
};

export const buffPetInnateBuffs: Record<string, BuffPetInnateBuffs> = {
  // COMMON
  "pet-buff-busy-bee": {
    buffTypes: ["speed"],
    moveInterval: 300, // 5 minutes
    moveType: "random",
  },
  "pet-buff-lucky-ladybug": {
    buffTypes: ["luck"],
    moveInterval: 300, // 5 minutes
    moveType: "random",
  },

  // RARE
  "pet-buff-silk-moth": {
    buffTypes: ["echo"],
    moveInterval: 300, // 5 minutes
    moveType: "smart",
  },
  "pet-buff-honey-drone": {
    buffTypes: ["lure", "speed"],
    moveInterval: 300, // 5 minutes
    moveType: "random",
  },

  // EPIC
  "pet-buff-crystal-weaver": {
    buffTypes: ["cluster", "echo"],
    moveInterval: 300, // 5 minutes
    moveType: "smart",
  },
  "pet-buff-overclocked-wasp": {
    buffTypes: ["overclock"],
    moveInterval: 180, // 3 minutes
    moveType: "random",
  },

  // LEGENDARY
  "pet-buff-prism-moth": {
    buffTypes: ["echo", "luck"],
    moveInterval: 300, // 5 minutes
    moveType: "smart",
  },
  "pet-buff-fortune-scarab": {
    buffTypes: ["gamble"],
    moveInterval: 300, // 5 minutes
    moveType: "smart",
  },

  // MYTHICAL
  "pet-buff-celestial-queen-bee": {
    buffTypes: ["speed", "lure", "echo"],
    moveInterval: 300, // 5 minutes
    moveType: "smart",
  },
  "pet-buff-entropy-firefly": {
    buffTypes: ["unstable", "triple"],
    moveInterval: 240, // 4 minutes
    moveType: "random",
  },
};
