/**
 * Loading state component for consistent loading UI across screens.
 */

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Optional message to display. Defaults to "Loading..." */
  message?: string;
  /** Optional classes for the container. */
  className?: string;
}

/**
 * Shared loading state component.
 */
export function LoadingState({
  message = "Loading...",
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center h-64", className)}>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
