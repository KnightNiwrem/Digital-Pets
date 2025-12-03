/**
 * Feed button component that opens food selection.
 */

import { CareActionButton } from "@/components/care/CareActionButton";
import { CareUI } from "@/game/data/uiText";
import { feedPet } from "@/game/state/actions/care";

interface FeedButtonProps {
  onSuccess?: () => void;
}

/**
 * Button to open food selection and feed the pet.
 */
export function FeedButton({ onSuccess }: FeedButtonProps) {
  return (
    <CareActionButton
      action={feedPet}
      category={CareUI.feed.category}
      label={CareUI.feed.label}
      icon={CareUI.feed.icon}
      selectorTitle={CareUI.feed.selectorTitle}
      selectorDescription={CareUI.feed.selectorDescription}
      onSuccess={onSuccess}
    />
  );
}
