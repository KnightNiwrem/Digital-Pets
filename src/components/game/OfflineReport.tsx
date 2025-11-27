/**
 * Offline report dialog showing what happened while the player was away.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getItemById } from "@/game/data/items";
import { toDisplay, toDisplayCare } from "@/game/types/common";
import type {
  OfflineExplorationResult,
  OfflineReport as OfflineReportType,
} from "@/game/types/offline";

interface OfflineReportProps {
  report: OfflineReportType;
  onDismiss: () => void;
}

/**
 * Format elapsed time in a human-readable way.
 */
function formatElapsedTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${days} day${days > 1 ? "s" : ""} and ${remainingHours} hour${remainingHours > 1 ? "s" : ""}`
      : `${days} day${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours} hour${hours > 1 ? "s" : ""} and ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`
      : `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  return "less than a minute";
}

/**
 * Stat change indicator showing the difference between before and after values.
 * Uses a configurable display function for rounding (defaults to floor for energy).
 */
function StatChange({
  label,
  before,
  after,
  max,
  displayFn = toDisplay,
}: {
  label: string;
  before: number;
  after: number;
  max: number;
  displayFn?: (value: number) => number;
}) {
  const beforeDisplay = displayFn(before);
  const afterDisplay = displayFn(after);
  const maxDisplay = displayFn(max);
  const change = afterDisplay - beforeDisplay;

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span>
          {afterDisplay}/{maxDisplay}
        </span>
        {change !== 0 && (
          <span className={change < 0 ? "text-destructive" : "text-green-500"}>
            ({change > 0 ? "+" : ""}
            {change})
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * Display a single exploration result.
 */
function ExplorationResultCard({
  result,
}: {
  result: OfflineExplorationResult;
}) {
  const hasItems = result.itemsFound.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{hasItems ? "🌿" : "😔"}</span>
        <div>
          <p className="font-medium">Exploration Complete</p>
          <p className="text-sm text-muted-foreground">{result.locationName}</p>
        </div>
      </div>

      {hasItems ? (
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Items Found
          </p>
          <div className="grid grid-cols-2 gap-2">
            {result.itemsFound.map((drop, index) => {
              const item = getItemById(drop.itemId);
              return (
                <div
                  key={`${drop.itemId}-${index}`}
                  className="flex items-center gap-2 p-2 bg-background rounded-md"
                >
                  <span className="text-lg">{item?.icon ?? "❓"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item?.name ?? drop.itemId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      x{drop.quantity}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Didn't find anything this time.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Page types for the offline report.
 */
type OfflineReportPage = "stats" | "exploration";

/**
 * Display the offline report as a dialog.
 */
export function OfflineReport({ report, onDismiss }: OfflineReportProps) {
  const {
    elapsedMs,
    wasCapped,
    petName,
    beforeStats,
    afterStats,
    maxStats,
    poopBefore,
    poopAfter,
    explorationResults,
  } = report;

  const hasExplorationResults = explorationResults.length > 0;

  // Start on stats page, move to exploration if there are results
  const [currentPage, setCurrentPage] = useState<OfflineReportPage>("stats");
  const [explorationIndex, setExplorationIndex] = useState(0);

  const poopChange = poopAfter - poopBefore;

  // Use max values from report, with fallback for safety
  const maxCareStat = maxStats?.careStatMax ?? 200_000;
  const maxEnergy = maxStats?.energyMax ?? 200_000;

  // Calculate total pages (1 for stats + number of exploration results)
  const totalExplorationPages = explorationResults.length;
  const hasPetInfo = petName && beforeStats && afterStats;

  // Handle next button
  const handleNext = () => {
    if (currentPage === "stats") {
      if (hasExplorationResults) {
        setCurrentPage("exploration");
        setExplorationIndex(0);
      } else {
        onDismiss();
      }
    } else {
      if (explorationIndex < totalExplorationPages - 1) {
        setExplorationIndex(explorationIndex + 1);
      } else {
        onDismiss();
      }
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentPage === "exploration") {
      if (explorationIndex > 0) {
        setExplorationIndex(explorationIndex - 1);
      } else {
        setCurrentPage("stats");
      }
    }
  };

  // Determine button labels
  const isLastPage =
    (currentPage === "stats" && !hasExplorationResults) ||
    (currentPage === "exploration" &&
      explorationIndex === totalExplorationPages - 1);
  const nextButtonLabel = isLastPage ? "Continue" : "Next";

  // Calculate page indicator
  const getCurrentPageNumber = () => {
    if (currentPage === "stats") return 1;
    return 2 + explorationIndex;
  };
  const getTotalPages = () => 1 + totalExplorationPages;

  return (
    <Dialog open onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>
            You were away for {formatElapsedTime(elapsedMs)}
            {wasCapped && " (capped at 7 days)"}
          </DialogDescription>
        </DialogHeader>

        {currentPage === "stats" && (
          <>
            {hasPetInfo && (
              <div className="space-y-4">
                <p className="text-sm">
                  While you were away, <strong>{petName}</strong> experienced
                  the following changes:
                </p>

                <div className="space-y-1 text-sm">
                  <StatChange
                    label="Satiety"
                    before={beforeStats.satiety}
                    after={afterStats.satiety}
                    max={maxCareStat}
                    displayFn={toDisplayCare}
                  />
                  <StatChange
                    label="Hydration"
                    before={beforeStats.hydration}
                    after={afterStats.hydration}
                    max={maxCareStat}
                    displayFn={toDisplayCare}
                  />
                  <StatChange
                    label="Happiness"
                    before={beforeStats.happiness}
                    after={afterStats.happiness}
                    max={maxCareStat}
                    displayFn={toDisplayCare}
                  />
                  <StatChange
                    label="Energy"
                    before={beforeStats.energy}
                    after={afterStats.energy}
                    max={maxEnergy}
                  />

                  {poopChange > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Poop</span>
                      <span className="text-amber-500">
                        +{poopChange} poop{poopChange > 1 ? "s" : ""}{" "}
                        accumulated
                      </span>
                    </div>
                  )}
                </div>

                {(afterStats.satiety === 0 ||
                  afterStats.hydration === 0 ||
                  afterStats.happiness === 0 ||
                  afterStats.energy === 0) && (
                  <p className="text-destructive text-sm">
                    ⚠️ Some needs are critical! Take care of your pet
                    immediately.
                  </p>
                )}
              </div>
            )}

            {!petName && (
              <p className="text-sm text-muted-foreground">
                Time has passed but you don&apos;t have a pet yet.
              </p>
            )}
          </>
        )}

        {currentPage === "exploration" &&
          explorationResults[explorationIndex] && (
            <ExplorationResultCard
              result={explorationResults[explorationIndex]}
            />
          )}

        {/* Page indicator and navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {(hasExplorationResults || currentPage === "exploration") && (
              <span className="text-xs text-muted-foreground">
                Page {getCurrentPageNumber()} of {getTotalPages()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {currentPage === "exploration" && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>{nextButtonLabel}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
