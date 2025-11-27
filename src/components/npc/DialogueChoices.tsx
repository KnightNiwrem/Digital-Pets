/**
 * Dialogue choices component for player response options.
 */

import { Button } from "@/components/ui/button";
import type { DialogueChoice } from "@/game/types/npc";

interface DialogueChoicesProps {
  choices: DialogueChoice[];
  onSelect: (index: number) => void;
}

/**
 * Displays dialogue choice buttons for player selection.
 */
export function DialogueChoices({ choices, onSelect }: DialogueChoicesProps) {
  return (
    <div className="flex flex-col gap-2">
      {choices.map((choice, index) => (
        <Button
          key={`choice-${index}-${choice.nextNodeId}`}
          variant="outline"
          className="justify-start text-left h-auto py-3 px-4"
          onClick={() => onSelect(index)}
        >
          <span className="text-muted-foreground mr-2">{index + 1}.</span>
          {choice.text}
        </Button>
      ))}
    </div>
  );
}
