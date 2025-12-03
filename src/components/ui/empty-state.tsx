/**
 * Empty state component for displaying messages when no data is available.
 */

interface EmptyStateProps {
  /** Message to display */
  message: string;
  /** Optional height class. Defaults to "h-64" */
  className?: string;
}

/**
 * Shared empty state component for "no data" or error states.
 */
export function EmptyState({ message, className = "h-64" }: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
