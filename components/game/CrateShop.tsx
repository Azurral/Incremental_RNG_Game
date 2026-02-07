// components/game/CrateShop.tsx
"use client";

import { Pet } from "../../src/game/types/pet";
import { crates } from "../../src/game/constants/crates";
import { openCrate } from "../../src/game/services/crate";
import { useState } from "react";

interface CrateShopProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  cash: number;
  onPurchase: (pet: Pet, cost: number) => void;
  onBulkPurchase?: (pets: Pet[], cost: number) => void;
}

export default function CrateShop({ open, setOpen, cash, onPurchase, onBulkPurchase }: CrateShopProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuy = (crateId: string, cost: number, qty = 1) => {
    if (isProcessing) return;
    const totalCost = qty === 10 ? cost * 2 : cost * qty;
    if (cash < totalCost) return;
    setIsProcessing(true);
    try {
      const rarity = crateId.replace("crate-", "") as any;
      const pets: Pet[] = [];
      for (let i = 0; i < qty; i++) pets.push(openCrate(rarity));

      if (qty === 1) onPurchase(pets[0], cost);
      else if (onBulkPurchase) onBulkPurchase(pets, totalCost);
      else pets.forEach((p) => onPurchase(p, cost));
    } finally {
      setTimeout(() => setIsProcessing(false), 150);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />

      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl p-6 border border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">🎁 Crate Shop</h2>
            <p className="text-zinc-400 text-sm">Open crates to get pets with random buffs.</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white text-2xl">✕</button>
        </div>

        <div className="mb-6 p-4 bg-zinc-800 rounded-xl border border-zinc-700">
          <div className="text-sm text-zinc-400">Your Cash</div>
          <div className="text-3xl font-bold text-green-400">${cash.toLocaleString()}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crates.map((crate) => {
            const canAfford = cash >= crate.cost;
            return (
              <div key={crate.id} className={`rounded-xl p-4 bg-gradient-to-br from-zinc-700 to-zinc-800 border`}>
                <div className="text-5xl mb-2 text-center">📦</div>
                <h3 className="text-lg font-bold text-white text-center">{crate.name}</h3>
                <p className="text-sm text-white/80 text-center mb-3">{crate.description}</p>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => canAfford && handleBuy(crate.id, crate.cost, 1)}
                    disabled={!canAfford || isProcessing}
                    className="px-3 py-2 bg-white/10 rounded-md"
                  >
                    x1 • ${crate.cost}
                  </button>
                  <button
                    onClick={() => canAfford && handleBuy(crate.id, crate.cost, 10)}
                    disabled={cash < crate.cost * 2 || isProcessing}
                    className="px-3 py-2 bg-white/10 rounded-md"
                  >
                    x10 • ${crate.cost * 2}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 text-sm text-zinc-400">
          💡 Tip: Higher tier crates have better pets, but may sometimes downgrade.
        </div>
      </div>
    </div>
  );
}
