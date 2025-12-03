/**
 * Water button component that opens drink selection.
 */

import { CareActionButton } from "@/components/care/CareActionButton";
import { CareUI } from "@/game/data/uiText";
import { waterPet } from "@/game/state/actions/care";

interface WaterButtonProps {
  onSuccess?: () => void;
}

/**
 * Button to open drink selection and give the pet water.
 */
export function WaterButton({ onSuccess }: WaterButtonProps) {
  return (
    <CareActionButton
      action={waterPet}
      category={CareUI.water.category}
      label={CareUI.water.label}
      icon={CareUI.water.icon}
      selectorTitle={CareUI.water.selectorTitle}
      selectorDescription={CareUI.water.selectorDescription}
      onSuccess={onSuccess}
      variant="secondary"
    />
  );
}
