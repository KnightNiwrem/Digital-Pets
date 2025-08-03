// Pet care system managing all pet-related mechanics

import type { Pet, ItemEffect, Result } from "@/types";
import type { SystemProposal, ValidationResult, ProposalContext, ProposalGenerator } from "@/types/SystemProposal";
import { PET_CONSTANTS } from "@/types";
import { PetValidator, GameMath } from "@/lib/utils";
import { ProposalFactory } from "@/types/SystemProposal";

export class PetSystem {
  // NOTE: Direct pet care methods (feedPet, giveDrink, playWithPet, cleanPoop, treatPet, putPetToSleep, wakePetUp)
  // have been removed. Pet care is now handled through ActionCoordinator + proposal system.

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
  // ============= PROPOSAL-BASED METHODS =============

  /**
   * Generate proposals for pet care actions
   */
  static generateCareProposals(
    pet: Pet,
    careType: "feed" | "drink" | "play" | "clean" | "medicine" | "sleep" | "wake",
    value?: number,
    effects?: ItemEffect[]
  ): SystemProposal[] {
    const proposals: SystemProposal[] = [];

    switch (careType) {
      case "feed":
        if (value) {
          const ticksToAdd = value * PET_CONSTANTS.STAT_MULTIPLIER.SATIETY;
          proposals.push(
            ProposalFactory.createPetUpdateProposal(
              "pet_system",
              `Feed pet (${value} satiety)`,
              {
                satietyTicksLeft: pet.satietyTicksLeft + ticksToAdd,
                lastCareTime: Date.now(),
              },
              100
            )
          );
        }
        break;

      case "drink":
        if (value) {
          const ticksToAdd = value * PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION;
          proposals.push(
            ProposalFactory.createPetUpdateProposal(
              "pet_system",
              `Give drink to pet (${value} hydration)`,
              {
                hydrationTicksLeft: pet.hydrationTicksLeft + ticksToAdd,
                lastCareTime: Date.now(),
              },
              100
            )
          );
        }
        break;

      case "play":
        if (value) {
          const ticksToAdd = value * PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS;
          const energyCost = 10; // Default energy cost for playing
          proposals.push(
            ProposalFactory.createPetUpdateProposal(
              "pet_system",
              `Play with pet (${value} happiness)`,
              {
                happinessTicksLeft: pet.happinessTicksLeft + ticksToAdd,
                currentEnergy: Math.max(0, pet.currentEnergy - energyCost),
                lastCareTime: Date.now(),
              },
              100
            )
          );
        }
        break;

      case "clean":
        proposals.push(
          ProposalFactory.createPetUpdateProposal(
            "pet_system",
            "Clean pet",
            {
              poopCount: 0,
              poopTicksLeft: Math.floor(Math.random() * 240) + 240,
              sickByPoopTicksLeft: PET_CONSTANTS.SICK_BY_POOP_TICKS,
              lastCareTime: Date.now(),
            },
            100
          )
        );
        break;

      case "medicine":
        if (effects && effects.length > 0) {
          const updates: Partial<Pet> = { lastCareTime: Date.now() };
          let description = "Treat pet with medicine";

          for (const effect of effects) {
            if (effect.type === "cure" && PetValidator.isUnhealthy(pet)) {
              updates.health = "healthy";
              description += " (cured illness)";
            } else if (effect.type === "health" && pet.currentHealth < pet.maxHealth) {
              updates.currentHealth = Math.min(pet.maxHealth, pet.currentHealth + effect.value);
              description += ` (+${effect.value} health)`;
            }
          }

          if (Object.keys(updates).length > 1) {
            // More than just lastCareTime
            proposals.push(ProposalFactory.createPetUpdateProposal("pet_system", description, updates, 100));
          }
        }
        break;

      case "sleep":
        proposals.push(
          ProposalFactory.createPetUpdateProposal(
            "pet_system",
            "Put pet to sleep",
            {
              state: "sleeping",
              lastCareTime: Date.now(),
            },
            100
          )
        );
        break;

      case "wake":
        proposals.push(
          ProposalFactory.createPetUpdateProposal(
            "pet_system",
            "Wake pet up",
            {
              state: "idle",
              lastCareTime: Date.now(),
            },
            100
          )
        );
        break;
    }

    return proposals;
  }

  /**
   * Validate pet care proposal
   */
  static validateCareProposal(_proposal: SystemProposal, pet: Pet, careType: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic pet validation
    if (PetValidator.isDead(pet)) {
      errors.push("Cannot perform actions on a deceased pet");
    }

    // Care-specific validation
    switch (careType) {
      case "feed":
        if (pet.satiety >= 100) {
          errors.push("Pet is not hungry right now");
        }
        break;

      case "drink":
        if (pet.hydration >= 100) {
          errors.push("Pet is not thirsty right now");
        }
        break;

      case "play":
        if (pet.happiness >= 100) {
          errors.push("Pet is already very happy");
        }
        if (!PetValidator.hasEnoughEnergy(pet, 10)) {
          errors.push("Pet has insufficient energy to play");
        }
        if (PetValidator.isSleeping(pet)) {
          errors.push("Pet cannot play while sleeping");
        }
        if (PetValidator.isExploring(pet)) {
          errors.push("Pet cannot play while exploring");
        }
        break;

      case "clean":
        if (pet.poopCount === 0) {
          errors.push("There's no poop to clean right now");
        }
        if (PetValidator.isSleeping(pet)) {
          errors.push("Cannot clean pet while sleeping");
        }
        if (PetValidator.isExploring(pet)) {
          errors.push("Cannot clean pet while exploring");
        }
        if (PetValidator.isTravelling(pet)) {
          errors.push("Cannot clean pet while travelling");
        }
        break;

      case "medicine":
        if (PetValidator.isHealthy(pet)) {
          errors.push("Pet doesn't need medicine - already healthy");
        }
        break;

      case "sleep":
        if (PetValidator.isSleeping(pet)) {
          errors.push("Pet is already sleeping");
        }
        if (PetValidator.isExploring(pet)) {
          errors.push("Pet cannot sleep while exploring");
        }
        if (PetValidator.isTravelling(pet)) {
          errors.push("Pet cannot sleep while travelling");
        }
        break;

      case "wake":
        if (!PetValidator.isSleeping(pet)) {
          errors.push("Pet is not sleeping");
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflicts: [],
    };
  }

  /**
   * Apply pet care proposal changes directly to pet
   * This is used by ActionCoordinator for atomic state changes
   */
  static applyCareChanges(pet: Pet, changes: Partial<Pet>): void {
    Object.assign(pet, changes);
  }

  /**
   * Check if a care action would be effective
   */
  static isActionEffective(pet: Pet, careType: string, _value?: number): boolean {
    switch (careType) {
      case "feed":
        return pet.satiety < 100;
      case "drink":
        return pet.hydration < 100;
      case "play":
        return pet.happiness < 100 && PetValidator.hasEnoughEnergy(pet, 10);
      case "clean":
        return pet.poopCount > 0;
      case "medicine":
        return !PetValidator.isHealthy(pet);
      case "sleep":
        return !PetValidator.isSleeping(pet) && !PetValidator.isExploring(pet);
      case "wake":
        return PetValidator.isSleeping(pet);
      default:
        return false;
    }
  }
  // ============= TESTING COMPATIBILITY METHODS =============
  // These methods are restored for unit test compatibility only
  // Main game flow uses ActionCoordinator + proposal system

  /**
   * Feed pet (for testing only)
   * @deprecated Use ActionCoordinator.dispatchAction with PetCareAction instead
   */
  static feedPet(pet: Pet, value: number): Result<{ type: string; [key: string]: unknown }> {
    if (pet.health === "sick") {
      return { success: false, error: "Pet is too sick to eat" };
    }
    if (pet.satiety >= 100) {
      return { success: false, error: "Pet is not hungry right now" };
    }

    const ticksToAdd = value * PET_CONSTANTS.STAT_MULTIPLIER.SATIETY;
    pet.satietyTicksLeft += ticksToAdd;
    pet.satiety = GameMath.calculateSatietyDisplay(pet.satietyTicksLeft);
    pet.lastCareTime = Date.now();

    return { success: true, data: { type: "feed", value } };
  }

  /**
   * Give drink to pet (for testing only)
   * @deprecated Use ActionCoordinator.dispatchAction with PetCareAction instead
   */
  static giveDrink(pet: Pet, value: number): Result<{ type: string; [key: string]: unknown }> {
    if (pet.health === "sick") {
      return { success: false, error: "Pet is too sick to drink" };
    }
    if (pet.hydration >= 100) {
      return { success: false, error: "Pet is not dehydrated right now" };
    }

    const ticksToAdd = value * PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION;
    pet.hydrationTicksLeft += ticksToAdd;
    pet.hydration = GameMath.calculateHydrationDisplay(pet.hydrationTicksLeft);
    pet.lastCareTime = Date.now();

    return { success: true, data: { type: "drink", value } };
  }

  /**
   * Play with pet (for testing only)
   * @deprecated Use ActionCoordinator.dispatchAction with PetCareAction instead
   */
  static playWithPet(
    pet: Pet,
    happiness: number,
    energyCost: number = 10
  ): Result<{ type: string; energyCost: number; [key: string]: unknown }> {
    if (pet.health === "sick") {
      return { success: false, error: "Pet is too sick to play" };
    }
    if (pet.happiness >= 100) {
      return { success: false, error: "Pet is already very happy" };
    }
    if (pet.currentEnergy < energyCost) {
      return { success: false, error: "Pet doesn't have enough energy to play" };
    }
    if (PetValidator.isSleeping(pet)) {
      return { success: false, error: "Pet cannot play while sleeping" };
    }

    const ticksToAdd = happiness * PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS;
    pet.happinessTicksLeft += ticksToAdd;
    pet.happiness = GameMath.calculateHappinessDisplay(pet.happinessTicksLeft);
    pet.currentEnergy = Math.max(0, pet.currentEnergy - energyCost);
    pet.lastCareTime = Date.now();

    return { success: true, data: { type: "play", happiness, energyCost } };
  }

  /**
   * Clean pet poop (for testing only)
   * @deprecated Use ActionCoordinator.dispatchAction with PetCareAction instead
   */
  static cleanPoop(pet: Pet): Result<{ type: string; [key: string]: unknown }> {
    if (pet.poopCount === 0) {
      return { success: false, error: "Pet has no poop to clean right now" };
    }

    pet.poopCount = 0;
    pet.poopTicksLeft = Math.floor(Math.random() * 240) + 240;
    pet.sickByPoopTicksLeft = PET_CONSTANTS.SICK_BY_POOP_TICKS;
    pet.lastCareTime = Date.now();

    return { success: true, data: { type: "clean" } };
  }

  /**
   * Treat pet with medicine (for testing only)
   * @deprecated Use ActionCoordinator.dispatchAction with PetCareAction instead
   */
  static treatPet(
    pet: Pet,
    effects: Array<{ type: string; value: number }>
  ): Result<{ type: string; [key: string]: unknown }> {
    if (PetValidator.isHealthy(pet) && pet.currentHealth >= pet.maxHealth) {
      return { success: false, error: "Pet doesn't need this treatment" };
    }

    let treated = false;
    let healthHealed = 0;

    for (const effect of effects) {
      if (effect.type === "cure" && PetValidator.isUnhealthy(pet)) {
        pet.health = "healthy";
        treated = true;
      } else if (effect.type === "health" && pet.currentHealth < pet.maxHealth) {
        const healAmount = Math.min(effect.value, pet.maxHealth - pet.currentHealth);
        pet.currentHealth += healAmount;
        healthHealed += healAmount;
        treated = true;
      } else if (effect.type === "satiety") {
        return { success: false, error: "This medicine cannot treat the pet's condition" };
      }
    }

    if (!treated) {
      return { success: false, error: "This medicine cannot treat the pet's condition" };
    }

    pet.lastCareTime = Date.now();

    return { success: true, data: { type: "medicine", healthHealed } };
  }

  /**
   * Put pet to sleep (for testing only)
   * @deprecated Use ActionCoordinator.dispatchAction with PetCareAction instead
   */
  static putPetToSleep(pet: Pet): Result<{ type: string; [key: string]: unknown }> {
    if (PetValidator.isSleeping(pet)) {
      return { success: false, error: "Pet is already sleeping" };
    }
    if (pet.state === "travelling") {
      return { success: false, error: "Pet cannot sleep while travelling" };
    }
    if (PetValidator.isExploring(pet)) {
      return { success: false, error: "Pet cannot sleep while exploring" };
    }

    pet.state = "sleeping";
    pet.lastCareTime = Date.now();

    return { success: true, data: { type: "sleep" } };
  }

  /**
   * Wake pet up (for testing only)
   * @deprecated Use ActionCoordinator.dispatchAction with PetCareAction instead
   */
  static wakePetUp(pet: Pet): Result<{ type: string; [key: string]: unknown }> {
    if (!PetValidator.isSleeping(pet)) {
      return { success: false, error: "Pet is not sleeping" };
    }

    pet.state = "idle";
    pet.lastCareTime = Date.now();

    return { success: true, data: { type: "wake" } };
  }
}

/**
 * Pet System Proposal Generator for ActionCoordinator integration
 */
export class PetSystemProposalGenerator implements ProposalGenerator {
  generateProposals(_action: unknown, _context: ProposalContext): SystemProposal[] {
    // This method is implemented in ActionCoordinator
    // We keep this class for type compatibility
    return [];
  }

  validateProposal(proposal: SystemProposal, context: ProposalContext): ValidationResult {
    if (!context.activePet) {
      return {
        isValid: false,
        errors: ["No active pet found"],
        warnings: [],
        conflicts: [],
      };
    }

    // Extract care type from proposal description or metadata
    const careType = this.extractCareTypeFromProposal(proposal);
    return PetSystem.validateCareProposal(proposal, context.activePet, careType);
  }

  checkConflicts(
    _proposal: SystemProposal,
    _otherProposals: SystemProposal[],
    _context: ProposalContext
  ): import("@/types/SystemProposal").ProposalConflict[] {
    // Pet care actions rarely conflict with each other
    // Most conflicts would be handled by validation
    return [];
  }

  private extractCareTypeFromProposal(proposal: SystemProposal): string {
    const description = proposal.description.toLowerCase();

    if (description.includes("feed")) return "feed";
    if (description.includes("drink")) return "drink";
    if (description.includes("play")) return "play";
    if (description.includes("clean")) return "clean";
    if (description.includes("medicine") || description.includes("treat")) return "medicine";
    if (description.includes("sleep")) return "sleep";
    if (description.includes("wake")) return "wake";

    return "unknown";
  }
}
