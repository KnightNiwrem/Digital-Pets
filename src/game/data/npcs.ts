/**
 * NPC data definitions.
 */

import { type NPC, NpcRole } from "@/game/types/npc";

/**
 * Mira - the shopkeeper at Willowbrook.
 * A friendly merchant who sells pet care supplies.
 */
export const shopkeeperMira: NPC = {
  id: "shopkeeper_mira",
  name: "Mira",
  description:
    "A cheerful shopkeeper with a warm smile. She runs the general store in Willowbrook.",
  roles: [NpcRole.Merchant],
  locationId: "willowbrook",
  dialogueId: "mira_dialogue",
  shopId: "willowbrook_shop",
  emoji: "👩‍🌾",
};

/**
 * Oak - the trainer at Willowbrook.
 * An experienced trainer who helps pets grow stronger.
 */
export const trainerOak: NPC = {
  id: "trainer_oak",
  name: "Oak",
  description:
    "A seasoned trainer with years of experience. He can help your pet reach its full potential.",
  roles: [NpcRole.Trainer, NpcRole.Guide],
  locationId: "willowbrook",
  dialogueId: "oak_dialogue",
  emoji: "👴",
};

/**
 * All NPCs indexed by ID.
 */
export const npcs: Record<string, NPC> = {
  [shopkeeperMira.id]: shopkeeperMira,
  [trainerOak.id]: trainerOak,
};

/**
 * Get an NPC by ID.
 */
export function getNpc(npcId: string): NPC | undefined {
  return npcs[npcId];
}

/**
 * Get all NPCs at a specific location.
 */
export function getNpcsAtLocation(locationId: string): NPC[] {
  return Object.values(npcs).filter((npc) => npc.locationId === locationId);
}
