// Pet care system managing all pet-related mechanics

import type { Pet, PetCareAction, ItemEffect, Result } from "@/types";
import { PET_CONSTANTS } from "@/types";
import { PetValidator, GameMath, EnergyManager, StatUpdateUtils, ResultUtils, PetCareActionFactory } from "@/lib/utils";

export class PetSystem {
  /**
   * Feed the pet with a food item
   */
  static feedPet(pet: Pet, satietyValue: number): Result<PetCareAction> {
    // Use new validation utility
    const validationResult = ResultUtils.validateOrError<PetCareAction>(PetValidator.validateCareAction(pet, "feed"));
    if (validationResult) return validationResult;

    const updateResult = StatUpdateUtils.updateStat(
      pet,
      "satiety",
      satietyValue,
      PET_CONSTANTS.STAT_MULTIPLIER.SATIETY,
      15000
    );

    if (updateResult.actualIncrease <= 0) {
      return ResultUtils.error("Pet is not hungry right now.");
    }

    const updatedPet = updateResult.updatedPet;
    Object.assign(pet, updatedPet);

    // Use new action factory
    return ResultUtils.success(PetCareActionFactory.feed());
  }

  /**
   * Give the pet water or other drinks
   */
  static giveDrink(pet: Pet, hydrationValue: number): Result<PetCareAction> {
    // Use new validation utility
    const validationResult = ResultUtils.validateOrError<PetCareAction>(PetValidator.validateCareAction(pet, "drink"));
    if (validationResult) return validationResult;

    const updateResult = StatUpdateUtils.updateStat(
      pet,
      "hydration",
      hydrationValue,
      PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION,
      12000
    );

    if (updateResult.actualIncrease <= 0) {
      return ResultUtils.error("Pet is not dehydrated right now.");
    }

    const updatedPet = updateResult.updatedPet;
    Object.assign(pet, updatedPet);

    // Use new action factory
    return ResultUtils.success(PetCareActionFactory.drink());
  }

  /**
   * Play with the pet using toys or activities
   */
  static playWithPet(pet: Pet, happinessValue: number, energyCost: number = 10): Result<PetCareAction> {
    // Use new validation utility
    const validationResult = ResultUtils.validateOrError<PetCareAction>(
      PetValidator.validateCareAction(pet, "play", energyCost)
    );
    if (validationResult) return validationResult;

    const updateResult = StatUpdateUtils.updateStat(
      pet,
      "happiness",
      happinessValue,
      PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS,
      18000
    );

    if (updateResult.actualIncrease <= 0) {
      return ResultUtils.error("Pet is already very happy.");
    }

    const updatedPet = updateResult.updatedPet;
    Object.assign(pet, updatedPet);
    EnergyManager.deductEnergy(pet, energyCost);

    // Use new action factory
    return ResultUtils.success(PetCareActionFactory.play(energyCost));
  }

  /**
   * Clean the pet's poop
   */
  static cleanPoop(pet: Pet): Result<PetCareAction> {
    if (pet.poopCount === 0) {
      return ResultUtils.error("There's no poop to clean right now.");
    }

    // Clean all poop and reset timers
    pet.poopCount = 0; // Clear all uncleaned poop
    pet.poopTicksLeft = Math.floor(Math.random() * 240) + 240; // 1-2 hours until next poop
    pet.sickByPoopTicksLeft = PET_CONSTANTS.SICK_BY_POOP_TICKS; // Reset to full 72 hours
    pet.lastCareTime = Date.now();

    // Use new action factory
    return ResultUtils.success(PetCareActionFactory.clean());
  }

  /**
   * Treat the pet with medicine
   */
  static treatPet(pet: Pet, medicine: ItemEffect[]): Result<PetCareAction> {
    let treated = false;
    const healthEffects = medicine.filter(effect => effect.type === "health" || effect.type === "cure");

    if (healthEffects.length === 0) {
      return ResultUtils.error("This item cannot treat the pet's condition.");
    }

    for (const effect of healthEffects) {
      if (effect.type === "cure" && PetValidator.isUnhealthy(pet)) {
        pet.health = "healthy";
        treated = true;
      } else if (effect.type === "health" && pet.currentHealth < pet.maxHealth) {
        pet.currentHealth = GameMath.addToStat(pet.currentHealth, effect.value, pet.maxHealth);
        treated = true;
      }
    }

    if (!treated) {
      return ResultUtils.error("Pet doesn't need this treatment right now.");
    }

    pet.lastCareTime = Date.now();

    // Use new action factory
    return ResultUtils.success(PetCareActionFactory.medicine());
  }

  /**
   * Put the pet to sleep for energy recovery
   */
  static putPetToSleep(pet: Pet): Result<PetCareAction> {
    // Use new validation utility
    const validationResult = ResultUtils.validateOrError<PetCareAction>(PetValidator.validateSleepAction(pet));
    if (validationResult) return validationResult;

    pet.state = "sleeping";
    pet.lastCareTime = Date.now();

    // Use new action factory
    return ResultUtils.success(PetCareActionFactory.sleep());
  }

  /**
   * Wake the pet up from sleep
   */
  static wakePetUp(pet: Pet): Result<PetCareAction> {
    if (pet.state !== "sleeping") {
      return ResultUtils.error("Pet is not sleeping.");
    }

    pet.state = "idle";
    pet.lastCareTime = Date.now();

    // Use new action factory
    return ResultUtils.success(PetCareActionFactory.wake());
  }

  /**
   * Process a single game tick for a pet
   */
  static processPetTick(pet: Pet): string[] {
    const changes: string[] = [];

    // Decrement hidden counters
    pet.satietyTicksLeft = GameMath.subtractEnergy(pet.satietyTicksLeft, 1);
    pet.hydrationTicksLeft = GameMath.subtractEnergy(pet.hydrationTicksLeft, 1);
    pet.happinessTicksLeft = GameMath.subtractEnergy(pet.happinessTicksLeft, 1);
    pet.poopTicksLeft = GameMath.subtractEnergy(pet.poopTicksLeft, 1);

    // Decrement sickness timer faster when there are more poops
    const sickDecrement = pet.poopCount > 0 ? 2 * pet.poopCount : 0;
    pet.sickByPoopTicksLeft = GameMath.subtractEnergy(pet.sickByPoopTicksLeft, sickDecrement);

    // Update displayed stats
    const prevSatiety = pet.satiety;
    const prevHydration = pet.hydration;
    const prevHappiness = pet.happiness;

    pet.satiety = GameMath.calculateSatietyDisplay(pet.satietyTicksLeft);
    pet.hydration = GameMath.calculateHydrationDisplay(pet.hydrationTicksLeft);
    pet.happiness = GameMath.calculateHappinessDisplay(pet.happinessTicksLeft);

    // Track changes in displayed stats
    if (pet.satiety !== prevSatiety) changes.push("satiety_changed");
    if (pet.hydration !== prevHydration) changes.push("hydration_changed");
    if (pet.happiness !== prevHappiness) changes.push("happiness_changed");

    // Handle poop
    if (pet.poopTicksLeft === 0) {
      // Increment poop count (if there was already poop, this adds more)
      pet.poopCount = pet.poopCount + 1;
      pet.poopTicksLeft = Math.floor(Math.random() * 240) + 240; // 1-2 hours
      changes.push("pet_pooped");
    }

    // Handle sickness from uncleaned poop
    if (pet.sickByPoopTicksLeft === 0 && PetValidator.isHealthy(pet)) {
      pet.health = "sick";
      pet.sickByPoopTicksLeft = PET_CONSTANTS.SICK_BY_POOP_TICKS;
      changes.push("pet_sick_from_poop");
    }

    // Handle life changes
    const lifeChanges = this.calculateLifeChanges(pet);
    pet.life = GameMath.clamp(pet.life + lifeChanges.total, 0, PET_CONSTANTS.MAX_LIFE);

    if (lifeChanges.total !== 0) {
      changes.push(lifeChanges.total > 0 ? "life_recovered" : "life_decreased");
    }

    // Handle death
    if (PetValidator.isDead(pet)) {
      changes.push("pet_died");
    }

    // Handle energy recovery during sleep
    if (PetValidator.isSleeping(pet)) {
      const energyRecovery = this.calculateEnergyRecovery(pet);
      const prevEnergy = pet.currentEnergy;
      pet.currentEnergy = GameMath.addToStat(pet.currentEnergy, energyRecovery, pet.maxEnergy);

      if (pet.currentEnergy !== prevEnergy) {
        changes.push("energy_recovered");
      }
    }

    // Handle growth
    pet.totalLifetime++;
    if (this.checkGrowthEligibility(pet)) {
      this.processGrowth(pet);
      changes.push("pet_grew");
    }

    return changes;
  }

  /**
   * Calculate life changes for this tick
   */
  private static calculateLifeChanges(pet: Pet): { total: number; reasons: string[] } {
    let total = 0;
    const reasons: string[] = [];
    let shouldRecover = true;

    // Life decreases
    if (pet.health === "injured") {
      total -= PET_CONSTANTS.LIFE_DECREASE.injured;
      reasons.push("injured");
      shouldRecover = false;
    }
    if (pet.health === "sick") {
      total -= PET_CONSTANTS.LIFE_DECREASE.sick;
      reasons.push("sick");
      shouldRecover = false;
    }
    if (pet.satiety === 0) {
      total -= PET_CONSTANTS.LIFE_DECREASE.noSatiety;
      reasons.push("no_satiety");
      shouldRecover = false;
    }
    if (pet.hydration === 0) {
      total -= PET_CONSTANTS.LIFE_DECREASE.noHydration;
      reasons.push("no_hydration");
      shouldRecover = false;
    }
    if (pet.growthStage === PET_CONSTANTS.GROWTH_STAGES - 1) {
      total -= PET_CONSTANTS.LIFE_DECREASE.finalStage;
      reasons.push("final_stage");
    }

    // Life recovery
    if (shouldRecover && total >= 0) {
      total += PET_CONSTANTS.LIFE_RECOVERY;
      reasons.push("recovery");
    }

    return { total, reasons };
  }

  /**
   * Calculate energy recovery for a sleeping pet
   */
  private static calculateEnergyRecovery(pet: Pet): number {
    if (!PetValidator.isSleeping(pet)) return 0;

    // Base recovery of 1 energy per tick while sleeping
    let recovery = 1;

    // Higher stages recover energy faster
    const stageBonus = Math.floor(pet.growthStage / 10);
    recovery += stageBonus;

    return recovery;
  }

  /**
   * Check if pet is eligible for growth
   */
  private static checkGrowthEligibility(pet: Pet): boolean {
    if (pet.growthStage >= PET_CONSTANTS.GROWTH_STAGES - 1) return false;

    // Growth requirement increases with each stage
    const requiredLifetime = (pet.growthStage + 1) * 10000; // Simplified formula
    return pet.totalLifetime >= requiredLifetime;
  }

  /**
   * Process pet growth to next stage
   */
  private static processGrowth(pet: Pet): void {
    if (pet.growthStage >= PET_CONSTANTS.GROWTH_STAGES - 1) return;

    pet.growthStage++;

    // Increase max energy
    const energyIncrease = 10 + Math.floor(pet.growthStage / 5) * 5; // More energy per stage as pet grows
    pet.maxEnergy += energyIncrease;

    // Increase battle stats based on species growth rates
    pet.attack = Math.floor(pet.attack * pet.species.growthRates.attack);
    pet.defense = Math.floor(pet.defense * pet.species.growthRates.defense);
    pet.speed = Math.floor(pet.speed * pet.species.growthRates.speed);
    pet.maxHealth = Math.floor(pet.maxHealth * pet.species.growthRates.health);

    // Heal to full health on growth
    pet.currentHealth = pet.maxHealth;
  }

  /**
   * Get pet's current status summary
   */
  static getPetStatus(pet: Pet): {
    overall: "excellent" | "good" | "fair" | "poor" | "critical";
    needs: string[];
    warnings: string[];
  } {
    const needs: string[] = [];
    const warnings: string[] = [];

    // Check basic needs
    if (pet.satiety < 20) needs.push("food");
    if (pet.hydration < 20) needs.push("water");
    if (pet.happiness < 20) needs.push("attention");
    if (PetValidator.hasLowEnergy(pet)) needs.push("rest");

    // Check health warnings
    if (PetValidator.isUnhealthy(pet)) warnings.push(`Pet is ${pet.health}`);
    if (pet.poopCount > 0) {
      const poopMessage = pet.poopCount === 1 ? "Pet needs cleaning" : `Pet needs cleaning (${pet.poopCount} poops)`;
      warnings.push(poopMessage);
    }
    if (pet.sickByPoopTicksLeft < 1000) warnings.push("Pet may get sick from uncleaned area");
    if (PetValidator.hasCriticalLife(pet)) warnings.push("Pet's life is critically low");

    // Determine overall status
    let overall: "excellent" | "good" | "fair" | "poor" | "critical";
    if (PetValidator.isDead(pet)) {
      overall = "critical";
    } else if (warnings.length > 2 || needs.length > 2) {
      overall = "poor";
    } else if (warnings.length > 0 || needs.length > 1) {
      overall = "fair";
    } else if (needs.length > 0) {
      overall = "good";
    } else {
      overall = "excellent";
    }

    return { overall, needs, warnings };
  }

  /**
   * Calculate time until next critical event
   */
  static getNextCriticalEvent(pet: Pet): {
    event: string;
    ticksRemaining: number;
    severity: "low" | "medium" | "high" | "critical";
  } | null {
    const events = [
      {
        event: "pet_will_poop",
        ticksRemaining: pet.poopTicksLeft,
        severity: "low" as const,
      },
      {
        event: "pet_will_be_sick_from_poop",
        ticksRemaining: pet.sickByPoopTicksLeft,
        severity: "high" as const,
      },
      {
        event: "satiety_will_reach_zero",
        ticksRemaining: pet.satietyTicksLeft,
        severity: "high" as const,
      },
      {
        event: "hydration_will_reach_zero",
        ticksRemaining: pet.hydrationTicksLeft,
        severity: "critical" as const,
      },
      {
        event: "happiness_will_reach_zero",
        ticksRemaining: pet.happinessTicksLeft,
        severity: "medium" as const,
      },
    ].filter(event => event.ticksRemaining > 0);

    if (events.length === 0) return null;

    // Return the event that will happen soonest
    return events.reduce((soonest, current) => (current.ticksRemaining < soonest.ticksRemaining ? current : soonest));
  }

  /**
   * Calculate display stats from hidden tick counters
   */
  static calculateDisplayStats(pet: Pet): {
    satiety: number;
    hydration: number;
    happiness: number;
    needsPoop: boolean;
  } {
    // Convert hidden tick counters to display percentages
    const satiety = GameMath.calculateSatietyDisplay(pet.satietyTicksLeft);
    const hydration = GameMath.calculateHydrationDisplay(pet.hydrationTicksLeft);
    const happiness = GameMath.calculateHappinessDisplay(pet.happinessTicksLeft);

    // Check if pet needs poop cleaning
    const needsPoop = pet.poopCount > 0;

    return {
      satiety,
      hydration,
      happiness,
      needsPoop,
    };
  }
}
