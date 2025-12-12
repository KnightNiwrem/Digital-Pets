## 2025-05-22 - Mobile Safe Areas
**Learning:** The codebase uses `safe-area-inset-bottom` as a utility class, but it wasn't defined in Tailwind or CSS. This causes navigation bars to be obstructed on newer iPhones.
**Action:** Always verify that mobile-specific utility classes (like safe area insets) are actually defined in `index.css` or Tailwind config.
