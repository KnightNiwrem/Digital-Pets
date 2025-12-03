/**
 * Play button component that opens toy selection.
 */

import { CareActionButton } from "@/components/care/CareActionButton";
import { CareUI } from "@/game/data/uiText";
import { playWithPet } from "@/game/state/actions/care";

interface PlayButtonProps {
  onSuccess?: () => void;
}

/**
 * Button to open toy selection and play with the pet.
 */
export function PlayButton({ onSuccess }: PlayButtonProps) {
  return (
    <CareActionButton
      action={playWithPet}
      category={CareUI.play.category}
      label={CareUI.play.label}
      icon={CareUI.play.icon}
      selectorTitle={CareUI.play.selectorTitle}
      selectorDescription={CareUI.play.selectorDescription}
      onSuccess={onSuccess}
    />
  );
}
