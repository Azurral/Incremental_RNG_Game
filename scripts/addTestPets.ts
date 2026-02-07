// scripts/addTestPets.ts
// Run this in the browser console to add test pets with downtime buffs

import { Pet } from "../src/game/types/pet";

export const createTestPets = (): Pet[] => {
  return [
    // OVERCLOCK Test Pet
    {
      id: "test-pet-overclock",
      name: "Overclock Tester",
      rarity: "legendary",
      gemsPerTick: 5,
      tickInterval: 40000,
      baseUpgradeChance: 0.025,
      tierUpgradeBonus: 0.01,
      buffs: [
        {
          id: "buff-overclock-5",
          name: "OVERCLOCK V",
          rarity: "legendary",
          type: "overclock",
          tickSpeedMultiplier: 0.40,
          areaRadius: 0,
          moveInterval: 0,
          disableChance: 0.10,
          disableMinDuration: 60,
          disableMaxDuration: 80,
        },
      ],
    },
    // BURNOUT Test Pet
    {
      id: "test-pet-burnout",
      name: "Burnout Tester",
      rarity: "legendary",
      gemsPerTick: 5,
      tickInterval: 40000,
      baseUpgradeChance: 0.025,
      tierUpgradeBonus: 0.01,
      buffs: [
        {
          id: "buff-burnout-5",
          name: "BURNOUT V",
          rarity: "legendary",
          type: "burnout",
          tickSpeedMultiplier: 0.45,
          gemValueMultiplier: 1.60,
          areaRadius: 0,
          moveInterval: 0,
          disableChance: 0.16,
          disableMinDuration: 60,
          disableMaxDuration: 90,
        },
      ],
    },
    // STRAIN Test Pet
    {
      id: "test-pet-strain",
      name: "Strain Tester",
      rarity: "legendary",
      gemsPerTick: 5,
      tickInterval: 40000,
      baseUpgradeChance: 0.025,
      tierUpgradeBonus: 0.01,
      buffs: [
        {
          id: "buff-strain-5",
          name: "STRAIN V",
          rarity: "legendary",
          type: "strain",
          nextTierChanceBonus: 0.35,
          areaRadius: 0,
          moveInterval: 0,
          disableChance: 0.12,
          disableMinDuration: 70,
          disableMaxDuration: 100,
        },
      ],
    },
    // HYPERDRIVE Test Pet
    {
      id: "test-pet-hyperdrive",
      name: "Hyperdrive Tester",
      rarity: "legendary",
      gemsPerTick: 5,
      tickInterval: 40000,
      baseUpgradeChance: 0.025,
      tierUpgradeBonus: 0.01,
      buffs: [
        {
          id: "buff-hyperdrive-5",
          name: "HYPERDRIVE V",
          rarity: "legendary",
          type: "hyperdrive",
          tickSpeedMultiplier: 0.25,
          nextTierChanceBonus: 0.25,
          gemValueMultiplier: 1.50,
          areaRadius: 0,
          moveInterval: 0,
          disableChance: 0.20,
          disableMinDuration: 80,
          disableMaxDuration: 120,
        },
      ],
    },
    // MELTDOWN Test Pet
    {
      id: "test-pet-meltdown",
      name: "Meltdown Tester",
      rarity: "legendary",
      gemsPerTick: 5,
      tickInterval: 40000,
      baseUpgradeChance: 0.025,
      tierUpgradeBonus: 0.01,
      buffs: [
        {
          id: "buff-meltdown-5",
          name: "MELTDOWN V",
          rarity: "legendary",
          type: "meltdown",
          tickSpeedMultiplier: 0.35,
          gemValueMultiplier: 2.00,
          nextTierChanceBonus: 0.40,
          areaRadius: 0,
          moveInterval: 0,
          disableChanceIncrement: 0.025,
          disableChanceMax: 0.45,
          disableMinDuration: 90,
          disableMaxDuration: 120,
        },
      ],
    },
    // FRENZY Test Pet
    {
      id: "test-pet-frenzy",
      name: "Frenzy Tester",
      rarity: "legendary",
      gemsPerTick: 5,
      tickInterval: 40000,
      baseUpgradeChance: 0.025,
      tierUpgradeBonus: 0.01,
      buffs: [
        {
          id: "buff-frenzy-5",
          name: "FRENZY V",
          rarity: "legendary",
          type: "frenzy",
          tickSpeedMultiplier: 0.33,
          areaRadius: 0,
          moveInterval: 0,
          frenzyGenerationCount: 10,
          disableMinDuration: 30,
          disableMaxDuration: 60,
        },
      ],
    },
    // EXHAUST Test Pet
    {
      id: "test-pet-exhaust",
      name: "Exhaust Tester",
      rarity: "legendary",
      gemsPerTick: 5,
      tickInterval: 40000,
      baseUpgradeChance: 0.025,
      tierUpgradeBonus: 0.01,
      buffs: [
        {
          id: "buff-exhaust-5",
          name: "EXHAUST V",
          rarity: "legendary",
          type: "exhaust",
          tickSpeedMultiplier: 0.40,
          gemValueMultiplier: 2.50,
          areaRadius: 0,
          moveInterval: 0,
          exhaustGenerationCount: 8,
          disableMinDuration: 30,
          disableMaxDuration: 45,
        },
      ],
    },
  ];
};

// Browser console command to add pets
// Copy and paste this into your browser console:
/*
// Add test pets to inventory
const testPets = [
  {
    id: "test-pet-overclock",
    name: "Overclock Tester",
    rarity: "legendary",
    gemsPerTick: 5,
    tickInterval: 40000,
    baseUpgradeChance: 0.025,
    tierUpgradeBonus: 0.01,
    buffs: [
      {
        id: "buff-overclock-5",
        name: "OVERCLOCK V",
        rarity: "legendary",
        type: "overclock",
        tickSpeedMultiplier: 0.40,
        areaRadius: 0,
        moveInterval: 0,
        disableChance: 0.10,
        disableMinDuration: 60,
        disableMaxDuration: 80,
      },
    ],
  },
  {
    id: "test-pet-burnout",
    name: "Burnout Tester",
    rarity: "legendary",
    gemsPerTick: 5,
    tickInterval: 40000,
    baseUpgradeChance: 0.025,
    tierUpgradeBonus: 0.01,
    buffs: [
      {
        id: "buff-burnout-5",
        name: "BURNOUT V",
        rarity: "legendary",
        type: "burnout",
        tickSpeedMultiplier: 0.45,
        gemValueMultiplier: 1.60,
        areaRadius: 0,
        moveInterval: 0,
        disableChance: 0.16,
        disableMinDuration: 60,
        disableMaxDuration: 90,
      },
    ],
  },
  {
    id: "test-pet-strain",
    name: "Strain Tester",
    rarity: "legendary",
    gemsPerTick: 5,
    tickInterval: 40000,
    baseUpgradeChance: 0.025,
    tierUpgradeBonus: 0.01,
    buffs: [
      {
        id: "buff-strain-5",
        name: "STRAIN V",
        rarity: "legendary",
        type: "strain",
        nextTierChanceBonus: 0.35,
        areaRadius: 0,
        moveInterval: 0,
        disableChance: 0.12,
        disableMinDuration: 70,
        disableMaxDuration: 100,
      },
    ],
  },
  {
    id: "test-pet-hyperdrive",
    name: "Hyperdrive Tester",
    rarity: "legendary",
    gemsPerTick: 5,
    tickInterval: 40000,
    baseUpgradeChance: 0.025,
    tierUpgradeBonus: 0.01,
    buffs: [
      {
        id: "buff-hyperdrive-5",
        name: "HYPERDRIVE V",
        rarity: "legendary",
        type: "hyperdrive",
        tickSpeedMultiplier: 0.25,
        nextTierChanceBonus: 0.25,
        gemValueMultiplier: 1.50,
        areaRadius: 0,
        moveInterval: 0,
        disableChance: 0.20,
        disableMinDuration: 80,
        disableMaxDuration: 120,
      },
    ],
  },
  {
    id: "test-pet-meltdown",
    name: "Meltdown Tester",
    rarity: "legendary",
    gemsPerTick: 5,
    tickInterval: 40000,
    baseUpgradeChance: 0.025,
    tierUpgradeBonus: 0.01,
    buffs: [
      {
        id: "buff-meltdown-5",
        name: "MELTDOWN V",
        rarity: "legendary",
        type: "meltdown",
        tickSpeedMultiplier: 0.35,
        gemValueMultiplier: 2.00,
        nextTierChanceBonus: 0.40,
        areaRadius: 0,
        moveInterval: 0,
        disableChanceIncrement: 0.025,
        disableChanceMax: 0.45,
        disableMinDuration: 90,
        disableMaxDuration: 120,
      },
    ],
  },
  {
    id: "test-pet-frenzy",
    name: "Frenzy Tester",
    rarity: "legendary",
    gemsPerTick: 5,
    tickInterval: 40000,
    baseUpgradeChance: 0.025,
    tierUpgradeBonus: 0.01,
    buffs: [
      {
        id: "buff-frenzy-5",
        name: "FRENZY V",
        rarity: "legendary",
        type: "frenzy",
        tickSpeedMultiplier: 0.33,
        areaRadius: 0,
        moveInterval: 0,
        frenzyGenerationCount: 10,
        disableMinDuration: 30,
        disableMaxDuration: 60,
      },
    ],
  },
  {
    id: "test-pet-exhaust",
    name: "Exhaust Tester",
    rarity: "legendary",
    gemsPerTick: 5,
    tickInterval: 40000,
    baseUpgradeChance: 0.025,
    tierUpgradeBonus: 0.01,
    buffs: [
      {
        id: "buff-exhaust-5",
        name: "EXHAUST V",
        rarity: "legendary",
        type: "exhaust",
        tickSpeedMultiplier: 0.40,
        gemValueMultiplier: 2.50,
        areaRadius: 0,
        moveInterval: 0,
        exhaustGenerationCount: 8,
        disableMinDuration: 30,
        disableMaxDuration: 45,
      },
    ],
  },
];

// Get React component state from the page
const container = document.querySelector('[data-testid="main-page"]');
if (container) {
  const reactKey = Object.keys(container).find(key => key.startsWith('__reactFiber'));
  if (reactKey) {
    const fiber = container[reactKey];
    // Navigate to the HomePage component
    let current = fiber;
    while (current && (!current.memoizedState || !current.memoizedState.memoizedState)) {
      current = current.return;
    }
    if (current) {
      // Find setPets in the hooks chain
      let hook = current.memoizedState;
      while (hook) {
        if (Array.isArray(hook.memoizedState)) {
          // This might be the pets state
          console.log("Adding test pets...");
          // We need to trigger a re-render via the dispatcher
          break;
        }
        hook = hook.next;
      }
    }
  }
}

console.log("Test pets prepared. Please use the developer tools to inject them.");
console.log("Test pets:", testPets);
*/
