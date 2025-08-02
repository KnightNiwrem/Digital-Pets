// Activity Statistics Panel - displays activity completion statistics

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ActivityStats } from "@/types/GameState";
import { ActivityType } from "@/types/World";
import { Pickaxe, Fish, TreePine, Dumbbell, Clock, Coins, Package2, Star, LucideIcon } from "lucide-react";

interface ActivityStatsPanelProps {
  activityStats: ActivityStats;
}

export function ActivityStatsPanel({ activityStats }: ActivityStatsPanelProps) {
  // Activity type configurations
  const activityConfigs: Record<ActivityType, { icon: LucideIcon; name: string; color: string; description: string }> =
    {
      foraging: {
        icon: TreePine,
        name: "Foraging",
        color: "text-green-600",
        description: "Gathering herbs and plants from nature",
      },
      fishing: {
        icon: Fish,
        name: "Fishing",
        color: "text-blue-600",
        description: "Catching fish from rivers and lakes",
      },
      mining: {
        icon: Pickaxe,
        name: "Mining",
        color: "text-orange-600",
        description: "Extracting ores and gems from mountains",
      },
      training: {
        icon: Dumbbell,
        name: "Training",
        color: "text-purple-600",
        description: "Building strength and combat skills",
      },
    };

  // Helper function to format time in ticks to readable format
  const formatTime = (ticks: number): string => {
    const minutes = Math.floor((ticks * 15) / 60); // Each tick is 15 seconds
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate highest completion count for progress bars
  const maxCompletions = Math.max(
    activityStats.foraging.completions,
    activityStats.fishing.completions,
    activityStats.mining.completions,
    activityStats.training.completions,
    1 // Minimum 1 to avoid division by zero
  );

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activityStats.totals.completions}</div>
              <div className="text-sm text-gray-600">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatTime(activityStats.totals.timeSpent)}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{activityStats.totals.goldEarned}</div>
              <div className="text-sm text-gray-600">Gold Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{activityStats.totals.experienceEarned}</div>
              <div className="text-sm text-gray-600">Experience</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(activityConfigs) as ActivityType[]).map(activityType => {
          const config = activityConfigs[activityType];
          const stats = activityStats[activityType];
          const IconComponent = config.icon;
          const completionPercentage = maxCompletions > 0 ? (stats.completions / maxCompletions) * 100 : 0;

          return (
            <Card key={activityType}>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-lg ${config.color}`}>
                  <IconComponent className="w-5 h-5" />
                  {config.name}
                </CardTitle>
                <p className="text-sm text-gray-600">{config.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Completion Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Completions</span>
                    <Badge variant="secondary">{stats.completions}</Badge>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>

                <Separator />

                {/* Detailed Statistics */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{formatTime(stats.timeSpent)}</div>
                      <div className="text-gray-600">Time Spent</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{stats.goldEarned}</div>
                      <div className="text-gray-600">Gold Earned</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{stats.itemsEarned}</div>
                      <div className="text-gray-600">Items Found</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{stats.experienceEarned}</div>
                      <div className="text-gray-600">Experience</div>
                    </div>
                  </div>
                </div>

                {/* Efficiency Metrics */}
                {stats.completions > 0 && (
                  <>
                    <Separator />
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Avg Gold per Activity: {Math.round((stats.goldEarned / stats.completions) * 10) / 10}</div>
                      <div>Avg Time per Activity: {formatTime(Math.round(stats.timeSpent / stats.completions))}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
