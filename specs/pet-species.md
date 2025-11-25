# Pet Species

Different species have unique stat distributions, growth patterns, and care requirements.

## Species Attributes

Each species is defined by:

| Attribute | Description |
|-----------|-------------|
| **Base Stats** | Starting battle stat distribution |
| **Stat Growth** | Growth multipliers per stat per stage |
| **Care Cap Multiplier** | Float multiplier affecting max care stat values |
| **Resistance Profile** | Natural damage type resistances |

## Stat Distribution Categories

Species fall into archetypes based on stat distribution:

| Archetype | Primary Stats | Playstyle |
|-----------|---------------|-----------|
| Balanced | Even distribution | Versatile |
| Glass Cannon | High Agility/Precision | Fast, critical-focused |
| Power Tank | High Strength/Endurance | Slow, high damage |
| Evasion | High Agility/Cunning | Dodge-focused |
| Defender | High Endurance/Fortitude | High survivability |
| Status | High Cunning/Precision | Debuff specialist |

## Care Cap Multiplier

Species have different care requirements expressed as multipliers to base care max:

| Multiplier Range | Description |
|------------------|-------------|
| 0.7 - 0.85 | Low maintenance (smaller/simpler pets) |
| 0.9 - 1.1 | Normal maintenance |
| 1.15 - 1.3 | High maintenance (larger/complex pets) |

**Effect:**
```
actualCareMax = floor(baseCareMax × speciesCareCapMultiplier)
```

Lower multiplier = lower max care stats = need more frequent care.

## Stat Growth

At each main growth stage transition, pets gain stats based on species growth rates.

| Growth Rate | Description |
|-------------|-------------|
| Low | +1-2 per stage |
| Medium | +3-4 per stage |
| High | +5-6 per stage |

Each species has different growth rates per stat.

## Resistance Profile

Species have innate resistances to damage types:

| Resistance Level | Damage Reduction |
|------------------|------------------|
| None | 0% |
| Minor | 5-10% |
| Moderate | 15-20% |
| Strong | 25% |

Resistances are per damage type (Slashing, Piercing, Crushing, Chemical, Thermal, Electric).

## Species Unlocking

| Unlock Method | Description |
|---------------|-------------|
| Starting | Available at game start |
| Quest | Complete specific quest chain |
| Discovery | Find during exploration |
| Achievement | Reach certain milestones |

## Species Identity

Each species should have:

- Unique visual design
- Distinct stat profile
- Characteristic resistances
- Thematic move affinity
- Lore/background

## Balance Considerations

When defining species:

- Total base stats should be comparable across species
- Higher growth in one stat offset by lower in others
- Care Cap Multiplier balances overall ease
- No species should dominate all scenarios
- Each species should excel in specific situations