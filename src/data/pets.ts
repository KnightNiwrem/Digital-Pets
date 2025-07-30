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
  description: "A large, protective bear-like creature with moss-green fur that serves as a forest caretaker.",
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
export const BLUE_SALAMANDER: PetSpecies = {
  id: "blue_salamander",
  name: "Blue Salamander",
  rarity: "common",
  description:
    "A small amphibious creature with bright blue skin that loves to swim in streams. One of the three starter pets.",
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
  sprite: "blue-salamander.png",
  icon: "blue-salamander-icon.png",
};

export const FLAME_PUP: PetSpecies = {
  id: "flame_pup",
  name: "Flame Pup",
  rarity: "common",
  description:
    "A warm-hearted canine with bright reddish-orange fur that thrives in hot climates. One of the three starter pets.",
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
  description: "A lightweight bird-like creature with downy feathers that glides gracefully on air currents.",
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
  description:
    "A fluffy white sheep with incredibly thick wool that helps predict weather changes through static buildup.",
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
export const GLASS_CAT: PetSpecies = {
  id: "glass_cat",
  name: "Glass Cat",
  rarity: "uncommon",
  description: "A feline with translucent fur that has a unique refractive quality, creating beautiful light patterns.",
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
  sprite: "glass-cat.png",
  icon: "glass-cat-icon.png",
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
  description: "A dark-furred fox with exceptional camouflage abilities and silent movement through dense undergrowth.",
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
  description: "A powerful bear with dark grey fur and incredible strength, known for its resilient constitution.",
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

export const FIREFLY_DEER: PetSpecies = {
  id: "firefly_deer",
  name: "Firefly Deer",
  rarity: "uncommon",
  description: "An elegant deer with white antlers that have bioluminescent properties, creating a soft glow at night.",
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
  sprite: "firefly-deer.png",
  icon: "firefly-deer-icon.png",
};

// RARE PETS (6 total)
export const THUNDER_LION: PetSpecies = {
  id: "thunder_lion",
  name: "Thunder Lion",
  rarity: "rare",
  description: "A majestic lion with a deep, booming roar that can be heard for miles across the savanna.",
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
  description:
    "An ancient mammoth species with incredibly thick fur and massive curved tusks, adapted to extreme cold.",
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

export const FIRE_FINCH: PetSpecies = {
  id: "fire_finch",
  name: "Fire Finch",
  rarity: "rare",
  description: "A young bird with brilliant red and orange plumage that resembles flickering flames in sunlight.",
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
  sprite: "fire-finch.png",
  icon: "fire-finch-icon.png",
};

export const CAVE_PYTHON: PetSpecies = {
  id: "cave_python",
  name: "Cave Python",
  rarity: "rare",
  description: "A mysterious deep-cave serpent with dark scales and bioluminescent markings along its spine.",
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
  sprite: "cave-python.png",
  icon: "cave-python-icon.png",
};

export const STAR_WHALE: PetSpecies = {
  id: "star_whale",
  name: "Star Whale",
  rarity: "rare",
  description:
    "A gentle giant whale with star-like white spots across its dark blue skin, found in the deepest ocean trenches.",
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
  sprite: "star-whale.png",
  icon: "star-whale-icon.png",
};

// EPIC PETS (4 total)
export const STAR_MONITOR: PetSpecies = {
  id: "star_monitor",
  name: "Star Monitor",
  rarity: "epic",
  description:
    "A large reptilian creature with dark scales patterned like a night sky, dwelling in high mountain peaks.",
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
  sprite: "star-monitor.png",
  icon: "star-monitor-icon.png",
};

export const GROVE_BEAR: PetSpecies = {
  id: "grove_bear",
  name: "Grove Bear",
  rarity: "epic",
  description: "An ancient, wise creature with pale markings that has protected sacred groves for centuries.",
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
  sprite: "grove-bear.png",
  icon: "grove-bear-icon.png",
};

export const MIDNIGHT_STALLION: PetSpecies = {
  id: "midnight_stallion",
  name: "Midnight Stallion",
  rarity: "epic",
  description: "A powerful dark horse with a jet-black coat and remarkable speed, known for its wild temperament.",
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
  sprite: "midnight-stallion.png",
  icon: "midnight-stallion-icon.png",
};

export const GOLDEN_HAWK: PetSpecies = {
  id: "golden_hawk",
  name: "Golden Hawk",
  rarity: "epic",
  description: "A mature bird of prey with brilliant golden and crimson plumage that shimmers with incredible beauty.",
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
  sprite: "golden-hawk.png",
  icon: "golden-hawk-icon.png",
};

// LEGENDARY PETS (3 total)
export const ANCIENT_TURTLE: PetSpecies = {
  id: "ancient_turtle",
  name: "Ancient Turtle",
  rarity: "legendary",
  description:
    "A magnificent creature resembling an ancient tree with living bark and moss, representing the pinnacle of forest wisdom.",
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
  sprite: "ancient-turtle.png",
  icon: "ancient-turtle-icon.png",
};

export const GIANT_MONITOR: PetSpecies = {
  id: "giant_monitor",
  name: "Giant Monitor",
  rarity: "legendary",
  description:
    "An enormous reptilian creature with ancient scarred hide and tremendous size, believed to be centuries old.",
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
  sprite: "giant-monitor.png",
  icon: "giant-monitor-icon.png",
};

export const APEX_PANTHER: PetSpecies = {
  id: "apex_panther",
  name: "Apex Panther",
  rarity: "legendary",
  description:
    "A legendary creature of unmatched power and perfect balance, representing the ultimate achievement in pet companionship.",
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
  sprite: "apex-panther.png",
  icon: "apex-panther-icon.png",
};

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
