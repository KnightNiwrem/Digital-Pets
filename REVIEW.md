# Code Hygiene and Refactoring Review

## Cruft Inventory

The following files and code segments should be removed or cleaned up.

| File | Line(s) | Description | Recommendation |
|------|---------|-------------|----------------|
| `src/APITester.tsx` | 1-79 | API testing component not imported or used anywhere. | Delete file. |
| `src/index.ts` | 8-29 | Placeholder `/api/hello` routes from `bun init` scaffolding. | Remove the `/api/hello` and `/api/hello/:name` routes (keep the routes object structure for future APIs). |
| `src/game/core/care/careStats.ts` | 14 | Re-exporting constants solely for backwards compatibility with tests. | Update `careStats.test.ts` to import from `constants.ts` directly and remove the re-export. |
