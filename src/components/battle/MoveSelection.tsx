// Move selection component for battle actions

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BattleMove } from "@/types/Battle";
import type { BattlePet } from "@/types/Battle";

interface MoveSelectionProps {
  pet: BattlePet;
  availableMoves: BattleMove[];
  isLoading?: boolean;
  onMoveSelect: (moveId: string) => void;
  onFlee: () => void;
}

function MoveButton({
  move,
  pet,
  onSelect,
  disabled,
}: {
  move: BattleMove;
  pet: BattlePet;
  onSelect: () => void;
  disabled: boolean;
}) {
  const canAfford = pet.currentEnergy >= move.energyCost;
  const isDisabled = disabled || !canAfford;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "physical":
        return "bg-red-100 text-red-700";
      case "special":
        return "bg-blue-100 text-blue-700";
      case "status":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPowerDisplay = (power: number) => {
    if (power === 0) return "Status";
    if (power <= 30) return "Weak";
    if (power <= 60) return "Normal";
    if (power <= 90) return "Strong";
    return "Very Strong";
  };

  return (
    <Button
      onClick={onSelect}
      disabled={isDisabled}
      variant="outline"
      className={`h-auto p-4 text-left flex-col items-start space-y-2 ${
        isDisabled ? "opacity-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="w-full space-y-1">
        {/* Move Name and Category */}
        <div className="flex justify-between items-center">
          <span className="font-medium">{move.name}</span>
          <Badge className={getCategoryColor(move.category)}>{move.category}</Badge>
        </div>

        {/* Move Description */}
        <div className="text-xs text-gray-600 text-left">{move.description}</div>

        {/* Move Stats */}
        <div className="flex justify-between text-xs">
          <span>Power: {move.power > 0 ? getPowerDisplay(move.power) : "—"}</span>
          <span>Accuracy: {move.accuracy}%</span>
        </div>

        {/* Energy Cost */}
        <div className="flex justify-between text-xs">
          <span className={canAfford ? "text-green-600" : "text-red-600"}>Energy: {move.energyCost}</span>
          {!canAfford && <span className="text-red-500 font-medium">Not enough energy!</span>}
        </div>
      </div>
    </Button>
  );
}

export function MoveSelection({ pet, availableMoves, isLoading = false, onMoveSelect, onFlee }: MoveSelectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Choose Your Action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Moves */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Battle Moves:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableMoves.map(move => (
              <MoveButton
                key={move.id}
                move={move}
                pet={pet}
                onSelect={() => onMoveSelect(move.id)}
                disabled={isLoading}
              />
            ))}
          </div>

          {availableMoves.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No moves available. Your pet needs to learn some battle moves!
            </div>
          )}
        </div>

        {/* Special Actions */}
        <div className="space-y-2 border-t pt-4">
          <div className="text-sm font-medium">Special Actions:</div>
          <div className="flex gap-3">
            <Button
              onClick={onFlee}
              disabled={isLoading}
              variant="outline"
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
            >
              🏃‍♂️ Flee from Battle
            </Button>
          </div>
        </div>

        {/* Pet Energy Status */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm">
            <div className="flex justify-between">
              <span>Current Energy:</span>
              <span className={pet.currentEnergy <= 20 ? "text-red-600" : "text-green-600"}>
                {pet.currentEnergy}/{pet.maxEnergy}
              </span>
            </div>
            {pet.currentEnergy <= 20 && (
              <div className="text-xs text-yellow-600 mt-1">
                ⚠️ Low energy! Consider fleeing or using low-cost moves.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
