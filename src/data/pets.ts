// Pet species definitions - importing from individual files

import type { PetSpecies } from "@/types/Pet";

// Common pets
export { WILD_BEAST } from "./pets/wildBeast";
export { BLUE_SALAMANDER } from "./pets/blueSalamander";
export { FLAME_PUP } from "./pets/flamePup";
export { MEADOW_MOUSE } from "./pets/meadowMouse";
export { ROCK_BEETLE } from "./pets/rockBeetle";
export { WIND_WISP } from "./pets/windWisp";
export { GARDEN_TOAD } from "./pets/gardenToad";
export { CLOUD_SHEEP } from "./pets/cloudSheep";
export { POND_FROG } from "./pets/pondFrog";
export { VALLEY_RABBIT } from "./pets/valleyRabbit";

// Uncommon pets
export { FOREST_GUARDIAN } from "./pets/forestGuardian";
export { GLASS_CAT } from "./pets/glassCat";
export { STORM_HAWK } from "./pets/stormHawk";
export { EMBER_WOLF } from "./pets/emberWolf";
export { CORAL_TURTLE } from "./pets/coralTurtle";
export { SHADOW_FOX } from "./pets/shadowFox";
export { IRON_BEAR } from "./pets/ironBear";
export { FIREFLY_DEER } from "./pets/fireflyDeer";

// Rare pets
export { ARENA_CHAMPION } from "./pets/arenaChampion";
export { THUNDER_LION } from "./pets/thunderLion";
export { GLACIER_MAMMOTH } from "./pets/glacierMammoth";
export { FIRE_FINCH } from "./pets/fireFinch";
export { CAVE_PYTHON } from "./pets/cavePython";
export { STAR_WHALE } from "./pets/starWhale";

// Epic pets
export { STAR_MONITOR } from "./pets/starMonitor";
export { GROVE_BEAR } from "./pets/groveBear";
export { MIDNIGHT_STALLION } from "./pets/midnightStallion";
export { GOLDEN_HAWK } from "./pets/goldenHawk";

// Legendary pets
export { ANCIENT_TURTLE } from "./pets/ancientTurtle";
export { GIANT_MONITOR } from "./pets/giantMonitor";
export { APEX_PANTHER } from "./pets/apexPanther";

// Import all pets for use in helper functions
import { WILD_BEAST } from "./pets/wildBeast";
import { BLUE_SALAMANDER } from "./pets/blueSalamander";
import { FLAME_PUP } from "./pets/flamePup";
import { MEADOW_MOUSE } from "./pets/meadowMouse";
import { ROCK_BEETLE } from "./pets/rockBeetle";
import { WIND_WISP } from "./pets/windWisp";
import { GARDEN_TOAD } from "./pets/gardenToad";
import { CLOUD_SHEEP } from "./pets/cloudSheep";
import { POND_FROG } from "./pets/pondFrog";
import { VALLEY_RABBIT } from "./pets/valleyRabbit";
import { FOREST_GUARDIAN } from "./pets/forestGuardian";
import { GLASS_CAT } from "./pets/glassCat";
import { STORM_HAWK } from "./pets/stormHawk";
import { EMBER_WOLF } from "./pets/emberWolf";
import { CORAL_TURTLE } from "./pets/coralTurtle";
import { SHADOW_FOX } from "./pets/shadowFox";
import { IRON_BEAR } from "./pets/ironBear";
import { FIREFLY_DEER } from "./pets/fireflyDeer";
import { ARENA_CHAMPION } from "./pets/arenaChampion";
import { THUNDER_LION } from "./pets/thunderLion";
import { GLACIER_MAMMOTH } from "./pets/glacierMammoth";
import { FIRE_FINCH } from "./pets/fireFinch";
import { CAVE_PYTHON } from "./pets/cavePython";
import { STAR_WHALE } from "./pets/starWhale";
import { STAR_MONITOR } from "./pets/starMonitor";
import { GROVE_BEAR } from "./pets/groveBear";
import { MIDNIGHT_STALLION } from "./pets/midnightStallion";
import { GOLDEN_HAWK } from "./pets/goldenHawk";
import { ANCIENT_TURTLE } from "./pets/ancientTurtle";
import { GIANT_MONITOR } from "./pets/giantMonitor";
import { APEX_PANTHER } from "./pets/apexPanther";

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
