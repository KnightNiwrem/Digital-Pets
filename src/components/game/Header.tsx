/**
 * Header component for the game.
 */

import { useGameStateReadOnly } from "@/game/hooks/useGameState";
import { selectPetInfo } from "@/game/state/selectors";

/**
 * Header displaying game title and basic status.
 */
export function Header() {
  const { state, isLoading } = useGameStateReadOnly();
  const petInfo = state ? selectPetInfo(state) : null;

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Digital Pets</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {isLoading ? (
            <span>Loading...</span>
          ) : petInfo ? (
            <span>{petInfo.name}</span>
          ) : (
            <span>No Pet</span>
          )}
        </div>
      </div>
    </header>
  );
}
