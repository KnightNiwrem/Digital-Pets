/**
 * Care Screen component showing pet status and care actions.
 */

import {
  CleanButton,
  FeedButton,
  PlayButton,
  PoopIndicator,
  SleepToggle,
  WaterButton,
} from "@/components/care";
import {
  EnergyBar,
  GrowthProgress,
  PetInfo,
  PetSprite,
  PetStatus,
} from "@/components/pet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameState } from "@/game/hooks/useGameState";
import {
  selectCareStats,
  selectEnergy,
  selectGrowthProgress,
  selectPetInfo,
  selectPetSpecies,
  selectPoop,
} from "@/game/state/selectors";

/**
 * Main care screen showing pet status and care actions.
 */
export function CareScreen() {
  const { state, isLoading } = useGameState();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!state?.pet) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No pet found.</p>
      </div>
    );
  }

  const petInfo = selectPetInfo(state);
  const careStats = selectCareStats(state);
  const energy = selectEnergy(state);
  const species = selectPetSpecies(state);
  const poop = selectPoop(state);
  const growthProgress = selectGrowthProgress(state);

  if (
    !petInfo ||
    !careStats ||
    !energy ||
    !species ||
    !poop ||
    !growthProgress
  ) {
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

      {/* Growth Progress */}
      <GrowthProgress progress={growthProgress} />

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

      {/* Sleep Status */}
      {petInfo.isSleeping && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
              <span className="text-2xl">💤</span>
              <span className="font-medium">Your pet is sleeping...</span>
            </div>
            <p className="text-center text-sm text-blue-600 dark:text-blue-400 mt-2">
              Energy regenerates faster while sleeping. Care stats decay more
              slowly.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Care Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <SleepToggle />
          </div>
          {!petInfo.isSleeping && (
            <div className="flex gap-2">
              <FeedButton />
              <WaterButton />
              <PlayButton />
              <CleanButton />
            </div>
          )}
          {petInfo.isSleeping && (
            <p className="text-sm text-muted-foreground text-center">
              Wake up your pet to feed, water, play, or clean.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
