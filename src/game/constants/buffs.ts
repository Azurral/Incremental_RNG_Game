// src/game/constants/buffs.ts
import { Buff } from "../types/buff";

export const buffs: Buff[] = [
  // SPEED - Production Speed Buffs
  {
    id: "buff-speed-1",
    name: "SPEED I",
    rarity: "common",
    type: "speed",
    baseValue: 1000,
    tickSpeedMultiplier: 0.90, // 1.11x speed
    moveInterval: 5,
  },
  {
    id: "buff-speed-2",
    name: "SPEED II",
    rarity: "common",
    type: "speed",
    baseValue: 2500,
    tickSpeedMultiplier: 0.80, // 1.25x speed
    moveInterval: 5,
  },
  {
    id: "buff-speed-3",
    name: "SPEED III",
    rarity: "rare",
    type: "speed",
    baseValue: 10000,
    tickSpeedMultiplier: 0.70, // 1.43x speed
    moveInterval: 5,
  },
  {
    id: "buff-speed-4",
    name: "SPEED IV",
    rarity: "epic",
    type: "speed",
    baseValue: 250000,
    tickSpeedMultiplier: 0.55, // 1.82x speed
    moveInterval: 5,
  },
  {
    id: "buff-speed-5",
    name: "SPEED V",
    rarity: "legendary",
    type: "speed",
    baseValue: 8000000,
    tickSpeedMultiplier: 0.40, // 2.5x speed
    moveInterval: 5,
  },

  // LUCK - Gem Rarity Chance Buffs
  {
    id: "buff-luck-1",
    name: "LUCK I",
    rarity: "common",
    type: "luck",
    baseValue: 1000,
    nextTierChanceBonus: 0.05,
    moveInterval: 5,
  },
  {
    id: "buff-luck-2",
    name: "LUCK II",
    rarity: "common",
    type: "luck",
    baseValue: 2500,
    nextTierChanceBonus: 0.10,
    moveInterval: 5,
  },
  {
    id: "buff-luck-3",
    name: "LUCK III",
    rarity: "rare",
    type: "luck",
    baseValue: 15000,
    nextTierChanceBonus: 0.15,
    moveInterval: 5,
  },
  {
    id: "buff-luck-4",
    name: "LUCK IV",
    rarity: "epic",
    type: "luck",
    baseValue: 400000,
    nextTierChanceBonus: 0.25,
    moveInterval: 5,
  },
  {
    id: "buff-luck-5",
    name: "LUCK V",
    rarity: "legendary",
    type: "luck",
    baseValue: 12000000,
    nextTierChanceBonus: 0.35,
    moveInterval: 5,
  },

  // DOUBLE - Double Gem Chance Buffs
  {
    id: "buff-double-1",
    name: "DOUBLE I",
    rarity: "common",
    type: "double",
    baseValue: 1000,
    doubleGemChance: 0.05,
    moveInterval: 5,
  },
  {
    id: "buff-double-2",
    name: "DOUBLE II",
    rarity: "common",
    type: "double",
    baseValue: 5000,
    doubleGemChance: 0.075,
    moveInterval: 5,
  },
  {
    id: "buff-double-3",
    name: "DOUBLE III",
    rarity: "rare",
    type: "double",
    baseValue: 20000,
    doubleGemChance: 0.10,
    moveInterval: 5,
  },
  {
    id: "buff-double-4",
    name: "DOUBLE IV",
    rarity: "epic",
    type: "double",
    baseValue: 500000,
    doubleGemChance: 0.15,
    moveInterval: 5,
  },
  {
    id: "buff-double-5",
    name: "DOUBLE V",
    rarity: "legendary",
    type: "double",
    baseValue: 15000000,
    doubleGemChance: 0.20,
    moveInterval: 5,
  },

  // TRIPLE - Triple Gem Chance Buffs
  {
    id: "buff-triple-1",
    name: "TRIPLE I",
    rarity: "common",
    type: "triple",
    baseValue: 5000,
    tripleGemChance: 0.025,
    moveInterval: 5,
  },
  {
    id: "buff-triple-2",
    name: "TRIPLE II",
    rarity: "common",
    type: "triple",
    baseValue: 25000,
    tripleGemChance: 0.0375,
    moveInterval: 5,
  },
  {
    id: "buff-triple-3",
    name: "TRIPLE III",
    rarity: "rare",
    type: "triple",
    baseValue: 750000,
    tripleGemChance: 0.05,
    moveInterval: 5,
  },
  {
    id: "buff-triple-4",
    name: "TRIPLE IV",
    rarity: "epic",
    type: "triple",
    baseValue: 18000000,
    tripleGemChance: 0.08,
    moveInterval: 5,
  },
  {
    id: "buff-triple-5",
    name: "TRIPLE V",
    rarity: "legendary",
    type: "triple",
    baseValue: 35000000,
    tripleGemChance: 0.10,
    moveInterval: 5,
  },

  // BURST - Speed + Double Gem Combo
  {
    id: "buff-burst-1",
    name: "BURST I",
    rarity: "common",
    type: "burst",
    baseValue: 10000,
    tickSpeedMultiplier: 0.67, // 1.5x speed
    doubleGemChance: 0.06,
    moveInterval: 5,
  },
  {
    id: "buff-burst-2",
    name: "BURST II",
    rarity: "common",
    type: "burst",
    baseValue: 35000,
    tickSpeedMultiplier: 0.625, // 1.6x speed
    doubleGemChance: 0.08,
    moveInterval: 5,
  },
  {
    id: "buff-burst-3",
    name: "BURST III",
    rarity: "rare",
    type: "burst",
    baseValue: 800000,
    tickSpeedMultiplier: 0.588, // 1.7x speed
    doubleGemChance: 0.10,
    moveInterval: 5,
  },
  {
    id: "buff-burst-4",
    name: "BURST IV",
    rarity: "epic",
    type: "burst",
    baseValue: 3000000,
    tickSpeedMultiplier: 0.556, // 1.8x speed
    doubleGemChance: 0.12,
    moveInterval: 5,
  },
  {
    id: "buff-burst-5",
    name: "BURST V",
    rarity: "legendary",
    type: "burst",
    baseValue: 22000000,
    tickSpeedMultiplier: 0.50, // 2x speed
    doubleGemChance: 0.15,
    moveInterval: 5,
  },

  // FORTUNE - Luck + Double Gem Combo
  {
    id: "buff-fortune-1",
    name: "FORTUNE I",
    rarity: "common",
    type: "fortune",
    baseValue: 12000,
    nextTierChanceBonus: 0.05,
    doubleGemChance: 0.08,
    moveInterval: 5,
  },
  {
    id: "buff-fortune-2",
    name: "FORTUNE II",
    rarity: "common",
    type: "fortune",
    baseValue: 600000,
    nextTierChanceBonus: 0.08,
    doubleGemChance: 0.10,
    moveInterval: 5,
  },
  {
    id: "buff-fortune-3",
    name: "FORTUNE III",
    rarity: "rare",
    type: "fortune",
    baseValue: 2500000,
    nextTierChanceBonus: 0.10,
    doubleGemChance: 0.12,
    moveInterval: 5,
  },
  {
    id: "buff-fortune-4",
    name: "FORTUNE IV",
    rarity: "epic",
    type: "fortune",
    baseValue: 20000000,
    nextTierChanceBonus: 0.12,
    doubleGemChance: 0.14,
    moveInterval: 5,
  },
  {
    id: "buff-fortune-5",
    name: "FORTUNE V",
    rarity: "legendary",
    type: "fortune",
    baseValue: 25000000,
    nextTierChanceBonus: 0.15,
    doubleGemChance: 0.16,
    moveInterval: 5,
  },

  // JACKPOT - Triple Gem Combo
  {
    id: "buff-jackpot-1",
    name: "JACKPOT I",
    rarity: "common",
    type: "jackpot",
    baseValue: 1500000,
    tripleGemChance: 0.03,
    moveInterval: 5,
  },
  {
    id: "buff-jackpot-2",
    name: "JACKPOT II",
    rarity: "common",
    type: "jackpot",
    baseValue: 4000000,
    tripleGemChance: 0.04,
    moveInterval: 5,
  },
  {
    id: "buff-jackpot-3",
    name: "JACKPOT III",
    rarity: "rare",
    type: "jackpot",
    baseValue: 25000000,
    tripleGemChance: 0.05,
    moveInterval: 5,
  },
  {
    id: "buff-jackpot-4",
    name: "JACKPOT IV",
    rarity: "epic",
    type: "jackpot",
    baseValue: 38000000,
    tripleGemChance: 0.06,
    moveInterval: 5,
  },
  {
    id: "buff-jackpot-5",
    name: "JACKPOT V",
    rarity: "mythical",
    type: "jackpot",
    baseValue: 48000000,
    tripleGemChance: 0.07,
    moveInterval: 5,
  },

  // OVERDRIVE - Speed + Double + Triple Gem Combo
  {
    id: "buff-overdrive-1",
    name: "OVERDRIVE I",
    rarity: "common",
    type: "overdrive",
    baseValue: 2000000,
    tickSpeedMultiplier: 0.67, // 1.5x speed
    doubleGemChance: 0.08,
    tripleGemChance: 0.02,
    moveInterval: 5,
  },
  {
    id: "buff-overdrive-2",
    name: "OVERDRIVE II",
    rarity: "common",
    type: "overdrive",
    baseValue: 5000000,
    tickSpeedMultiplier: 0.625, // 1.6x speed
    doubleGemChance: 0.10,
    tripleGemChance: 0.03,
    moveInterval: 5,
  },
  {
    id: "buff-overdrive-3",
    name: "OVERDRIVE III",
    rarity: "rare",
    type: "overdrive",
    baseValue: 28000000,
    tickSpeedMultiplier: 0.588, // 1.7x speed
    doubleGemChance: 0.12,
    tripleGemChance: 0.04,
    moveInterval: 5,
  },
  {
    id: "buff-overdrive-4",
    name: "OVERDRIVE IV",
    rarity: "epic",
    type: "overdrive",
    baseValue: 40000000,
    tickSpeedMultiplier: 0.556, // 1.8x speed
    doubleGemChance: 0.14,
    tripleGemChance: 0.05,
    moveInterval: 5,
  },
  {
    id: "buff-overdrive-5",
    name: "OVERDRIVE V",
    rarity: "mythical",
    type: "overdrive",
    baseValue: 47000000,
    tickSpeedMultiplier: 0.50, // 2x speed
    doubleGemChance: 0.16,
    tripleGemChance: 0.06,
    moveInterval: 5,
  },

  // OVERCLOCK - High Speed with Disable Risk
  {
    id: "buff-overclock-1",
    name: "OVERCLOCK I",
    rarity: "common",
    type: "overclock",
    baseValue: 15000,
    tickSpeedMultiplier: 0.50, // 2x speed
    overclockFailChance: 0.10,
    overclockDisableDuration: 80,
    moveInterval: 5,
  },
  {
    id: "buff-overclock-2",
    name: "OVERCLOCK II",
    rarity: "common",
    type: "overclock",
    baseValue: 900000,
    tickSpeedMultiplier: 0.44, // 2.25x speed
    overclockFailChance: 0.0875,
    overclockDisableDuration: 75,
    moveInterval: 5,
  },
  {
    id: "buff-overclock-3",
    name: "OVERCLOCK III",
    rarity: "rare",
    type: "overclock",
    baseValue: 3500000,
    tickSpeedMultiplier: 0.40, // 2.5x speed
    overclockFailChance: 0.075,
    overclockDisableDuration: 70,
    moveInterval: 5,
  },
  {
    id: "buff-overclock-4",
    name: "OVERCLOCK IV",
    rarity: "epic",
    type: "overclock",
    baseValue: 24000000,
    tickSpeedMultiplier: 0.33, // 3x speed
    overclockFailChance: 0.06,
    overclockDisableDuration: 60,
    moveInterval: 5,
  },
  {
    id: "buff-overclock-5",
    name: "OVERCLOCK V",
    rarity: "mythical",
    type: "overclock",
    baseValue: 42000000,
    tickSpeedMultiplier: 0.25, // 4x speed
    overclockFailChance: 0.05,
    overclockDisableDuration: 50,
    moveInterval: 5,
  },

  // UNSTABLE - High Triple/Double Chance with No Gem Risk
  {
    id: "buff-unstable-1",
    name: "UNSTABLE I",
    rarity: "common",
    type: "unstable",
    baseValue: 1200000,
    tripleGemChance: 0.10,
    doubleGemChance: 0.20,
    noGemChance: 0.15,
    moveInterval: 5,
  },
  {
    id: "buff-unstable-2",
    name: "UNSTABLE II",
    rarity: "common",
    type: "unstable",
    baseValue: 3800000,
    tripleGemChance: 0.10625,
    doubleGemChance: 0.2125,
    noGemChance: 0.1375,
    moveInterval: 5,
  },
  {
    id: "buff-unstable-3",
    name: "UNSTABLE III",
    rarity: "rare",
    type: "unstable",
    baseValue: 23000000,
    tripleGemChance: 0.1125,
    doubleGemChance: 0.225,
    noGemChance: 0.125,
    moveInterval: 5,
  },
  {
    id: "buff-unstable-4",
    name: "UNSTABLE IV",
    rarity: "epic",
    type: "unstable",
    baseValue: 32000000,
    tripleGemChance: 0.11875,
    doubleGemChance: 0.2375,
    noGemChance: 0.1125,
    moveInterval: 5,
  },
  {
    id: "buff-unstable-5",
    name: "UNSTABLE V",
    rarity: "mythical",
    type: "unstable",
    baseValue: 40000000,
    tripleGemChance: 0.125,
    doubleGemChance: 0.25,
    noGemChance: 0.10,
    moveInterval: 5,
  },

  // SURGE - Speed burst with skip risk
  {
    id: "buff-surge-1",
    name: "SURGE I",
    rarity: "common",
    type: "surge",
    baseValue: 800000,
    tickSpeedMultiplier: 0.67, // 1.5x speed
    surgeSkipChance: 0.10,
    surgeSkipCount: 1,
    moveInterval: 5,
  },
  {
    id: "buff-surge-2",
    name: "SURGE II",
    rarity: "common",
    type: "surge",
    baseValue: 2800000,
    tickSpeedMultiplier: 0.57, // 1.75x speed
    surgeSkipChance: 0.12,
    surgeSkipCount: 1,
    moveInterval: 5,
  },
  {
    id: "buff-surge-3",
    name: "SURGE III",
    rarity: "rare",
    type: "surge",
    baseValue: 19000000,
    tickSpeedMultiplier: 0.50, // 2x speed
    surgeSkipChance: 0.15,
    surgeSkipCount: 2,
    moveInterval: 5,
  },
  {
    id: "buff-surge-4",
    name: "SURGE IV",
    rarity: "epic",
    type: "surge",
    baseValue: 28000000,
    tickSpeedMultiplier: 0.40, // 2.5x speed
    surgeSkipChance: 0.18,
    surgeSkipCount: 2,
    moveInterval: 5,
  },
  {
    id: "buff-surge-5",
    name: "SURGE V",
    rarity: "mythical",
    type: "surge",
    baseValue: 38000000,
    tickSpeedMultiplier: 0.33, // 3x speed
    surgeSkipChance: 0.20,
    surgeSkipCount: 2,
    moveInterval: 5,
  },

  // FRENZY - Guaranteed double gems with disable risk
  {
    id: "buff-frenzy-1",
    name: "FRENZY I",
    rarity: "common",
    type: "frenzy",
    baseValue: 1500000,
    doubleGemChance: 1.0, // Guaranteed double
    frenzyDisableChance: 0.25, // 25% chance to disable
    frenzyDisableDuration: 60,
    moveInterval: 5,
  },
  {
    id: "buff-frenzy-2",
    name: "FRENZY II",
    rarity: "common",
    type: "frenzy",
    baseValue: 4500000,
    doubleGemChance: 1.0, // Guaranteed double
    frenzyDisableChance: 0.225, // 22.5% chance to disable
    frenzyDisableDuration: 52,
    moveInterval: 5,
  },
  {
    id: "buff-frenzy-3",
    name: "FRENZY III",
    rarity: "rare",
    type: "frenzy",
    baseValue: 26000000,
    doubleGemChance: 1.0, // Guaranteed double
    frenzyDisableChance: 0.20, // 20% chance to disable
    frenzyDisableDuration: 45,
    moveInterval: 5,
  },
  {
    id: "buff-frenzy-4",
    name: "FRENZY IV",
    rarity: "epic",
    type: "frenzy",
    baseValue: 34000000,
    doubleGemChance: 1.0, // Guaranteed double
    frenzyDisableChance: 0.175, // 17.5% chance to disable
    frenzyDisableDuration: 38,
    moveInterval: 5,
  },
  {
    id: "buff-frenzy-5",
    name: "FRENZY V",
    rarity: "mythical",
    type: "frenzy",
    baseValue: 44000000,
    doubleGemChance: 1.0, // Guaranteed double
    frenzyDisableChance: 0.15, // 15% chance to disable
    frenzyDisableDuration: 30,
    moveInterval: 5,
  },

  // MELTDOWN - Guaranteed triple gems with disable risk
  {
    id: "buff-meltdown-1",
    name: "MELTDOWN I",
    rarity: "legendary",
    type: "meltdown",
    baseValue: 26000000,
    tripleGemChance: 1.0, // Guaranteed triple
    meltdownDisableChance: 0.40, // 40% chance to disable
    meltdownDisableDuration: 120,
    moveInterval: 5,
  },
  {
    id: "buff-meltdown-2",
    name: "MELTDOWN II",
    rarity: "legendary",
    type: "meltdown",
    baseValue: 33000000,
    tripleGemChance: 1.0, // Guaranteed triple
    meltdownDisableChance: 0.3625, // 36.25% chance to disable
    meltdownDisableDuration: 105,
    moveInterval: 5,
  },
  {
    id: "buff-meltdown-3",
    name: "MELTDOWN III",
    rarity: "mythical",
    type: "meltdown",
    baseValue: 41000000,
    tripleGemChance: 1.0, // Guaranteed triple
    meltdownDisableChance: 0.325, // 32.5% chance to disable
    meltdownDisableDuration: 90,
    moveInterval: 5,
  },
  {
    id: "buff-meltdown-4",
    name: "MELTDOWN IV",
    rarity: "mythical",
    type: "meltdown",
    baseValue: 45000000,
    tripleGemChance: 1.0, // Guaranteed triple
    meltdownDisableChance: 0.2875, // 28.75% chance to disable
    meltdownDisableDuration: 75,
    moveInterval: 5,
  },
  {
    id: "buff-meltdown-5",
    name: "MELTDOWN V",
    rarity: "mythical",
    type: "meltdown",
    baseValue: 49000000,
    tripleGemChance: 1.0, // Guaranteed triple
    meltdownDisableChance: 0.25, // 25% chance to disable
    meltdownDisableDuration: 60,
    moveInterval: 5,
  },

  // HYPERDRIVE - All-in-one mega buff with gem multipliers and severe risk
  {
    id: "buff-hyperdrive-1",
    name: "HYPERDRIVE I",
    rarity: "legendary",
    type: "hyperdrive",
    baseValue: 30000000,
    doubleGemChance: 0.10,
    tickSpeedMultiplier: 0.50, // 2x speed
    nextTierChanceBonus: 0.02,
    hyperdriveFailChance: 0.20,
    hyperdriveDisableDuration: 120,
    moveInterval: 5,
  },
  {
    id: "buff-hyperdrive-2",
    name: "HYPERDRIVE II",
    rarity: "legendary",
    type: "hyperdrive",
    baseValue: 36000000,
    doubleGemChance: 0.12,
    tripleGemChance: 0.02,
    tickSpeedMultiplier: 0.44, // 2.25x speed
    nextTierChanceBonus: 0.025,
    hyperdriveFailChance: 0.23,
    hyperdriveDisableDuration: 140,
    moveInterval: 5,
  },
  {
    id: "buff-hyperdrive-3",
    name: "HYPERDRIVE III",
    rarity: "mythical",
    type: "hyperdrive",
    baseValue: 42000000,
    doubleGemChance: 0.15,
    tripleGemChance: 0.03,
    tickSpeedMultiplier: 0.40, // 2.5x speed
    nextTierChanceBonus: 0.03,
    hyperdriveFailChance: 0.26,
    hyperdriveDisableDuration: 160,
    moveInterval: 5,
  },
  {
    id: "buff-hyperdrive-4",
    name: "HYPERDRIVE IV",
    rarity: "mythical",
    type: "hyperdrive",
    baseValue: 44000000,
    doubleGemChance: 0.20,
    tripleGemChance: 0.08,
    tickSpeedMultiplier: 0.33, // 3x speed
    nextTierChanceBonus: 0.05,
    hyperdriveFailChance: 0.25,
    hyperdriveDisableDuration: 140,
    moveInterval: 5,
  },
  {
    id: "buff-hyperdrive-5",
    name: "HYPERDRIVE V",
    rarity: "mythical",
    type: "hyperdrive",
    baseValue: 50000000,
    doubleGemChance: 0.25,
    tripleGemChance: 0.12,
    tickSpeedMultiplier: 0.28, // 3.57x speed
    nextTierChanceBonus: 0.08,
    hyperdriveFailChance: 0.22,
    hyperdriveDisableDuration: 120,
    moveInterval: 5,
  },
  
  // STAR - Merge Reward Buffs (awarded when merging pets)
  {
    id: "buff-star-2",
    name: "STAR II",
    rarity: "mythical",
    type: "star",
    baseValue: 100000,
    starLevel: 2,
    capacityBonus: 0.25,
    buffEffectivenessBonus: 0.15,
    tickSpeedMultiplier: 0.90, // 11.1% faster
    moveInterval: 999999, // Never moves
  },
  {
    id: "buff-star-3",
    name: "STAR III",
    rarity: "mythical",
    type: "star",
    baseValue: 5000000,
    starLevel: 3,
    capacityBonus: 0.50,
    buffEffectivenessBonus: 0.35,
    tickSpeedMultiplier: 0.80, // 25% faster
    moveInterval: 999999,
  },
  {
    id: "buff-star-4",
    name: "STAR IV",
    rarity: "mythical",
    type: "star",
    baseValue: 50000000,
    starLevel: 4,
    capacityBonus: 1.50,
    buffEffectivenessBonus: 0.60,
    tickSpeedMultiplier: 0.70, // 42.9% faster
    moveInterval: 999999,
  },
  {
    id: "buff-star-5",
    name: "STAR V",
    rarity: "mythical",
    type: "star",
    baseValue: 250000000,
    starLevel: 5,
    capacityBonus: 2.50,
    buffEffectivenessBonus: 1.00,
    tickSpeedMultiplier: 0.60, // 66.7% faster
    moveInterval: 999999,
  },
];
