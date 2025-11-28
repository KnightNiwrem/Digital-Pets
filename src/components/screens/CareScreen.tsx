/**
 * Care Screen component showing pet status and care actions.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionFeedback,
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
import { ActivityState } from "@/game/types/constants";

type PetAnimationType = "idle" | "happy" | "eat" | "drink" | "play" | "hurt";

interface ActionFeedbackState {
  emoji: string;
  key: number;
}

/**
 * Main care screen showing pet status and care actions.
 */
export function CareScreen() {
  const { state, isLoading } = useGameState();
  const [petAnimation, setPetAnimation] = useState<PetAnimationType>("idle");
  const [actionFeedback, setActionFeedback] =
    useState<ActionFeedbackState | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const triggerAction = useCallback(
    (animation: PetAnimationType, emoji: string) => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      setPetAnimation(animation);
      setActionFeedback({ emoji, key: Date.now() });
      animationTimeoutRef.current = setTimeout(
        () => setPetAnimation("idle"),
        600,
      );
    },
    [],
  );

  const handleFeedSuccess = useCallback(() => {
    triggerAction("eat", "🍖");
  }, [triggerAction]);

  const handleWaterSuccess = useCallback(() => {
    triggerAction("drink", "💧");
  }, [triggerAction]);

  const handlePlaySuccess = useCallback(() => {
    triggerAction("play", "🎾");
  }, [triggerAction]);

  const handleCleanSuccess = useCallback(() => {
    triggerAction("happy", "✨");
  }, [triggerAction]);

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

  // Check all required data is available
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
            <PetSprite
              emoji={species.emoji}
              isSleeping={petInfo.isSleeping}
              animationType={petAnimation}
            />
            {actionFeedback && (
              <ActionFeedback
                key={actionFeedback.key}
                emoji={actionFeedback.emoji}
                onComplete={() => setActionFeedback(null)}
              />
            )}
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

      {/* Training Status */}
      {petInfo.activityState === ActivityState.Training && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
              <span className="text-2xl">💪</span>
              <span className="font-medium">Your pet is training...</span>
            </div>
            <p className="text-center text-sm text-amber-600 dark:text-amber-400 mt-2">
              Go to the Training screen to view progress or cancel.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Exploring Status */}
      {petInfo.activityState === ActivityState.Exploring && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
              <span className="text-2xl">🌿</span>
              <span className="font-medium">Your pet is exploring...</span>
            </div>
            <p className="text-center text-sm text-green-600 dark:text-green-400 mt-2">
              Go to the Explore screen to view progress or cancel.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Battling Status */}
      {petInfo.activityState === ActivityState.Battling && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300">
              <span className="text-2xl">⚔️</span>
              <span className="font-medium">Your pet is battling...</span>
            </div>
            <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2">
              Complete the battle before performing care actions.
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="col-span-2 sm:col-span-4 flex justify-center pb-2">
              <SleepToggle />
            </div>
            {petInfo.activityState === ActivityState.Idle && (
              <>
                <FeedButton onSuccess={handleFeedSuccess} />
                <WaterButton onSuccess={handleWaterSuccess} />
                <PlayButton onSuccess={handlePlaySuccess} />
                <CleanButton onSuccess={handleCleanSuccess} />
              </>
            )}
          </div>
          {petInfo.activityState !== ActivityState.Idle && (
            <p className="text-sm text-muted-foreground text-center">
              {petInfo.isSleeping
                ? "Wake up your pet to feed, water, play, or clean."
                : petInfo.activityState === ActivityState.Training
                  ? "Cancel training to feed, water, play, or clean."
                  : petInfo.activityState === ActivityState.Exploring
                    ? "Cancel exploration to feed, water, play, or clean."
                    : "Complete the battle to feed, water, play, or clean."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
