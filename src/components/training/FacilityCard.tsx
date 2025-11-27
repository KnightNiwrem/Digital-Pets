/**
 * Display card for a training facility.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSessionAvailable } from "@/game/core/training";
import type {
  TrainingFacility,
  TrainingSession,
  TrainingSessionType,
} from "@/game/types/activity";
import { formatTicksAsTime } from "@/game/types/common";
import type { GrowthStage } from "@/game/types/constants";
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
        {formatTicksAsTime(session.durationTicks)} · ⚡{session.energyCost}
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
