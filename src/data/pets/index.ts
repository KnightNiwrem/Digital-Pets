// Pet species definitions - importing from individual files

import type { PetSpecies } from "@/types/Pet";

// Common pets
export { WILD_BEAST } from "./wildBeast";
export { BLUE_SALAMANDER } from "./blueSalamander";
export { FLAME_PUP } from "./flamePup";
export { MEADOW_MOUSE } from "./meadowMouse";
export { ROCK_BEETLE } from "./rockBeetle";
export { WIND_WISP } from "./windWisp";
export { GARDEN_TOAD } from "./gardenToad";
export { CLOUD_SHEEP } from "./cloudSheep";
export { POND_FROG } from "./pondFrog";
export { VALLEY_RABBIT } from "./valleyRabbit";

// Uncommon pets
export { FOREST_GUARDIAN } from "./forestGuardian";
export { GLASS_CAT } from "./glassCat";
export { STORM_HAWK } from "./stormHawk";
export { EMBER_WOLF } from "./emberWolf";
export { CORAL_TURTLE } from "./coralTurtle";
export { SHADOW_FOX } from "./shadowFox";
export { IRON_BEAR } from "./ironBear";
export { FIREFLY_DEER } from "./fireflyDeer";

// Rare pets
export { ARENA_CHAMPION } from "./arenaChampion";
export { THUNDER_LION } from "./thunderLion";
export { GLACIER_MAMMOTH } from "./glacierMammoth";
export { FIRE_FINCH } from "./fireFinch";
export { CAVE_PYTHON } from "./cavePython";
export { STAR_WHALE } from "./starWhale";

// Epic pets
export { STAR_MONITOR } from "./starMonitor";
export { GROVE_BEAR } from "./groveBear";
export { MIDNIGHT_STALLION } from "./midnightStallion";
export { GOLDEN_HAWK } from "./goldenHawk";

// Legendary pets
export { ANCIENT_TURTLE } from "./ancientTurtle";
export { GIANT_MONITOR } from "./giantMonitor";
export { APEX_PANTHER } from "./apexPanther";

// Import all pets for use in helper functions
import { WILD_BEAST } from "./wildBeast";
import { BLUE_SALAMANDER } from "./blueSalamander";
import { FLAME_PUP } from "./flamePup";
import { MEADOW_MOUSE } from "./meadowMouse";
import { ROCK_BEETLE } from "./rockBeetle";
import { WIND_WISP } from "./windWisp";
import { GARDEN_TOAD } from "./gardenToad";
import { CLOUD_SHEEP } from "./cloudSheep";
import { POND_FROG } from "./pondFrog";
import { VALLEY_RABBIT } from "./valleyRabbit";
import { FOREST_GUARDIAN } from "./forestGuardian";
import { GLASS_CAT } from "./glassCat";
import { STORM_HAWK } from "./stormHawk";
import { EMBER_WOLF } from "./emberWolf";
import { CORAL_TURTLE } from "./coralTurtle";
import { SHADOW_FOX } from "./shadowFox";
import { IRON_BEAR } from "./ironBear";
import { FIREFLY_DEER } from "./fireflyDeer";
import { ARENA_CHAMPION } from "./arenaChampion";
import { THUNDER_LION } from "./thunderLion";
import { GLACIER_MAMMOTH } from "./glacierMammoth";
import { FIRE_FINCH } from "./fireFinch";
import { CAVE_PYTHON } from "./cavePython";
import { STAR_WHALE } from "./starWhale";
import { STAR_MONITOR } from "./starMonitor";
import { GROVE_BEAR } from "./groveBear";
import { MIDNIGHT_STALLION } from "./midnightStallion";
import { GOLDEN_HAWK } from "./goldenHawk";
import { ANCIENT_TURTLE } from "./ancientTurtle";
import { GIANT_MONITOR } from "./giantMonitor";
import { APEX_PANTHER } from "./apexPanther";

export const getAllPetSpecies = (): PetSpecies[] => [
  // Common pets (10 total - including 3 starters)
  WILD_BEAST,
  BLUE_SALAMANDER,
  FLAME_PUP,
  MEADOW_MOUSE,
  ROCK_BEETLE,
  WIND_WISP,
  GARDEN_TOAD,
  CLOUD_SHEEP,
  POND_FROG,
  VALLEY_RABBIT,

  // Uncommon pets (8 total)
  FOREST_GUARDIAN,
  GLASS_CAT,
  STORM_HAWK,
  EMBER_WOLF,
  CORAL_TURTLE,
  SHADOW_FOX,
  IRON_BEAR,
  FIREFLY_DEER,

  // Rare pets (6 total)
  ARENA_CHAMPION,
  THUNDER_LION,
  GLACIER_MAMMOTH,
  FIRE_FINCH,
  CAVE_PYTHON,
  STAR_WHALE,

  // Epic pets (4 total)
  STAR_MONITOR,
  GROVE_BEAR,
  MIDNIGHT_STALLION,
  GOLDEN_HAWK,

  // Legendary pets (3 total)
  ANCIENT_TURTLE,
  GIANT_MONITOR,
  APEX_PANTHER,
];

export const getStarterPets = (): PetSpecies[] => [WILD_BEAST, BLUE_SALAMANDER, FLAME_PUP];

export const getPetsByRarity = (rarity: string): PetSpecies[] => {
  return getAllPetSpecies().filter(pet => pet.rarity === rarity);
};

export const getPetSpeciesById = (id: string): PetSpecies | undefined => {
  return getAllPetSpecies().find(species => species.id === id);
};
