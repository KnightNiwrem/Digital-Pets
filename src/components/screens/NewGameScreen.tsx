/**
 * New game screen for species selection and pet naming.
 */

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStarterSpecies } from "@/game/data/species";
import type { Species } from "@/game/types/species";
import { cn } from "@/lib/utils";

interface NewGameScreenProps {
  /** Callback when the player starts a new game */
  onStartGame: (petName: string, speciesId: string) => void;
}

interface SpeciesCardProps {
  species: Species;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Get a growth speed label based on total growth stages.
 * Species with more substages grow more gradually (slower).
 */
function getGrowthSpeedLabel(totalStages: number): string {
  if (totalStages >= 18) return "Slow Grower";
  if (totalStages >= 16) return "Steady Grower";
  return "Fast Grower";
}

/**
 * Species selection card component.
 */
function SpeciesCard({ species, isSelected, onSelect }: SpeciesCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary",
      )}
      onClick={onSelect}
      tabIndex={0}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Select ${species.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-3xl">{species.emoji}</span>
          <span>{species.name}</span>
        </CardTitle>
        <CardDescription>{species.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Type:</div>
          <div className="capitalize">{species.archetype}</div>
          <div className="text-muted-foreground">Growth:</div>
          <div>{getGrowthSpeedLabel(species.growthStages.length)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * New game screen with species selection and pet naming.
 */
export function NewGameScreen({ onStartGame }: NewGameScreenProps) {
  const [petName, setPetName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const starterSpecies = useMemo(() => getStarterSpecies(), []);

  const trimmedName = petName.trim();
  const isValid = trimmedName.length > 0 && selectedSpecies !== null;

  const handleStart = () => {
    if (isValid && selectedSpecies !== null) {
      onStartGame(trimmedName, selectedSpecies);
    }
  };

  if (starterSpecies.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <h1 className="text-4xl font-bold mb-4">🐾 Digital Pets</h1>
            <p className="text-destructive text-lg">
              No starter species available. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-8 pb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">🐾 Digital Pets</h1>
          <p className="text-muted-foreground mt-2">
            Welcome! Choose your new companion and give them a name.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle id="species-selection-title">Choose Your Pet</CardTitle>
            <CardDescription>
              Select a species to start your journey with.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              role="radiogroup"
              aria-labelledby="species-selection-title"
            >
              {starterSpecies.map((species) => (
                <SpeciesCard
                  key={species.id}
                  species={species}
                  isSelected={selectedSpecies === species.id}
                  onSelect={() => setSelectedSpecies(species.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Name Your Pet</CardTitle>
            <CardDescription>
              Give your new companion a special name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="pet-name">Pet Name</Label>
              <Input
                id="pet-name"
                type="text"
                placeholder="Enter a name..."
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                maxLength={20}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid) {
                    handleStart();
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleStart}
            disabled={!isValid}
            className="px-8"
          >
            Start Your Adventure! 🎉
          </Button>
        </div>
      </div>
    </div>
  );
}
