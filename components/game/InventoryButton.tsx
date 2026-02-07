// components/game/InventoryButton.tsx
"use client";

interface InventoryButtonProps {
  onClick: () => void;
  gemCount?: number;
  variant?: "inventory" | "crate";
  imageSrc?: string;
}

export default function InventoryButton({ onClick, gemCount = 0, variant = "inventory", imageSrc }: InventoryButtonProps) {
  // colors per variant
  const styles = {
    inventory: {
      topBg: "bg-[#0065b1]",
      topBorder: "border-[#234]",
      outerBg: "bg-[#00000066]",
      innerBg: "bg-[#0085d1]",
      innerBorder: "border-[#123]",
    },
    crate: {
      topBg: "bg-[#b10055]",
      topBorder: "border-[#34342b]",
      outerBg: "bg-[#00000066]",
      innerBg: "bg-[#ff007b]",
      innerBorder: "border-[#2b342e]",
    },
  } as const;

  const s = variant === "crate" ? styles.crate : styles.inventory;

  return (
    <div className="group relative w-[107px] h-[125px]">
      <button
        type="button"
        onClick={onClick}
        className="relative w-[107px] h-[125px] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 cursor-pointer"
        aria-label={variant === "crate" ? "Crate button" : "Inventory button"}
      >
        <div className={`relative w-[107px] h-[125px] ${s.outerBg} rounded-[10px] overflow-hidden transition-opacity duration-150 group-hover:opacity-0`}>
          <div className={`absolute top-0 left-0 w-[107px] h-[117px] ${s.topBg} rounded-[10px] border-4 border-solid ${s.topBorder}`} />

          <div className={`absolute top-0 left-0 w-[107px] h-[107px] flex ${s.innerBg} rounded-[10px] overflow-hidden border-4 border-solid ${s.innerBorder}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[87px] h-[87px] flex items-center justify-center bg-[#00000066] rounded-[5px] overflow-hidden border-4 border-solid border-[#00000066]">
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="w-[70px] h-[70px] object-cover block" alt={variant} src={imageSrc} />
              ) : (
                <div className="w-[70px] h-[70px] flex items-center justify-center text-white font-bold">📦</div>
              )}
            </div>
          </div>

          {gemCount > 0 && variant === "inventory" && (
            <span className="absolute -top-2 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{gemCount}</span>
          )}
        </div>
      </button>

      <div className="pointer-events-none absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
        <div className="relative w-[107px] h-[125px]">
          <div className="absolute top-2.5 left-0 w-[107px] h-[107px] bg-[#00000066] rounded-[10px]" />

          <div className={`absolute top-2.5 left-0 w-[107px] h-[107px] ${s.topBg} rounded-[10px] border-4 border-solid ${s.topBorder}`} />

          <div className={`absolute top-2.5 left-0 w-[107px] h-[107px] flex items-center justify-center ${s.innerBg} rounded-[10px] overflow-hidden border-4 border-solid ${s.innerBorder}`}>
            <div className="w-[87px] h-[87px] flex items-center justify-center bg-[#00000066] rounded-[5px] overflow-hidden border-4 border-solid border-[#00000066]">
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="w-[70px] h-[70px] object-cover block" alt={`${variant} hovered`} src={imageSrc} />
              ) : (
                <div className="w-[70px] h-[70px] flex items-center justify-center text-white font-bold">📦</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
