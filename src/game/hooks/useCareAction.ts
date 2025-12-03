/**
 * Hook for managing care action state (open, error) and wrapped action handlers.
 */

import { useCallback, useState } from "react";
import { useGameState } from "@/game/hooks/useGameState";
import type { CareActionResult } from "@/game/state/actions/care";
import type { GameState } from "@/game/types/gameState";

interface UseCareActionOptions {
  action: (state: GameState, itemId: string) => CareActionResult;
  onSuccess?: () => void;
}

interface UseCareActionReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  errorMessage: string | null;
  clearError: () => void;
  handleSelect: (itemId: string) => void;
  state: GameState | null;
}

/**
 * Manages care action dialog state and provides a wrapped action handler.
 * Reduces boilerplate in care button components.
 */
export function useCareAction({
  action,
  onSuccess,
}: UseCareActionOptions): UseCareActionReturn {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, actions } = useGameState();

  const clearError = useCallback(() => setErrorMessage(null), []);

  const handleSelect = useCallback(
    (itemId: string) => {
      actions.updateState((currentState) => {
        const result = action(currentState, itemId);
        if (!result.success) {
          setErrorMessage(result.message);
        } else {
          onSuccess?.();
        }
        return result.state;
      });
    },
    [action, actions, onSuccess],
  );

  return {
    open,
    setOpen,
    errorMessage,
    clearError,
    handleSelect,
    state,
  };
}
