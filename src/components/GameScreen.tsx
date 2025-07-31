// Main game screen component combining all pet care UI elements

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PetDisplay } from "@/components/pet/PetDisplay";
import { PetCarePanel } from "@/components/pet/PetCarePanel";
import { WorldScreen } from "@/components/world/WorldScreen";
import { InventoryScreen } from "@/components/inventory/InventoryScreen";
import { BattleScreen } from "@/components/battle/BattleScreen";
import { QuestScreen } from "@/components/quest/QuestScreen";
import { useGameState } from "@/hooks/useGameState";
import { useBattleState } from "@/hooks/useBattleState";
import type { BattleAction } from "@/types/Battle";
import type { PetSpecies } from "@/types/Pet";
import { getStarterPets } from "@/data/pets";
import { Home, Map as MapIcon, Package, Sword, ScrollText } from "lucide-react";

export function GameScreen() {
  const {
    gameState,
    isLoading,
    error,
    startNewGame,
    loadExistingGame,
    saveGame,
    feedPetWithItem,
    giveDrinkWithItem,
    playWithItem,
    cleanWithItem,
    treatWithItem,
    toggleSleep,
    useItem,
    sellItem,
    buyItem,
    sortInventory,
    startQuest,
    abandonQuest,
    completeQuest,
    getAvailableQuests,
    getActiveQuests,
    getCompletedQuests,
    startTravel,
    startActivity,
    cancelActivity,
    applyBattleResults: applyGameStateBattleResults,
    isPaused,
    hasExistingSave,
    storageInfo,
  } = useGameState();

  // Battle state management
  const {
    currentBattle,
    isLoading: battleLoading,
    error: battleError,
    startBattle,
    executeAction,
    endBattle,
  } = useBattleState();

  const [gameStarted, setGameStarted] = useState(false);
  const [petName, setPetName] = useState("Buddy");
  const [selectedStarter, setSelectedStarter] = useState<PetSpecies | null>(null);
  const [activeTab, setActiveTab] = useState<"pet" | "world" | "inventory" | "battle" | "quest">("pet");

  // Get starter pets
  const starterPets = getStarterPets();

  // World action handlers - now using enhanced autosave from useGameState
  const handleTravel = async (destinationId: string) => {
    if (!gameState?.currentPet || !gameState?.world) return;

    try {
      const result = await startTravel(destinationId);
      if (result.success) {
        console.log("Travel started successfully");
      } else {
        console.error("Travel failed:", result.error);
      }
    } catch (error) {
      console.error("Travel error:", error);
    }
  };

  const handleStartActivity = async (activityId: string) => {
    if (!gameState?.currentPet || !gameState?.world) return;

    try {
      const result = await startActivity(activityId);
      if (result.success) {
        console.log("Activity started successfully");
      } else {
        console.error("Activity failed:", result.error);
      }
    } catch (error) {
      console.error("Activity error:", error);
    }
  };

  const handleCancelActivity = async () => {
    if (!gameState?.currentPet || !gameState?.world) return;

    try {
      const result = await cancelActivity();
      if (result.success) {
        console.log("Activity cancelled successfully");
      } else {
        console.error("Cancel activity failed:", result.error);
      }
    } catch (error) {
      console.error("Cancel activity error:", error);
    }
  };

  // Shop action handlers
  const handleBuyItem = async (itemId: string, quantity: number, price: number) => {
    const result = await buyItem(itemId, quantity);
    if (result.success) {
      console.log(`Bought ${quantity}x ${itemId} for ${price * quantity} gold`);
    } else {
      console.error("Purchase failed:", result.error);
    }
  };

  const handleSellItem = async (itemId: string, quantity: number, price: number) => {
    const result = await sellItem(itemId, quantity);
    if (result.success) {
      console.log(`Sold ${quantity}x ${itemId} for ${price * quantity} gold`);
    } else {
      console.error("Sale failed:", result.error);
    }
  };

  // Battle action handlers
  const handleBattleStart = async (opponentId: string) => {
    if (!gameState?.currentPet) return;

    const result = await startBattle(gameState.currentPet, opponentId);
    if (!result.success) {
      console.error("Battle start failed:", result.error);
    }
  };

  const handleBattleAction = async (action: BattleAction) => {
    const result = await executeAction(action);
    if (!result.success) {
      console.error("Battle action failed:", result.error);
    }

    // If battle ended, apply results to pet with enhanced autosave
    if (currentBattle && (currentBattle.status === "victory" || currentBattle.status === "defeat")) {
      if (gameState?.currentPet) {
        try {
          const applyResult = await applyGameStateBattleResults(currentBattle);
          if (applyResult.success) {
            console.log("Battle results applied to pet and game saved");
          } else {
            console.error("Failed to apply battle results:", applyResult.error);
          }
        } catch (error) {
          console.error("Battle result application error:", error);
        }
      }
    }
  };

  const handleBattleEnd = () => {
    endBattle();
  };

  // Auto-load existing save on mount
  useEffect(() => {
    if (hasExistingSave && !gameStarted) {
      loadExistingGame().then(() => setGameStarted(true));
    }
  }, [hasExistingSave, gameStarted, loadExistingGame]);

  const handleNewGame = async () => {
    if (!selectedStarter) return;

    setGameStarted(true);
    await startNewGame(petName, selectedStarter.id);
  };

  const handleLoadGame = async () => {
    setGameStarted(true);
    await loadExistingGame();
  };

  const handleSaveGame = async () => {
    const result = await saveGame();
    if (result.success) {
      console.log("Game saved successfully!");
    } else {
      console.error(`Save failed: ${result.error}`);
    }
  };

  // Show initial screen if no game is loaded
  if (!gameStarted || !gameState) {
    return (
      <div className="container mx-auto p-8 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">🐾 Digital Pets</CardTitle>
            <p className="text-muted-foreground">Welcome to your virtual pet adventure!</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">{error}</div>}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading...</div>
                <div className="text-sm text-muted-foreground mt-2">Please wait while we prepare your pet</div>
              </div>
            ) : (
              <>
                {hasExistingSave && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-center">Continue Your Adventure</h3>
                    <Button onClick={handleLoadGame} className="w-full" size="lg">
                      Load Existing Game
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">Or start fresh below</div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-center">Start New Game</h3>

                  {/* Starter Pet Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Choose Your Starter Pet:</label>
                    <div className="grid grid-cols-1 gap-3">
                      {starterPets.map(species => (
                        <div
                          key={species.id}
                          onClick={() => setSelectedStarter(species)}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedStarter?.id === species.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">🐾</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{species.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{species.description}</p>
                              <div className="flex gap-2 mt-2 text-xs">
                                <span className="px-2 py-1 bg-gray-100 rounded">ATK: {species.baseStats.attack}</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">DEF: {species.baseStats.defense}</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">SPD: {species.baseStats.speed}</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">HP: {species.baseStats.health}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pet Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pet Name:</label>
                    <input
                      type="text"
                      value={petName}
                      onChange={e => setPetName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your pet's name"
                      maxLength={20}
                    />
                  </div>

                  <Button
                    onClick={handleNewGame}
                    className="w-full"
                    size="lg"
                    disabled={!petName.trim() || !selectedStarter}
                  >
                    Start New Adventure
                  </Button>
                </div>

                {/* Storage Info */}
                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>Storage Used: {storageInfo.percentage.toFixed(1)}%</p>
                  <p>Game saves automatically every minute</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show game interface
  return (
    <div className="container mx-auto p-4 max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🐾 Digital Pets</h1>

        <div className="flex gap-2">
          <Button onClick={handleSaveGame} variant="outline" size="sm">
            💾 Save
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">{error}</div>}
      {battleError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
          Battle Error: {battleError}
        </div>
      )}

      {/* Game Paused Overlay */}
      {isPaused && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded text-center">
          <div className="text-lg font-semibold text-yellow-800">Game Paused</div>
          <div className="text-sm text-yellow-700">Your pet is safe and time is frozen</div>
        </div>
      )}

      {/* Main Game Content */}
      {gameState.currentPet ? (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-2">
            <button
              onClick={() => setActiveTab("pet")}
              className={`px-3 sm:px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === "pet"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Home className="w-4 h-4 inline mr-1 sm:mr-2" />
              Care
            </button>
            <button
              onClick={() => setActiveTab("world")}
              className={`px-3 sm:px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === "world"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <MapIcon className="w-4 h-4 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Explore </span>World
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-3 sm:px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === "inventory"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package className="w-4 h-4 inline mr-1 sm:mr-2" />
              Inventory
            </button>
            <button
              onClick={() => setActiveTab("battle")}
              className={`px-3 sm:px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === "battle"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sword className="w-4 h-4 inline mr-1 sm:mr-2" />
              Battle
            </button>
            <button
              onClick={() => setActiveTab("quest")}
              className={`px-3 sm:px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === "quest"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <ScrollText className="w-4 h-4 inline mr-1 sm:mr-2" />
              Quests
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "pet" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Pet Display */}
              <div>
                <PetDisplay pet={gameState.currentPet} />
              </div>

              {/* Pet Care Panel */}
              <div>
                <PetCarePanel
                  pet={gameState.currentPet}
                  inventory={gameState.inventory}
                  isLoading={isLoading}
                  onFeedWithItem={feedPetWithItem}
                  onDrinkWithItem={giveDrinkWithItem}
                  onPlayWithItem={playWithItem}
                  onCleanWithItem={cleanWithItem}
                  onTreatWithItem={treatWithItem}
                  onToggleSleep={toggleSleep}
                />
              </div>
            </div>
          )}

          {activeTab === "world" && gameState.world && (
            <WorldScreen
              pet={gameState.currentPet}
              worldState={gameState.world}
              inventory={gameState.inventory}
              onTravel={handleTravel}
              onStartActivity={handleStartActivity}
              onCancelActivity={handleCancelActivity}
              onBuyItem={handleBuyItem}
              onSellItem={handleSellItem}
              disabled={isLoading || isPaused}
            />
          )}

          {activeTab === "inventory" && gameState.inventory && (
            <InventoryScreen
              inventory={gameState.inventory}
              pet={gameState.currentPet}
              onUseItem={useItem}
              onSellItem={sellItem}
              onSortInventory={sortInventory}
            />
          )}

          {activeTab === "battle" && (
            <BattleScreen
              pet={gameState.currentPet}
              isLoading={battleLoading}
              onBattleStart={handleBattleStart}
              onBattleAction={handleBattleAction}
              onBattleEnd={handleBattleEnd}
              currentBattle={currentBattle || undefined}
            />
          )}

          {activeTab === "quest" && (
            <QuestScreen
              activeQuests={getActiveQuests()}
              availableQuests={getAvailableQuests()}
              completedQuests={getCompletedQuests()}
              onStartQuest={startQuest}
              onAbandonQuest={abandonQuest}
              onCompleteQuest={completeQuest}
              isLoading={isLoading}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2">No Active Pet</h2>
          <p className="text-muted-foreground mb-4">Your pet may have passed away or you need to select a new one.</p>
          <Button onClick={handleNewGame}>Get a New Pet</Button>
        </div>
      )}

      {/* Game Stats Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground space-y-1">
        <p>{gameState.playerStats && <>Level {gameState.playerStats.level}</>}</p>
        <p>
          Storage: {storageInfo.percentage.toFixed(1)}% used
          {isPaused && <> • Game is paused</>}
        </p>
      </div>
    </div>
  );
}
