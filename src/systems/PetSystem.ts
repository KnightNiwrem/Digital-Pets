// Pet care system managing all pet-related mechanics

import type { Pet, PetCareAction, ItemEffect, Result } from "@/types";
import { PET_CONSTANTS } from "@/types";
import { PetValidator, GameMath } from "@/lib/utils";

export class PetSystem {
  /**
   * Feed the pet with a food item
   */
  static feedPet(pet: Pet, satietyValue: number): Result<PetCareAction> {
    const validationError = PetValidator.validateCareAction(pet, "feed");
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const actualIncrease = Math.min(satietyValue, 100 - pet.satiety);

    if (actualIncrease <= 0) {
      return {
        success: false,
        error: "Pet is not hungry right now.",
      };
    }

    // Convert display value back to ticks
    const tickIncrease = GameMath.displayValueToTicks(actualIncrease, PET_CONSTANTS.STAT_MULTIPLIER.SATIETY);
    pet.satietyTicksLeft = GameMath.addToStat(pet.satietyTicksLeft, tickIncrease, 15000); // Cap at ~62 hours
    pet.satiety = GameMath.calculateSatietyDisplay(pet.satietyTicksLeft);
    pet.lastCareTime = Date.now();

    const action: PetCareAction = {
      type: "feed",
      timestamp: Date.now(),
    };

    return { success: true, data: action };
  }

  /**
   * Give the pet water or other drinks
   */
  static giveDrink(pet: Pet, hydrationValue: number): Result<PetCareAction> {
    const validationError = PetValidator.validateCareAction(pet, "drink");
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const actualIncrease = Math.min(hydrationValue, 100 - pet.hydration);

    if (actualIncrease <= 0) {
      return {
        success: false,
        error: "Pet is not dehydrated right now.",
      };
    }

    const tickIncrease = GameMath.displayValueToTicks(actualIncrease, PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION);
    pet.hydrationTicksLeft = GameMath.addToStat(pet.hydrationTicksLeft, tickIncrease, 12000); // Cap at ~50 hours
    pet.hydration = GameMath.calculateHydrationDisplay(pet.hydrationTicksLeft);
    pet.lastCareTime = Date.now();

    const action: PetCareAction = {
      type: "drink",
      timestamp: Date.now(),
    };

    return { success: true, data: action };
  }

  /**
   * Play with the pet using toys or activities
   */
  static playWithPet(pet: Pet, happinessValue: number, energyCost: number = 10): Result<PetCareAction> {
    const validationError = PetValidator.validateCareAction(pet, "play", energyCost);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const actualIncrease = Math.min(happinessValue, 100 - pet.happiness);

    if (actualIncrease <= 0) {
      return {
        success: false,
        error: "Pet is already very happy.",
      };
    }

    const tickIncrease = GameMath.displayValueToTicks(actualIncrease, PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS);
    pet.happinessTicksLeft = GameMath.addToStat(pet.happinessTicksLeft, tickIncrease, 18000); // Cap at ~75 hours
    pet.happiness = GameMath.calculateHappinessDisplay(pet.happinessTicksLeft);
    pet.currentEnergy = GameMath.subtractEnergy(pet.currentEnergy, energyCost);
    pet.lastCareTime = Date.now();

    const action: PetCareAction = {
      type: "play",
      timestamp: Date.now(),
      energyCost,
    };

    return { success: true, data: action };
  }

  /**
   * Clean the pet's poop
   */
  static cleanPoop(pet: Pet): Result<PetCareAction> {
    if (pet.poopTicksLeft > 0) {
      return {
        success: false,
        error: "There's no poop to clean right now.",
      };
    }

    // Reset poop timer and sickness timer
    pet.poopTicksLeft = Math.floor(Math.random() * 240) + 240; // 1-2 hours until next poop
    pet.sickByPoopTicksLeft = PET_CONSTANTS.SICK_BY_POOP_TICKS; // Reset to full 72 hours
    pet.lastCareTime = Date.now();

    const action: PetCareAction = {
      type: "clean",
      timestamp: Date.now(),
    };

    return { success: true, data: action };
  }

  /**
   * Treat the pet with medicine
   */
  static treatPet(pet: Pet, medicine: ItemEffect[]): Result<PetCareAction> {
    let treated = false;
    const healthEffects = medicine.filter(effect => effect.type === "health" || effect.type === "cure");

    if (healthEffects.length === 0) {
      return {
        success: false,
        error: "This item cannot treat the pet's condition.",
      };
    }

    for (const effect of healthEffects) {
      if (effect.type === "cure" && pet.health !== "healthy") {
        pet.health = "healthy";
        treated = true;
      } else if (effect.type === "health" && pet.currentHealth < pet.maxHealth) {
        pet.currentHealth = Math.min(pet.maxHealth, pet.currentHealth + effect.value);
        treated = true;
      }
    }

    if (!treated) {
      return {
        success: false,
        error: "Pet doesn't need this treatment right now.",
      };
    }

    pet.lastCareTime = Date.now();

    const action: PetCareAction = {
      type: "medicine",
      timestamp: Date.now(),
    };

    return { success: true, data: action };
  }

  /**
   * Put the pet to sleep for energy recovery
   */
  static putPetToSleep(pet: Pet): Result<PetCareAction> {
    const validationError = PetValidator.validateSleepAction(pet);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    pet.state = "sleeping";
    pet.lastCareTime = Date.now();

    const action: PetCareAction = {
      type: "sleep",
      timestamp: Date.now(),
    };

    return { success: true, data: action };
  }

  /**
   * Wake the pet up from sleep
   */
  static wakePetUp(pet: Pet): Result<PetCareAction> {
    if (pet.state !== "sleeping") {
      return {
        success: false,
        error: "Pet is not sleeping.",
      };
    }

    pet.state = "idle";
    pet.lastCareTime = Date.now();

    const action: PetCareAction = {
      type: "wake",
      timestamp: Date.now(),
    };

    return { success: true, data: action };
  }

  /**
   * Process a single game tick for a pet
   */
  static processPetTick(pet: Pet): string[] {
    const changes: string[] = [];

    // Decrement hidden counters
    pet.satietyTicksLeft = Math.max(0, pet.satietyTicksLeft - 1);
    pet.hydrationTicksLeft = Math.max(0, pet.hydrationTicksLeft - 1);
    pet.happinessTicksLeft = Math.max(0, pet.happinessTicksLeft - 1);
    pet.poopTicksLeft = Math.max(0, pet.poopTicksLeft - 1);
    pet.sickByPoopTicksLeft = Math.max(0, pet.sickByPoopTicksLeft - 1);

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
      pet.poopTicksLeft = Math.floor(Math.random() * 240) + 240; // 1-2 hours
      changes.push("pet_pooped");
    }

    // Handle sickness from uncleaned poop
    if (pet.sickByPoopTicksLeft === 0 && pet.health === "healthy") {
      pet.health = "sick";
      pet.sickByPoopTicksLeft = PET_CONSTANTS.SICK_BY_POOP_TICKS;
      changes.push("pet_sick_from_poop");
    }

    // Handle life changes
    const lifeChanges = this.calculateLifeChanges(pet);
    pet.life = Math.max(0, Math.min(PET_CONSTANTS.MAX_LIFE, pet.life + lifeChanges.total));

    if (lifeChanges.total !== 0) {
      changes.push(lifeChanges.total > 0 ? "life_recovered" : "life_decreased");
    }

    // Handle death
    if (pet.life === 0) {
      changes.push("pet_died");
    }

    // Handle energy recovery during sleep
    if (pet.state === "sleeping") {
      const energyRecovery = this.calculateEnergyRecovery(pet);
      const prevEnergy = pet.currentEnergy;
      pet.currentEnergy = Math.min(pet.maxEnergy, pet.currentEnergy + energyRecovery);

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
    if (pet.state !== "sleeping") return 0;

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
    if (pet.currentEnergy < 20) needs.push("rest");

    // Check health warnings
    if (pet.health !== "healthy") warnings.push(`Pet is ${pet.health}`);
    if (pet.poopTicksLeft === 0) warnings.push("Pet needs cleaning");
    if (pet.sickByPoopTicksLeft < 1000) warnings.push("Pet may get sick from uncleaned area");
    if (pet.life < PET_CONSTANTS.MAX_LIFE * 0.2) warnings.push("Pet's life is critically low");

    // Determine overall status
    let overall: "excellent" | "good" | "fair" | "poor" | "critical";
    if (pet.life === 0) {
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
    const needsPoop = pet.poopTicksLeft <= 0;

    return {
      satiety,
      hydration,
      happiness,
      needsPoop,
    };
  }
}
