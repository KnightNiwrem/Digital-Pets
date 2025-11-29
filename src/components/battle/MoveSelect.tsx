/**
 * Move selection component for battle.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Combatant, canUseMove } from "@/game/core/battle/turn";
import type { Move, MoveSlot } from "@/game/types/move";
import { cn } from "@/lib/utils";

const DAMAGE_TYPE_EMOJIS: Record<string, string> = {
  slashing: "⚔️",
  piercing: "🗡️",
  crushing: "🔨",
  chemical: "🧪",
  thermal: "🔥",
  electric: "⚡",
};

function getDamageTypeEmoji(type: string): string {
  return DAMAGE_TYPE_EMOJIS[type] ?? "💥";
}

interface MoveSelectProps {
  combatant: Combatant;
  onSelectMove: (move: Move) => void;
  disabled?: boolean;
}

/**
 * Displays available moves for the player to select.
 */
export function MoveSelect({
  combatant,
  onSelectMove,
  disabled = false,
}: MoveSelectProps) {
  return (
    <Card>
      <CardHeader className="py-2 sm:pb-2">
        <CardTitle className="text-sm sm:text-base">Select Move</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 py-2 sm:py-4">
        {combatant.moveSlots.map((slot) => (
          <MoveButton
            key={slot.move.id}
            slot={slot}
            combatant={combatant}
            onSelect={() => onSelectMove(slot.move)}
            disabled={disabled}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface MoveButtonProps {
  slot: MoveSlot;
  combatant: Combatant;
  onSelect: () => void;
  disabled: boolean;
}

function MoveButton({ slot, combatant, onSelect, disabled }: MoveButtonProps) {
  const { move, currentCooldown } = slot;
  const { canUse, reason } = canUseMove(combatant, slot);
  const isDisabled = disabled || !canUse;

  return (
    <Button
      variant="outline"
      className={cn(
        "h-auto py-1.5 px-2 sm:py-2 sm:px-3 flex flex-col items-start text-left gap-0.5 sm:gap-1",
        !canUse && "opacity-50",
      )}
      onClick={onSelect}
      disabled={isDisabled}
      title={reason}
    >
      <div className="flex items-center gap-1 w-full">
        <span className="text-xs sm:text-sm">
          {getDamageTypeEmoji(move.damageType)}
        </span>
        <span className="font-medium text-xs sm:text-sm flex-1 truncate">
          {move.name}
        </span>
        {currentCooldown > 0 && (
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            ({currentCooldown})
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground w-full">
        {move.power > 0 && <span>Pwr: {move.power.toFixed(1)}</span>}
        {move.staminaCost !== 0 && (
          <span
            className={cn(
              move.staminaCost < 0 ? "text-green-600" : "text-blue-600",
            )}
          >
            {move.staminaCost < 0 ? "+" : "-"}
            {Math.abs(move.staminaCost)} SP
          </span>
        )}
      </div>
    </Button>
  );
}
