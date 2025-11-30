# Role
Act as a Principal Software Engineer and Code Quality Specialist.

# Task
Conduct a strict code hygiene and refactoring review of the provided codebase. Your primary goal is to reduce technical debt by identifying dead code, test pollution, and redundancy.

# Context
* **Game Type:** Browser-only, Idle Pet Raising simulation with 1v1 turn-based battles.
* **Architecture:** Client-side only (no server).
* **Current State:** The codebase may contain abandoned experiments, legacy logic from previous iterations, or duplicated logic for similar game mechanics.

# Evaluation Criteria
Please analyze the code for the following specific issues:

1.  **Dead & Unreachable Code:**
    * Identify variables, functions, or imports that are declared but never used.
    * Flag "Zombie Logic": Code paths (like specific battle effects or pet stats) that exist in the engine but are never triggered by the current UI or game loop.

2.  **Test-Only Artifacts:**
    * Detect code that appears to exist *solely* for the benefit of tests (e.g., methods like `resetStateForTesting()` or exposed private variables) inside production files.
    * Flag hardcoded mock data (e.g., "Test Pet", "God Mode" stats) that was left in the production source.

3.  **DRY (Don't Repeat Yourself) & Pattern Matching:**
    * **Resource Tickers:** Look for copy-pasted logic in resource accumulation (e.g., `updateGold` and `updateMana` having identical structures). Suggest a generic `updateResource(type)` handler.
    * **Battle Moves:** Look for duplicated logic in battle calculations (e.g., separate functions for "Fire Attack" vs "Water Attack" that only differ by a multiplier). Suggest a data-driven approach.

4.  **Refactoring Opportunities:**
    * Identify complex conditional chains (nested `if/else` or massive `switch` statements) in the main game loop that should be refactored into a Strategy Pattern or lookup table.

# Output Deliverables
Create a file named `REVIEW.md` containing:
1.  **Cruft Inventory:** A list of file names and line numbers containing dead or test-only code to be deleted immediately.
2.  **DRY Candidates:** A table listing repeated logic patterns and a proposed abstraction to replace them.
3.  **Refactoring Showcase:** Select the single "messiest" function in the battle or idle logic and provide a refactored version that is cleaner, DRY-compliant, and free of dead logic.

