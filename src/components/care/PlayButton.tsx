/**
 * Play button component that opens toy selection.
 */

import { useState } from "react";
import { ItemSelector } from "@/components/inventory/ItemSelector";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { CareUI } from "@/game/data/uiText";
import { useGameState } from "@/game/hooks/useGameState";
import { playWithPet } from "@/game/state/actions/care";
import { selectInventory } from "@/game/state/selectors";

interface PlayButtonProps {
  onSuccess?: () => void;
}

/**
 * Button to open toy selection and play with the pet.
 */
export function PlayButton({ onSuccess }: PlayButtonProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, actions } = useGameState();

  if (!state) return null;

  const handleSelect = (itemId: string) => {
    actions.updateState((currentState) => {
      const result = playWithPet(currentState, itemId);
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
        className="flex items-center gap-2 flex-1"
      >
        <span>{CareUI.play.icon}</span>
        <span>{CareUI.play.label}</span>
      </Button>
      <ItemSelector
        open={open}
        onOpenChange={setOpen}
        inventory={selectInventory(state)}
        category={CareUI.play.category}
        title={CareUI.play.selectorTitle}
        description={CareUI.play.selectorDescription}
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
