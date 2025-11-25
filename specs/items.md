# Items System

Items provide care, battle, and utility functions. Most are consumables and stackable.

## Item Categories

| Category | Purpose | Stackable |
|----------|---------|-----------|
| Food | Restore Satiety | Yes |
| Drink | Restore Hydration | Yes |
| Toy | Restore Happiness | Durability |
| Cleaning | Remove poop | Yes |
| Medicine | Heal or cure status | Yes |
| Battle | Combat consumables | Yes |
| Equipment | Passive bonuses | No (durability) |
| Material | Crafting ingredients | Yes |
| Key | Quest items | No |

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
| poopAcceleration | Ticks reduced from next poop timer |

### Drink

Drink items restore Hydration (in micro-units).

| Property | Description |
|----------|-------------|
| hydrationRestore | microHydration restored on use |

Some drinks may also restore Energy.

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

Battle items provide temporary buffs during combat.

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
- Drop rates from foraging
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
| Access | Only at home/storage locations |

### Stack Limits

- Maximum items per stack (configurable per item)
- Maximum unique stacks per inventory type

## Item Acquisition

| Method | Description |
|--------|-------------|
| Shop | Purchased with currency |
| Foraging | Found based on forage tables |
| Crafting | Created from materials |
| Quest Reward | Given on quest completion |
| Battle Drop | Chance from defeated enemies |
| Starting | Given to new players |

## Starting Inventory

New players receive a set of basic care items including food, drink, toy, and cleaning items to begin caring for their pet. Specific items and quantities defined in game data.