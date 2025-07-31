import * as React from "react";
import { cn, GameMath } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value, max = 100, ...props }, ref) => {
  const percentage = GameMath.clamp(value, 0, max);

  return (
    <div ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-200", className)} {...props}>
      <div className="h-full bg-blue-500 transition-all duration-300 ease-in-out" style={{ width: `${percentage}%` }} />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
