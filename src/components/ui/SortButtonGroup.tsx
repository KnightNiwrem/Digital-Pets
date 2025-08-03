// Reusable sort button group component

import { Button } from "@/components/ui/button";

interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortButtonGroupProps<T extends string> {
  options: SortOption<T>[];
  activeSort: T;
  onSortChange: (sortBy: T) => void;
  disabled?: boolean;
  className?: string;
}

export function SortButtonGroup<T extends string>({
  options,
  activeSort,
  onSortChange,
  disabled = false,
  className = "",
}: SortButtonGroupProps<T>) {
  return (
    <div className={`flex items-center gap-1 sm:gap-2 flex-wrap ${className}`}>
      {options.map(option => (
        <Button
          key={option.value}
          variant="outline"
          size="sm"
          onClick={() => onSortChange(option.value)}
          disabled={disabled}
          className={`text-xs whitespace-nowrap ${activeSort === option.value ? "bg-secondary" : ""}`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
