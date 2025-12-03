/**
 * Loading state component for consistent loading UI across screens.
 */

interface LoadingStateProps {
  /** Optional message to display. Defaults to "Loading..." */
  message?: string;
  /** Optional height class. Defaults to "h-64" */
  className?: string;
}

/**
 * Shared loading state component.
 */
export function LoadingState({
  message = "Loading...",
  className = "h-64",
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
