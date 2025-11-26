/**
 * Care Screen component showing pet status and care actions.
 */

import {
  CleanButton,
  FeedButton,
  PlayButton,
  PoopIndicator,
  WaterButton,
} from "@/components/care";
import { EnergyBar, PetInfo, PetSprite, PetStatus } from "@/components/pet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameState } from "@/game/hooks/useGameState";
import { createInitialGameStateWithPet } from "@/game/state/initialState";
import {
  selectCareStats,
  selectEnergy,
  selectPetInfo,
  selectPetSpecies,
  selectPoop,
} from "@/game/state/selectors";

/**
 * Main care screen showing pet status and care actions.
 */
export function CareScreen() {
  const { state, isLoading, actions } = useGameState();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!state?.pet) {
    const handleCreatePet = () => {
      const newState = createInitialGameStateWithPet();
      actions.updateState(() => newState);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Digital Pets!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You don't have a pet yet. Create your first companion to get
            started!
          </p>
          <Button onClick={handleCreatePet}>Create Pet</Button>
        </CardContent>
      </Card>
    );
  }

  const petInfo = selectPetInfo(state);
  const careStats = selectCareStats(state);
  const energy = selectEnergy(state);
  const species = selectPetSpecies(state);
  const poop = selectPoop(state);

  if (!petInfo || !careStats || !energy || !species || !poop) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Error loading pet data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pet Display */}
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="relative flex justify-center">
            <PetSprite emoji={species.emoji} isSleeping={petInfo.isSleeping} />
          </div>
        </CardContent>
      </Card>

      {/* Pet Info */}
      <PetInfo info={petInfo} />

      {/* Care Stats */}
      <PetStatus careStats={careStats} />

      {/* Energy */}
      <EnergyBar energy={energy} />

      {/* Poop Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Cleanliness</CardTitle>
        </CardHeader>
        <CardContent>
          <PoopIndicator count={poop.count} />
        </CardContent>
      </Card>

      {/* Care Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <FeedButton />
            <WaterButton />
            <PlayButton />
            <CleanButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
