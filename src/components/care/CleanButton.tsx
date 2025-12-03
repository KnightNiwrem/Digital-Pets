/**
 * Clean button component that opens cleaning item selection.
 */

import { CareActionButton } from "@/components/care/CareActionButton";
import { CareUI } from "@/game/data/uiText";
import { useGameState } from "@/game/hooks/useGameState";
import { cleanPet } from "@/game/state/actions/care";
import { selectPoop } from "@/game/state/selectors";

interface CleanButtonProps {
  onSuccess?: () => void;
}

/**
 * Button to open cleaning item selection and clean the pet.
 */
export function CleanButton({ onSuccess }: CleanButtonProps) {
  const { state } = useGameState();

  if (!state) return null;

  // Disable button if there's no poop to clean
  const poopDisplay = selectPoop(state);
  const poopCount = poopDisplay?.count ?? 0;
  const isDisabled = poopCount === 0;

  return (
    <CareActionButton
      action={cleanPet}
      category={CareUI.clean.category}
      label={CareUI.clean.label}
      icon={CareUI.clean.icon}
      selectorTitle={CareUI.clean.selectorTitle}
      selectorDescription={CareUI.clean.selectorDescription}
      onSuccess={onSuccess}
      disabled={isDisabled}
    />
  );
}
