// src/game/services/land.ts
import { LandGrid, LandTile, Position } from "../types/land";

// Pricing per-tile for specific ring distances (distance = max(|x-centerX|, |y-centerY|))
// distance 2 => each tile in the 5x5 ring costs 10,000,000
// distance 3 => each tile in the 7x7 ring costs 125,000,000
// distance 4 => each tile in the 9x9 ring costs 500,000,000
const PER_TILE_PRICES: Record<number, number> = {
  2: 10_000_000,
  3: 125_000_000,
  4: 500_000_000,
};

function getPerTilePriceForDistance(distance: number): number {
  // distances < 2 are center and should be free
  if (distance < 2) return 0;

  const perTile = PER_TILE_PRICES[distance];
  if (perTile !== undefined) {
    return Math.max(1, Math.round(perTile));
  }

  // Fallback to exponential pricing for larger grids (shouldn't hit normally)
  const basePrice = 1000000;
  return Math.round(basePrice * Math.pow(3, distance - 1));
}

/**
 * Create an empty land grid with expandable tiles
 * Center 3x3 is unlocked by default, outer tiles are locked
 */
export function createLandGrid(width: number, height: number): LandGrid {
  const tiles: LandTile[][] = [];
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  for (let y = 0; y < height; y++) {
    const row: LandTile[] = [];
    for (let x = 0; x < width; x++) {
      // Unlock center 3x3 tiles (1 tile radius from center)
      const isCenter = Math.abs(x - centerX) <= 1 && Math.abs(y - centerY) <= 1;
      
      // Calculate price based on distance from center (ring-based targets)
      const distance = Math.max(Math.abs(x - centerX), Math.abs(y - centerY));
      const price = isCenter ? 0 : getPerTilePriceForDistance(distance);
      
      row.push({
        position: { x, y },
        petId: undefined,
        buffIds: [],
        unlocked: isCenter,
        price: isCenter ? undefined : price,
      });
    }
    tiles.push(row);
  }

  return { width, height, tiles };
}

/**
 * Get a specific tile
 */
export function getTile(grid: LandGrid, pos: Position): LandTile | undefined {
  if (pos.x < 0 || pos.x >= grid.width || pos.y < 0 || pos.y >= grid.height) {
    return undefined;
  }
  return grid.tiles[pos.y][pos.x];
}

/**
 * Place a pet on a tile
 */
export function placePet(grid: LandGrid, pos: Position, petId: string): boolean {
  const tile = getTile(grid, pos);
  if (!tile || tile.petId) return false; // Invalid or occupied
  
  tile.petId = petId;
  return true;
}

/**
 * Remove a pet from a tile
 */
export function removePet(grid: LandGrid, pos: Position): string | undefined {
  const tile = getTile(grid, pos);
  if (!tile || !tile.petId) return undefined;
  
  const petId = tile.petId;
  tile.petId = undefined;
  return petId;
}

/**
 * Move a pet from one tile to another
 */
export function movePet(grid: LandGrid, from: Position, to: Position): boolean {
  const fromTile = getTile(grid, from);
  const toTile = getTile(grid, to);
  
  if (!fromTile?.petId || !toTile || toTile.petId) return false;
  
  toTile.petId = fromTile.petId;
  fromTile.petId = undefined;
  return true;
}

/**
 * Get all empty tiles
 */
export function getEmptyTiles(grid: LandGrid): LandTile[] {
  const empty: LandTile[] = [];
  for (const row of grid.tiles) {
    for (const tile of row) {
      if (!tile.petId) empty.push(tile);
    }
  }
  return empty;
}

/**
 * Get all tiles with pets
 */
export function getOccupiedTiles(grid: LandGrid): LandTile[] {
  const occupied: LandTile[] = [];
  for (const row of grid.tiles) {
    for (const tile of row) {
      if (tile.petId) occupied.push(tile);
    }
  }
  return occupied;
}

/**
 * Get tiles within radius (for buff areas)
 */
export function getTilesInRadius(
  grid: LandGrid,
  center: Position,
  radius: number
): LandTile[] {
  const tiles: LandTile[] = [];

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const tile = getTile(grid, { x: center.x + dx, y: center.y + dy });
      if (tile) tiles.push(tile);
    }
  }

  return tiles;
}

/**
 * Check if all tiles in the grid are unlocked
 */
export function areAllTilesUnlocked(grid: LandGrid): boolean {
  for (const row of grid.tiles) {
    for (const tile of row) {
      if (!tile.unlocked) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Expand the grid by adding a new border of locked tiles
 * Returns a new grid with expanded dimensions
 */
export function expandGrid(currentGrid: LandGrid): LandGrid {
  const newWidth = currentGrid.width + 2;
  const newHeight = currentGrid.height + 2;
  const tiles: LandTile[][] = [];
  
  const centerX = Math.floor(newWidth / 2);
  const centerY = Math.floor(newHeight / 2);
  const basePrice = 1000000; // 1M

  for (let y = 0; y < newHeight; y++) {
    const row: LandTile[] = [];
    for (let x = 0; x < newWidth; x++) {
      // Check if this is an existing tile (offset by 1 from old grid)
      const oldX = x - 1;
      const oldY = y - 1;
      const isOldTile = oldX >= 0 && oldX < currentGrid.width && 
                        oldY >= 0 && oldY < currentGrid.height;
      
      if (isOldTile) {
        // Copy existing tile with updated position
        const oldTile = currentGrid.tiles[oldY][oldX];
        row.push({
          ...oldTile,
          position: { x, y },
        });
      } else {
        // New border tile - locked with price (use ring-based pricing)
        const distance = Math.max(Math.abs(x - centerX), Math.abs(y - centerY));
        const price = getPerTilePriceForDistance(distance);

        row.push({
          position: { x, y },
          petId: undefined,
          buffIds: [],
          unlocked: false,
          price,
        });
      }
    }
    tiles.push(row);
  }

  return { width: newWidth, height: newHeight, tiles };
}
