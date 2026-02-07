import React, { useEffect, useState } from "react";
import { Pet } from "../../src/game/types/pet";

interface IndexButtonProps {
  onOpen?: () => void;
  externalCloseToggle?: number;
  pets?: Pet[];
}

export const IndexButton = ({ onOpen, externalCloseToggle, pets }: IndexButtonProps): React.ReactElement => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (externalCloseToggle !== undefined) {
      // any change from parent should close the panel
      setOpen(false);
    }
  }, [externalCloseToggle]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) onOpen?.();
  };

  return (
    <div className="group relative w-[107px] h-[125px]">
      <button
        type="button"
        onClick={handleToggle}
        className="relative w-[107px] h-[125px] bg-[#00000066] rounded-[10px] overflow-hidden outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 transition-opacity duration-150 group-hover:opacity-0"
        aria-label="Button with icon"
      >
        <div className="absolute top-0 left-0 w-[107px] h-[117px] bg-[#00b149] rounded-[10px] border-4 border-solid border-[#34342b]" />

        <div className="absolute top-0 left-0 w-[107px] h-[107px] flex bg-[#00ff6a] rounded-[10px] overflow-hidden border-4 border-solid border-[#2b342e]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[87px] h-[87px] flex items-center justify-center bg-[#00000066] rounded-[5px] overflow-hidden border-4 border-solid border-[#00000066]">
            <img
              className="w-[70px] h-[70px] object-cover block"
              alt="Index"
              src="/button-icons/INDEXicon.png"
            />
          </div>
        </div>
      </button>

      <div className="pointer-events-none absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
        <div className="relative w-[107px] h-[125px]">
          <div className="absolute top-2.5 left-0 w-[107px] h-[107px] bg-[#00000066] rounded-[10px]" />

          <div className="absolute top-2.5 left-0 w-[107px] h-[107px] bg-[#00b149] rounded-[10px] border-4 border-solid border-[#34342b]" />

          <div className="absolute top-2.5 left-0 w-[107px] h-[107px] flex items-center justify-center bg-[#00ff6a] rounded-[10px] overflow-hidden border-4 border-solid border-[#2b342e]">
            <div className="w-[87px] h-[87px] flex items-center justify-center bg-[#00000066] rounded-[5px] overflow-hidden border-4 border-solid border-[#00000066]">
              <img
                className="w-[70px] h-[70px] object-cover block"
                alt="Index hovered"
                src="/button-icons/INDEXicon.png"
              />
            </div>
          </div>
        </div>
      </div>
      {open && (
        // lazy-load panel to avoid circular runtime errors
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        (() => {
          const mod = require("./IndexPanel");
          const IndexPanel = mod && (mod.default ?? mod);
          return <IndexPanel pets={pets} onClose={() => setOpen(false)} />;
        })()
      )}
    </div>
  );
};

export default IndexButton;
