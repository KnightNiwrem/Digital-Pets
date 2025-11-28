# Battle System

Turn-based 1v1 combat between pets. Pets cannot die in battle - defeat results in exhaustion, not death.

## Battle Pacing

The battle formulas are tuned so that battles between pets with similar stats complete within approximately **8-10 turns** (4-5 turns per combatant). This provides engaging tactical decisions without dragging on too long.

## Battle Stats

Six attributes determine combat effectiveness:

| Stat | Primary Effect |
|------|----------------|
| **Strength** | Physical damage output |
| **Endurance** | Health pool, damage resistance |
| **Agility** | Turn order, dodge chance |
| **Precision** | Hit accuracy, critical chance |
| **Fortitude** | Status resistance, stamina pool |
| **Cunning** | Debuff potency, counter-attack chance |

### Derived Stats

Derived stats are calculated from base stats:

| Derived Stat | Based On |
|--------------|----------|
| **Health** | Endurance (linear scaling + base) |
| **Stamina** | Fortitude (linear scaling + base) |
| **Initiative** | Agility + partial Cunning |
| **Dodge Chance** | Agility (percentage, capped) |
| **Critical Chance** | Precision (percentage + base) |
| **Critical Damage** | Base multiplier + Cunning scaling |
| **Counter Chance** | Cunning (percentage, capped) |

Specific formulas defined in game data.

## Damage Types

No elemental type system. Physical damage categories with resistances:

| Damage Type | Description |
|-------------|-------------|
| **Slashing** | Cutting attacks |
| **Piercing** | Stabbing attacks |
| **Crushing** | Blunt force |
| **Chemical** | Acid, poison, corrosive |
| **Thermal** | Heat or cold |
| **Electric** | Shocking attacks |

### Resistance

Each pet has resistance values per damage type (0-max%).

Resistance calculation:
```
resistanceMultiplier = 1 - (resistance / 100)
```

## Damage Formula

### Base Damage Calculation

```
baseDamage = (Strength × movePower / powerDivisor) + moveFlatDamage
```

### Hit Calculation

```
hitChance = baseHitChance + (Precision × precisionBonus) - targetDodgeChance
isHit = random() < hitChance
```

### Critical Calculation

```
isCritical = random() < criticalChance
critMultiplier = isCritical ? criticalDamageMultiplier : 1
```

### Full Damage Pipeline

```
1. Calculate baseDamage
2. Roll for hit
3. If hit, roll for critical
4. Apply critical multiplier
5. Apply target damage type resistance
6. Apply Endurance mitigation: damage × (100 / (100 + Endurance))
7. Apply variance: damage × random(minVariance, maxVariance)
8. Round to integer
```

## Moves and Skills

### Move Properties

| Property | Description |
|----------|-------------|
| id | Unique identifier |
| name | Display name |
| power | Damage multiplier |
| flatDamage | Added base damage |
| damageType | Damage category |
| staminaCost | Stamina consumed |
| cooldown | Turns before reuse |
| accuracyModifier | Adjustment to hit chance |
| effects | Status effects, buffs, debuffs |

### Default Moves

All pets have innate moves:
- Basic attack (low power, no cost, no cooldown)
- Rest action (skip turn, recover stamina)

### Move Slots

Pets have limited active move slots. Additional moves must be swapped.

### Skill Acquisition

Moves are acquired rarely via:
- Training at specialized facilities
- Quest rewards
- Random chance during battles (very rare)

## Status Effects

| Effect Type | Description |
|-------------|-------------|
| Stat Debuff | Temporary stat reduction |
| Stat Buff | Temporary stat increase |
| Damage Over Time | Damage each turn |
| Control | Skip turn, reduced actions |

### Effect Properties

| Property | Description |
|----------|-------------|
| type | Effect category |
| stat | Affected stat (if applicable) |
| value | Modifier amount |
| duration | Turns remaining |

### Status Resistance

```
resistChance = Fortitude × fortitudeResistBonus
isResisted = random() < resistChance
```

## Turn Structure

1. **Turn Order**: Higher Initiative acts first
2. **Action Selection**: Choose move or item
3. **Action Resolution**: Execute action
4. **End of Turn**: Tick status effects, reduce cooldowns, regen stamina

### Stamina Management

- Stamina regenerates each turn (percentage based)
- At 0 Stamina, only no-cost moves available
- Some moves have minimum Stamina requirements

## Victory Conditions

- Reduce opponent Health to 0
- Opponent forfeits

## Battle Rewards

| Outcome | Possible Rewards |
|---------|-----------------|
| Victory | Currency, item drops, skill XP, move learning chance |
| Defeat | Reduced rewards, exhaustion state |

## Exhaustion

Defeated pets enter exhausted state:
- Cannot battle for a duration (ticks)
- Training effectiveness reduced
- Clears after rest period