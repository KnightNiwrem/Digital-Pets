// World Screen - main interface for world exploration

import React from "react";
import { WorldMap } from "./WorldMap";
import { ActivitiesPanel } from "./ActivitiesPanel";
import type { Pet, WorldState } from "@/types";

interface WorldScreenProps {
  pet: Pet;
  worldState: WorldState;
  onTravel: (destinationId: string) => void;
  onStartActivity: (activityId: string) => void;
  onCancelActivity: () => void;
  disabled?: boolean;
}

export function WorldScreen({ 
  pet, 
  worldState, 
  onTravel, 
  onStartActivity, 
  onCancelActivity, 
  disabled = false 
}: WorldScreenProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* World Map - Left Side */}
      <div className="w-full">
        <WorldMap
          pet={pet}
          worldState={worldState}
          onTravel={onTravel}
          disabled={disabled}
        />
      </div>
      
      {/* Activities Panel - Right Side */}
      <div className="w-full">
        <ActivitiesPanel
          pet={pet}
          worldState={worldState}
          onStartActivity={onStartActivity}
          onCancelActivity={onCancelActivity}
          disabled={disabled}
        />
      </div>
    </div>
  );
}