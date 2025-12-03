/**
 * Generic care action button component.
 * Reduces duplication across FeedButton, WaterButton, PlayButton, and CleanButton.
 */

import type * as React from "react";
import { ItemSelector } from "@/components/inventory/ItemSelector";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { useCareAction } from "@/game/hooks/useCareAction";
import type { CareActionResult } from "@/game/state/actions/care";
import { selectInventory } from "@/game/state/selectors";
import type { GameState } from "@/game/types/gameState";

/** Item categories that can be used with care actions */
type CareItemCategory = "food" | "drink" | "cleaning" | "toy";

interface CareActionButtonProps {
  /** Action function to execute when an item is selected */
  action: (state: GameState, itemId: string) => CareActionResult;
  /** Item category to filter in the selector */
  category: CareItemCategory;
  /** Button label text */
  label: string;
  /** Button icon emoji */
  icon: string;
  /** Item selector dialog title */
  selectorTitle: string;
  /** Item selector dialog description */
  selectorDescription: string;
  /** Callback when action succeeds */
  onSuccess?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button variant */
  variant?: React.ComponentProps<typeof Button>["variant"];
}

/**
 * Generic care action button with item selector and error handling.
 */
export function CareActionButton({
  action,
  category,
  label,
  icon,
  selectorTitle,
  selectorDescription,
  onSuccess,
  disabled = false,
  variant = "default",
}: CareActionButtonProps) {
  const { open, setOpen, errorMessage, clearError, handleSelect, state } =
    useCareAction({ action, onSuccess });

  if (!state) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={disabled}
        variant={disabled ? "outline" : variant}
        className="flex items-center gap-2 flex-1"
      >
        <span>{icon}</span>
        <span>{label}</span>
      </Button>
      <ItemSelector
        open={open}
        onOpenChange={setOpen}
        inventory={selectInventory(state)}
        category={category}
        title={selectorTitle}
        description={selectorDescription}
        onSelect={handleSelect}
      />
      <ErrorDialog
        open={errorMessage !== null}
        onOpenChange={clearError}
        message={errorMessage ?? ""}
      />
    </>
  );
}
