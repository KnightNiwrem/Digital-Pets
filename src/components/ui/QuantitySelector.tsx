// Reusable quantity selector component with increment/decrement buttons

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { GameMath } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "lg" | "default";
  className?: string;
}

export function QuantitySelector({
  value,
  min,
  max,
  onChange,
  disabled = false,
  size = "sm",
  className = "",
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    onChange(GameMath.adjustQuantity(value, -1, min, max));
  };

  const handleIncrement = () => {
    onChange(GameMath.adjustQuantity(value, 1, min, max));
  };

  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size={size}
        onClick={handleDecrement}
        disabled={disabled || isAtMin}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="text-sm min-w-8 text-center font-medium">{value}</span>
      <Button
        variant="outline"
        size={size}
        onClick={handleIncrement}
        disabled={disabled || isAtMax}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
