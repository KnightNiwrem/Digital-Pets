import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculatePetMaxStats } from "@/game/core/petStats";
import { processMultipleTicks } from "@/game/core/tickProcessor";
import { useGameState } from "@/game/hooks/useGameState";
import { toDisplay, toDisplayCare, toMicro } from "@/game/types/common";

const BATTLE_STAT_KEYS = [
  "strength",
  "endurance",
  "agility",
  "precision",
  "fortitude",
  "cunning",
] as const;

export function DeveloperScreen() {
  const { state, actions } = useGameState();
  const pet = state?.pet ?? null;
  const maxStats = pet ? calculatePetMaxStats(pet) : null;

  const [tickCount, setTickCount] = useState("1");
  const [coinAmount, setCoinAmount] = useState("100");

  const [careInputs, setCareInputs] = useState({
    satiety: "",
    hydration: "",
    happiness: "",
    energy: "",
    careLife: "",
  });

  const [battleInputs, setBattleInputs] = useState({
    strength: "",
    endurance: "",
    agility: "",
    precision: "",
    fortitude: "",
    cunning: "",
  });

  const handleAdvanceTicks = () => {
    const ticks = Number.parseInt(tickCount, 10);
    if (Number.isNaN(ticks) || ticks <= 0) return;
    actions.updateState((prev) => processMultipleTicks(prev, ticks));
  };

  const handleGiveCoins = () => {
    const amount = Number.parseInt(coinAmount, 10);
    if (Number.isNaN(amount)) return;
    actions.updateState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        currency: {
          ...prev.player.currency,
          coins: prev.player.currency.coins + amount,
        },
      },
    }));
  };

  const handleSetCareStats = () => {
    if (!pet) return;
    actions.updateState((prev) => {
      if (!prev.pet) return prev;
      const currentMax = calculatePetMaxStats(prev.pet);
      const newPet = { ...prev.pet };

      const satiety = Number.parseInt(careInputs.satiety, 10);
      const hydration = Number.parseInt(careInputs.hydration, 10);
      const happiness = Number.parseInt(careInputs.happiness, 10);
      const energy = Number.parseInt(careInputs.energy, 10);
      const careLife = Number.parseInt(careInputs.careLife, 10);

      newPet.careStats = { ...newPet.careStats };
      if (!Number.isNaN(satiety)) {
        const max = currentMax?.care.satiety ?? toMicro(100);
        newPet.careStats.satiety = Math.min(toMicro(satiety), max);
      }
      if (!Number.isNaN(hydration)) {
        const max = currentMax?.care.hydration ?? toMicro(100);
        newPet.careStats.hydration = Math.min(toMicro(hydration), max);
      }
      if (!Number.isNaN(happiness)) {
        const max = currentMax?.care.happiness ?? toMicro(100);
        newPet.careStats.happiness = Math.min(toMicro(happiness), max);
      }

      if (!Number.isNaN(energy)) {
        const max = currentMax?.energy ?? toMicro(100);
        newPet.energyStats = {
          energy: Math.min(toMicro(energy), max),
        };
      }

      if (!Number.isNaN(careLife)) {
        const max = currentMax?.careLife ?? toMicro(100);
        newPet.careLifeStats = {
          careLife: Math.min(toMicro(careLife), max),
        };
      }

      return { ...prev, pet: newPet };
    });
  };

  const handleSetBattleStats = () => {
    if (!pet) return;
    actions.updateState((prev) => {
      if (!prev.pet) return prev;
      const newTrained = { ...prev.pet.trainedBattleStats };

      for (const key of BATTLE_STAT_KEYS) {
        const val = Number.parseInt(battleInputs[key], 10);
        if (!Number.isNaN(val)) {
          newTrained[key] = Math.max(0, val);
        }
      }

      return {
        ...prev,
        pet: { ...prev.pet, trainedBattleStats: newTrained },
      };
    });
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Developer Panel</h1>

      {/* Advance Ticks */}
      <Card>
        <CardHeader>
          <CardTitle>Game Ticks</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="tick-count">Number of ticks</Label>
            <Input
              id="tick-count"
              type="number"
              min="1"
              value={tickCount}
              onChange={(e) => setTickCount(e.target.value)}
            />
          </div>
          <Button onClick={handleAdvanceTicks}>Advance</Button>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle>
            Currency (current: {state?.player.currency.coins ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="coin-amount">Coins to add</Label>
            <Input
              id="coin-amount"
              type="number"
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
            />
          </div>
          <Button onClick={handleGiveCoins}>Give Coins</Button>
        </CardContent>
      </Card>

      {/* Care Stats */}
      {pet && (
        <Card>
          <CardHeader>
            <CardTitle>Care Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="care-satiety">
                  Satiety ({toDisplayCare(pet.careStats.satiety)}/
                  {maxStats ? toDisplayCare(maxStats.care.satiety) : "?"})
                </Label>
                <Input
                  id="care-satiety"
                  type="number"
                  min="0"
                  placeholder={String(toDisplayCare(pet.careStats.satiety))}
                  value={careInputs.satiety}
                  onChange={(e) =>
                    setCareInputs((p) => ({ ...p, satiety: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="care-hydration">
                  Hydration ({toDisplayCare(pet.careStats.hydration)}/
                  {maxStats ? toDisplayCare(maxStats.care.hydration) : "?"})
                </Label>
                <Input
                  id="care-hydration"
                  type="number"
                  min="0"
                  placeholder={String(toDisplayCare(pet.careStats.hydration))}
                  value={careInputs.hydration}
                  onChange={(e) =>
                    setCareInputs((p) => ({ ...p, hydration: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="care-happiness">
                  Happiness ({toDisplayCare(pet.careStats.happiness)}/
                  {maxStats ? toDisplayCare(maxStats.care.happiness) : "?"})
                </Label>
                <Input
                  id="care-happiness"
                  type="number"
                  min="0"
                  placeholder={String(toDisplayCare(pet.careStats.happiness))}
                  value={careInputs.happiness}
                  onChange={(e) =>
                    setCareInputs((p) => ({ ...p, happiness: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="care-energy">
                  Energy ({toDisplay(pet.energyStats.energy)}/
                  {maxStats ? toDisplay(maxStats.energy) : "?"})
                </Label>
                <Input
                  id="care-energy"
                  type="number"
                  min="0"
                  placeholder={String(toDisplay(pet.energyStats.energy))}
                  value={careInputs.energy}
                  onChange={(e) =>
                    setCareInputs((p) => ({ ...p, energy: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="care-life">
                  Care Life [hidden] ({toDisplay(pet.careLifeStats.careLife)}/
                  {maxStats ? toDisplay(maxStats.careLife) : "?"})
                </Label>
                <Input
                  id="care-life"
                  type="number"
                  min="0"
                  placeholder={String(toDisplay(pet.careLifeStats.careLife))}
                  value={careInputs.careLife}
                  onChange={(e) =>
                    setCareInputs((p) => ({ ...p, careLife: e.target.value }))
                  }
                />
              </div>
            </div>
            <Button onClick={handleSetCareStats} className="w-full">
              Set Care Stats
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Battle Stats */}
      {pet && (
        <Card>
          <CardHeader>
            <CardTitle>Battle Stats (Trained)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {BATTLE_STAT_KEYS.map((key) => (
                <div key={key}>
                  <Label htmlFor={`battle-${key}`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} (trained:{" "}
                    {pet.trainedBattleStats[key]}, total: {pet.battleStats[key]}
                    )
                  </Label>
                  <Input
                    id={`battle-${key}`}
                    type="number"
                    min="0"
                    placeholder={String(pet.trainedBattleStats[key])}
                    value={battleInputs[key]}
                    onChange={(e) =>
                      setBattleInputs((p) => ({ ...p, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleSetBattleStats} className="w-full">
              Set Battle Stats
            </Button>
          </CardContent>
        </Card>
      )}

      {!pet && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Start a game to modify pet stats.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
