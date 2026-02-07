"use client";

import React, { useEffect, useState, useRef } from "react";
import PetInfoPopup from "../game/PetInfoPopup";
import { createPortal } from "react-dom";
import { generatorPetTemplates } from "../../src/game/constants/pets";
import { Pet } from "../../src/game/types/pet";
import { calculatePetStars } from "../../src/game/services/petRating";

type Props = {
  onClose: () => void;
  open?: boolean;
  pets?: Pet[]; // player's owned pets
};

export default function IndexPanel({ onClose, open = true, pets = [] }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const [hovered, setHovered] = useState<{ pet: any; rect: DOMRect } | null>(null);
  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
    "pet-opaline-scallop": "/pet-icons/pet-opalline-scallop.png",
    "pet-crystalline-mantis-shrimp": "/pet-icons/pet-crystalline-mantis-shrimp.png",
    "pet-prismatic-spider-crab": "/pet-icons/pet-prismatic-spider-crab.png",
    "pet-ancient-geodenum-turtle": "/pet-icons/pet-ancient-geodenum-turtle.png",
    "pet-cosmic-trilobite": "/pet-icons/pet-cosmic-trilobite.png",
    "pet-voidwyrm-isopod": "/pet-icons/pet-voidwrym-isopod.png",
  };

  const handleSlotEnter = (templateKey: string, tpl: any, el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    // build a template-like pet object for the popup
    const petObj = { id: templateKey + "-template", ...tpl, buffs: [] };
    setHovered({ pet: petObj, rect });
  };

  const handleSlotLeave = () => setHovered(null);

  // Build ordered list of template keys grouped by rarity (common->mythical)
  const rarityOrder = ["common", "rare", "epic", "legendary", "mythical"] as const;
  const templates = Object.entries(generatorPetTemplates).sort((a, b) => {
    const ra = rarityOrder.indexOf(a[1].rarity as any);
    const rb = rarityOrder.indexOf(b[1].rarity as any);
    if (ra !== rb) return ra - rb;
    return a[1].name.localeCompare(b[1].name);
  });

  // Helper to normalize base id from created pet id by matching known template keys
  const getBasePetType = (petId: string) => {
    const keys = Object.keys(generatorPetTemplates);
    const match = keys.find((k) => petId.startsWith(k));
    if (match) return match;
    // Fallback: strip trailing numeric suffixes like -1, -2
    return petId.replace(/(-\d+)+$/g, "");
  };

  const isOwnedAtStar = (templateKey: string, star: number) => {
    // DEBUG: trace ownership checks to help debug persistent index state
    try {
      const result = pets.some((p) => {
        const base = getBasePetType(p.id);
        const stars = (p as any).starRating ?? calculatePetStars(p);
        return base === templateKey && stars === star;
      });
      // Log minimal info for diagnostics
      // eslint-disable-next-line no-console
      console.debug('[IndexPanel] isOwnedAtStar', { templateKey, star, result, petCount: pets.length });
      return result;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[IndexPanel] isOwnedAtStar error', err);
      return false;
    }
  };

  const panel = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-transparent pointer-events-auto" style={{ width: 'min(1100px, 90vw)', height: 'min(760px, 90vh)' }}>
        {/* decorative outer layer matching Index button container */}
        <div className="absolute top-0 left-0 w-full h-[calc(100%-8px)] bg-[#00b149] rounded-[10px] border-4 border-solid border-[#34342b] pointer-events-none" />

        <div className="absolute inset-0 bg-zinc-800 rounded-[10px] overflow-hidden border-2 border-solid border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Pet Index</h2>
            <div className="text-sm text-zinc-700">Collect the pets you've obtained — 5 star slots per pet</div>
          </div>

          <div className="overflow-auto" style={{ height: '620px' }}>
            <div className="grid grid-rows-5 grid-flow-col gap-3">
              {templates.map(([key, tpl]) => (
                <div key={key} className="flex flex-col gap-2">
                  {Array.from({ length: 5 }, (_, i) => {
                    const star = i + 1;
                    const owned = isOwnedAtStar(key, star);
                    const iconUrl = petIconMap[key] ?? `/pet-icons/${key}.png`;
                    return (
                      <div
                        key={star}
                        ref={(el) => {
                          if (el) slotRefs.current.set(`${key}-${star}`, el);
                          else slotRefs.current.delete(`${key}-${star}`);
                        }}
                        onMouseEnter={(e) => handleSlotEnter(key, tpl, e.currentTarget as HTMLDivElement)}
                        onMouseLeave={handleSlotLeave}
                        className={`w-64 h-16 rounded-md border border-zinc-400 flex items-center px-3 bg-white relative overflow-hidden ${owned ? '' : 'filter grayscale'}`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center mr-3">
                          <img src={iconUrl} alt={tpl.name} className="w-10 h-10 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                        <div className="flex-1 text-sm font-semibold text-zinc-800">{tpl.name}</div>
                        <div className="w-20 text-right text-sm text-zinc-600">{tpl.rarity.toUpperCase()}</div>
                        <div className="absolute right-2 top-2 flex items-center gap-1">
                          {Array.from({ length: star }).map((_, si) => (
                            <svg key={si} width="12" height="12" viewBox="0 0 24 24" fill={owned ? 'gold' : 'transparent'} stroke={owned ? 'gold' : 'rgba(0,0,0,0.2)'}>
                              <path d="M12 .587l3.668 7.431L24 9.748l-6 5.851 1.416 8.269L12 19.771 4.584 23.868 6 15.599 0 9.748l8.332-1.73z" />
                            </svg>
                          ))}
                        </div>
                        {!owned && (
                          <div className="absolute inset-0 bg-white/70" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-[#fbffde] rounded-md border-2 border-[#34342b]"
          aria-label="Close index"
        >
          X
        </button>
      
      {/* Hover popup for template (no buffs) */}
      {hovered && (
        <div style={{ position: 'fixed', left: hovered.rect.right + 8, top: hovered.rect.top, zIndex: 1400, pointerEvents: 'none' }}>
          <PetInfoPopup pet={hovered.pet} activeBuffs={[]} onClose={() => {}} scale={1} hideButtons={true} />
        </div>
      )}
      </div>
    </div>
  );

  // Render in a portal to avoid being trapped by parent transforms
  if (typeof document !== "undefined") {
    return createPortal(panel, document.body);
  }

  return panel;
}
