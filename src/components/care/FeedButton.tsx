/**
 * Feed button component that opens food selection.
 */

import { useState } from "react";
import { ItemSelector } from "@/components/inventory/ItemSelector";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { CareUI } from "@/game/data/uiText";
import { useGameState } from "@/game/hooks/useGameState";
import { feedPet } from "@/game/state/actions/care";
import { selectInventory } from "@/game/state/selectors";

interface FeedButtonProps {
  onSuccess?: () => void;
}

/**
 * Button to open food selection and feed the pet.
 */
export function FeedButton({ onSuccess }: FeedButtonProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, actions } = useGameState();

  if (!state) return null;

  const handleSelect = (itemId: string) => {
    actions.updateState((currentState) => {
      const result = feedPet(currentState, itemId);
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
        <span>{CareUI.feed.icon}</span>
        <span>{CareUI.feed.label}</span>
      </Button>
      <ItemSelector
        open={open}
        onOpenChange={setOpen}
        inventory={selectInventory(state)}
        category={CareUI.feed.category}
        title={CareUI.feed.selectorTitle}
        description={CareUI.feed.selectorDescription}
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
