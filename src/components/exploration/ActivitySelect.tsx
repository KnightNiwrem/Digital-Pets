/**
 * Activity selection component for exploration options.
 * Displays available exploration activities with their requirements, costs, and cooldowns.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CanStartExplorationResult } from "@/game/core/exploration/exploration";
import type { Tick } from "@/game/types/common";
import { formatTicksAsTime } from "@/game/types/common";
import type { ExplorationActivity } from "@/game/types/exploration";

/**
 * Status information for a single activity.
 */
export interface ActivityStatus {
  /** The activity definition */
  activity: ExplorationActivity;
  /** Whether this activity can currently be started */
  canStart: CanStartExplorationResult;
  /** Remaining cooldown ticks (0 if not on cooldown) */
  cooldownRemaining: Tick;
}

interface ActivitySelectProps {
  /** List of activities available at this location with their status */
  activities: ActivityStatus[];
  /** Pet's current energy (display units) */
  currentEnergy: number;
  /** Callback when an activity is selected to start */
  onStartActivity: (activityId: string) => void;
}

/**
 * Get an emoji icon for an activity based on its ID.
 */
function getActivityIcon(activityId: string): string {
  switch (activityId) {
    case "foraging":
      return "🌿";
    case "mining":
      return "⛏️";
    case "fishing":
      return "🎣";
    case "deep_exploration":
      return "🗺️";
    default:
      return "🔍";
  }
}

/**
 * Format activity requirements for display.
 */
function formatRequirements(activity: ExplorationActivity): string[] {
  const reqs: string[] = [];

  if (activity.requirements?.minSkillLevels) {
    for (const [skill, level] of Object.entries(
      activity.requirements.minSkillLevels,
    )) {
      // Capitalize skill name
      const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);
      reqs.push(`${skillName} Lv.${level}`);
    }
  }

  if (activity.requirements?.minPetStage) {
    const stageName =
      activity.requirements.minPetStage.charAt(0).toUpperCase() +
      activity.requirements.minPetStage.slice(1);
    reqs.push(`${stageName}+ stage`);
  }

  if (
    activity.requirements?.questCompleted &&
    activity.requirements.questCompleted.length > 0
  ) {
    reqs.push(`${activity.requirements.questCompleted.length} quest(s)`);
  }

  return reqs;
}

/**
 * Single activity card component.
 */
function ActivityCard({
  status,
  currentEnergy,
  onStart,
}: {
  status: ActivityStatus;
  currentEnergy: number;
  onStart: () => void;
}) {
  const { activity, canStart, cooldownRemaining } = status;
  const hasEnoughEnergy = currentEnergy >= activity.energyCost;
  const isOnCooldown = cooldownRemaining > 0;
  const requirements = formatRequirements(activity);

  // Determine button text
  let buttonText: string;
  if (isOnCooldown) {
    buttonText = `Cooldown: ${formatTicksAsTime(cooldownRemaining)}`;
  } else if (!canStart.canStart && canStart.reason) {
    buttonText = canStart.reason;
  } else {
    buttonText = `Start ${activity.name}`;
  }

  return (
    <Card className={isOnCooldown ? "opacity-60" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>{getActivityIcon(activity.id)}</span>
          <span>{activity.name}</span>
          {isOnCooldown && (
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              ⏱️ On cooldown
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{activity.description}</p>

        {/* Requirements */}
        {requirements.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {requirements.map((req) => (
              <span
                key={req}
                className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground"
              >
                {req}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Energy:</span>
            <span
              className={
                hasEnoughEnergy
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              ⚡ {activity.energyCost}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span>{formatTicksAsTime(activity.duration)}</span>
          </div>
        </div>

        {/* Skill rewards */}
        {Object.keys(activity.skillFactors).length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>📚</span>
            <span>
              XP:{" "}
              {Object.keys(activity.skillFactors)
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(", ")}
            </span>
          </div>
        )}

        <Button
          className="w-full"
          onClick={onStart}
          disabled={!canStart.canStart}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Display exploration activity options for a location.
 */
export function ActivitySelect({
  activities,
  currentEnergy,
  onStartActivity,
}: ActivitySelectProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            No exploration activities available at this location.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((status) => (
        <ActivityCard
          key={status.activity.id}
          status={status}
          currentEnergy={currentEnergy}
          onStart={() => onStartActivity(status.activity.id)}
        />
      ))}
    </div>
  );
}
