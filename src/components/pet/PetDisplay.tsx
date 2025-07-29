// Pet display component showing pet sprite, stats, and status

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Pet } from "@/types";
import { PetSystem } from "@/systems/PetSystem";

interface PetDisplayProps {
  pet: Pet;
}

export function PetDisplay({ pet }: PetDisplayProps) {
  const displayStats = PetSystem.calculateDisplayStats(pet);
  const status = PetSystem.getPetStatus(pet);
  const nextCriticalEvent = PetSystem.getNextCriticalEvent(pet);

  // Helper function to get status color
  const getStatusColor = (statusLevel: string) => {
    switch (statusLevel) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "okay":
        return "text-yellow-600";
      case "poor":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Helper function to get health color
  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600";
      case "injured":
        return "text-yellow-600";
      case "sick":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Helper function to get stat bar color
  const getStatColor = (value: number) => {
    if (value >= 75) return "bg-green-500";
    if (value >= 50) return "bg-yellow-500";
    if (value >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{pet.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {pet.species.name} • Stage {pet.growthStage + 1} • {pet.rarity}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pet Sprite Placeholder */}
        <div className="flex justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-blue-200">
            <div className="text-4xl">🐾</div>
          </div>
        </div>

        {/* Health Status */}
        <div className="text-center">
          <span className={`text-lg font-semibold ${getHealthColor(pet.health)}`}>
            {pet.health.charAt(0).toUpperCase() + pet.health.slice(1)}
          </span>
          {pet.state !== "idle" && <span className="ml-2 text-sm text-muted-foreground">({pet.state})</span>}
        </div>

        {/* Care Stats */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center">Care Stats</h3>

          {/* Satiety */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Satiety</span>
              <span>{displayStats.satiety}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getStatColor(displayStats.satiety)}`}
                style={{ width: `${displayStats.satiety}%` }}
              />
            </div>
          </div>

          {/* Hydration */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Hydration</span>
              <span>{displayStats.hydration}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getStatColor(displayStats.hydration)}`}
                style={{ width: `${displayStats.hydration}%` }}
              />
            </div>
          </div>

          {/* Happiness */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Happiness</span>
              <span>{displayStats.happiness}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getStatColor(displayStats.happiness)}`}
                style={{ width: `${displayStats.happiness}%` }}
              />
            </div>
          </div>

          {/* Energy */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Energy</span>
              <span>
                {pet.currentEnergy}/{pet.maxEnergy}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getStatColor((pet.currentEnergy / pet.maxEnergy) * 100)}`}
                style={{ width: `${(pet.currentEnergy / pet.maxEnergy) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Life */}
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Life: {pet.life.toLocaleString()} / 1,000,000</span>
        </div>

        {/* Overall Status */}
        <div className="text-center p-2 bg-muted rounded">
          <p className={`font-medium ${getStatusColor(status.overall)}`}>
            {status.overall.charAt(0).toUpperCase() + status.overall.slice(1)}
          </p>
          {status.needs.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">Needs: {status.needs.join(", ")}</p>
          )}
          {status.warnings.length > 0 && (
            <p className="text-sm text-orange-600 mt-1">⚠️ {status.warnings.join(", ")}</p>
          )}
        </div>

        {/* Next Critical Event */}
        {nextCriticalEvent && (
          <div className="text-center p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium text-yellow-800">Next: {nextCriticalEvent.event}</p>
            <p className="text-xs text-yellow-600">
              In ~{Math.ceil((nextCriticalEvent.ticksRemaining * 15) / 60)} minutes
            </p>
          </div>
        )}

        {/* Poop Indicator */}
        {displayStats.needsPoop && (
          <div className="text-center p-2 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm font-medium text-amber-800">💩 Needs cleaning!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
