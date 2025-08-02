// Activity Log Panel - Display activity history and statistics

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActivityLogEntry } from "@/types/World";
import type { GameState } from "@/types/GameState";
import { ActivityLogSystem } from "@/systems/ActivityLogSystem";
import { ActivityLogUtils } from "@/lib/utils";
import { Activity, Clock, MapPin, Award } from "lucide-react";

interface ActivityLogPanelProps {
  gameState: GameState;
}

interface FilterState {
  status: "all" | "started" | "cancelled" | "completed";
  location: string;
  limit: number;
}

export function ActivityLogPanel({ gameState }: ActivityLogPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    location: "all",
    limit: 20,
  });

  // Get all log entries
  const allEntries = useMemo(() => {
    return ActivityLogSystem.getLogEntries(gameState);
  }, [gameState.activityLog]);

  // Get unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    const locations = new Set(allEntries.map(entry => entry.locationId));
    return Array.from(locations).sort();
  }, [allEntries]);

  // Apply filters
  const filteredEntries = useMemo(() => {
    let filtered = ActivityLogUtils.filterEntries(allEntries, {
      status: filters.status === "all" ? undefined : filters.status,
      locationId: filters.location === "all" ? undefined : filters.location,
    });

    // Apply limit
    if (filters.limit > 0) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }, [allEntries, filters]);

  // Calculate statistics
  const statistics = useMemo(() => {
    return ActivityLogSystem.getLogStatistics(gameState);
  }, [gameState.activityLog]);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold">{statistics.totalActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{statistics.completedActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold">{statistics.cancelledActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-2xl font-bold">{Object.keys(statistics.byLocation).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value: FilterState["status"]) =>
                  setFilters(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="started">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <Select
                value={filters.location}
                onValueChange={(value: string) =>
                  setFilters(prev => ({ ...prev, location: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>
                      {ActivityLogUtils.getLocationDisplayName(location)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Show</label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value: string) =>
                  setFilters(prev => ({ ...prev, limit: parseInt(value) }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 entries</SelectItem>
                  <SelectItem value="20">20 entries</SelectItem>
                  <SelectItem value="50">50 entries</SelectItem>
                  <SelectItem value="0">All entries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ status: "all", location: "all", limit: 20 })}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Activity Log Entries */}
          <div className="space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No activities found matching your filters.</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or start some activities!</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <ActivityLogEntryCard key={entry.id} entry={entry} />
              ))
            )}
          </div>

          {/* Show more button if there are more entries */}
          {filters.limit > 0 && allEntries.length > filters.limit && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => setFilters(prev => ({ ...prev, limit: prev.limit + 20 }))}
              >
                Show More ({allEntries.length - filters.limit} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ActivityLogEntryCardProps {
  entry: ActivityLogEntry;
}

function ActivityLogEntryCard({ entry }: ActivityLogEntryCardProps) {
  const statusBadgeClass = ActivityLogUtils.getStatusBadgeClass(entry.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-medium text-gray-900">
                {ActivityLogUtils.getActivityDisplayName(entry.activityId)}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusBadgeClass}`}>
                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{ActivityLogUtils.getLocationDisplayName(entry.locationId)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{ActivityLogUtils.formatActivityDuration(entry.startTime, entry.endTime)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>{entry.energyCost} energy</span>
              </div>
            </div>

            {entry.results.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700 mb-1">Results:</p>
                <div className="flex flex-wrap gap-1">
                  {entry.results.map((result, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {result.description}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-right text-sm text-gray-500">
            <p>{ActivityLogUtils.formatRelativeTime(entry.startTime)}</p>
            <p className="text-xs">{ActivityLogUtils.formatTimestamp(entry.startTime)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}