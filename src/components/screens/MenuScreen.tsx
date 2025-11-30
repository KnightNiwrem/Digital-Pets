/**
 * Menu screen with settings and save management.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGameState } from "@/game/hooks/useGameState";
import { exportSave, importSave, saveGame } from "@/game/state/persistence";
import { selectLastSaveTime } from "@/game/state/selectors";

/**
 * Menu screen with save management and settings.
 */
export function MenuScreen() {
  const { state, actions } = useGameState();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  const showSaveStatus = useCallback((message: string) => {
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }
    setSaveStatus(message);
    saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(null), 2000);
  }, []);

  const handleManualSave = () => {
    if (!state) return;
    const success = saveGame(state);
    showSaveStatus(success ? "Game saved!" : "Failed to save game");
  };

  const handleExport = () => {
    const data = exportSave();
    if (!data) {
      showSaveStatus("Failed to export save");
      return;
    }

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digital-pets-save-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSaveStatus("Save exported!");
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleImportDialogChange = (open: boolean) => {
    setShowImportDialog(open);
    if (!open) {
      setImportError(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = importSave(text);
      if (result.success) {
        actions.updateState(() => result.state);
        setShowImportDialog(false);
        showSaveStatus("Save imported successfully!");
      } else {
        setImportError(result.error);
      }
    } catch (error) {
      console.error("File import error:", error);
      setImportError("Failed to read file");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetGame = () => {
    actions.resetGame();
    setShowResetConfirm(false);
  };

  const lastSaveTime = state ? selectLastSaveTime(state) : null;

  return (
    <div className="space-y-4">
      {/* Save Status Toast */}
      {saveStatus && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          {saveStatus}
        </div>
      )}

      {/* Save Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💾</span>
            <span>Save Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleManualSave}
            className="w-full"
            variant="outline"
          >
            <span className="mr-2">💾</span>
            Save Game
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleExport} variant="outline">
              <span className="mr-2">📤</span>
              Export
            </Button>
            <Button onClick={() => setShowImportDialog(true)} variant="outline">
              <span className="mr-2">📥</span>
              Import
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Game auto-saves every 30 seconds
          </p>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>⚙️</span>
            <span>Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            More settings coming soon!
          </p>
        </CardContent>
      </Card>

      {/* Game Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>Game Info</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Ticks</span>
            <span className="font-mono">{state?.totalTicks ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Save</span>
            <span className="font-mono">
              {lastSaveTime
                ? new Date(lastSaveTime).toLocaleTimeString()
                : "Never"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <span>⚠️</span>
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setShowResetConfirm(true)}
            className="w-full"
          >
            <span className="mr-2">🗑️</span>
            Delete Save Data
          </Button>
        </CardContent>
      </Card>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Save Data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all your progress including your pet,
              items, and achievements. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetGame}>
              Delete Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={handleImportDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Save Data</DialogTitle>
            <DialogDescription>
              Select a previously exported save file to restore your game.
              Warning: This will overwrite your current save!
            </DialogDescription>
          </DialogHeader>
          {importError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {importError}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleImportDialogChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleImportClick}>
              <span className="mr-2">📁</span>
              Select File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
