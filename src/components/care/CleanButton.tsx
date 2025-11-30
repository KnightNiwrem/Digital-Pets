/**
 * Clean button component that opens cleaning item selection.
 */

import { useState } from "react";
import { ItemSelector } from "@/components/inventory/ItemSelector";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { useGameState } from "@/game/hooks/useGameState";
import { cleanPet } from "@/game/state/actions/care";
import { selectInventory, selectPoop } from "@/game/state/selectors";

interface CleanButtonProps {
  onSuccess?: () => void;
}

/**
 * Button to open cleaning item selection and clean the pet.
 */
export function CleanButton({ onSuccess }: CleanButtonProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, actions } = useGameState();

  if (!state) return null;

  const handleSelect = (itemId: string) => {
    actions.updateState((currentState) => {
      const result = cleanPet(currentState, itemId);
      if (!result.success) {
        setErrorMessage(result.message);
      } else {
        onSuccess?.();
      }
      return result.state;
    });
  };

  // Disable button if there's no poop to clean
  const poopDisplay = selectPoop(state);
  const poopCount = poopDisplay?.count ?? 0;
  const isDisabled = poopCount === 0;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={isDisabled}
        variant={isDisabled ? "outline" : "default"}
        className="flex items-center gap-2 flex-1"
      >
        <span>🧹</span>
        <span>Clean</span>
      </Button>
      <ItemSelector
        open={open}
        onOpenChange={setOpen}
        inventory={selectInventory(state)}
        category="cleaning"
        title="Select Cleaning Item"
        description="Choose a cleaning item to clean up poop."
        onSelect={handleSelect}
      />
      <ErrorDialog
        open={errorMessage !== null}
        onOpenChange={() => setErrorMessage(null)}
        message={errorMessage ?? ""}
      />
    </>
  );
}
