// Battle screen component for turn-based combat interface

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BattleField } from "./BattleField";
import { MoveSelection } from "./MoveSelection";
import type { Pet } from "@/types/Pet";
import type { Battle, BattleAction } from "@/types/Battle";

interface BattleScreenProps {
  pet: Pet;
  isLoading?: boolean;
  onBattleStart: (opponentId: string) => void;
  onBattleAction: (action: BattleAction) => void;
  onBattleEnd: () => void;
  currentBattle?: Battle;
}

export function BattleScreen({
  pet,
  isLoading = false,
  onBattleStart,
  onBattleAction,
  onBattleEnd,
  currentBattle,
}: BattleScreenProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<string>("wild_beast");

  // If no battle is active, show battle selection
  if (!currentBattle) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">⚔️ Battle Arena</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pet Status */}
              <div className="space-y-4">
                <h3 className="font-semibold">Your Pet</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-bold">{pet.name}</div>
                  <div className="text-sm text-gray-600">{pet.species.name}</div>
                  <div className="mt-2 space-y-1">
                    <div>
                      Energy: {pet.currentEnergy}/{pet.maxEnergy}
                    </div>
                    <div>
                      Health: {pet.currentHealth}/{pet.maxHealth}
                    </div>
                    <div>
                      Attack: {pet.attack} | Defense: {pet.defense}
                    </div>
                  </div>
                </div>

                {/* Battle Readiness Check */}
                {pet.currentEnergy < 20 && (
                  <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    ⚠️ Your pet has low energy. Consider resting before battle.
                  </div>
                )}

                {pet.health !== "healthy" && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    🏥 Your pet is not healthy. Consider treatment before battle.
                  </div>
                )}
              </div>

              {/* Opponent Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold">Choose Opponent</h3>
                <div className="space-y-2">
                  <label className="block">
                    <input
                      type="radio"
                      value="wild_beast"
                      checked={selectedOpponent === "wild_beast"}
                      onChange={e => setSelectedOpponent(e.target.value)}
                      className="mr-2"
                    />
                    <span className="font-medium">Wild Beast</span>
                    <div className="text-sm text-gray-600 ml-6">
                      A basic opponent for training. Moderate difficulty.
                    </div>
                  </label>

                  <label className="block">
                    <input
                      type="radio"
                      value="forest_guardian"
                      checked={selectedOpponent === "forest_guardian"}
                      onChange={e => setSelectedOpponent(e.target.value)}
                      className="mr-2"
                    />
                    <span className="font-medium">Forest Guardian</span>
                    <div className="text-sm text-gray-600 ml-6">A stronger opponent with nature-based attacks.</div>
                  </label>

                  <label className="block">
                    <input
                      type="radio"
                      value="arena_champion"
                      checked={selectedOpponent === "arena_champion"}
                      onChange={e => setSelectedOpponent(e.target.value)}
                      className="mr-2"
                    />
                    <span className="font-medium">Arena Champion</span>
                    <div className="text-sm text-gray-600 ml-6">Elite opponent with advanced moves and high stats.</div>
                  </label>
                </div>

                <Button
                  onClick={() => onBattleStart(selectedOpponent)}
                  disabled={isLoading || pet.currentEnergy < 20}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Preparing Battle..." : "Start Battle"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Battle is active - show battle interface
  return (
    <div className="space-y-6">
      {/* Battle Field */}
      <BattleField battle={currentBattle} />

      {/* Battle Actions */}
      {currentBattle.status === "in_progress" && (
        <MoveSelection
          pet={currentBattle.playerPet}
          availableMoves={currentBattle.playerPet.moves}
          isLoading={isLoading}
          onMoveSelect={moveId =>
            onBattleAction({
              type: "move",
              moveId,
              petId: currentBattle.playerPet.id,
              priority: 0,
              timestamp: Date.now(),
            })
          }
          onFlee={() =>
            onBattleAction({
              type: "flee",
              petId: currentBattle.playerPet.id,
              priority: 0,
              timestamp: Date.now(),
            })
          }
        />
      )}

      {/* Battle End */}
      {(currentBattle.status === "victory" || currentBattle.status === "defeat" || currentBattle.status === "fled") && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              {currentBattle.status === "victory" && (
                <>
                  <div className="text-3xl">🎉</div>
                  <div className="text-xl font-bold text-green-600">Victory!</div>
                  <div className="text-sm text-gray-600">You defeated {currentBattle.opponentPet.name}!</div>
                </>
              )}

              {currentBattle.status === "defeat" && (
                <>
                  <div className="text-3xl">😵</div>
                  <div className="text-xl font-bold text-red-600">Defeat</div>
                  <div className="text-sm text-gray-600">
                    {currentBattle.opponentPet.name} was too strong this time.
                  </div>
                </>
              )}

              {currentBattle.status === "fled" && (
                <>
                  <div className="text-3xl">🏃‍♂️</div>
                  <div className="text-xl font-bold text-yellow-600">Fled</div>
                  <div className="text-sm text-gray-600">You successfully escaped from battle.</div>
                </>
              )}

              <Button onClick={onBattleEnd} className="mt-4">
                Return to Battle Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
