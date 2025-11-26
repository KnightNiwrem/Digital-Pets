/**
 * Poop indicator component showing current poop count.
 */

import { cn } from "@/lib/utils";

interface PoopIndicatorProps {
  /** Current poop count */
  count: number;
}

/**
 * Get the visual style based on poop count.
 */
function getPoopStyle(count: number): {
  bgClass: string;
  textClass: string;
  animate: boolean;
} {
  if (count >= 5) {
    return {
      bgClass: "bg-destructive",
      textClass: "text-destructive-foreground",
      animate: count >= 7,
    };
  }
  if (count >= 3) {
    return {
      bgClass: "bg-yellow-500",
      textClass: "text-white",
      animate: false,
    };
  }
  return {
    bgClass: "bg-secondary",
    textClass: "text-secondary-foreground",
    animate: false,
  };
}

/**
 * Display the current poop count with visual indicators.
 */
export function PoopIndicator({ count }: PoopIndicatorProps) {
  const { bgClass, textClass, animate } = getPoopStyle(count);

  if (count === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>💩</span>
        <span className="text-sm">Clean!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span>💩</span>
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
          bgClass,
          textClass,
          animate && "animate-pulse",
        )}
      >
        {count} {count === 1 ? "poop" : "poops"}
      </span>
      {count >= 7 && (
        <span className="text-xs text-destructive">Care Life draining!</span>
      )}
    </div>
  );
}
