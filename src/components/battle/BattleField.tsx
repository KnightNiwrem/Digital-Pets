// Battle field component for combat visualization

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Battle, BattlePet } from "@/types/Battle";

interface BattleFieldProps {
  battle: Battle;
}

interface BattlePetDisplayProps {
  pet: BattlePet;
  isPlayer: boolean;
}

function BattlePetDisplay({ pet, isPlayer }: BattlePetDisplayProps) {
  const healthPercentage = (pet.currentHealth / pet.maxHealth) * 100;
  const energyPercentage = (pet.currentEnergy / pet.maxEnergy) * 100;

  return (
    <div className={`space-y-3 ${isPlayer ? "text-left" : "text-right"}`}>
      {/* Pet Info */}
      <div className="space-y-1">
        <div className="font-bold text-lg">{pet.name}</div>
        <div className="text-sm text-gray-600">{pet.species}</div>
      </div>

      {/* Health Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Health</span>
          <span>
            {pet.currentHealth}/{pet.maxHealth}
          </span>
        </div>
        <Progress
          value={healthPercentage}
          className={`h-3 ${healthPercentage <= 25 ? "bg-red-200" : healthPercentage <= 50 ? "bg-yellow-200" : "bg-green-200"}`}
        />
      </div>

      {/* Energy Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Energy</span>
          <span>
            {pet.currentEnergy}/{pet.maxEnergy}
          </span>
        </div>
        <Progress
          value={energyPercentage}
          className={`h-2 ${energyPercentage <= 25 ? "bg-orange-200" : "bg-blue-200"}`}
        />
      </div>

      {/* Battle Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>ATK: {pet.attack}</div>
        <div>DEF: {pet.defense}</div>
        <div>SPD: {pet.speed}</div>
        <div>ACC: {pet.accuracy}</div>
      </div>

      {/* Status Effects */}
      {pet.statusEffects && pet.statusEffects.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium">Status Effects:</div>
          <div className="flex flex-wrap gap-1">
            {pet.statusEffects.map((effect, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                title={effect.description}
              >
                {effect.name} ({effect.duration})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BattleField({ battle }: BattleFieldProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Battle Status */}
          <div className="text-center">
            <div className="text-lg font-bold">
              {battle.status === "waiting" && "Battle is about to begin..."}
              {battle.status === "in_progress" && `Turn ${battle.currentTurn}`}
              {battle.status === "victory" && "Victory!"}
              {battle.status === "defeat" && "Defeat!"}
              {battle.status === "fled" && "Fled from battle"}
            </div>
            {battle.location && <div className="text-sm text-gray-600 mt-1">Location: {battle.location}</div>}
          </div>

          {/* Battle Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Player Pet (Left Side) */}
            <div className="order-1">
              <div className="text-center mb-4">
                <div className="text-6xl">🐾</div>
                <div className="text-sm text-blue-600 font-medium">Your Pet</div>
              </div>
              <BattlePetDisplay pet={battle.playerPet} isPlayer={true} />
            </div>

            {/* VS Indicator */}
            <div className="order-3 md:order-2 text-center">
              <div className="text-4xl font-bold text-gray-400">VS</div>
            </div>

            {/* Opponent Pet (Right Side) */}
            <div className="order-2 md:order-3">
              <div className="text-center mb-4">
                <div className="text-6xl">👾</div>
                <div className="text-sm text-red-600 font-medium">Opponent</div>
              </div>
              <BattlePetDisplay pet={battle.opponentPet} isPlayer={false} />
            </div>
          </div>

          {/* Battle Log */}
          {battle.turns && battle.turns.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Battle Log:</div>
              <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                <div className="space-y-1 text-sm">
                  {battle.turns
                    .slice(-3)
                    .flatMap(turn => turn.results.slice(-2))
                    .map((result, index) => (
                      <div
                        key={index}
                        className={`${
                          result.type === "critical"
                            ? "text-orange-600 font-medium"
                            : result.message.includes("defeated") || result.message.includes("victory")
                              ? "text-green-600 font-medium"
                              : result.type === "damage"
                                ? "text-red-600"
                                : result.type === "heal"
                                  ? "text-green-600"
                                  : "text-gray-700"
                        }`}
                      >
                        {result.message}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
