/**
 * NPC data definitions.
 */

import { type NPC, NpcRole } from "@/game/types/npc";

// ========================================
// WILLOWBROOK NPCs
// ========================================

/**
 * Mira - the shopkeeper at Willowbrook.
 * A friendly merchant who sells pet care supplies.
 */
export const shopkeeperMira: NPC = {
  id: "shopkeeper_mira",
  name: "Mira",
  description:
    "A cheerful shopkeeper with a warm smile. She runs the general store in Willowbrook.",
  roles: [NpcRole.Merchant, NpcRole.QuestGiver],
  locationId: "willowbrook",
  dialogueId: "mira_dialogue",
  shopId: "willowbrook_shop",
  questIds: [
    "side_coastal_explorer",
    "side_gourmet_chef",
    "side_rare_collector",
  ],
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
  roles: [NpcRole.Trainer, NpcRole.Guide, NpcRole.QuestGiver],
  locationId: "willowbrook",
  dialogueId: "oak_dialogue",
  questIds: [
    "main_new_journey",
    "main_crystal_discovery",
    "main_rising_flames",
    "main_shadow_depths",
    "side_material_gatherer",
    "side_monster_hunter",
  ],
  emoji: "👴",
};

// ========================================
// IRONHAVEN NPCs
// ========================================

/**
 * Grom - the blacksmith at Ironhaven.
 * A master craftsman who forges equipment and trades ore.
 */
export const blacksmithGrom: NPC = {
  id: "blacksmith_grom",
  name: "Grom",
  description:
    "A burly blacksmith with arms like tree trunks. His forge produces the finest equipment in the region, and he pays well for quality ore.",
  roles: [NpcRole.Merchant, NpcRole.QuestGiver],
  locationId: "ironhaven",
  dialogueId: "grom_dialogue",
  shopId: "ironhaven_shop",
  questIds: ["side_ore_collector", "side_forge_master"],
  emoji: "🧔",
};

/**
 * Delva - the mining expert at Ironhaven.
 * A veteran miner who knows every tunnel in the mountains.
 */
export const minerDelva: NPC = {
  id: "miner_delva",
  name: "Delva",
  description:
    "A weathered miner with a pickaxe always at her side. She has explored every cave and tunnel in the mountain range.",
  roles: [NpcRole.Trainer, NpcRole.QuestGiver, NpcRole.Lore],
  locationId: "ironhaven",
  dialogueId: "delva_dialogue",
  questIds: ["side_deep_mining", "side_crystal_hunter"],
  emoji: "👷‍♀️",
};

// ========================================
// TIDECREST NPCs
// ========================================

/**
 * Marina - the fisher at Tidecrest.
 * A skilled angler who knows the secrets of the sea.
 */
export const fisherMarina: NPC = {
  id: "fisher_marina",
  name: "Marina",
  description:
    "A sun-weathered fisher with an encyclopedic knowledge of the sea. She can identify any fish by its silhouette and knows the best fishing spots.",
  roles: [NpcRole.Trainer, NpcRole.QuestGiver, NpcRole.Merchant],
  locationId: "tidecrest",
  dialogueId: "marina_dialogue",
  shopId: "tidecrest_shop",
  questIds: ["side_big_catch", "side_pearl_diving"],
  emoji: "🧜‍♀️",
};

/**
 * Captain Torrent - a retired sea captain at Tidecrest.
 * A legendary sailor with tales of ancient underwater ruins.
 */
export const captainTorrent: NPC = {
  id: "captain_torrent",
  name: "Captain Torrent",
  description:
    "A grizzled sea captain with a peg leg and endless stories. He speaks of sunken temples and treasures lost to the deep.",
  roles: [NpcRole.Lore, NpcRole.QuestGiver],
  locationId: "tidecrest",
  dialogueId: "torrent_dialogue",
  questIds: ["side_treasure_hunt", "main_sunken_secrets"],
  emoji: "🧑‍✈️",
};

// ========================================
// STARFALL SANCTUARY NPCs
// ========================================

/**
 * Sage Lumina - the mystical sage at Starfall Sanctuary.
 * A wise elder who guards ancient knowledge.
 */
export const sageLumina: NPC = {
  id: "sage_lumina",
  name: "Sage Lumina",
  description:
    "An ethereal sage who seems to shimmer with starlight. She has devoted her life to studying the mysteries of pet evolution and cosmic energy.",
  roles: [NpcRole.Trainer, NpcRole.Lore, NpcRole.QuestGiver],
  locationId: "starfall_sanctuary",
  dialogueId: "lumina_dialogue",
  questIds: ["main_celestial_trial", "side_starlight_gathering"],
  emoji: "🧙‍♀️",
};

/**
 * Archivist Echo - the keeper of records at Starfall Sanctuary.
 * Preserves all knowledge about pets and the world.
 */
export const archivistEcho: NPC = {
  id: "archivist_echo",
  name: "Archivist Echo",
  description:
    "A mysterious figure whose face is always hidden in shadow. They maintain the vast library of pet knowledge accumulated over millennia.",
  roles: [NpcRole.Lore, NpcRole.QuestGiver, NpcRole.Merchant],
  locationId: "starfall_sanctuary",
  dialogueId: "echo_dialogue",
  shopId: "sanctuary_shop",
  questIds: ["side_lost_knowledge", "side_ancient_texts"],
  emoji: "📚",
};

// ========================================
// WANDERING NPCs (found during exploration)
// ========================================

/**
 * Fern - a traveling herbalist.
 * Appears in wild areas and offers healing items.
 */
export const herbalistFern: NPC = {
  id: "herbalist_fern",
  name: "Fern",
  description:
    "A gentle herbalist who wanders the wilds gathering medicinal plants. She's always happy to share her remedies with fellow travelers.",
  roles: [NpcRole.Merchant, NpcRole.QuestGiver],
  locationId: "ancient_grove",
  dialogueId: "fern_dialogue",
  shopId: "fern_traveling_shop",
  questIds: ["side_rare_herbs", "side_mushroom_mystery"],
  emoji: "🌿",
};

/**
 * Blaze - a fire-focused trainer.
 * Found in volcanic areas, specializes in thermal training.
 */
export const trainerBlaze: NPC = {
  id: "trainer_blaze",
  name: "Blaze",
  description:
    "An intense trainer who has dedicated their life to understanding thermal resistance. They train exclusively in the volcanic regions.",
  roles: [NpcRole.Trainer, NpcRole.QuestGiver],
  locationId: "scorched_highlands",
  dialogueId: "blaze_dialogue",
  questIds: ["side_trial_by_fire", "side_volcanic_champion"],
  emoji: "🔥",
};

/**
 * Frost - an ice-specialized researcher.
 * Studies creatures adapted to extreme cold.
 */
export const researcherFrost: NPC = {
  id: "researcher_frost",
  name: "Dr. Frost",
  description:
    "A dedicated researcher bundled in heavy furs, studying how creatures survive in the frozen peaks. Their research could revolutionize pet training.",
  roles: [NpcRole.Lore, NpcRole.QuestGiver],
  locationId: "frozen_peaks",
  dialogueId: "frost_dialogue",
  questIds: ["side_cold_adaptation", "side_ice_sample_collection"],
  emoji: "🥶",
};

/**
 * Coral - an underwater explorer.
 * Knows the secrets of the reef and temple.
 */
export const explorerCoral: NPC = {
  id: "explorer_coral",
  name: "Coral",
  description:
    "An intrepid underwater explorer who has mapped every corner of the reef. She seeks to uncover the mysteries of the Sunken Temple.",
  roles: [NpcRole.Guide, NpcRole.QuestGiver],
  locationId: "coral_reef",
  dialogueId: "coral_dialogue",
  questIds: ["side_reef_survey", "side_temple_expedition"],
  emoji: "🤿",
};

/**
 * Gloom - a mysterious shadow dweller.
 * Offers rare knowledge about the depths.
 */
export const shadowGloom: NPC = {
  id: "shadow_gloom",
  name: "Gloom",
  description:
    "A shadowy figure who has spent so long in the darkness that they seem to merge with it. They know secrets that should remain forgotten.",
  roles: [NpcRole.Lore, NpcRole.QuestGiver, NpcRole.Merchant],
  locationId: "shadow_depths",
  dialogueId: "gloom_dialogue",
  shopId: "shadow_shop",
  questIds: ["side_embrace_darkness", "side_shadow_essence"],
  emoji: "👤",
};

/**
 * All NPCs indexed by ID.
 */
export const npcs: Record<string, NPC> = {
  // Willowbrook
  [shopkeeperMira.id]: shopkeeperMira,
  [trainerOak.id]: trainerOak,
  // Ironhaven
  [blacksmithGrom.id]: blacksmithGrom,
  [minerDelva.id]: minerDelva,
  // Tidecrest
  [fisherMarina.id]: fisherMarina,
  [captainTorrent.id]: captainTorrent,
  // Starfall Sanctuary
  [sageLumina.id]: sageLumina,
  [archivistEcho.id]: archivistEcho,
  // Wandering/Location-based
  [herbalistFern.id]: herbalistFern,
  [trainerBlaze.id]: trainerBlaze,
  [researcherFrost.id]: researcherFrost,
  [explorerCoral.id]: explorerCoral,
  [shadowGloom.id]: shadowGloom,
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
