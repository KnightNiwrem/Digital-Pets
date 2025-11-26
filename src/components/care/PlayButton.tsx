/**
 * Play button component that opens toy selection.
 */

import { useState } from "react";
import { ItemSelector } from "@/components/inventory/ItemSelector";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { useGameState } from "@/game/hooks/useGameState";
import { playWithPet } from "@/game/state/actions/care";

/**
 * Button to open toy selection and play with the pet.
 */
export function PlayButton() {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, actions } = useGameState();

  if (!state) return null;

  const handleSelect = (itemId: string) => {
    actions.updateState((currentState) => {
      const result = playWithPet(currentState, itemId);
      if (!result.success) {
        setErrorMessage(result.message);
      }
      return result.state;
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 flex-1"
      >
        <span>🎾</span>
        <span>Play</span>
      </Button>
      <ItemSelector
        open={open}
        onOpenChange={setOpen}
        inventory={state.player.inventory}
        category="toy"
        title="Select Toy"
        description="Choose a toy to play with your pet."
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
