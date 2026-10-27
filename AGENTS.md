# Repository instructions

- This is a reusable Expo SDK 58 foundation, imported from Obytes PR #543 at commit 43783db5f9ef237cd350f4a6e3535dfffa1454eb.
- Use the Bun version in package.json and the Node version in .nvmrc. Commit bun.lock. Install with bun install --frozen-lockfile.
- Keep the base free of product-specific API contracts, business rules, branding, account IDs and credentials.
- App identity lives in foundation.config.json. Public runtime values live in env.ts. Build-only account settings belong in app.config.ts.
- Never add secrets to EXPO_PUBLIC variables or log authentication credentials.
- Native projects are generated and ignored. Fix app.config.ts, dependencies or config plugins rather than patching generated ios/ or android/ files.
- Follow src/features for features, src/app for thin routes, src/components/ui for common UI and src/lib for shared infrastructure.
- React Native uses the strict TypeScript API. Use instance types for native refs; do not opt out of strict API checking.
- Run bun run check-all, bun run check:dependencies and bun run doctor after changes. Use bun run test, not bun test (which runs a different runner).
- For changes to dependencies, native config or release tooling, run bun run verify:android and bun run verify:ios. Record actual outcomes in docs/validation.md.
- Verification archives are unsigned / use verification keys. Do not describe them as signed store submissions.
- The local template generator must reject nonempty destinations and omit credentials, native projects, caches and Git history. Run bun run test:tooling when changing it.
