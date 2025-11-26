/**
 * Sleep toggle button for putting the pet to sleep or waking it up.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { useGameState } from "@/game/hooks/useGameState";
import { sleepPet, wakePet } from "@/game/state/actions/sleep";

/**
 * Button to toggle the pet's sleep state.
 */
export function SleepToggle() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, actions } = useGameState();

  if (!state?.pet) return null;

  const isSleeping = state.pet.sleep.isSleeping;

  const handleToggle = () => {
    actions.updateState((currentState) => {
      const result = isSleeping
        ? wakePet(currentState)
        : sleepPet(currentState);
      if (!result.success) {
        setErrorMessage(result.message);
      }
      return result.state;
    });
  };

  return (
    <>
      <Button
        onClick={handleToggle}
        variant={isSleeping ? "secondary" : "default"}
        className="flex items-center gap-2 flex-1"
      >
        <span>{isSleeping ? "☀️" : "🌙"}</span>
        <span>{isSleeping ? "Wake Up" : "Sleep"}</span>
      </Button>
      <ErrorDialog
        open={errorMessage !== null}
        onOpenChange={() => setErrorMessage(null)}
        message={errorMessage ?? ""}
      />
    </>
  );
}
