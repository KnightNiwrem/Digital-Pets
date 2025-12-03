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
import {
  ActivityBlockedCard,
  getActivityBlockingInfo,
} from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useGameState } from "@/game/hooks/useGameState";
import {
  selectCareStats,
  selectEnergy,
  selectGrowthProgress,
  selectPet,
  selectPetActivityState,
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
    return <LoadingState />;
  }

  const pet = state ? selectPet(state) : null;

  if (!state || !pet) {
    return <EmptyState message="No pet found." />;
  }

  const petInfo = selectPetInfo(state);
  const careStats = selectCareStats(state);
  const energy = selectEnergy(state);
  const species = selectPetSpecies(state);
  const poop = selectPoop(state);
  const growthProgress = selectGrowthProgress(state);
  const activityState = selectPetActivityState(state);
  const blockingInfo = getActivityBlockingInfo(
    pet,
    "feed, water, play, or clean",
  );

  // Check all required data is available
  if (
    !petInfo ||
    !careStats ||
    !energy ||
    !species ||
    !poop ||
    !growthProgress
  ) {
    return <EmptyState message="Error loading pet data." />;
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

      {/* Activity Status */}
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
      {!petInfo.isSleeping && blockingInfo && (
        <ActivityBlockedCard blockingInfo={blockingInfo} />
      )}

      {/* Care Actions - only show when idle or sleeping */}
      {(activityState === ActivityState.Idle ||
        activityState === ActivityState.Sleeping) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="col-span-2 sm:col-span-4 flex justify-center pb-2">
                <SleepToggle />
              </div>
              {activityState === ActivityState.Idle && (
                <>
                  <FeedButton onSuccess={handleFeedSuccess} />
                  <WaterButton onSuccess={handleWaterSuccess} />
                  <PlayButton onSuccess={handlePlaySuccess} />
                  <CleanButton onSuccess={handleCleanSuccess} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
