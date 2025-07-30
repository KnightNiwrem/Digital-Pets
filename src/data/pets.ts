// Pet species definitions

import type { PetSpecies } from "@/types/Pet";

export const WILD_BEAST: PetSpecies = {
  id: "wild_beast",
  name: "Wild Beast",
  rarity: "common",
  description: "A basic wild creature found in forests.",
  baseStats: {
    attack: 25,
    defense: 20,
    speed: 30,
    health: 100,
  },
  growthRates: {
    attack: 1.2,
    defense: 1.1,
    speed: 1.3,
    health: 1.15,
    energy: 1.1,
  },
  sprite: "beast.png",
  icon: "beast-icon.png",
};

export const FOREST_GUARDIAN: PetSpecies = {
  id: "forest_guardian",
  name: "Forest Guardian",
  rarity: "uncommon",
  description: "A mystical creature that protects the forest.",
  baseStats: {
    attack: 35,
    defense: 40,
    speed: 25,
    health: 120,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.4,
    speed: 1.2,
    health: 1.25,
    energy: 1.2,
  },
  sprite: "guardian.png",
  icon: "guardian-icon.png",
};

export const ARENA_CHAMPION: PetSpecies = {
  id: "arena_champion",
  name: "Arena Champion",
  rarity: "rare",
  description: "An elite fighter from the battle arena.",
  baseStats: {
    attack: 45,
    defense: 50,
    speed: 40,
    health: 150,
  },
  growthRates: {
    attack: 1.4,
    defense: 1.5,
    speed: 1.35,
    health: 1.3,
    energy: 1.25,
  },
  sprite: "champion.png",
  icon: "champion-icon.png",
};

// COMMON PETS (10 total - 3 starters + 7 others)
// Starter pets (player chooses from these 3)
export const WATER_SPRITE: PetSpecies = {
  id: "water_sprite",
  name: "Water Sprite",
  rarity: "common",
  description: "A gentle water elemental that loves to play in streams. One of the three starter pets.",
  baseStats: {
    attack: 20,
    defense: 25,
    speed: 35,
    health: 90,
  },
  growthRates: {
    attack: 1.1,
    defense: 1.2,
    speed: 1.4,
    health: 1.1,
    energy: 1.1,
  },
  sprite: "water-sprite.png",
  icon: "water-sprite-icon.png",
};

export const FLAME_PUP: PetSpecies = {
  id: "flame_pup",
  name: "Flame Pup",
  rarity: "common",
  description: "A playful fire elemental with a warm heart. One of the three starter pets.",
  baseStats: {
    attack: 30,
    defense: 15,
    speed: 30,
    health: 95,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.0,
    speed: 1.2,
    health: 1.15,
    energy: 1.1,
  },
  sprite: "flame-pup.png",
  icon: "flame-pup-icon.png",
};

// Additional common pets
export const MEADOW_MOUSE: PetSpecies = {
  id: "meadow_mouse",
  name: "Meadow Mouse",
  rarity: "common",
  description: "A small, quick rodent that scurries through grasslands.",
  baseStats: {
    attack: 15,
    defense: 10,
    speed: 45,
    health: 80,
  },
  growthRates: {
    attack: 1.0,
    defense: 0.9,
    speed: 1.5,
    health: 1.0,
    energy: 1.0,
  },
  sprite: "meadow-mouse.png",
  icon: "meadow-mouse-icon.png",
};

export const ROCK_BEETLE: PetSpecies = {
  id: "rock_beetle",
  name: "Rock Beetle",
  rarity: "common",
  description: "A sturdy insect with a hard shell that protects mountain caves.",
  baseStats: {
    attack: 20,
    defense: 35,
    speed: 15,
    health: 110,
  },
  growthRates: {
    attack: 1.1,
    defense: 1.4,
    speed: 0.9,
    health: 1.2,
    energy: 1.0,
  },
  sprite: "rock-beetle.png",
  icon: "rock-beetle-icon.png",
};

export const WIND_WISP: PetSpecies = {
  id: "wind_wisp",
  name: "Wind Wisp",
  rarity: "common",
  description: "An ethereal creature that floats on air currents.",
  baseStats: {
    attack: 25,
    defense: 15,
    speed: 40,
    health: 85,
  },
  growthRates: {
    attack: 1.2,
    defense: 1.0,
    speed: 1.4,
    health: 1.0,
    energy: 1.2,
  },
  sprite: "wind-wisp.png",
  icon: "wind-wisp-icon.png",
};

export const GARDEN_TOAD: PetSpecies = {
  id: "garden_toad",
  name: "Garden Toad",
  rarity: "common",
  description: "A friendly amphibian that helps tend to plants and flowers.",
  baseStats: {
    attack: 18,
    defense: 28,
    speed: 20,
    health: 105,
  },
  growthRates: {
    attack: 1.0,
    defense: 1.3,
    speed: 1.0,
    health: 1.2,
    energy: 1.1,
  },
  sprite: "garden-toad.png",
  icon: "garden-toad-icon.png",
};

export const CLOUD_SHEEP: PetSpecies = {
  id: "cloud_sheep",
  name: "Cloud Sheep",
  rarity: "common",
  description: "A fluffy creature that brings gentle rains and soft breezes.",
  baseStats: {
    attack: 22,
    defense: 30,
    speed: 25,
    health: 100,
  },
  growthRates: {
    attack: 1.1,
    defense: 1.3,
    speed: 1.1,
    health: 1.15,
    energy: 1.1,
  },
  sprite: "cloud-sheep.png",
  icon: "cloud-sheep-icon.png",
};

export const POND_FROG: PetSpecies = {
  id: "pond_frog",
  name: "Pond Frog",
  rarity: "common",
  description: "A cheerful amphibian that loves lily pads and catching flies.",
  baseStats: {
    attack: 20,
    defense: 20,
    speed: 35,
    health: 90,
  },
  growthRates: {
    attack: 1.1,
    defense: 1.1,
    speed: 1.3,
    health: 1.1,
    energy: 1.1,
  },
  sprite: "pond-frog.png",
  icon: "pond-frog-icon.png",
};

export const VALLEY_RABBIT: PetSpecies = {
  id: "valley_rabbit",
  name: "Valley Rabbit",
  rarity: "common",
  description: "A quick and nimble rabbit that loves to hop through meadows.",
  baseStats: {
    attack: 18,
    defense: 15,
    speed: 40,
    health: 85,
  },
  growthRates: {
    attack: 1.0,
    defense: 1.0,
    speed: 1.4,
    health: 1.0,
    energy: 1.1,
  },
  sprite: "valley-rabbit.png",
  icon: "valley-rabbit-icon.png",
};

// UNCOMMON PETS (8 total)
export const CRYSTAL_CAT: PetSpecies = {
  id: "crystal_cat",
  name: "Crystal Cat",
  rarity: "uncommon",
  description: "A feline with crystalline fur that sparkles in moonlight.",
  baseStats: {
    attack: 32,
    defense: 35,
    speed: 42,
    health: 115,
  },
  growthRates: {
    attack: 1.25,
    defense: 1.3,
    speed: 1.35,
    health: 1.2,
    energy: 1.15,
  },
  sprite: "crystal-cat.png",
  icon: "crystal-cat-icon.png",
};

export const STORM_HAWK: PetSpecies = {
  id: "storm_hawk",
  name: "Storm Hawk",
  rarity: "uncommon",
  description: "A majestic bird that soars through thunderstorms.",
  baseStats: {
    attack: 40,
    defense: 25,
    speed: 50,
    health: 105,
  },
  growthRates: {
    attack: 1.4,
    defense: 1.15,
    speed: 1.45,
    health: 1.15,
    energy: 1.2,
  },
  sprite: "storm-hawk.png",
  icon: "storm-hawk-icon.png",
};

export const EMBER_WOLF: PetSpecies = {
  id: "ember_wolf",
  name: "Ember Wolf",
  rarity: "uncommon",
  description: "A fierce canine with glowing red fur and fiery determination.",
  baseStats: {
    attack: 38,
    defense: 30,
    speed: 38,
    health: 125,
  },
  growthRates: {
    attack: 1.35,
    defense: 1.2,
    speed: 1.3,
    health: 1.25,
    energy: 1.2,
  },
  sprite: "ember-wolf.png",
  icon: "ember-wolf-icon.png",
};

export const CORAL_TURTLE: PetSpecies = {
  id: "coral_turtle",
  name: "Coral Turtle",
  rarity: "uncommon",
  description: "An ancient turtle with a shell covered in living coral.",
  baseStats: {
    attack: 25,
    defense: 50,
    speed: 20,
    health: 140,
  },
  growthRates: {
    attack: 1.15,
    defense: 1.5,
    speed: 1.0,
    health: 1.35,
    energy: 1.15,
  },
  sprite: "coral-turtle.png",
  icon: "coral-turtle-icon.png",
};

export const SHADOW_FOX: PetSpecies = {
  id: "shadow_fox",
  name: "Shadow Fox",
  rarity: "uncommon",
  description: "A mysterious fox that can blend with shadows and move unseen.",
  baseStats: {
    attack: 35,
    defense: 28,
    speed: 48,
    health: 110,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.2,
    speed: 1.4,
    health: 1.2,
    energy: 1.25,
  },
  sprite: "shadow-fox.png",
  icon: "shadow-fox-icon.png",
};

export const IRON_BEAR: PetSpecies = {
  id: "iron_bear",
  name: "Iron Bear",
  rarity: "uncommon",
  description: "A powerful bear with metallic fur and incredible strength.",
  baseStats: {
    attack: 42,
    defense: 45,
    speed: 25,
    health: 135,
  },
  growthRates: {
    attack: 1.4,
    defense: 1.4,
    speed: 1.1,
    health: 1.3,
    energy: 1.2,
  },
  sprite: "iron-bear.png",
  icon: "iron-bear-icon.png",
};

export const STARLIGHT_DEER: PetSpecies = {
  id: "starlight_deer",
  name: "Starlight Deer",
  rarity: "uncommon",
  description: "An elegant deer whose antlers glow with celestial light.",
  baseStats: {
    attack: 30,
    defense: 32,
    speed: 45,
    health: 120,
  },
  growthRates: {
    attack: 1.2,
    defense: 1.25,
    speed: 1.4,
    health: 1.25,
    energy: 1.3,
  },
  sprite: "starlight-deer.png",
  icon: "starlight-deer-icon.png",
};

export const PRISM_BIRD: PetSpecies = {
  id: "prism_bird",
  name: "Prism Bird",
  rarity: "uncommon",
  description: "A beautiful bird whose feathers refract light into rainbow patterns.",
  baseStats: {
    attack: 36,
    defense: 30,
    speed: 46,
    health: 115,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.2,
    speed: 1.4,
    health: 1.2,
    energy: 1.25,
  },
  sprite: "prism-bird.png",
  icon: "prism-bird-icon.png",
};

// RARE PETS (6 total)
export const THUNDER_LION: PetSpecies = {
  id: "thunder_lion",
  name: "Thunder Lion",
  rarity: "rare",
  description: "A majestic lion whose roar can summon lightning from the sky.",
  baseStats: {
    attack: 55,
    defense: 40,
    speed: 45,
    health: 160,
  },
  growthRates: {
    attack: 1.5,
    defense: 1.3,
    speed: 1.4,
    health: 1.35,
    energy: 1.3,
  },
  sprite: "thunder-lion.png",
  icon: "thunder-lion-icon.png",
};

export const GLACIER_MAMMOTH: PetSpecies = {
  id: "glacier_mammoth",
  name: "Glacier Mammoth",
  rarity: "rare",
  description: "An ancient mammoth with tusks of pure ice and incredible endurance.",
  baseStats: {
    attack: 50,
    defense: 60,
    speed: 25,
    health: 180,
  },
  growthRates: {
    attack: 1.4,
    defense: 1.6,
    speed: 1.1,
    health: 1.4,
    energy: 1.25,
  },
  sprite: "glacier-mammoth.png",
  icon: "glacier-mammoth-icon.png",
};

export const PHOENIX_CHICK: PetSpecies = {
  id: "phoenix_chick",
  name: "Phoenix Chick",
  rarity: "rare",
  description: "A young phoenix with the power of rebirth and eternal flames.",
  baseStats: {
    attack: 48,
    defense: 35,
    speed: 50,
    health: 145,
  },
  growthRates: {
    attack: 1.45,
    defense: 1.25,
    speed: 1.45,
    health: 1.3,
    energy: 1.4,
  },
  sprite: "phoenix-chick.png",
  icon: "phoenix-chick-icon.png",
};

export const VOID_SERPENT: PetSpecies = {
  id: "void_serpent",
  name: "Void Serpent",
  rarity: "rare",
  description: "A mysterious serpent that exists between dimensions.",
  baseStats: {
    attack: 52,
    defense: 45,
    speed: 48,
    health: 155,
  },
  growthRates: {
    attack: 1.5,
    defense: 1.35,
    speed: 1.4,
    health: 1.3,
    energy: 1.35,
  },
  sprite: "void-serpent.png",
  icon: "void-serpent-icon.png",
};

export const CELESTIAL_WHALE: PetSpecies = {
  id: "celestial_whale",
  name: "Celestial Whale",
  rarity: "rare",
  description: "A gentle giant that swims through the cosmos carrying stardust.",
  baseStats: {
    attack: 40,
    defense: 65,
    speed: 35,
    health: 200,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.6,
    speed: 1.25,
    health: 1.5,
    energy: 1.3,
  },
  sprite: "celestial-whale.png",
  icon: "celestial-whale-icon.png",
};

// EPIC PETS (4 total)
export const COSMIC_DRAGON: PetSpecies = {
  id: "cosmic_dragon",
  name: "Cosmic Dragon",
  rarity: "epic",
  description: "A dragon born from cosmic energy with power over space and time.",
  baseStats: {
    attack: 70,
    defense: 55,
    speed: 60,
    health: 220,
  },
  growthRates: {
    attack: 1.6,
    defense: 1.45,
    speed: 1.5,
    health: 1.5,
    energy: 1.4,
  },
  sprite: "cosmic-dragon.png",
  icon: "cosmic-dragon-icon.png",
};

export const SPIRIT_GUARDIAN: PetSpecies = {
  id: "spirit_guardian",
  name: "Spirit Guardian",
  rarity: "epic",
  description: "An ancient protector spirit with wisdom spanning millennia.",
  baseStats: {
    attack: 60,
    defense: 70,
    speed: 50,
    health: 240,
  },
  growthRates: {
    attack: 1.5,
    defense: 1.6,
    speed: 1.4,
    health: 1.55,
    energy: 1.45,
  },
  sprite: "spirit-guardian.png",
  icon: "spirit-guardian-icon.png",
};

export const NIGHTMARE_STALLION: PetSpecies = {
  id: "nightmare_stallion",
  name: "Nightmare Stallion",
  rarity: "epic",
  description: "A dark horse wreathed in shadow flames with incredible speed.",
  baseStats: {
    attack: 65,
    defense: 50,
    speed: 75,
    health: 200,
  },
  growthRates: {
    attack: 1.55,
    defense: 1.4,
    speed: 1.7,
    health: 1.45,
    energy: 1.5,
  },
  sprite: "nightmare-stallion.png",
  icon: "nightmare-stallion-icon.png",
};

export const DIVINE_PHOENIX: PetSpecies = {
  id: "divine_phoenix",
  name: "Divine Phoenix",
  rarity: "epic",
  description: "A mature phoenix blessed by divine light with resurrection powers.",
  baseStats: {
    attack: 68,
    defense: 45,
    speed: 65,
    health: 210,
  },
  growthRates: {
    attack: 1.6,
    defense: 1.35,
    speed: 1.55,
    health: 1.5,
    energy: 1.6,
  },
  sprite: "divine-phoenix.png",
  icon: "divine-phoenix-icon.png",
};

// LEGENDARY PETS (3 total)
export const WORLD_TREE_SPIRIT: PetSpecies = {
  id: "world_tree_spirit",
  name: "World Tree Spirit",
  rarity: "legendary",
  description: "The living essence of the World Tree that connects all realms.",
  baseStats: {
    attack: 80,
    defense: 90,
    speed: 70,
    health: 300,
  },
  growthRates: {
    attack: 1.7,
    defense: 1.8,
    speed: 1.6,
    health: 1.8,
    energy: 1.7,
  },
  sprite: "world-tree-spirit.png",
  icon: "world-tree-spirit-icon.png",
};

export const ETERNAL_DRAGON: PetSpecies = {
  id: "eternal_dragon",
  name: "Eternal Dragon",
  rarity: "legendary",
  description: "An immortal dragon that has existed since the dawn of creation.",
  baseStats: {
    attack: 90,
    defense: 70,
    speed: 80,
    health: 280,
  },
  growthRates: {
    attack: 1.8,
    defense: 1.6,
    speed: 1.7,
    health: 1.7,
    energy: 1.8,
  },
  sprite: "eternal-dragon.png",
  icon: "eternal-dragon-icon.png",
};

export const PRIMORDIAL_GOD_BEAST: PetSpecies = {
  id: "primordial_god_beast",
  name: "Primordial God Beast",
  rarity: "legendary",
  description: "The first creature ever created, possessing unlimited potential.",
  baseStats: {
    attack: 75,
    defense: 75,
    speed: 75,
    health: 275,
  },
  growthRates: {
    attack: 1.9,
    defense: 1.9,
    speed: 1.9,
    health: 2.0,
    energy: 1.9,
  },
  sprite: "primordial-god-beast.png",
  icon: "primordial-god-beast-icon.png",
};

export const getAllPetSpecies = (): PetSpecies[] => [
  // Common pets (10 total - including 3 starters)
  WILD_BEAST,
  WATER_SPRITE,
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
  CRYSTAL_CAT,
  STORM_HAWK,
  EMBER_WOLF,
  CORAL_TURTLE,
  SHADOW_FOX,
  IRON_BEAR,
  STARLIGHT_DEER,

  // Rare pets (6 total)
  ARENA_CHAMPION,
  THUNDER_LION,
  GLACIER_MAMMOTH,
  PHOENIX_CHICK,
  VOID_SERPENT,
  CELESTIAL_WHALE,

  // Epic pets (4 total)
  COSMIC_DRAGON,
  SPIRIT_GUARDIAN,
  NIGHTMARE_STALLION,
  DIVINE_PHOENIX,

  // Legendary pets (3 total)
  WORLD_TREE_SPIRIT,
  ETERNAL_DRAGON,
  PRIMORDIAL_GOD_BEAST,
];

export const getStarterPets = (): PetSpecies[] => [WILD_BEAST, WATER_SPRITE, FLAME_PUP];

export const getPetsByRarity = (rarity: string): PetSpecies[] => {
  return getAllPetSpecies().filter(pet => pet.rarity === rarity);
};

export const getPetSpeciesById = (id: string): PetSpecies | undefined => {
  return getAllPetSpecies().find(species => species.id === id);
};
