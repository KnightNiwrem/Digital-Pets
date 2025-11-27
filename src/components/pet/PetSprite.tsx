/**
 * Pet sprite component for displaying the pet visual.
 * Uses emoji as placeholder, will be replaced with actual sprites later.
 */

import { cn } from "@/lib/utils";

interface PetSpriteProps {
  emoji: string;
  isSleeping?: boolean;
  isAnimating?: boolean;
  animationType?: "idle" | "happy" | "eat" | "drink" | "play" | "hurt";
  className?: string;
}

/**
 * Displays the pet's visual representation with idle and action animations.
 */
export function PetSprite({
  emoji,
  isSleeping = false,
  isAnimating = true,
  animationType = "idle",
  className,
}: PetSpriteProps) {
  const getAnimationClass = () => {
    if (isSleeping) return "animate-pulse";
    if (!isAnimating) return "";

    switch (animationType) {
      case "happy":
        return "animate-bounce";
      case "eat":
      case "drink":
        return "animate-pet-eat";
      case "play":
        return "animate-pet-wiggle";
      case "hurt":
        return "animate-pet-shake";
      default:
        return "animate-pet-idle";
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center text-8xl select-none transition-all duration-300",
        isSleeping && "opacity-70 grayscale",
        className,
      )}
    >
      <span className={cn(getAnimationClass())}>{emoji}</span>
      {isSleeping && (
        <span className="absolute top-0 right-0 text-3xl animate-float">
          💤
        </span>
      )}
    </div>
  );
}
