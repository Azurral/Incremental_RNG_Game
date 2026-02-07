// components/game/LandGrid.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LandGrid as LandGridType } from "../../src/game/types/land";
import { Pet } from "../../src/game/types/pet";
import { PlacedBuff, Buff } from "../../src/game/types/buff";
import GridCell from "./GridCell";
import PetInfoPopup from "./PetInfoPopup";
import BuffInfoPopup from "./BuffInfoPopup";

interface LandGridProps {
  grid: LandGridType;
  pets: Pet[];
  buffs: PlacedBuff[];
  scale: number;
  onScaleChange: (scale: number) => void;
  onPetPlaced: (petId: string, x: number, y: number) => void;
  onPetMoved: (petId: string, fromX: number, fromY: number, toX: number, toY: number) => void;
  onBuffPlaced: (buffId: string, x: number, y: number) => void;
  onBuffMoved: (buffId: string, fromX: number, fromY: number, toX: number, toY: number) => void;
  onSellPet?: (petId: string, value: number) => void;
  onHidePetToInventory?: (petId: string) => void;
  onTogglePetLock?: (petId: string) => void;
  onCollectGems?: (petId: string) => void;
  onTilePurchase?: (position: { x: number; y: number }) => void;
  draggedItem: { id: string; type: "pet" | "buff"; fromGrid: boolean; position?: { x: number; y: number } } | null;
  setDraggedItem: (item: { id: string; type: "pet" | "buff"; fromGrid: boolean; position?: { x: number; y: number } } | null) => void;
  inventoryOpen: boolean;
  crateShopOpen: boolean;
  cash?: number;
}

export default function LandGrid({
  grid,
  pets,
  buffs,
  scale,
  onScaleChange,
  onPetPlaced,
  onPetMoved,
  onBuffPlaced,
  onBuffMoved,
  onSellPet,
  onHidePetToInventory,
  onTogglePetLock,
  onCollectGems,
  onTilePurchase,
  draggedItem,
  setDraggedItem,
  inventoryOpen,
  crateShopOpen,
  cash = 0,
}: LandGridProps) {
  const [dropTarget, setDropTarget] = useState<{ x: number; y: number } | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<{ petId: string; tilePos: { x: number; y: number } } | null>(null);
  const [selectedBuffId, setSelectedBuffId] = useState<{ instanceId: string; tilePos: { x: number; y: number } } | null>(null);
  
  // Pan state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close pet popup when inventory or shop opens
  useEffect(() => {
    if (inventoryOpen || crateShopOpen) {
      setSelectedPetId(null);
      setSelectedBuffId(null);
    }
  }, [inventoryOpen, crateShopOpen]);

  // Zoom limits
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;
  const ZOOM_SPEED = 0.1;
  
  // Grid cell size
  const CELL_SIZE = 80; // w-20 = 5rem = 80px
  // Number of land tiles one water tile should cover (NxN)
  const WATER_TILE_LAND_SIZE = 5; // 1 water tile = 5x5 land tiles

  // Reset zoom and pan to center
  const resetView = useCallback(() => {
    onScaleChange(1);
    setPosition({ x: 0, y: 0 });
  }, [onScaleChange]);

  // Get pet by ID
  const getPetById = (petId: string) => pets.find((p) => p.id === petId);

  // Get buff by instance ID
  const getBuffByInstanceId = (instanceId: string) => buffs.find((b) => b.instanceId === instanceId);

  // Get pet on a specific tile
  const getPetOnTile = (x: number, y: number) => {
    const tile = grid.tiles[y]?.[x];
    if (!tile?.petId) return undefined;
    return getPetById(tile.petId);
  };

  // Find placed position for a pet id
  const findPetPosition = (petId: string): { x: number; y: number } | null => {
    for (const row of grid.tiles) {
      for (const tile of row) {
        if (tile.petId === petId) return tile.position;
      }
    }
    return null;
  };

  // Get buff on a specific tile
  const getBuffOnTile = (x: number, y: number) => {
    return buffs.find((b) => b.position?.x === x && b.position?.y === y);
  };

  // Buff display info (small helper similar to PetInfoPopup)
  const getBuffDisplay = (buff: Buff) => {
    // STAR buff always shows first
    if (buff.type === "star" && buff.starLevel) {
      return { emoji: "⭐", description: `Merged Pet Bonus` };
    }
    // Check UNSTABLE (triple + double + noGem)
    if (buff.tripleGemChance && buff.doubleGemChance && buff.noGemChance) {
      return { emoji: "⚠️", description: `Unstable Multi-Gem Buff` };
    }
    // Check combo buffs (JACKPOT, OVERDRIVE, etc.)
    if (buff.tripleGemChance && buff.doubleGemChance) {
      return { emoji: "🎆", description: `Combo Multiplier Buff` };
    }
    if (buff.tickSpeedMultiplier && buff.tickSpeedMultiplier < 1) {
      return { emoji: "⚡", description: `+${Math.round((1 - buff.tickSpeedMultiplier) * 100)}% Speed` };
    }
    if (buff.tripleGemChance) {
      return { emoji: "💫", description: `+${Math.round(buff.tripleGemChance * 100)}% Triple Gem Chance` };
    }
    if (buff.doubleGemChance) {
      return { emoji: "✨", description: `+${Math.round(buff.doubleGemChance * 100)}% Double Gem Chance` };
    }
    if (buff.nextTierChanceBonus) {
      return { emoji: "⬆️", description: `+${Math.round(buff.nextTierChanceBonus * 100)}% Tier Upgrade Chance` };
    }
    return { emoji: "❓", description: "Unknown buff" };
  };

  // Rarity text colors (used for buff popup to match pet UI)
  const rarityTextColors: Record<string, string> = {
    common: "text-gray-400",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-yellow-400",
    mythical: "text-red-400",
  };

  // Progress state for selected buff teleport timer
  const [buffProgress, setBuffProgress] = useState({ progress: 0, timeLeft: 0, totalTime: 0 });

  // Helper to return multiple displays for a buff's effects
  const getBuffDisplays = (buff: Buff) => {
    const displays: { emoji: string; description: string }[] = [];
    
    // STAR buff (merge rewards) - Always display first
    if (buff.type === "star" && buff.starLevel) {
      let bonuses: string[] = [];
      if (buff.capacityBonus) bonuses.push(`+${Math.round(buff.capacityBonus * 100)}% Gem Capacity`);
      if (buff.buffEffectivenessBonus) bonuses.push(`+${Math.round(buff.buffEffectivenessBonus * 100)}% Buff Effectiveness`);
      if (buff.tickSpeedMultiplier && buff.tickSpeedMultiplier < 1) {
        bonuses.push(`-${Math.round((1 - buff.tickSpeedMultiplier) * 100)}% Gem Production Speed`);
      }
      displays.push({ emoji: "⭐", description: `${bonuses.join(', ')}` });
    }
    
    // UNSTABLE (triple + double + noGem)
    if (buff.tripleGemChance && buff.doubleGemChance && buff.noGemChance) {
      displays.push({ emoji: "⚠️", description: `+${(buff.tripleGemChance * 100).toFixed(1)}% Triple, +${(buff.doubleGemChance * 100).toFixed(1)}% Double, +${Math.round(buff.noGemChance * 100)}% No Gems` });
    }
    // Combo buffs with multiple gem chances
    else if (buff.tripleGemChance && buff.doubleGemChance) {
      let parts: string[] = [];
      if (buff.tripleGemChance) parts.push('+' + (buff.tripleGemChance * 100).toFixed(1) + '% Triple');
      if (buff.doubleGemChance) parts.push('+' + (buff.doubleGemChance * 100).toFixed(1) + '% Double');
      displays.push({ emoji: "🎆", description: parts.join(', ') });
    }
    // Individual multipliers
    else if (buff.tripleGemChance) {
      displays.push({ emoji: "💫", description: `+${(buff.tripleGemChance * 100).toFixed(1)}% Triple Gem Chance` });
    }
    else if (buff.doubleGemChance) {
      displays.push({ emoji: "✨", description: `+${Math.round(buff.doubleGemChance * 100)}% Double Gem Chance` });
    }
    
    // Skip speed multiplier display for star buffs (already included in star display)
    if (buff.type !== "star" && buff.tickSpeedMultiplier && buff.tickSpeedMultiplier < 1) {
      displays.push({ emoji: "⚡", description: `+${Math.round((1 - buff.tickSpeedMultiplier) * 100)}% Gem Speed Production on Nearby Pets` });
    }
    if (buff.nextTierChanceBonus) {
      displays.push({ emoji: "⬆️", description: `+${Math.round(buff.nextTierChanceBonus * 100)}% Tier Upgrade Chance` });
    }
    if (displays.length === 0) displays.push({ emoji: "❓", description: "Unknown buff" });
    return displays;
  };

  // Keep buff progress updated for the currently selected buff (top-level hook)
  useEffect(() => {
    if (!selectedBuffId) {
      setBuffProgress({ progress: 0, timeLeft: 0, totalTime: 0 });
      return;
    }

    let mounted = true;

    const update = () => {
      const buff = getBuffByInstanceId(selectedBuffId.instanceId);
      const now = Date.now() / 1000;
      if (!buff) {
        if (mounted) setBuffProgress({ progress: 0, timeLeft: 0, totalTime: 0 });
        return;
      }
      const last = buff.lastMoved ?? now;
      const total = buff.moveInterval || 0;
      if (total <= 0) {
        if (mounted) setBuffProgress({ progress: 100, timeLeft: 0, totalTime: 0 });
        return;
      }

      const elapsed = Math.max(0, now - last);
      const timeLeft = Math.max(0, total - elapsed);
      const progress = Math.min(100, (elapsed / total) * 100);
      if (mounted) setBuffProgress({ progress, timeLeft, totalTime: total });
    };

    update();
    const interval = setInterval(update, 100);
    return () => { mounted = false; clearInterval(interval); };
  }, [selectedBuffId?.instanceId, buffs]);

  // Handle pet click to toggle info popup
  const handlePetClick = (pet: Pet, rect: DOMRect, tilePos: { x: number; y: number }) => {
    setSelectedBuffId(null); // Close buff popup
    // Toggle off if clicking same pet
    if (selectedPetId?.petId === pet.id) {
      setSelectedPetId(null);
    } else {
      setSelectedPetId({
        petId: pet.id,
        tilePos,
      });
    }
  };

  // Handle buff click to toggle info popup
  const handleBuffClick = (buff: PlacedBuff, rect: DOMRect, tilePos: { x: number; y: number }) => {
    setSelectedPetId(null); // Close pet popup
    // Toggle off if clicking same buff
    if (selectedBuffId?.instanceId === buff.instanceId) {
      setSelectedBuffId(null);
    } else {
      setSelectedBuffId({
        instanceId: buff.instanceId,
        tilePos,
      });
    }
  };

  // Handle drag start from grid
  const handleDragStart = (id: string, type: "pet" | "buff", fromGrid: boolean, position: { x: number; y: number }) => {
    setDraggedItem({ id, type, fromGrid, position });
    // Close stats popup when starting to drag
    setSelectedPetId(null);
    setSelectedBuffId(null);
  };

  // Handle drop on cell
  const handleDrop = (x: number, y: number) => {
    if (!draggedItem) return;

    const tile = grid.tiles[y]?.[x];
    let dropSuccessful = false;
    
    if (draggedItem.type === "pet") {
      // Don't allow placing a generating pet onto a tile that has a placed buff
      // (prevents merging a generator with a placed buff item)
      const buffAtTile = buffs.find((b) => b.position && b.position.x === x && b.position.y === y);
      if (buffAtTile) {
        setDraggedItem(null);
        setDropTarget(null);
        return;
      }

      // If cell has a pet and we're moving from grid (not from inventory), allow it for merging
      // The onPetMoved handler will check if merge is possible
      if (tile?.petId && !draggedItem.fromGrid) {
        // Don't allow placing from inventory onto a pet
        setDraggedItem(null);
        setDropTarget(null);
        return;
      }

      if (draggedItem.fromGrid && draggedItem.position) {
        // Check if dropping on the same tile (no movement)
        const isSameTile = draggedItem.position.x === x && draggedItem.position.y === y;
        
        if (isSameTile) {
          // Just cancel the drag, don't move
          console.log('[LandGrid] Dropped on same tile, canceling drag');
          dropSuccessful = true;
        } else {
          // Moving from another cell - this can trigger merge if target has pet
          console.log('[LandGrid] Calling onPetMoved for potential merge');
          onPetMoved(
            draggedItem.id,
            draggedItem.position.x,
            draggedItem.position.y,
            x,
            y
          );
          dropSuccessful = true;
        }
      } else {
        // Placing from inventory - only on empty cells
        if (!tile?.petId) {
          onPetPlaced(draggedItem.id, x, y);
          dropSuccessful = true;
        }
      }
    } else {
      // Buff - can only be placed on empty tiles (no pets)
      if (tile?.petId) {
        setDraggedItem(null);
        setDropTarget(null);
        return;
      }
      
      if (draggedItem.fromGrid && draggedItem.position) {
        onBuffMoved(
          draggedItem.id,
          draggedItem.position.x,
          draggedItem.position.y,
          x,
          y
        );
        dropSuccessful = true;
      } else {
        onBuffPlaced(draggedItem.id, x, y);
        dropSuccessful = true;
      }
    }

    // Only clear dragged item if drop was successful
    if (dropSuccessful) {
      setDraggedItem(null);
      setDropTarget(null);
    }
  };

  // Handle wheel zoom (scroll) - disabled when popup is open
  const handleWheel = useCallback((e: WheelEvent) => {
    if (selectedPetId || selectedBuffId) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
    onScaleChange(newScale);
  }, [scale, onScaleChange, selectedPetId, selectedBuffId]);

  // Handle mouse down for panning (drag anywhere)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow right-click (button 2) to pan
    if (e.button !== 2) return;
    
    // Don't pan if clicking on a pet or buff (let click handle it)
    const target = e.target as HTMLElement;
    if (target.closest('.pet-square') || target.closest('.buff-square')) return;
    
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    // Close stats popup when panning starts
    setSelectedPetId(null);
    setSelectedBuffId(null);
  };

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    
    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;
    
    // Calculate grid dimensions
    const gridWidth = grid.width * CELL_SIZE * scale;
    const gridHeight = grid.height * CELL_SIZE * scale;
    
    // Get container dimensions
    const container = containerRef.current;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Limit pan so grid stays visible (at least partially)
    const maxPanX = Math.max(0, (gridWidth / 2) + (containerWidth / 2) - CELL_SIZE * scale);
    const maxPanY = Math.max(0, (gridHeight / 2) + (containerHeight / 2) - CELL_SIZE * scale);
    
    setPosition({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
    });
  }, [isPanning, panStart, scale, grid.width, grid.height]);

  // Handle mouse up to stop panning
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Keyboard shortcut for reset (Z key)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    
    if (e.key.toLowerCase() === "z" && !e.ctrlKey) {
      resetView();
    }
  }, [resetView]);

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp, handleKeyDown]);

  const gridElements = grid.tiles.flat().map((tile) => (
    <GridCell
      key={`${tile.position.x}-${tile.position.y}`}
      tile={tile}
      pet={getPetOnTile(tile.position.x, tile.position.y)}
      buff={getBuffOnTile(tile.position.x, tile.position.y)}
      isDropTarget={dropTarget?.x === tile.position.x && dropTarget?.y === tile.position.y}
      scale={scale}
      onDragStart={handleDragStart}
      onDrop={() => handleDrop(tile.position.x, tile.position.y)}
      onDragEnter={() => setDropTarget(tile.position)}
      onDragLeave={() => setDropTarget(null)}
      onPetClick={handlePetClick}
      onBuffClick={handleBuffClick}
      onTilePurchase={onTilePurchase}
      cash={cash}
      allTiles={grid.tiles}
    />
  ));

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-transparent flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => e.preventDefault()}
      style={{ cursor: isPanning ? "grabbing" : "default" }}
    >
            <div
              className="grid relative transition-transform duration-150 ease-out"
              style={{
                gridTemplateColumns: `repeat(${grid.width}, 1fr)`,
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                zIndex: 10,
                position: 'relative',
              }}
            >
              {/* Fixed 11x11 water tile area centered inside the grid (each water tile = 5x5 land tiles) */}
              {(() => {
                const waterTileSizePx = CELL_SIZE * WATER_TILE_LAND_SIZE;
                const tilesPerSide = 31; // 31x31 water tiles (20 tiles each direction)
                const bgWidth = tilesPerSide * waterTileSizePx;
                const bgHeight = tilesPerSide * waterTileSizePx;
                const gridWidthPx = grid.width * CELL_SIZE;
                const gridHeightPx = grid.tiles.length * CELL_SIZE;
                const left = (gridWidthPx - bgWidth) / 2;
                const top = (gridHeightPx - bgHeight) / 2;

                return (
                  <div
                    style={{
                      position: 'absolute',
                      left,
                      top,
                      width: bgWidth,
                      height: bgHeight,
                      zIndex: 0,
                      pointerEvents: 'none',
                      backgroundImage: `url('/assets/water.gif')`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: `${waterTileSizePx}px ${waterTileSizePx}px`,
                      backgroundPosition: 'top left',
                    }}
                  />
                );
              })()}

              {/* Per-tile outline+shadow layer (rendered inside the transformed grid so outlines sit behind neighboring tiles) */}
              {grid.tiles.flat().filter(t => t.unlocked).map((tile) => {
                const leftPx = tile.position.x * CELL_SIZE;
                const topPx = tile.position.y * CELL_SIZE;
                return (
                  <div
                    key={`outline-${tile.position.x}-${tile.position.y}`}
                    style={{
                      position: 'absolute',
                      left: leftPx,
                      top: topPx,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      zIndex: 5, // behind tile children (grid has zIndex 10)
                      pointerEvents: 'none',
                      boxSizing: 'border-box',
                      border: '2px solid #d6b89a',
                      boxShadow: '0 0 36px rgba(0,0,0,0.9)',
                    }}
                  />
                );
              })}

              {gridElements}
            </div>

        {/* (buff overlay moved outside grid for reliable visibility) */}


      {/* Overlay layer (sibling of grid) - mirrors grid transform so overlays align precisely */}
      <div
        // overlay positioned relative to container; compute absolute pixel coords
        className="absolute pointer-events-none"
        style={{ left: 0, top: 0, width: '100%', height: '100%', zIndex: 999 }}
        key={`overlay-pos-${position.x}-${position.y}-${scale}`}
      >
        {/* AOE Radius Indicators (animated dashed outline) for pets with AOE buffs */}
        {pets.map((p) => {
          const pos = findPetPosition(p.id);
          if (!pos || !p.buffs) return null;
          
          // Only show when pet is selected
          if (!selectedPetId || selectedPetId.petId !== p.id) return null;
          
          // Check if pet has any AOE buffs (any buff with areaRadius property)
          const aoeBuffs = p.buffs.filter(b => b.areaRadius && b.areaRadius > 0);
          
          if (aoeBuffs.length === 0) return null;
          
          // Use the largest radius from all AOE buffs
          const maxRadius = Math.max(...aoeBuffs.map(b => b.areaRadius ?? 0));
          
          const container = containerRef.current;
          if (!container) return null;
          const crect = container.getBoundingClientRect();
          
          const gridWidthPx = grid.width * CELL_SIZE * scale;
          const gridHeightPx = grid.height * CELL_SIZE * scale;
          const gridLeft = (crect.width - gridWidthPx) / 2 + position.x;
          const gridTop = (crect.height - gridHeightPx) / 2 + position.y;
          
          const leftPx = gridLeft + (pos.x - maxRadius) * CELL_SIZE * scale;
          const topPx = gridTop + (pos.y - maxRadius) * CELL_SIZE * scale;
          const sizePx = CELL_SIZE * (maxRadius * 2 + 1) * scale;
          
          return (
            <div
              key={`aoe-outline-${p.id}-radius-${maxRadius}`}
              style={{ position: 'absolute', left: leftPx, top: topPx, width: sizePx, height: sizePx, pointerEvents: 'none' }}
            >
              <svg width={sizePx} height={sizePx} viewBox={`0 0 ${sizePx} ${sizePx}`} style={{ position: 'absolute', top: 0, left: 0 }}>
                <rect x={6} y={6} width={sizePx - 12} height={sizePx - 12} stroke="rgba(200,200,200,0.5)" strokeWidth={8} strokeDasharray="20 10" fill="rgba(128,128,128,0.03)" className="aoe-radius-outline" />
              </svg>
            </div>
          );
        })}
      
        {pets.map((p) => {
          if (!p.providesBuffs || !p.buffRadius) return null;
          if (!selectedPetId || selectedPetId.petId !== p.id) return null;
          const pos = findPetPosition(p.id);
          if (!pos) return null;
          const radius = p.buffRadius;

          const container = containerRef.current;
          if (!container) return null;
          const crect = container.getBoundingClientRect();

          const gridWidthPx = grid.width * CELL_SIZE * scale;
          const gridHeightPx = grid.height * CELL_SIZE * scale;
          const gridLeft = (crect.width - gridWidthPx) / 2 + position.x;
          const gridTop = (crect.height - gridHeightPx) / 2 + position.y;

          const leftPx = gridLeft + (pos.x - radius) * CELL_SIZE * scale;
          const topPx = gridTop + (pos.y - radius) * CELL_SIZE * scale;
          const sizePx = CELL_SIZE * (radius * 2 + 1) * scale;

          return (
            <div
              key={`overlay-${p.id}-buff-radius-${radius}`}
              style={{ position: 'absolute', left: leftPx, top: topPx, width: sizePx, height: sizePx, pointerEvents: 'none' }}
            >
              <svg width={sizePx} height={sizePx} viewBox={`0 0 ${sizePx} ${sizePx}`} style={{ position: 'absolute', top: 0, left: 0 }}>
                <rect x={7.5} y={7.5} width={sizePx - 15} height={sizePx - 15} stroke="rgba(200,200,200,0.6)" strokeWidth={15} strokeDasharray="15 45" fill="rgba(128,128,128,0.04)" className="buff-radius-outline" />
              </svg>
            </div>
          );
        })}

        {/* Also show overlay when a placed buff instance is selected */}
        {selectedBuffId && (() => {
          const b = getBuffByInstanceId(selectedBuffId.instanceId);
          if (!b || !b.position) return null;
          const pos = b.position;
          const radius = b.areaRadius ?? 0;

          const container = containerRef.current;
          if (!container) return null;
          const crect = container.getBoundingClientRect();

          const gridWidthPx = grid.width * CELL_SIZE * scale;
          const gridHeightPx = grid.height * CELL_SIZE * scale;
          const gridLeft = (crect.width - gridWidthPx) / 2 + position.x;
          const gridTop = (crect.height - gridHeightPx) / 2 + position.y;

          const leftPx = gridLeft + (pos.x - radius) * CELL_SIZE * scale;
          const topPx = gridTop + (pos.y - radius) * CELL_SIZE * scale;
          const sizePx = CELL_SIZE * (radius * 2 + 1) * scale;

          return (
            <div
              key={`overlay-buff-${b.instanceId}-radius-${radius}`}
              style={{ position: 'absolute', left: leftPx, top: topPx, width: sizePx, height: sizePx, pointerEvents: 'none' }}
            >
              <svg width={sizePx} height={sizePx} viewBox={`0 0 ${sizePx} ${sizePx}`} style={{ position: 'absolute', top: 0, left: 0 }}>
                <rect x={7.5} y={7.5} width={sizePx - 15} height={sizePx - 15} stroke="rgba(200,200,200,0.6)" strokeWidth={15} strokeDasharray="15 10" fill="rgba(0, 0, 0, 0.1)" className="buff-radius-outline" />
              </svg>
            </div>
          );
        })()}

        <style>{`
          .buff-radius-outline { stroke-linecap: butt; animation: dash-anim 12s linear infinite; }
          .aoe-radius-outline { stroke-linecap: butt; animation: dash-anim 10s linear infinite; }
          @keyframes dash-anim { to { stroke-dashoffset: -500; } }
        `}</style>
        
        {/* Render popups in overlay so they sit above the radius outlines */}
        {(() => {
          const container = containerRef.current;
          if (!container) return null;
          const crect = container.getBoundingClientRect();
          const gridWidthPx = grid.width * CELL_SIZE * scale;
          const gridHeightPx = grid.height * CELL_SIZE * scale;
          const gridLeft = (crect.width - gridWidthPx) / 2 + position.x;
          const gridTop = (crect.height - gridHeightPx) / 2 + position.y;

          // Pet popup
          if (selectedPetId) {
            const pet = getPetById(selectedPetId.petId);
              if (pet) {
              const petPos = findPetPosition(pet.id) ?? selectedPetId.tilePos;
              // Position pet popup beside the pet tile (right side by default)
              const gridWidthPx = grid.width * CELL_SIZE * scale;
              const gridHeightPx = grid.tiles.length * CELL_SIZE * scale;
              const gridLeft = (crect.width - gridWidthPx) / 2 + position.x;
              const gridTop = (crect.height - gridHeightPx) / 2 + position.y;

              const petLeft = gridLeft + petPos.x * CELL_SIZE * scale;
              const petTop = gridTop + petPos.y * CELL_SIZE * scale;

              // Place popup to the right of the tile, or to the left if there's no room
              const popupWidth = 320; // approximate popup width in px
              const rightCandidate = petLeft + CELL_SIZE * scale + 8;
              const leftCandidate = petLeft - popupWidth - 8;
              const useLeft = rightCandidate + popupWidth > crect.width && leftCandidate >= 0;
              const popupLeft = useLeft ? leftCandidate : rightCandidate;

              const popupTop = Math.max(8, Math.min(crect.height - 8 - 200, petTop)); // clamp vertically
              const positionedStyle = { position: 'absolute' as const, left: popupLeft, top: popupTop, transform: 'none' };
              let activeBuffs: Buff[] = [];
              // Buff-providing pets should NOT receive buffs from other buff pets or placed buffs
              const isBuffProvider = Boolean(pet.providesBuffs && pet.providesBuffs.length > 0);
              if (!isBuffProvider) {
                // placed buff items - compute locally from `buffs` prop
                activeBuffs.push(...buffs.filter((b) => {
                  if (!b.position || !b.areaRadius) return false;
                  const dx = Math.abs(petPos.x - b.position.x);
                  const dy = Math.abs(petPos.y - b.position.y);
                  return dx <= b.areaRadius && dy <= b.areaRadius;
                }));

                // buffs provided by nearby pets (bee/moth)
                for (const otherPet of pets) {
                  if (!otherPet.providesBuffs || !otherPet.buffRadius) continue;
                  const buffingPos = findPetPosition(otherPet.id);
                  if (!buffingPos) continue;
                  const dx = Math.abs(petPos.x - buffingPos.x);
                  const dy = Math.abs(petPos.y - buffingPos.y);
                  if (dx <= otherPet.buffRadius && dy <= otherPet.buffRadius) activeBuffs.push(...otherPet.providesBuffs);
                }

                // buffs from nearby generator pets with AOE buffs (CLUSTER, ECHO, STABILIZER, etc.)
                for (const otherPet of pets) {
                  if (otherPet.id === pet.id) continue; // Skip self
                  if (!otherPet.buffs || otherPet.buffs.length === 0) continue;
                  
                  const otherPos = findPetPosition(otherPet.id);
                  if (!otherPos) continue;
                  
                  // Check each buff from the other pet
                  for (const buff of otherPet.buffs) {
                    // Skip buffs without areaRadius (self-only buffs like REGULATOR, HYPERDRIVE, etc.)
                    if (!buff.areaRadius) continue;
                    
                    const dx = Math.abs(petPos.x - otherPos.x);
                    const dy = Math.abs(petPos.y - otherPos.y);
                    
                    // If within the buff's area radius, add it to active buffs
                    if (dx <= buff.areaRadius && dy <= buff.areaRadius) {
                      activeBuffs.push(buff);
                    }
                  }
                }

                // Note: Pet's own intrinsic buffs (pet.buffs) are handled separately in PetInfoPopup
                // to distinguish between innate and area buffs
              }

              // Deduplicate activeBuffs by type, keeping only the highest level of each buff type
              const buffsByType = new Map<string, Buff>();
              for (const buff of activeBuffs) {
                const existing = buffsByType.get(buff.type);
                if (!existing) {
                  buffsByType.set(buff.type, buff);
                } else {
                  // Compare levels: extract roman numeral and convert to number
                  const getRomanLevel = (name: string) => {
                    const romanMap: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
                    const parts = name.split(' ');
                    const roman = parts[parts.length - 1];
                    return romanMap[roman] || 0;
                  };
                  
                  const existingLevel = getRomanLevel(existing.name);
                  const newLevel = getRomanLevel(buff.name);
                  
                  if (newLevel > existingLevel) {
                    buffsByType.set(buff.type, buff);
                  }
                }
              }
              activeBuffs = Array.from(buffsByType.values());

              return (
                <div key={`popup-pet-${pet.id}`} style={{ ...positionedStyle, zIndex: 1200, pointerEvents: 'auto' }}>
                  <PetInfoPopup 
                    pet={pet} 
                    activeBuffs={activeBuffs} 
                    onClose={() => setSelectedPetId(null)} 
                    onSell={onSellPet} 
                    onHideToInventory={onHidePetToInventory}
                    onToggleLock={onTogglePetLock}
                    onCollectGems={onCollectGems}
                    scale={scale} 
                  />
                </div>
              );
            }
          }

          // Buff popup
          if (selectedBuffId) {
            const b = getBuffByInstanceId(selectedBuffId.instanceId);
            if (b) {
              const bPos = b.position ?? selectedBuffId.tilePos;
              // Center buff popup in the middle of the overlay
              const centeredStyleBuff = { position: 'absolute' as const, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
              return (
                <div key={`popup-buff-${b.instanceId}`} style={{ ...centeredStyleBuff, zIndex: 1200, pointerEvents: 'auto' }}>
                  <BuffInfoPopup buff={b} onClose={() => setSelectedBuffId(null)} scale={scale} />
                </div>
              );
            }
          }

          return null;
        })()}

      </div>

      
    </div>
  );
}
