import { PhoneOff } from "lucide-react";
import { cn } from "../lib/utils";

interface PhoneOverlayProps {
  show: boolean;
  timeString: string;
}

export function PhoneOverlay({ show, timeString }: PhoneOverlayProps) {
  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black flex flex-col items-center justify-center text-white transition-all duration-700 z-[100]",
        show ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}
    >
      <PhoneOff className="text-amber-500 w-[15vw] h-[15vw] mb-[4vh] animate-pulse" strokeWidth={1} />
      <h2 className="font-teko fluid-text-2xl text-center leading-none tracking-wide text-white uppercase text-shadow-lg shadow-black/80">
        Please Silence Your Phone
      </h2>
      <div className="font-teko fluid-text-giant text-zinc-500 mt-[2vh] leading-none tracking-wider">
        {timeString}
      </div>
    </div>
  );
}
