// Main game screen component combining all pet care UI elements

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PetDisplay } from "@/components/pet/PetDisplay";
import { PetCarePanel } from "@/components/pet/PetCarePanel";
import { WorldScreen } from "@/components/world/WorldScreen";
import { InventoryScreen } from "@/components/inventory/InventoryScreen";
import { useGameState } from "@/hooks/useGameState";
import { Home, Map as MapIcon, Package } from "lucide-react";

export function GameScreen() {
  const {
    gameState,
    isLoading,
    error,
    startNewGame,
    loadExistingGame,
    saveGame,
    feedPet,
    giveDrink,
    playWithPet,
    cleanPoop,
    treatPet,
    toggleSleep,
    useItem,
    sellItem,
    sortInventory,
    pauseGame,
    resumeGame,
    isPaused,
    hasExistingSave,
    storageInfo,
  } = useGameState();

  const [gameStarted, setGameStarted] = useState(false);
  const [petName, setPetName] = useState("Buddy");
  const [activeTab, setActiveTab] = useState<"pet" | "world" | "inventory">("pet");

  // World action handlers
  const handleTravel = async (destinationId: string) => {
    if (!gameState?.currentPet || !gameState?.world) return;

    const { WorldSystem } = await import("@/systems/WorldSystem");
    const result = WorldSystem.startTravel(gameState.world, gameState.currentPet, destinationId);

    if (result.success) {
      // Update the game state through the existing game loop
      // This is a simplified approach - in practice, this would be handled by the GameLoop
      console.log("Travel started:", result.message);
    } else {
      console.error("Travel failed:", result.error);
    }
  };

  const handleStartActivity = async (activityId: string) => {
    if (!gameState?.currentPet || !gameState?.world) return;

    const { WorldSystem } = await import("@/systems/WorldSystem");
    const result = WorldSystem.startActivity(gameState.world, gameState.currentPet, activityId);

    if (result.success) {
      console.log("Activity started:", result.message);
    } else {
      console.error("Activity failed:", result.error);
    }
  };

  const handleCancelActivity = async () => {
    if (!gameState?.currentPet || !gameState?.world) return;

    const { WorldSystem } = await import("@/systems/WorldSystem");
    const result = WorldSystem.cancelActivity(gameState.world, gameState.currentPet.id);

    if (result.success) {
      console.log("Activity cancelled:", result.message);
    } else {
      console.error("Cancel failed:", result.error);
    }
  };

  // Auto-load existing save on mount
  useEffect(() => {
    if (hasExistingSave && !gameStarted) {
      loadExistingGame().then(() => setGameStarted(true));
    }
  }, [hasExistingSave, gameStarted, loadExistingGame]);

  const handleNewGame = async () => {
    setGameStarted(true);
    await startNewGame(petName);
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

                  <Button onClick={handleNewGame} className="w-full" size="lg" disabled={!petName.trim()}>
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
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🐾 Digital Pets</h1>

        <div className="flex gap-2">
          <Button onClick={isPaused ? resumeGame : pauseGame} variant="outline" size="sm">
            {isPaused ? "▶️ Resume" : "⏸️ Pause"}
          </Button>

          <Button onClick={handleSaveGame} variant="outline" size="sm">
            💾 Save
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">{error}</div>}

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
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab("pet")}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "pet"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Pet Care
            </button>
            <button
              onClick={() => setActiveTab("world")}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "world"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <MapIcon className="w-4 h-4 inline mr-2" />
              Explore World
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "inventory"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Inventory
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "pet" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pet Display */}
              <div>
                <PetDisplay pet={gameState.currentPet} />
              </div>

              {/* Pet Care Panel */}
              <div>
                <PetCarePanel
                  pet={gameState.currentPet}
                  isLoading={isLoading}
                  onFeed={feedPet}
                  onDrink={giveDrink}
                  onPlay={playWithPet}
                  onCleanPoop={cleanPoop}
                  onTreat={treatPet}
                  onToggleSleep={toggleSleep}
                />
              </div>
            </div>
          )}

          {activeTab === "world" && gameState.world && (
            <WorldScreen
              pet={gameState.currentPet}
              worldState={gameState.world}
              onTravel={handleTravel}
              onStartActivity={handleStartActivity}
              onCancelActivity={handleCancelActivity}
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
        <p>
          Game Time: {gameState.gameTime.totalTicks} ticks
          {gameState.playerStats && <> • Level {gameState.playerStats.level}</>}
        </p>
        <p>
          Storage: {storageInfo.percentage.toFixed(1)}% used
          {isPaused && <> • Game is paused</>}
        </p>
      </div>
    </div>
  );
}
