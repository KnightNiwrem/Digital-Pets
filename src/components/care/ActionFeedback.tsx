/**
 * Action feedback component that shows animated emoji feedback.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ActionFeedbackProps {
  emoji: string;
  onComplete?: () => void;
  className?: string;
}

/**
 * Shows an animated emoji that floats up and fades out.
 */
export function ActionFeedback({
  emoji,
  onComplete,
  className,
}: ActionFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none z-10",
        className,
      )}
    >
      <span className="text-4xl animate-action-feedback">{emoji}</span>
    </div>
  );
}
