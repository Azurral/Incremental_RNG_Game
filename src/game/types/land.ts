// src/game/types/land.ts

export interface Position {
  x: number;
  y: number;
}

export interface LandTile {
  position: Position;
  petId?: string;      // Pet placed on this tile
  buffIds: string[];   // Active buffs affecting this tile
  unlocked: boolean;   // Whether this tile can be used (default locked)
  price?: number;      // Cost to unlock this tile (if locked)
}

export interface LandGrid {
  width: number;
  height: number;
  tiles: LandTile[][];
}
