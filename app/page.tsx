// app/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Pet } from "../src/game/types/pet";
import { Gem } from "../src/game/types/gem";
import { Buff, PlacedBuff } from "../src/game/types/buff";
import { LandGrid as LandGridType } from "../src/game/types/land";
import { generateGemForPetWithBuffs } from "../src/game/services/generator";
import { createLandGrid, placePet, movePet, getOccupiedTiles, areAllTilesUnlocked, expandGrid } from "../src/game/services/land";
import { createPlacedBuff, placeBuff, moveBuff, shouldBuffMove, getBuffsAtPosition } from "../src/game/services/buff";
import { calculatePetStars } from "../src/game/services/petRating";
import LandGrid from "../components/game/LandGrid";
import Inventory from "../components/game/Inventory";
import InventoryButton from "../components/game/InventoryButton";
import IndexButton from "../components/ui/IndexButton";
import CrateShop from "../components/game/CrateShop";

// Module-level interval IDs to prevent duplicates across React re-renders
let globalGemIntervalId: NodeJS.Timeout | null = null;
let globalBuffIntervalId: NodeJS.Timeout | null = null;

// Global flag to ensure only one gem generation loop ever runs
let gemGenerationStarted = false;

// Debug counter for interval ticks
let intervalTickCount = 0;

// No starter pets - all pets come from crates

export default function HomePage() {
  const [grid, setGrid] = useState<LandGridType>(() => createLandGrid(5, 5));
  const [pets, setPets] = useState<Pet[]>([]);
  const [buffs, setBuffs] = useState<PlacedBuff[]>([]);
  const [gems, setGems] = useState<Gem[]>([]);
  const [cash, setCash] = useState<number>(100000000000); // 100B for testing
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [crateShopOpen, setCrateShopOpen] = useState(false);
  const [indexCloseToggle, setIndexCloseToggle] = useState(0);
  const [scale, setScale] = useState(1);
  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    type: "pet" | "buff";
    fromGrid: boolean;
    position?: { x: number; y: number };
  } | null>(null);

  // Get placed pet IDs from grid
  const getPlacedPetIds = () => getOccupiedTiles(grid).map((t) => t.petId!);
  const placedPetIds = getPlacedPetIds();

  const getPlacedBuffInstanceIds = () => buffs.filter((b) => b.position).map((b) => b.instanceId);
  const placedBuffInstanceIds = getPlacedBuffInstanceIds();

  // Refs to track latest values for intervals
  const gridRef = useRef(grid);
  const petsRef = useRef(pets);
  const buffsRef = useRef(buffs);
  gridRef.current = grid;
  petsRef.current = pets;
  buffsRef.current = buffs;

  // Handle placing pet from inventory to grid
  const handlePetPlaced = (petId: string, x: number, y: number) => {
    // Reset generation timer to current time when placing pet on grid
    const now = Math.floor(Date.now() / 1000);
    setPets(currentPets =>
      currentPets.map(p =>
        p.id === petId
          ? { ...p, lastGenerated: now }
          : p
      )
    );
    
    setGrid((currentGrid) => {
      const newGrid = JSON.parse(JSON.stringify(currentGrid)) as LandGridType;
      placePet(newGrid, { x, y }, petId);
      return newGrid;
    });
  };

  // Handle moving pet between cells
  const handlePetMoved = (
    petId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    console.log('[PetMove] Moving pet', petId, 'from', `${fromX},${fromY}`, 'to', `${toX},${toY}`);
    
    // Check if target cell has a pet for potential merging
    const targetTile = grid.tiles[toY]?.[toX];
    console.log('[PetMove] Target tile:', targetTile);
    
    if (targetTile?.petId) {
      console.log('[PetMove] Target has pet:', targetTile.petId);
      const sourcePet = pets.find(p => p.id === petId);
      const targetPet = pets.find(p => p.id === targetTile.petId);
      
      console.log('[PetMove] Source pet:', sourcePet?.name, 'Target pet:', targetPet?.name);
      
      if (sourcePet && targetPet) {
        const canMerge = canMergePets(sourcePet, targetPet);
        console.log('[PetMove] Can merge?', canMerge);
        
        if (canMerge) {
          handlePetMerge(sourcePet, targetPet, fromX, fromY, toX, toY);
          return;
        }
      }
    }
    
    // Normal move if no merge
    console.log('[PetMove] Performing normal move');
    setGrid((currentGrid) => {
      const newGrid = JSON.parse(JSON.stringify(currentGrid)) as LandGridType;
      movePet(newGrid, { x: fromX, y: fromY }, { x: toX, y: toY });
      return newGrid;
    });
  };
  
  // Check if two pets can be merged
  const canMergePets = (pet1: Pet, pet2: Pet): boolean => {
    console.log('[CanMerge] Checking merge eligibility...');
    console.log('[CanMerge] Pet1:', pet1.name, 'ID:', pet1.id);
    console.log('[CanMerge] Pet2:', pet2.name, 'ID:', pet2.id);
    
    // Must be same base pet type (extract base ID without timestamp)
    const getBasePetType = (petId: string) => {
      const parts = petId.split('-');
      return parts.slice(0, petId.startsWith('pet-buff-') ? 4 : 3).join('-');
    };
    
    const type1 = getBasePetType(pet1.id);
    const type2 = getBasePetType(pet2.id);
    console.log('[CanMerge] Base types:', type1, 'vs', type2, '- Match?', type1 === type2);
    
    if (type1 !== type2) {
      console.log('[CanMerge] FAIL: Different pet types');
      return false;
    }
    
    // Must be same star rating
    const stars1 = calculatePetStars(pet1);
    const stars2 = calculatePetStars(pet2);
    console.log('[CanMerge] Star ratings:', stars1, 'vs', stars2, '- Match?', stars1 === stars2);
    
    if (stars1 !== stars2) {
      console.log('[CanMerge] FAIL: Different star ratings');
      return false;
    }
    
    // Cannot merge if either is locked
    console.log('[CanMerge] Locked status:', 'Pet1:', pet1.locked, 'Pet2:', pet2.locked);
    if (pet1.locked || pet2.locked) {
      console.log('[CanMerge] FAIL: One or both pets are locked');
      return false;
    }
    
    console.log('[CanMerge] SUCCESS: Pets can merge!');
    return true;
  };

  // Auto-merge pets that are in inventory (not placed). Returns a new pets array.
  const autoMergeInventoryPets = (allPets: Pet[], placedIds: string[]) => {
    const now = Math.floor(Date.now() / 1000);
    // Work on a shallow copy
    let petsCopy = [...allPets];

    // Helper to find index by id
    const idxOf = (id: string) => petsCopy.findIndex(p => p.id === id);

    let mergedSomething = true;
    // Repeat until no more merges possible
    while (mergedSomething) {
      mergedSomething = false;

      // Find any pair of unplaced pets that can merge
      outer: for (let i = 0; i < petsCopy.length; i++) {
        const a = petsCopy[i];
        if (placedIds.includes(a.id)) continue;
        if (a.id.startsWith('test')) continue;
        for (let j = i + 1; j < petsCopy.length; j++) {
          const b = petsCopy[j];
          if (placedIds.includes(b.id)) continue;
          if (b.id.startsWith('test')) continue;

          if (canMergePets(a, b)) {
            // Use b as target, a as source (arbitrary)
            const sourcePet = a;
            const targetPet = b;

            // Merge buffs
            let mergedBuffs = mergePetBuffs(sourcePet.buffs || [], targetPet.buffs || []);

            // Calculate star rating logic similar to handlePetMerge
            const oldStarRating = calculatePetStars(targetPet);
            const tempMerged = { ...targetPet, buffs: mergedBuffs } as Pet;
            const newStarRating = calculatePetStars(tempMerged);

            if (newStarRating === oldStarRating + 1 && newStarRating >= 2 && newStarRating <= 5) {
              const { buffs: allBuffs } = require('../src/game/constants/buffs');
              const starBuff = allBuffs.find((bb: any) => bb.id === `buff-star-${newStarRating}`);
              if (starBuff) {
                mergedBuffs = mergedBuffs.filter((b) => b.type !== 'star');
                mergedBuffs.unshift(starBuff);
              }
            }

            const mergedPet: Pet = {
              ...targetPet,
              buffs: mergedBuffs,
              merged: true,
              starRating: newStarRating,
              lastGenerated: now,
            };

            // Replace target and remove source
            petsCopy = petsCopy.map(p => p.id === targetPet.id ? mergedPet : p).filter(p => p.id !== sourcePet.id);
            mergedSomething = true;
            break outer;
          }
        }
      }
    }

    return petsCopy;
  };
  
  // Merge two pets
  const handlePetMerge = (
    sourcePet: Pet,
    targetPet: Pet,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    console.log('[PetMerge] Merging', sourcePet.name, 'into', targetPet.name);
    
    // Calculate star rating BEFORE merge
    const oldStarRating = calculatePetStars(targetPet);
    console.log('[PetMerge] Star rating before merge:', oldStarRating);
    
    // Merge buffs: keep highest tier of each buff type
    let mergedBuffs = mergePetBuffs(sourcePet.buffs || [], targetPet.buffs || []);
    
    // Create temporary merged pet to calculate new star rating
    const tempMergedPet: Pet = {
      ...targetPet,
      buffs: mergedBuffs,
      merged: true,
    };
    
    // Calculate star rating AFTER merge (based on merged buffs)
    const newStarRating = calculatePetStars(tempMergedPet);
    console.log('[PetMerge] Star rating after merge:', newStarRating);
    
    // Only add star buff if rating increased by exactly 1
    if (newStarRating === oldStarRating + 1 && newStarRating >= 2 && newStarRating <= 5) {
      // Import buffs array to find the star buff
      const { buffs } = require('../src/game/constants/buffs');
      const starBuff = buffs.find((b: Buff) => b.id === `buff-star-${newStarRating}`);
      if (starBuff) {
        console.log('[PetMerge] Found star buff:', starBuff);
        console.log('[PetMerge] Star buff properties:', {
          type: starBuff.type,
          starLevel: starBuff.starLevel,
          capacityBonus: starBuff.capacityBonus,
          buffEffectivenessBonus: starBuff.buffEffectivenessBonus,
          tickSpeedMultiplier: starBuff.tickSpeedMultiplier
        });
        // Remove any existing star buffs
        mergedBuffs = mergedBuffs.filter(b => b.type !== 'star');
        // Add new star buff at the beginning
        mergedBuffs.unshift(starBuff);
        console.log('[PetMerge] Star rating increased! Added star buff:', starBuff.name);
      }
    } else if (newStarRating === oldStarRating) {
      console.log('[PetMerge] Star rating unchanged - no star buff added');
    } else {
      console.log('[PetMerge] Star rating did not increase by 1 - no star buff added');
    }
    
    // Create merged pet
    const mergedPet: Pet = {
      ...targetPet,
      buffs: mergedBuffs,
      merged: true, // Mark as merged (no buff limit)
      starRating: newStarRating,
      lastGenerated: Math.floor(Date.now() / 1000),
    };
    
    // Update pets list: remove source pet, update target pet
    setPets((prev) => prev.map(p => 
      p.id === targetPet.id ? mergedPet : p
    ).filter(p => p.id !== sourcePet.id));
    
    // Clear source cell on grid
    setGrid((currentGrid) => {
      const newGrid = JSON.parse(JSON.stringify(currentGrid)) as LandGridType;
      const fromTile = newGrid.tiles[fromY]?.[fromX];
      if (fromTile) {
        fromTile.petId = undefined;
      }
      return newGrid;
    });
    
    console.log('[PetMerge] Merge complete. New buffs:', mergedBuffs.map(b => b.name).join(', '));
  };
  
  // Merge buff arrays: keep highest tier of each buff type
  const mergePetBuffs = (buffs1: Buff[], buffs2: Buff[]): Buff[] => {
    const buffMap = new Map<string, Buff>();
    
    // Add all buffs from both pets
    const allBuffs = [...buffs1, ...buffs2];
    
    for (const buff of allBuffs) {
      const existing = buffMap.get(buff.type);
      if (!existing) {
        buffMap.set(buff.type, buff);
      } else {
        // Compare tiers: extract roman numeral and convert to number
        const getTier = (name: string) => {
          const romanMap: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
          const parts = name.split(' ');
          const roman = parts[parts.length - 1];
          return romanMap[roman] || 0;
        };
        
        const existingTier = getTier(existing.name);
        const newTier = getTier(buff.name);
        
        // Keep higher tier
        if (newTier > existingTier) {
          buffMap.set(buff.type, buff);
        }
      }
    }
    
    return Array.from(buffMap.values());
  };

  // Handle placing buff from inventory to grid
  const handleBuffPlaced = (buffId: string, x: number, y: number) => {
    setBuffs((currentBuffs) => {
      return currentBuffs.map((buff) => {
        if (buff.instanceId === buffId) {
          return placeBuff(buff, { x, y });
        }
        return buff;
      });
    });
  };

  // Handle moving buff between cells
  const handleBuffMoved = (
    buffId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    setBuffs((currentBuffs) => {
      return currentBuffs.map((buff) => {
        if (buff.instanceId === buffId) {
          return placeBuff(buff, { x: toX, y: toY });
        }
        return buff;
      });
    });
  };

  // Handle tile purchase
  const handleTilePurchase = (position: { x: number; y: number }) => {
    const tile = grid.tiles[position.y]?.[position.x];
    if (!tile || tile.unlocked || !tile.price) return;
    
    // Check if player has enough cash
    if (cash < tile.price) return;
    
    // Deduct cash
    setCash((prev) => prev - tile.price!);
    
    // Unlock the tile
    setGrid((currentGrid) => {
      const newGrid = JSON.parse(JSON.stringify(currentGrid)) as LandGridType;
      const targetTile = newGrid.tiles[position.y]?.[position.x];
      if (targetTile) {
        targetTile.unlocked = true;
        targetTile.price = undefined;
      }
      
      // Check if all tiles are now unlocked and expand if needed
      if (areAllTilesUnlocked(newGrid)) {
        // Only expand up to 9x9
        if (newGrid.width < 9) {
          console.log(`[Grid Expansion] All tiles unlocked! Expanding from ${newGrid.width}x${newGrid.height} to ${newGrid.width + 2}x${newGrid.height + 2}`);
          return expandGrid(newGrid);
        }
      }
      
      return newGrid;
    });
  };

  // Handle drag start from inventory
  const handleInventoryDragStart = (id: string, type: "pet" | "buff") => {
    setDraggedItem({ id, type, fromGrid: false });
  };

  // Handle crate purchase
  const handleCratePurchase = (pet: Pet, cost: number) => {
    // Single purchases now also attempt auto-merge
    setCash((prev) => prev - cost);
    setPets((prev) => {
      const next = [...prev, pet];
      try {
        const merged = autoMergeInventoryPets(next, placedPetIds);
        return merged;
      } catch (err) {
        console.error('[CratePurchase] auto-merge failed', err);
        return next;
      }
    });
  };

  // Handle bulk crate purchases (multiple pets at once) - optimized to reduce re-renders
  const handleCratePurchaseBulk = (newPets: Pet[], totalCost: number) => {
    setCash((prev) => prev - totalCost);
    setPets((prev) => {
      const next = [...prev, ...newPets];
      try {
        const merged = autoMergeInventoryPets(next, placedPetIds);
        return merged;
      } catch (err) {
        console.error('[CrateBulkPurchase] auto-merge failed', err);
        return next;
      }
    });
  };

  // Add test pets on mount - one pet per buff type at tier V
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const testPets: Pet[] = [
      // SPEED V
      {
        id: "test-speed",
        name: "Speed Pet",
        rarity: "legendary",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 120,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-speed-5",
          name: "SPEED V",
          rarity: "legendary",
          type: "speed",
          baseValue: 8000000,
          tickSpeedMultiplier: 0.40,
          moveInterval: 5,
        }],
      },
      // LUCK V
      {
        id: "test-luck",
        name: "Luck Pet",
        rarity: "legendary",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 120,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-luck-5",
          name: "LUCK V",
          rarity: "legendary",
          type: "luck",
          baseValue: 12000000,
          nextTierChanceBonus: 0.35,
          moveInterval: 5,
        }],
      },
      // DOUBLE V
      {
        id: "test-double",
        name: "Double Pet",
        rarity: "legendary",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 120,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-double-5",
          name: "DOUBLE V",
          rarity: "legendary",
          type: "double",
          baseValue: 15000000,
          doubleGemChance: 0.20,
          moveInterval: 5,
        }],
      },
      // TRIPLE V
      {
        id: "test-triple",
        name: "Triple Pet",
        rarity: "mythical",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 100,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-triple-5",
          name: "TRIPLE V",
          rarity: "legendary",
          type: "triple",
          baseValue: 35000000,
          tripleGemChance: 0.10,
          moveInterval: 5,
        }],
      },
      // BURST V
      {
        id: "test-burst",
        name: "Burst Pet",
        rarity: "legendary",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 120,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-burst-5",
          name: "BURST V",
          rarity: "legendary",
          type: "burst",
          baseValue: 22000000,
          tickSpeedMultiplier: 0.50,
          doubleGemChance: 0.15,
          moveInterval: 5,
        }],
      },
      // FORTUNE V
      {
        id: "test-fortune",
        name: "Fortune Pet",
        rarity: "legendary",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 120,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-fortune-5",
          name: "FORTUNE V",
          rarity: "legendary",
          type: "fortune",
          baseValue: 25000000,
          nextTierChanceBonus: 0.15,
          doubleGemChance: 0.16,
          moveInterval: 5,
        }],
      },
      // JACKPOT V
      {
        id: "test-jackpot",
        name: "Jackpot Pet",
        rarity: "mythical",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 100,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-jackpot-5",
          name: "JACKPOT V",
          rarity: "mythical",
          type: "jackpot",
          baseValue: 48000000,
          tripleGemChance: 0.07,
          moveInterval: 5,
        }],
      },
      // OVERDRIVE V
      {
        id: "test-overdrive",
        name: "Overdrive Pet",
        rarity: "mythical",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 100,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-overdrive-5",
          name: "OVERDRIVE V",
          rarity: "mythical",
          type: "overdrive",
          baseValue: 47000000,
          tickSpeedMultiplier: 0.50,
          doubleGemChance: 0.16,
          tripleGemChance: 0.06,
          moveInterval: 5,
        }],
      },
      // OVERCLOCK V
      {
        id: "test-overclock",
        name: "Overclock Pet",
        rarity: "mythical",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 100,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-overclock-5",
          name: "OVERCLOCK V",
          rarity: "mythical",
          type: "overclock",
          baseValue: 42000000,
          tickSpeedMultiplier: 0.25,
          overclockFailChance: 0.05,
          overclockDisableDuration: 50,
          moveInterval: 5,
        }],
      },
      // UNSTABLE V
      {
        id: "test-unstable",
        name: "Unstable Pet",
        rarity: "mythical",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 100,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-unstable-5",
          name: "UNSTABLE V",
          rarity: "mythical",
          type: "unstable",
          baseValue: 40000000,
          tripleGemChance: 0.125,
          doubleGemChance: 0.25,
          noGemChance: 0.10,
          moveInterval: 5,
        }],
      },
      // SURGE V
      {
        id: "test-surge",
        name: "Surge Pet",
        rarity: "mythical",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 100,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-surge-5",
          name: "SURGE V",
          rarity: "mythical",
          type: "surge",
          baseValue: 38000000,
          tickSpeedMultiplier: 0.33,
          surgeSkipChance: 0.20,
          surgeSkipCount: 2,
          moveInterval: 5,
        }],
      },
      // FRENZY V
      {
        id: "test-frenzy",
        name: "Frenzy Pet",
        rarity: "mythical",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 100,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-frenzy-5",
          name: "FRENZY V",
          rarity: "mythical",
          type: "frenzy",
          baseValue: 44000000,
          doubleGemChance: 1.0, // Guaranteed double
          frenzyDisableChance: 0.15, // 15% disable chance
          frenzyDisableDuration: 30,
          moveInterval: 5,
        }],
      },
      // MELTDOWN V
      {
        id: "test-meltdown",
        name: "Meltdown Pet",
        rarity: "mythical",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 100,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-meltdown-5",
          name: "MELTDOWN V",
          rarity: "mythical",
          type: "meltdown",
          baseValue: 49000000,
          tripleGemChance: 1.0, // Guaranteed triple
          meltdownDisableChance: 0.25, // 25% disable chance
          meltdownDisableDuration: 60,
          moveInterval: 5,
        }],
      },
      // HYPERDRIVE V
      {
        id: "test-hyperdrive",
        name: "Hyperdrive Pet",
        rarity: "mythical",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 100,
        currentGems: 0,
        lastGenerated: now - 5,
        buffs: [{
          id: "buff-hyperdrive-5",
          name: "HYPERDRIVE V",
          rarity: "mythical",
          type: "hyperdrive",
          baseValue: 50000000,
          doubleGemChance: 0.25,
          tripleGemChance: 0.12,
          tickSpeedMultiplier: 0.28,
          nextTierChanceBonus: 0.08,
          hyperdriveFailChance: 0.22,
          hyperdriveDisableDuration: 120,
          moveInterval: 5,
        }],
      },
      // MERGED PET WITH STAR BUFF (Example)
      {
        id: "test-merged-pet",
        name: "Sea Urchin",
        rarity: "common",
        baseGemRate: 3,
        tickTimeRange: [3, 3],
        maxGemCapacity: 800, // Will be boosted by star buff
        currentGems: 0,
        lastGenerated: now - 5,
        merged: true,
        starRating: 3,
        buffs: [
          {
            id: "buff-star-3",
            name: "STAR III",
            rarity: "mythical",
            type: "star",
            baseValue: 5000000,
            starLevel: 3,
            capacityBonus: 0.50,
            buffEffectivenessBonus: 0.35,
            tickSpeedMultiplier: 0.80,
            moveInterval: 999999,
          },
          {
            id: "buff-speed-4",
            name: "SPEED IV",
            rarity: "epic",
            type: "speed",
            baseValue: 250000,
            tickSpeedMultiplier: 0.55,
            moveInterval: 5,
          },
          {
            id: "buff-double-3",
            name: "DOUBLE III",
            rarity: "rare",
            type: "double",
            baseValue: 45000,
            doubleGemChance: 0.10,
            moveInterval: 5,
          },
        ],
      },
    ];
    
    setPets(testPets);
  }, []);

  // Handle pet sell
  const handlePetSell = (petId: string, value: number) => {
    console.log('[Page] handlePetSell called for petId:', petId, 'value:', value);
    setPets((prev) => prev.filter((p) => p.id !== petId));
    setCash((prev) => prev + value);
    // Also remove from grid if placed
    setGrid((currentGrid) => {
      const newGrid = JSON.parse(JSON.stringify(currentGrid)) as LandGridType;
      for (const row of newGrid.tiles) {
        for (const tile of row) {
          if (tile.petId === petId) {
            tile.petId = undefined;
          }
        }
      }
      return newGrid;
    });
    console.log('[Page] handlePetSell completed');
  };

  // Handle hide pet to inventory (remove from grid but keep in pets list)
  const handleHidePetToInventory = (petId: string) => {
    console.log('[Page] handleHidePetToInventory called for petId:', petId);
    
    setGrid((currentGrid) => {
      const newGrid = JSON.parse(JSON.stringify(currentGrid)) as LandGridType;
      for (const row of newGrid.tiles) {
        for (const tile of row) {
          if (tile.petId === petId) {
            console.log('[Page] Found pet on grid at position:', tile.position, 'removing...');
            tile.petId = undefined;
          }
        }
      }
      return newGrid;
    });
    console.log('[Page] handleHidePetToInventory completed');
  };

  // Handle toggle pet lock
  const handleTogglePetLock = (petId: string) => {
    console.log('[Page] handleTogglePetLock called for petId:', petId);
    setPets((prev) => {
      const updated = prev.map((pet) => 
        pet.id === petId 
          ? { ...pet, locked: !pet.locked }
          : pet
      );
      const targetPet = updated.find(p => p.id === petId);
      console.log('[Page] Toggled lock state for pet:', petId, 'new locked state:', targetPet?.locked);
      return updated;
    });
  };

  // Handle collecting gems from a pet
  const handleCollectGems = (petId: string) => {
    console.log('[Page] handleCollectGems called for petId:', petId);
    setPets((prev) => {
      const pet = prev.find(p => p.id === petId);
      if (!pet || !pet.currentGems || pet.currentGems === 0) {
        console.log('[Page] Pet has no gems to collect');
        return prev;
      }

      // Calculate cash value from gems (simplified - 1 gem = base gem value)
      // In future, this could factor in gem quality/tier
      const cashEarned = pet.currentGems * 100; // 100 cash per gem for now
      console.log('[Page] Collecting', pet.currentGems, 'gems for', cashEarned, 'cash');

      // Add cash
      setCash((prevCash) => prevCash + cashEarned);

      // Reset pet's gem count
      return prev.map((p) => 
        p.id === petId 
          ? { ...p, currentGems: 0 }
          : p
      );
    });
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "c") {
      setCrateShopOpen((prev) => !prev);
    }
    // Don't trigger if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    
    if (e.key.toLowerCase() === "i") {
      setInventoryOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Gem generation loop (only for placed pets) - now with buffs!
  useEffect(() => {
    // Global guard: only start gem generation once ever
    if (gemGenerationStarted) {
      return;
    }
    gemGenerationStarted = true;

    // Use module-level interval to prevent React StrictMode duplicates
    if (globalGemIntervalId) {
      clearInterval(globalGemIntervalId);
      globalGemIntervalId = null;
    }

    globalGemIntervalId = setInterval(() => {
      intervalTickCount++;
      const now = Math.floor(Date.now() / 1000);
      const currentGrid = gridRef.current;
      
      // Get placed pet IDs from current grid state
      const currentPlacedIds: string[] = [];
      for (const row of currentGrid.tiles) {
        for (const tile of row) {
          if (tile.petId) {
            currentPlacedIds.push(tile.petId);
          }
        }
      }

      if (currentPlacedIds.length === 0) return;

      // Calculate gems to add before updating pets
      const gemsToAdd: Gem[] = [];
      const updatedPets = petsRef.current.map((pet) => {
        // Only generate for placed pets
        if (!currentPlacedIds.includes(pet.id)) return pet;

        // Find pet's position on grid
        let petPosition: { x: number; y: number } | null = null;
        for (const row of currentGrid.tiles) {
          for (const tile of row) {
            if (tile.petId === pet.id) {
              petPosition = tile.position;
              break;
            }
            if (petPosition) break;
          }
        }

        // Get buffs from nearby buff items and from buff-providing pets
        const activeBuffs: Buff[] = [];
        if (petPosition) {
          // Do not apply buffs to buff-providing pets themselves
          if (!(pet.providesBuffs && pet.providesBuffs.length > 0)) {
            // Placed buff items
            activeBuffs.push(...getBuffsAtPosition(buffsRef.current, petPosition));

            // Buffs provided by nearby pets (bee/moth)
            for (const otherPet of petsRef.current) {
              if (!otherPet.providesBuffs || !otherPet.buffRadius) continue;

              // find the other pet's placed position
              let otherPos: { x: number; y: number } | null = null;
              for (const row of currentGrid.tiles) {
                for (const tile of row) {
                  if (tile.petId === otherPet.id) {
                    otherPos = tile.position;
                    break;
                  }
                }
                if (otherPos) break;
              }

              if (!otherPos) continue;

              const dx = Math.abs(petPosition.x - otherPos.x);
              const dy = Math.abs(petPosition.y - otherPos.y);
              if (dx <= otherPet.buffRadius && dy <= otherPet.buffRadius) {
                activeBuffs.push(...otherPet.providesBuffs);
              }
            }

            // Buffs from nearby generator pets with AOE buffs (CLUSTER, ECHO, STABILIZER, etc.)
            for (const otherPet of petsRef.current) {
              if (otherPet.id === pet.id) continue; // Skip self
              if (!otherPet.buffs || otherPet.buffs.length === 0) continue;

              // Find the other pet's position
              let otherPos: { x: number; y: number } | null = null;
              for (const row of currentGrid.tiles) {
                for (const tile of row) {
                  if (tile.petId === otherPet.id) {
                    otherPos = tile.position;
                    break;
                  }
                }
                if (otherPos) break;
              }

              if (!otherPos) continue;

              // Check each buff from the other pet
              for (const buff of otherPet.buffs) {
                if (!buff.areaRadius || buff.areaRadius === 0) continue;

                const dx = Math.abs(petPosition.x - otherPos.x);
                const dy = Math.abs(petPosition.y - otherPos.y);

                // If within the buff's area radius, add it to active buffs
                if (dx <= buff.areaRadius && dy <= buff.areaRadius) {
                  activeBuffs.push(buff);
                }
              }
            }
          }
        }

        // Check if enough time has passed for gem generation
        const lastGen = pet.lastGenerated ?? now;
        const elapsed = now - lastGen;
        
        // Calculate STAR buff bonuses (from pet's own buffs, not activeBuffs)
        const starBuff = (pet.buffs || []).find(b => b.type === "star");
        const capacityMultiplier = starBuff?.capacityBonus ? (1 + starBuff.capacityBonus) : 1;
        const buffEffectiveness = starBuff?.buffEffectivenessBonus ? (1 + starBuff.buffEffectivenessBonus) : 1;
        
        // Apply capacity bonus from STAR buff
        const effectiveCapacity = Math.round(pet.maxGemCapacity * capacityMultiplier);
        
        // Check if pet is at capacity
        const currentGems = pet.currentGems || 0;
        if (currentGems >= effectiveCapacity) {
          console.log(`[GEM DEBUG] Pet ${pet.id} is at capacity (${currentGems}/${effectiveCapacity})`);
          // Don't update anything - let the timer keep running so progress bar shows correctly
          return pet;
        }
        
        // Calculate tick speed with buff modifiers (lower = faster)
        // Include both pet's own buffs (like STAR) and activeBuffs from grid
        const allBuffs = [...(pet.buffs || []), ...activeBuffs];
        const tickSpeedMod = allBuffs.reduce(
          (mul, b) => b.tickSpeedMultiplier ? mul * b.tickSpeedMultiplier : mul,
          1
        );
        
        // Average tick time (modified by tick speed buffs)
        const baseAvgTick = (pet.tickTimeRange[0] + pet.tickTimeRange[1]) / 2;
        // Apply speed penalty from STABILIZER/REGULATOR if present (stored by generator)
        const speedPenalty = (pet as any).currentSpeedPenalty || 1.0;
        const avgTick = baseAvgTick * tickSpeedMod * speedPenalty;
        
        console.log(`[GEM TICK DEBUG] Pet ${pet.id}: elapsed=${elapsed.toFixed(1)}s, avgTick=${avgTick.toFixed(1)}s, canGenerate=${elapsed >= avgTick}, currentGems=${currentGems}, capacity=${effectiveCapacity}`);
        
        // Only generate if enough time has passed
        if (elapsed < avgTick) return pet;
        
        console.log(`[GEM GENERATION] Pet ${pet.id} attempting to generate...`);

        // Calculate gem multiplier based on DOUBLE/TRIPLE buff chances
        let gemsToGenerate = 1;
        
        // Check for TRIPLE buffs first (higher priority)
        const tripleChance = activeBuffs.reduce(
          (total, b) => total + ((b.tripleGemChance || 0) * buffEffectiveness),
          0
        );
        if (tripleChance > 0 && Math.random() < tripleChance) {
          gemsToGenerate = 3;
        } else {
          // Check for DOUBLE buffs if triple didn't proc
          const doubleChance = activeBuffs.reduce(
            (total, b) => total + ((b.doubleGemChance || 0) * buffEffectiveness),
            0
          );
          if (doubleChance > 0 && Math.random() < doubleChance) {
            gemsToGenerate = 2;
          }
        }
        
        // Respect capacity limit
        const gemsToAdd = Math.min(gemsToGenerate, effectiveCapacity - currentGems);
        
        // If no gems can be added (at capacity), don't update lastGenerated
        if (gemsToAdd === 0) {
          console.log(`[GEM DEBUG] Pet ${pet.id} at capacity, no gems added`);
          return pet;
        }
        
        // Create a copy and increment gem count
        const petCopy = { 
          ...pet, 
          currentGems: currentGems + gemsToAdd,
          lastGenerated: now
        };
        
        console.log(`[GEM DEBUG] Pet ${pet.id} generated ${gemsToAdd} gem(s) (${petCopy.currentGems}/${effectiveCapacity})`);
        
        return petCopy;
      });

      // Update pets state
      setPets(updatedPets);
    }, 1000);

    return () => {
      if (globalGemIntervalId) {
        clearInterval(globalGemIntervalId);
        globalGemIntervalId = null;
      }
      gemGenerationStarted = false;
    };
  }, []); // No dependencies - use refs for latest values

  // Buff movement loop (teleportation)
  useEffect(() => {
    // Use module-level interval to prevent React StrictMode duplicates
    if (globalBuffIntervalId) {
      clearInterval(globalBuffIntervalId);
      globalBuffIntervalId = null;
    }

    globalBuffIntervalId = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const currentGrid = gridRef.current;

      setBuffs((currentBuffs) =>
        currentBuffs.map((buff) => {
          if (shouldBuffMove(buff, now)) {
            return moveBuff(buff, currentGrid, currentBuffs);
          }
          return buff;
        })
      );
    }, 1000);

    return () => {
      if (globalBuffIntervalId) {
        clearInterval(globalBuffIntervalId);
        globalBuffIntervalId = null;
      }
    };
  }, []); // No dependencies - use refs for latest values

  // Prevent zoom with Ctrl+scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "=")) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <main
      className="h-screen w-screen overflow-hidden bg-transparent text-white flex flex-col"
      suppressHydrationWarning
    >
      {/* Grid Area */}
      <LandGrid
        grid={grid}
        pets={pets}
        buffs={buffs}
        scale={scale}
        onScaleChange={setScale}
        onPetPlaced={handlePetPlaced}
        onPetMoved={handlePetMoved}
        onBuffPlaced={handleBuffPlaced}
        onBuffMoved={handleBuffMoved}
        onSellPet={handlePetSell}
        onHidePetToInventory={handleHidePetToInventory}
        onTogglePetLock={handleTogglePetLock}
        onCollectGems={handleCollectGems}
        onTilePurchase={handleTilePurchase}
        draggedItem={draggedItem}
        setDraggedItem={setDraggedItem}
        inventoryOpen={inventoryOpen}
        crateShopOpen={crateShopOpen}
        cash={cash}
      />

      {/* Left-side stacked controls: Crate (top), Index (middle), Inventory (bottom) */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[99999] flex flex-col items-start gap-[10px]">
        <InventoryButton
          onClick={() => {
            setCrateShopOpen((prev) => {
              const next = !prev;
              if (next) {
                setInventoryOpen(false);
                setIndexCloseToggle((s) => s + 1);
              }
              return next;
            });
          }}
          variant="crate"
          imageSrc="/button-icons/CRATESicon.png"
        />

        <div>
          <IndexButton pets={pets} onOpen={() => { setInventoryOpen(false); setCrateShopOpen(false); }} externalCloseToggle={indexCloseToggle} />
        </div>

        <InventoryButton
          onClick={() => {
            setInventoryOpen((prev) => {
              const next = !prev;
              if (next) {
                setCrateShopOpen(false);
                setIndexCloseToggle((s) => s + 1);
              }
              return next;
            });
          }}
          gemCount={gems.length}
          variant="inventory"
          imageSrc="/button-icons/INVENTORYicon.png"
        />
      </div>

      {/* Cash Display (Bottom Left) - follow IndexButton format except width */}
      <div className="fixed left-4 bottom-4 z-40 shadow-lg">
        <div className="relative w-[420px] h-[125px] bg-[#00000066] rounded-[10px] overflow-hidden outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 transition-opacity duration-150">
          {/* Decorative layered backgrounds like IndexButton (width is flexible) */}
          <div className="absolute top-0 left-0 w-full h-[117px] bg-[#00b149] rounded-[10px] border-4 border-solid border-[#34342b]" />

          <div className="absolute top-0 left-0 w-full h-[107px] flex bg-[#00ff6a] rounded-[10px] overflow-hidden border-4 border-solid border-[#2b342e]">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[395px] h-[87px] flex items-center justify-center bg-[#00000066] rounded-[5px] overflow-hidden border-4 border-solid border-[#00000066]"></div>

            <div className="w-full flex items-center justify-center">
              <div className="text-4xl font-extrabold text-zinc-900">${cash.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Crate Shop Modal */}
      <CrateShop
        open={crateShopOpen}
        setOpen={setCrateShopOpen}
        cash={cash}
        onPurchase={handleCratePurchase}
        onBulkPurchase={handleCratePurchaseBulk}
      />
      {/* Inventory Modal */}
      <Inventory
        pets={pets}
        buffs={buffs}
        gems={gems}
        placedPetIds={placedPetIds}
        placedBuffInstanceIds={placedBuffInstanceIds}
        onInventoryDragStart={handleInventoryDragStart}
        open={inventoryOpen}
        setOpen={setInventoryOpen}
      />
    </main>
  );
}
