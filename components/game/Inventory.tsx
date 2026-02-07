// components/game/Inventory.tsx
"use client";

import { useState, useRef } from "react";
import { Pet } from "../../src/game/types/pet";
import { Gem } from "../../src/game/types/gem";
import { Buff, PlacedBuff } from "../../src/game/types/buff";
import PetInfoPopup from "./PetInfoPopup";
import { generatorPetTemplates } from "../../src/game/constants/pets";

interface InventoryProps {
  pets: Pet[];
  gems: Gem[];
  buffs: PlacedBuff[];
  placedPetIds: string[];
  placedBuffInstanceIds: string[];
  onInventoryDragStart: (id: string, type: "pet" | "buff") => void;
  open: boolean;
  setOpen: (open: boolean) => void;
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
  "buff-star-2": "⭐",
  "buff-star-3": "⭐",
  "buff-star-4": "⭐",
  "buff-star-5": "⭐",
};

export default function Inventory({
  pets,
  gems,
  buffs,
  placedPetIds,
  placedBuffInstanceIds,
  onInventoryDragStart,
  open,
  setOpen,
}: InventoryProps) {
  const [hoveredPet, setHoveredPet] = useState<{ pet: Pet; rect: DOMRect } | null>(null);
  const petRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [imgErrored, setImgErrored] = useState<string[]>([]);
  
  // Filter out already placed pets and developer test pets (exclude any id starting with 'test')
  // Then sort by rarity (mythical > legendary > epic > rare > common) and by starRating desc when tied
  const rarityOrder: Record<string, number> = {
    mythical: 5,
    legendary: 4,
    epic: 3,
    rare: 2,
    common: 1,
  };

  // Build a stable ordering for pet templates based on generatorPetTemplates declaration order
  const templateKeys = Object.keys(generatorPetTemplates);
  const templateOrder: Record<string, number> = {};
  templateKeys.forEach((k, idx) => (templateOrder[k] = idx));

  const unplacedPets = pets
    .filter((p) => !placedPetIds.includes(p.id) && !p.id.startsWith("test"))
    .slice()
    .sort((a, b) => {
      const r = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      if (r !== 0) return r;

      // Same rarity: prefer higher pet template order (as defined in generatorPetTemplates)
      const knownIds = templateKeys;
      const aBase = knownIds.find((k) => a.id.startsWith(k)) ?? a.id.replace(/(-\d+){1,2}$/, "");
      const bBase = knownIds.find((k) => b.id.startsWith(k)) ?? b.id.replace(/(-\d+){1,2}$/, "");
      const aIndex = templateOrder[aBase] ?? Number.MAX_SAFE_INTEGER;
      const bIndex = templateOrder[bBase] ?? Number.MAX_SAFE_INTEGER;
      if (aIndex !== bIndex) return aIndex - bIndex; // lower index = higher priority

      // Same template: sort by starRating desc
      const aStars = a.starRating ?? 1;
      const bStars = b.starRating ?? 1;
      return bStars - aStars;
    });

  // Filter out already placed buffs
  const unplacedBuffs = buffs.filter((b) => !placedBuffInstanceIds.includes(b.instanceId));

  // Calculate total gem value
  const totalValue = gems.reduce((sum, g) => sum + g.baseValue, 0);

  const handleDragStart = (e: React.DragEvent, id: string, type: "pet" | "buff", colorClass: string) => {
    e.dataTransfer.effectAllowed = "move";
    
    // Close hover popup when dragging
    setHoveredPet(null);
    
    onInventoryDragStart(id, type);
    // Auto close inventory when dragging starts
    setTimeout(() => setOpen(false), 50);
  };
  
  const handlePetMouseEnter = (pet: Pet, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    setHoveredPet({ pet, rect });
  };
  
  const handlePetMouseLeave = () => {
    setHoveredPet(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />

      {/* Inventory Panel (centered modal) */}
      <div className="relative w-full max-w-3xl bg-zinc-800 rounded-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Inventory</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Pets Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Pets (drag to place)</h3>
          
          {unplacedPets.length === 0 ? (
            <p className="text-zinc-500">All pets are placed on the grid!</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {unplacedPets.map((pet) => {
                // Determine base pet id by matching known templates first
                const knownIds = Object.keys(generatorPetTemplates);
                const matched = knownIds.find((k) => pet.id.startsWith(k));
                const basePetId = matched ?? pet.id.replace(/(-\d+){1,2}$/, "");
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
                const isErrored = imgErrored.includes(pet.id);
                
                return (
                  <div
                    key={pet.id}
                    ref={(el) => {
                      if (el) petRefs.current.set(pet.id, el);
                      else petRefs.current.delete(pet.id);
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, pet.id, "pet", rarityColors[pet.rarity])}
                    onMouseEnter={(e) => handlePetMouseEnter(pet, e.currentTarget)}
                    onMouseLeave={handlePetMouseLeave}
                    className={`
                      ${rarityColors[pet.rarity]} 
                      w-16 h-16 rounded-lg cursor-grab active:cursor-grabbing
                      flex items-center justify-center
                      hover:scale-105 transition-transform
                      border-2 border-white/20
                    `}
                    title={pet.name}
                  >
                    {!isErrored ? (
                      <img
                        src={iconUrl}
                        alt={pet.name}
                        className="w-12 h-12 object-contain"
                        onError={() => setImgErrored((prev) => prev.includes(pet.id) ? prev : [...prev, pet.id])}
                        draggable={false}
                      />
                    ) : (
                      <span className="text-2xl">{emoji}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Buffs Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Buffs</h3>
          
          {unplacedBuffs.length === 0 ? (
            <p className="text-zinc-500">All buffs are placed on the grid!</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {unplacedBuffs.map((buff) => {
                const iconKey = (buff.id || '').split('-')[1] ?? buff.id;
                const iconName = (iconKey || '').toString().toUpperCase();
                const iconUrl = `/buff-icons/${iconName}bufficon.png`;
                const isErroredBuff = imgErrored.includes(buff.instanceId);

                return (
                  <div
                    key={buff.instanceId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, buff.instanceId, "buff", "bg-yellow-500")}
                    className={`
                      bg-yellow-500 
                      w-16 h-16 rounded-lg cursor-grab active:cursor-grabbing
                      flex items-center justify-center
                      hover:scale-105 transition-transform
                      border-2 border-white/20
                    `}
                    title={buff.name}
                  >
                    {!isErroredBuff ? (
                      <img
                        src={iconUrl}
                        alt={buff.name}
                        className="w-10 h-10 object-contain"
                        onError={() => setImgErrored((prev) => prev.includes(buff.instanceId) ? prev : [...prev, buff.instanceId])}
                        draggable={false}
                      />
                    ) : (
                      <span className="text-2xl">{buffEmojis[buff.id] || '❓'}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        </div>
      
      {/* Pet Hover Popup */}
      {hoveredPet && (
        <div 
          style={{
            position: 'fixed',
            left: hoveredPet.rect.right + 8,
            top: hoveredPet.rect.top,
            zIndex: 1400,
            pointerEvents: 'none'
          }}
        >
          <PetInfoPopup
            pet={hoveredPet.pet}
            activeBuffs={[]}
            onClose={() => {}}
            scale={1}
            hideButtons={true}
          />
        </div>
      )}
    </div>
  );
}
