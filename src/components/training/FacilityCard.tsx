/**
 * Display card for a training facility.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  TrainingFacility,
  TrainingSession,
  TrainingSessionType,
} from "@/game/types/activity";
import type { GrowthStage } from "@/game/types/constants";
import { GROWTH_STAGE_ORDER } from "@/game/types/constants";
import { cn } from "@/lib/utils";

interface FacilityCardProps {
  facility: TrainingFacility;
  petStage: GrowthStage;
  currentEnergy: number;
  isTraining: boolean;
  onSelectSession: (
    facilityId: string,
    sessionType: TrainingSessionType,
  ) => void;
}

/**
 * Format duration for display.
 */
function formatDuration(ticks: number): string {
  const minutes = (ticks * 30) / 60;
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = minutes / 60;
  return `${hours}h`;
}

/**
 * Check if a session is available based on pet stage.
 */
function isSessionAvailable(
  session: TrainingSession,
  petStage: GrowthStage,
): boolean {
  if (!session.minStage) return true;
  const currentStageIndex = GROWTH_STAGE_ORDER.indexOf(petStage);
  const requiredStageIndex = GROWTH_STAGE_ORDER.indexOf(session.minStage);
  return currentStageIndex >= requiredStageIndex;
}

/**
 * Session button component.
 */
function SessionButton({
  session,
  facilityId,
  petStage,
  currentEnergy,
  isTraining,
  onSelect,
}: {
  session: TrainingSession;
  facilityId: string;
  petStage: GrowthStage;
  currentEnergy: number;
  isTraining: boolean;
  onSelect: (facilityId: string, sessionType: TrainingSessionType) => void;
}) {
  const available = isSessionAvailable(session, petStage);
  const hasEnergy = currentEnergy >= session.energyCost;
  const canStart = available && hasEnergy && !isTraining;

  return (
    <Button
      variant={canStart ? "default" : "outline"}
      size="sm"
      className={cn(
        "flex-1 flex flex-col h-auto py-2 gap-0.5",
        !canStart && "opacity-60",
      )}
      disabled={!canStart}
      onClick={() => onSelect(facilityId, session.type)}
    >
      <span className="font-medium text-xs">{session.name}</span>
      <span className="text-[10px] text-muted-foreground">
        {formatDuration(session.durationTicks)} · ⚡{session.energyCost}
      </span>
      <span className="text-[10px]">
        +{session.primaryStatGain}
        {session.secondaryStatGain > 0 && ` / +${session.secondaryStatGain}`}
      </span>
    </Button>
  );
}

/**
 * Training facility card component.
 */
export function FacilityCard({
  facility,
  petStage,
  currentEnergy,
  isTraining,
  onSelectSession,
}: FacilityCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{facility.emoji}</span>
          <div className="flex-1">
            <CardTitle className="text-base">{facility.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {facility.primaryStat} / {facility.secondaryStat}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{facility.description}</p>
        <div className="flex gap-2">
          {facility.sessions.map((session) => (
            <SessionButton
              key={session.type}
              session={session}
              facilityId={facility.id}
              petStage={petStage}
              currentEnergy={currentEnergy}
              isTraining={isTraining}
              onSelect={onSelectSession}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
