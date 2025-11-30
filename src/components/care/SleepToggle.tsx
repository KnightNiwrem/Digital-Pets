/**
 * Sleep toggle button for putting the pet to sleep or waking it up.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { useGameState } from "@/game/hooks/useGameState";
import { sleepPet, wakePet } from "@/game/state/actions/sleep";
import { selectPet, selectPetInfo } from "@/game/state/selectors";

/**
 * Button to toggle the pet's sleep state.
 */
export function SleepToggle() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, actions } = useGameState();

  if (!state) return null;
  const petInfo = selectPetInfo(state);
  if (!petInfo) return null;

  const isSleeping = petInfo.isSleeping;

  const handleToggle = () => {
    actions.updateState((currentState) => {
      const currentPet = selectPet(currentState);
      if (!currentPet) {
        return currentState;
      }
      const result = currentPet.sleep.isSleeping
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
