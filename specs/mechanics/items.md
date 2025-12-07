# Items System

Items provide care, battle, and utility functions. Most are consumables and stackable.

## Item Categories

| Category | Purpose | Stackable |
|----------|---------|-----------|
| Food | Restore Satiety (see [Care](./care.md)) | Yes |
| Drink | Restore Hydration (see [Care](./care.md)) | Yes |
| Toy | Restore Happiness (see [Care](./care.md)) | Durability |
| Cleaning | Remove poop (see [Care](./care.md)) | Yes |
| Medicine | Heal or cure status | Yes |
| Battle | Combat consumables (see [Battle](./battle.md)) | Yes |
| Equipment | Passive bonuses | No (durability) |
| Material | Crafting ingredients | Yes |
| Key | Quest items (see [Quests](./quests.md)) | No |

## Stackability Rules

| Type | Stack Behavior |
|------|----------------|
| **Stackable** | Same items stack to max stack size |
| **Durability** | Each item separate, has uses remaining |
| **Unique** | Cannot stack, one copy only |

## Consumable Items

### Food

Food items restore Satiety (in micro-units).

| Property | Description |
|----------|-------------|
| satietyRestore | microSatiety restored on use |
| poopAcceleration | Ticks reduced from next poop timer (varies by food: 30-120 ticks) |

### Drink

Drink items restore Hydration (in micro-units).

| Property | Description |
|----------|-------------|
| hydrationRestore | microHydration restored on use |

Some drinks may also restore Energy (see [Energy](./energy.md)).

### Toy

Toy items restore Happiness but have limited uses.

| Property | Description |
|----------|-------------|
| happinessRestore | microHappiness restored per use |
| maxDurability | Total uses before destroyed |
| currentDurability | Remaining uses |

Durability decreases by 1 per use. At 0, toy is destroyed.

### Cleaning

Cleaning items remove poop. Multiple items may be needed for pets with lots of poop.

| Property | Description |
|----------|-------------|
| poopRemoved | Amount of poop removed per use |

**Usage:**
```
remainingPoop = max(0, currentPoop - item.poopRemoved)
```

## Medicine Items

Medicine items affect battle health or status.

| Property | Description |
|----------|-------------|
| healAmount | HP restored (if healing) |
| cureStatus | Status effects cured (array) |

## Battle Consumables

Battle items provide temporary buffs during combat. See [Battle](./battle.md) for combat details.

| Property | Description |
|----------|-------------|
| statModifier | Which stat affected |
| modifierValue | Percentage or flat bonus |
| duration | Turns the effect lasts |

## Equipment

Equipment provides passive bonuses but degrades with use.

| Property | Description |
|----------|-------------|
| slot | Equipment slot (if applicable) |
| effect | Passive bonus description |
| maxDurability | Total uses before breaks |
| currentDurability | Remaining uses |
| degradeActivity | What activity reduces durability |

Durability decreases per relevant activity. At 0, equipment breaks.

## Materials

Materials have no direct use but are used in crafting.

| Property | Description |
|----------|-------------|
| craftingTags | Categories for recipe matching |

## Item Rarity

Items have rarity tiers affecting acquisition:

| Tier | Description |
|------|-------------|
| Common | Frequent drops, cheap |
| Uncommon | Moderate drops, affordable |
| Rare | Infrequent drops, expensive |
| Epic | Very rare, valuable |
| Legendary | Extremely rare, unique |

Rarity affects:
- Drop rates from exploration (see [Exploration](./exploration.md))
- Shop availability
- Crafting requirements
- Sell value

## Item Properties (Common)

All items share:

| Property | Description |
|----------|-------------|
| id | Unique identifier |
| name | Display name |
| description | Item description |
| category | Item category |
| rarity | Rarity tier |
| stackable | Whether item stacks |
| maxStack | Maximum stack size (if stackable) |
| sellValue | Currency when sold |

## Inventory System

### Carried Inventory

| Property | Description |
|----------|-------------|
| Capacity | Limited number of unique stacks |
| Access | Always available |

### Storage

| Property | Description |
|----------|-------------|
| Capacity | Larger than carried |
| Access | Only at home/storage locations (see [Locations](./locations.md)) |

### Stack Limits

- Maximum items per stack (configurable per item)
- Maximum unique stacks per inventory type

## Item Acquisition

| Method | Description |
|--------|-------------|
| Shop | Purchased with currency (see [Locations](./locations.md)) |
| Exploration | Found based on exploration tables (see [Exploration](./exploration.md)) |
| Crafting | Created from materials |
| Quest Reward | Given on quest completion (see [Quests](./quests.md)) |
| Battle Drop | Chance from defeated enemies (see [Battle](./battle.md)) |
| Starting | Given to new players |

## Starting Inventory

New players receive a set of basic care items including food, drink, toy, and cleaning items to begin caring for their pet. Specific items and quantities defined in game data.
