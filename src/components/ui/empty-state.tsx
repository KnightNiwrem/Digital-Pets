/**
 * Empty state component for displaying messages when no data is available.
 */

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Message to display */
  message: string;
  /** Optional classes for the container. */
  className?: string;
}

/**
 * Shared empty state component for "no data" or error states.
 */
export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div className={cn("flex items-center justify-center h-64", className)}>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
