// components/game/GridCell.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { LandTile } from "../../src/game/types/land";
import { Pet } from "../../src/game/types/pet";
import { PlacedBuff } from "../../src/game/types/buff";
import { generatorPetTemplates } from "../../src/game/constants/pets";

interface GridCellProps {
  tile: LandTile;
  pet?: Pet;
  buff?: PlacedBuff;
  isDropTarget: boolean;
  scale: number;
  onDragStart: (id: string, type: "pet" | "buff", fromGrid: boolean, position: { x: number; y: number }) => void;
  onDrop: () => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onPetClick?: (pet: Pet, rect: DOMRect, tilePos: { x: number; y: number }) => void;
  onBuffClick?: (buff: PlacedBuff, rect: DOMRect, tilePos: { x: number; y: number }) => void;
  onTilePurchase?: (position: { x: number; y: number }) => void;
  cash?: number;
  allTiles?: LandTile[][];
}

// Color mapping for pet rarity
const rarityColors: Record<string, string> = {
  common: "bg-gray-400",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
  mythical: "bg-red-500",
};

// Emoji for pet types (based on pet id prefix)
const petEmojis: Record<string, string> = {
  "pet-common-1": "🦀",
  "pet-rare-1": "🐌",
  "pet-epic-1": "💎",
  "pet-legendary-1": "🐚",
  "pet-mythical-1": "🐢",
  "pet-buff-bee": "🐝",
  "pet-buff-moth": "🦋",
};

// Emoji for buff types
const buffEmojis: Record<string, string> = {
  "buff-lure-1": "💎",
  "buff-lure-2": "💎",
  "buff-lure-3": "💎",
  "buff-lure-4": "💎",
  "buff-lure-5": "💎",
  "buff-speed-1": "⚡",
  "buff-speed-2": "⚡",
  "buff-speed-3": "⚡",
  "buff-speed-4": "⚡",
  "buff-speed-5": "⚡",
  "buff-luck-1": "⬆️",
  "buff-luck-2": "⬆️",
  "buff-luck-3": "⬆️",
  "buff-luck-4": "⬆️",
  "buff-luck-5": "⬆️",
  "buff-double-1": "✨",
  "buff-double-2": "✨",
  "buff-double-3": "✨",
  "buff-double-4": "✨",
  "buff-double-5": "✨",
  "buff-triple-1": "💫",
  "buff-triple-2": "💫",
  "buff-triple-3": "💫",
  "buff-sync-1": "🌐",
  "buff-sync-2": "🌐",
  "buff-cluster-1": "🔗",
  "buff-cluster-2": "🔗",
  "buff-overclock-1": "🔥",
  "buff-overclock-2": "🔥",
  "buff-overclock-3": "🔥",
  "buff-refine-1": "💰",
  "buff-refine-2": "💰",
  "buff-refine-3": "💰",
  "buff-unstable-1": "⚠️",
  "buff-unstable-2": "⚠️",
  "buff-gamble-1": "🎲",
  "buff-gamble-2": "🎲",
  "buff-gamble-3": "🎲",
};

export default function GridCell({
  tile,
  pet,
  buff,
  isDropTarget,
  scale,
  onDragStart,
  onDrop,
  onDragEnter,
  onDragLeave,
  onPetClick,
  onBuffClick,
  onTilePurchase,
  cash = 0,
  allTiles,
}: GridCellProps) {
  const [isDraggable, setIsDraggable] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [draggingType, setDraggingType] = useState<"pet" | "buff" | null>(null);
  const [isHoveringLocked, setIsHoveringLocked] = useState(false);
  const [purchaseProgress, setPurchaseProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const purchaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const purchaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  // Derive base pet id by matching known templates first, fallback to regex strip
  const knownIds = Object.keys(generatorPetTemplates);
  const basePetIdForCell = pet ? (knownIds.find((k) => pet.id.startsWith(k)) ?? pet.id.replace(/(-\d+){1,2}$/, "")) : undefined;
  const isPetBuff = Boolean(pet?.providesBuffs && pet.providesBuffs.length > 0) || basePetIdForCell?.startsWith("pet-buff-");

  const [imgError, setImgError] = useState(false);

  // Reset image error when the resolved base pet id changes so new images are attempted
  useEffect(() => {
    setImgError(false);
  }, [basePetIdForCell]);

  // Determine sand texture index based on tile position within a 3x3 pattern
  const getSandIndex = (x: number, y: number) => {
    const xm = ((x % 3) + 3) % 3; // ensure positive modulo
    const ym = ((y % 3) + 3) % 3;
    return ym * 3 + xm + 1; // 1..9
  };
  const sandIndex = getSandIndex(tile.position.x, tile.position.y);
  const sandUrl = `/assets/sandtile (${sandIndex}).png`;

  // Check if tile has at least one unlocked neighbor (orthogonal only)
  const hasUnlockedNeighbor = () => {
    if (!allTiles) return true; // If no grid data, allow purchase (fallback)
    
    const { x, y } = tile.position;
    const neighbors = [
      { x: x - 1, y }, // left
      { x: x + 1, y }, // right
      { x, y: y - 1 }, // up
      { x, y: y + 1 }, // down
    ];
    
    for (const neighbor of neighbors) {
      if (neighbor.y >= 0 && neighbor.y < allTiles.length &&
          neighbor.x >= 0 && neighbor.x < allTiles[neighbor.y].length) {
        const neighborTile = allTiles[neighbor.y][neighbor.x];
        if (neighborTile.unlocked) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Handle locked tile purchase
  const handleLockedTileMouseDown = () => {
    if (!tile.unlocked && tile.price !== undefined && cash >= tile.price && hasUnlockedNeighbor()) {
      setPurchaseProgress(0);
      
      // Start visual progress
      purchaseIntervalRef.current = setInterval(() => {
        setPurchaseProgress((prev) => Math.min(prev + 2, 100)); // 50 updates over 500ms
      }, 10);
      
      // Execute purchase after 500ms
      purchaseTimerRef.current = setTimeout(() => {
        onTilePurchase?.(tile.position);
        setPurchaseProgress(0);
        setIsHoveringLocked(false);
        
        if (purchaseIntervalRef.current) {
          clearInterval(purchaseIntervalRef.current);
          purchaseIntervalRef.current = null;
        }
      }, 500);
    }
  };

  const handleLockedTileMouseUp = () => {
    if (purchaseTimerRef.current) {
      clearTimeout(purchaseTimerRef.current);
      purchaseTimerRef.current = null;
    }
    if (purchaseIntervalRef.current) {
      clearInterval(purchaseIntervalRef.current);
      purchaseIntervalRef.current = null;
    }
    setPurchaseProgress(0);
  };

  // Start hold timer on mouse down
  const handleMouseDown = (type: "pet" | "buff") => {
    if (type === "pet" && !pet) return;
    if (type === "buff" && !buff) return;

    // If this is a buff-providing pet (bee/moth), DO NOT allow manual dragging from the grid.
    // Buff pets should teleport/move on their own after being placed; disallow hold-to-drag.
    if (type === "pet") {
      // Check if pet is locked
      if (pet?.locked) {
        return; // ignore mousedown for locked pets
      }
      
      const basePetId = pet?.id.replace(/(-\d+){1,2}$/, "");
      const isBuffPet = Boolean(pet?.providesBuffs && pet.providesBuffs.length > 0) || basePetId?.startsWith("pet-buff-");
      if (isBuffPet) {
        return; // ignore mousedown so user cannot start a drag
      }
    }

    setDraggingType(type);
    setIsHolding(true);
    holdTimerRef.current = setTimeout(() => {
      setIsDraggable(true);
    }, 500); // 0.5 second hold
  };

  // Cancel hold on mouse up/leave
  const handleMouseUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    setDraggingType(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Extra safeguard: prevent dragging of buff-providing pets or placed buff instances
    if (draggingType === "pet" && isPetBuff) {
      e.preventDefault();
      return;
    }
    if (draggingType === "buff" && buff && buff.id.startsWith("buff-")) {
      e.preventDefault();
      return;
    }

    if (!isDraggable || !draggingType) {
      e.preventDefault();
      return;
    }
    
    const id = draggingType === "pet" ? pet?.id : buff?.instanceId;
    if (!id) {
      e.preventDefault();
      return;
    }
    
    // Create scaled drag image that matches zoom level
    const targetClass = draggingType === "pet" ? '.pet-square' : '.buff-square';
    const element = e.currentTarget.querySelector(targetClass) as HTMLElement;
    if (element) {
      const clone = element.cloneNode(true) as HTMLElement;
      const scaledSize = 64 * scale; // 64px = w-16 base size
      clone.style.width = `${scaledSize}px`;
      clone.style.height = `${scaledSize}px`;
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      e.dataTransfer.setDragImage(clone, scaledSize / 2, scaledSize / 2);
      
      // Remove clone after drag starts
      requestAnimationFrame(() => {
        document.body.removeChild(clone);
      });
    }
    
    e.dataTransfer.effectAllowed = "move";
    onDragStart(id, draggingType, true, tile.position);
  };

  const handleDragEnd = () => {
    setIsDraggable(false);
    setIsHolding(false);
    setDraggingType(null);
    // Clear any pending hold timer
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handlePetClick = () => {
    // Also reset drag state in case it got stuck
    if (isDraggable) {
      setIsDraggable(false);
      setIsHolding(false);
      setDraggingType(null);
      return;
    }
    if (!pet || !cellRef.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    onPetClick?.(pet, rect, tile.position);
  };

  const handleBuffClick = () => {
    // Also reset drag state in case it got stuck
    if (isDraggable) {
      setIsDraggable(false);
      setIsHolding(false);
      setDraggingType(null);
      return;
    }
    if (!buff || !cellRef.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    onBuffClick?.(buff, rect, tile.position);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop();
  };

  // Format price with commas
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  // Render locked tile
  if (!tile.unlocked) {
    const canAfford = tile.price !== undefined && cash >= tile.price;
    const hasNeighbor = hasUnlockedNeighbor();
    const canPurchase = canAfford && hasNeighbor;
    
    return (
      <div
        ref={cellRef}
        className={`
          w-20 h-20 flex flex-col items-center justify-center relative z-[9500]
          transition-all duration-150
          ${isHoveringLocked ? "bg-gray-700" : "bg-transparent"}
        `}
        onMouseEnter={() => setIsHoveringLocked(true)}
        onMouseLeave={() => {
          setIsHoveringLocked(false);
          handleLockedTileMouseUp();
        }}
        onMouseDown={handleLockedTileMouseDown}
        onMouseUp={handleLockedTileMouseUp}
      >
        {/* Gray dotted border on hover */}
        {isHoveringLocked && (
          <div className="absolute inset-0 border-2 border-dashed border-gray-400 pointer-events-none bg-gray-700/70" />
        )}
        
        {/* BUY text and price */}
        {isHoveringLocked && tile.price !== undefined && (
          <div className="flex flex-col items-center justify-center gap-1 z-10">
            {!hasNeighbor ? (
              <span className="text-xs font-bold text-red-400">LOCKED</span>
            ) : (
              <div
                className={
                  `w-20 h-20 flex items-center justify-center relative z-[9500] overflow-hidden rounded-lg
                  transition-all duration-150
                  ${isDropTarget ? "bg-green-400" : ""}`
                }
                draggable={isDraggable && !isPetBuff}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold">BUY</span>
                  <span className="text-xs text-gray-200">{formatPrice(tile.price)}</span>
                  <div className="w-14 h-1 bg-gray-600 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-green-500 transition-all duration-100"
                      style={{ width: `${purchaseProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
      <div
        ref={cellRef}
        className={`
          w-20 h-20 flex items-center justify-center relative z-[9500]
          transition-all duration-150
          ${isDropTarget ? "bg-green-400" : ""}
        `}
      draggable={isDraggable && !isPetBuff}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
        {/* Sand layer (behind pets/buffs) - no border radius so global outline shows on edges */}
        <div className="absolute inset-0 bg-center bg-no-repeat bg-cover z-10" style={{ backgroundImage: `url('${sandUrl}')` }} />

      {/* Pet display */}
      {pet && (() => {
        const basePetId = basePetIdForCell ?? pet.id.replace(/(-\d+){1,2}$/, "");
        const emoji = petEmojis[basePetId] || "❓";

        const petIconMap: Record<string, string> = {
          "pet-hermit-crab": "/pet-icons/pet-hermit-crab.png",
          "pet-sea-urchin": "/pet-icons/pet-sea-urchin.png",
          "pet-tarnished-clam": "/pet-icons/pet-tarnished-clam.png",
          "pet-polished-snail": "/pet-icons/polished-snail.png",
          "pet-tide-crawler": "/pet-icons/pet-tide-crawler.png",
          "pet-fracture-crab": "/pet-icons/pet-fracture-crab.png",
          "pet-gilded-oyster": "/pet-icons/pet-gilded-oyster.png",
          "pet-pearl-nautilus": "/pet-icons/pet-pearl-nautilus.png",
          "pet-shiny-lobster": "/pet-icons/pet-shiny-lobster.png",
          // generator template key is 'pet-opaline-scallop' but filename has double 'l'
          "pet-opaline-scallop": "/pet-icons/pet-opalline-scallop.png",
          "pet-crystalline-mantis-shrimp": "/pet-icons/pet-crystalline-mantis-shrimp.png",
          "pet-prismatic-spider-crab": "/pet-icons/pet-prismatic-spider-crab.png",
          "pet-ancient-geodenum-turtle": "/pet-icons/pet-ancient-geodenum-turtle.png",
          "pet-cosmic-trilobite": "/pet-icons/pet-cosmic-trilobite.png",
          // generator template key is 'pet-voidwyrm-isopod' but filename is 'pet-voidwrym-isopod.png'
          "pet-voidwyrm-isopod": "/pet-icons/pet-voidwrym-isopod.png",
        };

        const iconUrl = petIconMap[basePetId] ?? `/pet-icons/${basePetId}.png`;

        return (
          <>
            {/* Render the pet image directly so it fills the tile. Keep the `pet-square` class
                for existing selectors and drag-image cloning. */}
            {!imgError ? (
              <img
                src={iconUrl}
                alt={pet.name}
                title={pet.name}
                draggable={false}
                onError={() => setImgError(true)}
                onClick={handlePetClick}
                onMouseDown={() => handleMouseDown("pet")}
                className={`pet-square relative z-20 w-[90%] h-[90%] object-contain block m-auto ${isDraggable && draggingType === "pet" ? "cursor-grabbing" : "cursor-pointer"}`}
              />
            ) : (
              <div
                title={pet.name}
                onClick={handlePetClick}
                onMouseDown={() => handleMouseDown("pet")}
                className={`pet-square relative z-20 w-full h-full flex items-center justify-center ${rarityColors[pet.rarity]} ${isDraggable && draggingType === "pet" ? "cursor-grabbing" : "cursor-pointer"}`}
              >
                <span className="text-2xl">{emoji}</span>
              </div>
            )}
          </>
        );
      })()}

      {/* Buff display */}
      {buff && (() => {
        const emoji = buffEmojis[buff.id] || "❓";
        
        return (
          <div
            className={`buff-square relative z-20 w-16 h-16 rounded-lg border-2 border-white/20 bg-yellow-500 flex items-center justify-center ${isDraggable && draggingType === "buff" ? "cursor-grabbing" : "cursor-pointer"}`}
            title={buff.name}
            onClick={handleBuffClick}
            onMouseDown={() => handleMouseDown("buff")}
          >
            <span className="text-2xl">{emoji}</span>
          </div>
        );
      })()}
    </div>
  );
}
