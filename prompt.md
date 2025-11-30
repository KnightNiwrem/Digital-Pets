# Role
Act as a Principal Frontend Architect specializing in browser-based game development.

# Task
Conduct a comprehensive architectural review of the provided codebase. The specific focus is the separation of **Presentation UI** from **Core Game Logic**.

# Context
* **Game Type:** Browser-only, Idle Pet Raising simulation with 1v1 turn-based battles.
* **Constraints:** There is no server-side logic and no physics engine.
* **Goal:** Treat the client-side logic as a "Virtual Backend." The simulation (math, timers, turn resolution) must operate independently of the DOM/View layer.

# Evaluation Criteria
Please analyze the code for these specific anti-patterns:
1.  **Logic-View Coupling:** Are damage calculations or resource generation logic embedded directly inside event handlers (e.g., inside an `onClick` or `render` loop)?
2.  **Idle Timer Precision:** Is resource accumulation tied to the frame rate (requestAnimationFrame) instead of delta-time (Date.now comparisons)?
3.  **Battle State integrity:** Is the turn logic (Player Phase -> Enemy Phase -> Resolution) clearly defined in a state machine, or is it scattered across UI timeout functions?
4.  **Data Persistence:** Is the save/load logic (localStorage) distinct from the game components?

# Output Deliverables
Create a file named `REVIEW.md` containing:
1.  **Architecture Score:** Rate the separation of concerns on a scale of 1-10.
2.  **Critical Refactoring Targets:** Identify specific files or functions where the "Pet" data model is polluted by UI concerns (e.g., a Pet object storing a DOM ID).
3.  **Refactoring Plan:** A strategy to move the game rules into a "Headless" engine that could theoretically run in a web worker or CLI.
4.  **Code Example:** Provide a "Before vs. After" snippet specifically for a **Battle Action** or **Resource Tick**, showing how to separate the math/state update from the resulting visual feedback/animation.

