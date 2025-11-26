/**
 * Dialogue box component for displaying NPC speech.
 */

import { Card, CardContent } from "@/components/ui/card";
import type { NPC } from "@/game/types/npc";

interface DialogueBoxProps {
  npc: NPC;
  text: string;
  onClick?: () => void;
  showContinue?: boolean;
}

/**
 * Displays NPC dialogue text in a styled box.
 */
export function DialogueBox({
  npc,
  text,
  onClick,
  showContinue = false,
}: DialogueBoxProps) {
  return (
    <Card
      className={
        onClick ? "cursor-pointer hover:bg-accent/50 transition-colors" : ""
      }
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <span className="text-3xl shrink-0">{npc.emoji}</span>
          <div className="flex-1">
            <div className="font-medium text-sm mb-1">{npc.name}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {text}
            </p>
            {showContinue && (
              <p className="text-xs text-muted-foreground/60 mt-2 italic">
                Click to continue...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
