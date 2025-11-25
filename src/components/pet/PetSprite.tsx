/**
 * Pet sprite component for displaying the pet visual.
 * Uses emoji as placeholder, will be replaced with actual sprites later.
 */

import { cn } from "@/lib/utils";

interface PetSpriteProps {
  emoji: string;
  isSleeping?: boolean;
  className?: string;
}

/**
 * Displays the pet's visual representation.
 */
export function PetSprite({
  emoji,
  isSleeping = false,
  className,
}: PetSpriteProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center text-8xl select-none transition-all duration-300",
        isSleeping && "opacity-70 grayscale",
        className,
      )}
    >
      <span className={cn(isSleeping && "animate-pulse")}>{emoji}</span>
      {isSleeping && (
        <span className="absolute top-0 right-0 text-3xl">💤</span>
      )}
    </div>
  );
}
