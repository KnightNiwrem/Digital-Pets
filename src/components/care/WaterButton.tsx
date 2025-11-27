/**
 * Water button component that opens drink selection.
 */

import { useState } from "react";
import { ItemSelector } from "@/components/inventory/ItemSelector";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { useGameState } from "@/game/hooks/useGameState";
import { waterPet } from "@/game/state/actions/care";

interface WaterButtonProps {
  onSuccess?: () => void;
}

/**
 * Button to open drink selection and give the pet water.
 */
export function WaterButton({ onSuccess }: WaterButtonProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, actions } = useGameState();

  if (!state) return null;

  const handleSelect = (itemId: string) => {
    actions.updateState((currentState) => {
      const result = waterPet(currentState, itemId);
      if (!result.success) {
        setErrorMessage(result.message);
      } else {
        onSuccess?.();
      }
      return result.state;
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        className="flex items-center gap-2 flex-1"
      >
        <span>💧</span>
        <span>Water</span>
      </Button>
      <ItemSelector
        open={open}
        onOpenChange={setOpen}
        inventory={state.player.inventory}
        category="drink"
        title="Select Drink"
        description="Choose a drink to give your pet."
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
