// src/game/services/buff.ts
import { PlacedBuff, Buff } from "../types/buff";
import { LandGrid, Position } from "../types/land";

/**
 * Create a placed buff instance from a buff definition
 */
export function createPlacedBuff(buff: Buff, index: number): PlacedBuff {
  return {
    ...buff,
    instanceId: `${buff.id}-${Date.now()}-${index}`,
    position: undefined,
    lastMoved: undefined,
  };
}

/**
 * Place a buff on the grid
 */
export function placeBuff(buff: PlacedBuff, position: Position): PlacedBuff {
  return {
    ...buff,
    position,
    lastMoved: Math.floor(Date.now() / 1000),
  };
}

/**
 * Remove buff from grid (back to inventory)
 */
export function removeBuff(buff: PlacedBuff): PlacedBuff {
  return {
    ...buff,
    position: undefined,
    lastMoved: undefined,
  };
}

/**
 * Get a random empty position on the grid (no pets and no buffs)
 */
export function getRandomEmptyPosition(grid: LandGrid, placedBuffs: PlacedBuff[] = [], excludePosition: Position | null = null): Position | null {
  // Get positions of existing buffs
  const buffPositions = new Set(
    placedBuffs
      .filter(b => b.position)
      .map(b => `${b.position!.x},${b.position!.y}`)
  );

  // Get all empty tiles (no pets and no buffs)
  const emptyTiles: Position[] = [];
  for (const row of grid.tiles) {
    for (const tile of row) {
      const posKey = `${tile.position.x},${tile.position.y}`;
      const isExcluded = excludePosition && tile.position.x === excludePosition.x && tile.position.y === excludePosition.y;
      if (!tile.petId && !buffPositions.has(posKey) && !isExcluded) {
        emptyTiles.push(tile.position);
      }
    }
  }

  if (emptyTiles.length === 0) return null;

  return emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
}

/**
 * Get a random position near pets but on empty tiles (for moth's smart movement)
 */
export function getSmartEmptyPosition(grid: LandGrid, placedBuffs: PlacedBuff[] = [], excludePosition: Position | null = null): Position | null {
  // Get positions of existing buffs
  const buffPositions = new Set(
    placedBuffs
      .filter(b => b.position)
      .map(b => `${b.position!.x},${b.position!.y}`)
  );

  // Find all tiles with pets
  const petsPositions: Position[] = [];
  for (const row of grid.tiles) {
    for (const tile of row) {
      if (tile.petId) {
        petsPositions.push(tile.position);
      }
    }
  }

  // If no pets, just return random empty position
  if (petsPositions.length === 0) {
    return getRandomEmptyPosition(grid, placedBuffs);
  }

  // Try multiple pets to find an empty nearby tile that isn't the excluded position.
  // Shuffle petsPositions for randomness.
  for (let i = petsPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = petsPositions[i];
    petsPositions[i] = petsPositions[j];
    petsPositions[j] = tmp;
  }

  for (const targetPet of petsPositions) {
    // Get all empty positions within 1 tile of the pet (no pets and no buffs)
    const nearbyEmpty: Position[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = targetPet.x + dx;
        const y = targetPet.y + dy;
        if (x >= 0 && x < grid.width && y >= 0 && y < grid.height) {
          const tile = grid.tiles[y][x];
          const posKey = `${x},${y}`;
          const isExcluded = excludePosition && x === excludePosition.x && y === excludePosition.y;
          if (!tile.petId && !buffPositions.has(posKey) && !isExcluded) {
            nearbyEmpty.push({ x, y });
          }
        }
      }
    }

    if (nearbyEmpty.length > 0) {
      return nearbyEmpty[Math.floor(Math.random() * nearbyEmpty.length)];
    }
  }

  // Fallback to any random empty position (excluding excluded position)
  return getRandomEmptyPosition(grid, placedBuffs, excludePosition);
}

/**
 * Move a buff to a new empty position (teleport)
 */
export function moveBuff(buff: PlacedBuff, grid: LandGrid, allBuffs: PlacedBuff[] = []): PlacedBuff {
  if (!buff.position) return buff;

  // When choosing a new position, exclude the current buff's tile so the buff
  // won't teleport back to the same cell unless there are no other empty tiles.
  // Pass the full list of placed buffs (including this one) so the selection
  // helpers will treat the current position as occupied.
  let newPosition: Position | null;

  // All buffs use random movement
  newPosition = getRandomEmptyPosition(grid, allBuffs, buff.position ?? null);

  // If no empty position found, stay in place
  if (!newPosition) {
    return {
      ...buff,
      lastMoved: Math.floor(Date.now() / 1000),
    };
  }

  return {
    ...buff,
    position: newPosition,
    lastMoved: Math.floor(Date.now() / 1000),
  };
}

/**
 * Check if a buff should move based on its interval
 */
export function shouldBuffMove(buff: PlacedBuff, currentTime: number): boolean {
  if (!buff.position || !buff.lastMoved) return false;
  return currentTime - buff.lastMoved >= buff.moveInterval;
}

/**
 * Get all buffs affecting a specific position
 */
export function getBuffsAtPosition(
  buffs: PlacedBuff[],
  position: Position
): PlacedBuff[] {
  return buffs.filter((buff) => {
    if (!buff.position || !buff.areaRadius) return false;

    // Check if position is within buff's area radius
    const dx = Math.abs(position.x - buff.position.x);
    const dy = Math.abs(position.y - buff.position.y);

    return dx <= buff.areaRadius && dy <= buff.areaRadius;
  });
}

/**
 * Get buff at exact position (for display)
 */
export function getBuffAtPosition(
  buffs: PlacedBuff[],
  position: Position
): PlacedBuff | undefined {
  return buffs.find(
    (buff) => buff.position?.x === position.x && buff.position?.y === position.y
  );
}

/**
 * Check if a position is within any buff's effect range
 */
export function isInBuffRange(
  buffs: PlacedBuff[],
  position: Position
): boolean {
  return getBuffsAtPosition(buffs, position).length > 0;
}