/**
 * Feed button component that opens food selection.
 */

import { useState } from "react";
import { ItemSelector } from "@/components/inventory/ItemSelector";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/game/hooks/useGameState";
import { feedPet } from "@/game/state/actions/care";

/**
 * Button to open food selection and feed the pet.
 */
export function FeedButton() {
  const [open, setOpen] = useState(false);
  const { state, actions } = useGameState();

  if (!state) return null;

  const handleSelect = (itemId: string) => {
    actions.updateState((currentState) => {
      const result = feedPet(currentState, itemId);
      if (!result.success) {
        // Use setTimeout to ensure alert shows after state update
        setTimeout(() => alert(result.message), 0);
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
        <span>🍖</span>
        <span>Feed</span>
      </Button>
      <ItemSelector
        open={open}
        onOpenChange={setOpen}
        inventory={state.player.inventory}
        category="food"
        title="Select Food"
        description="Choose a food item to feed your pet."
        onSelect={handleSelect}
      />
    </>
  );
}
