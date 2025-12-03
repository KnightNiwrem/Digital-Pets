/**
 * Dialogue screen component for NPC conversations.
 */

import { useCallback, useMemo, useState } from "react";
import { DialogueBox } from "@/components/npc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  advanceDialogue,
  checkCondition,
  selectChoice,
  startDialogue,
} from "@/game/core/dialogue";
import { completeQuest, startQuest } from "@/game/core/quests/quests";
import { getNpc } from "@/game/data/npcs";
import { useGameState } from "@/game/hooks/useGameState";
import { DialogueActionType, DialogueNodeType } from "@/game/types/npc";

interface DialogueScreenProps {
  npcId: string;
  onClose: () => void;
  onOpenShop?: (npcId: string) => void;
}

/**
 * Full-screen dialogue interface for NPC conversations.
 */
export function DialogueScreen({
  npcId,
  onClose,
  onOpenShop,
}: DialogueScreenProps) {
  const npc = getNpc(npcId);
  const { state: gameState, actions } = useGameState();

  // Initialize dialogue state with a single startDialogue call
  const [dialogue, setDialogue] = useState(() => {
    const result = startDialogue(npcId);
    return {
      state: result.success && result.state ? result.state : null,
      node: result.success && result.node ? result.node : null,
    };
  });

  const { state: dialogueState, node: currentNode } = dialogue;

  // Handle clicking to advance message nodes
  const handleAdvance = useCallback(() => {
    if (!dialogueState) return;

    const result = advanceDialogue(dialogueState);
    if (result.ended) {
      onClose();
    } else if (result.success && result.state && result.node) {
      setDialogue({ state: result.state, node: result.node });
    }
  }, [dialogueState, onClose]);

  // Handle selecting a choice
  const handleSelectChoice = useCallback(
    (index: number) => {
      if (!dialogueState) return;

      const result = selectChoice(dialogueState, index, gameState || undefined);
      if (result.success && result.state && result.node) {
        setDialogue({ state: result.state, node: result.node });

        // Handle any actions associated with the choice
        if (result.action && gameState) {
          const questActionMap: Record<
            string,
            typeof startQuest | typeof completeQuest
          > = {
            [DialogueActionType.StartQuest]: startQuest,
            [DialogueActionType.CompleteQuest]: completeQuest,
          };

          const actionFn = questActionMap[result.action.type];
          if (actionFn) {
            const questResult = actionFn(gameState, result.action.targetId);
            if (questResult.success) {
              actions.updateState(() => questResult.state);
            }
          }
        }
      }
    },
    [dialogueState, gameState, actions],
  );

  // Filter choices based on conditions
  const availableChoices = useMemo(() => {
    if (!currentNode?.choices) return [];
    return currentNode.choices
      .map((choice, index) => ({ choice, index }))
      .filter(({ choice }) => {
        if (!choice.conditions || !gameState) return true;
        return choice.conditions.every((c) => checkCondition(gameState, c));
      });
  }, [currentNode, gameState]);

  // Handle shop button
  const handleOpenShop = useCallback(() => {
    onOpenShop?.(npcId);
    onClose();
  }, [npcId, onOpenShop, onClose]);

  if (!npc) {
    return (
      <Card>
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-center">NPC not found.</p>
          <Button className="w-full mt-4" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!dialogueState || !currentNode) {
    return (
      <Card>
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-center">
            Could not start dialogue.
          </p>
          <Button className="w-full mt-4" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{npc.emoji}</span>
              <CardTitle className="text-lg">{npc.name}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close dialogue"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Dialogue content */}
      {currentNode.type === DialogueNodeType.Message && (
        <DialogueBox
          npc={npc}
          text={currentNode.text}
          onClick={handleAdvance}
          showContinue={true}
        />
      )}

      {currentNode.type === DialogueNodeType.Choice && (
        <>
          <DialogueBox npc={npc} text={currentNode.text} />
          <div className="flex flex-col gap-2">
            {availableChoices.map(({ choice, index }, i) => (
              <Button
                key={`choice-${index}-${choice.nextNodeId}`}
                variant="outline"
                className="justify-start text-left h-auto py-3 px-4"
                onClick={() => handleSelectChoice(index)}
              >
                <span className="text-muted-foreground mr-2">{i + 1}.</span>
                {choice.text}
              </Button>
            ))}
          </div>
        </>
      )}

      {currentNode.type === DialogueNodeType.End && (
        <>
          <DialogueBox npc={npc} text={currentNode.text} />
          <Button className="w-full" onClick={onClose}>
            Goodbye
          </Button>
        </>
      )}

      {currentNode.type === DialogueNodeType.Shop && (
        <>
          <DialogueBox npc={npc} text={currentNode.text} />
          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={handleOpenShop}>
              Browse Shop
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
