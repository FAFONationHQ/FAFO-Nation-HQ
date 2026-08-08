# Testing Toolchain Recommendation

Date: 2026-08-08  
Status: approved tool subset installed and verified during Shift #4

## Current evidence

Vitest 4.1.10, Playwright 1.62.1, and `@axe-core/playwright` 4.12.1 are installed. The current result is 43 passing unit/integration tests and 62 passing Chromium tests, including all public routes, credential-free auth behavior, baseline headers, primary navigation, and eight representative axe scans. Testing Library/jsdom were deliberately not added because current forms and routes are covered adequately by domain tests and browser tests. An isolated database and live auth sandbox remain unavailable.

## Original minimum proposal and current disposition

| Package | Exact purpose | Compatibility/impact |
| --- | --- | --- |
| `vitest` | Unit tests for domain/service code and integration tests for repository/route-handler logic | Vite-based TypeScript runner; confirm the selected version supports Node 24 and the repository’s TypeScript 5.9. Adds one runner plus transitive Vite tooling. Start in Node environment; do not add a DOM until needed. |
| `@testing-library/react` and `@testing-library/user-event` | User-observable React 19 component behavior, especially auth/privacy forms and navigation | Requires a DOM environment such as `jsdom`. Use sparingly for component behavior that browser E2E does not cover efficiently. |
| `jsdom` | DOM environment for Testing Library component tests | Development-only but comparatively large; stage it with the first interactive member form, not pure-domain tests. |
| `@playwright/test` | Browser E2E for Chromium first; protected/public routing, privacy publish/revoke, error paths, responsive/focus behavior | Next lists Playwright as an optional peer but it is not installed. CI must download/cache browser binaries and run the built app on an ephemeral port. Add Firefox/WebKit only after Chromium is stable or a specific compatibility need exists. |
| `@axe-core/playwright` | Automated accessibility rules against rendered E2E pages and states | Small integration layer on top of Playwright/axe-core. It complements, not replaces, keyboard, screen-reader, contrast, and visual review. |

## Staged adoption order

1. **Vitest in Node mode:** migrate the current assertion groups into ordinary test files and add coverage for the first member/privacy services. Keep the existing dependency-free script until parity is demonstrated.
2. **Playwright Chromium smoke suite:** home, Header destinations, intentional blocked-route behavior, FAFO World load/failure fallback, and future auth redirect boundaries. Start the production build in CI and collect traces/screenshots only on failure.
3. **Axe in Playwright:** scan representative route templates and every new interactive member/auth flow; maintain explicit documented exceptions rather than blanket disables.
4. **Testing Library + jsdom:** add only when interactive member/profile components exist and need fast state/validation tests below the browser layer.
5. **Integration database harness:** when Prisma schema/migrations are approved, use a disposable isolated test PostgreSQL database. Never point tests or previews at production.

## CI effect

- Unit/integration jobs should run before the production build and remain parallelizable.
- Playwright needs browser caching, a built server, reserved ephemeral port, failure artifacts, and an execution timeout. It will be the largest initial CI download and runtime increase.
- Accessibility runs inside the E2E job initially; split only if suite volume justifies it.
- No test should require live auth, payment, fulfillment, email, or production services. Provider integrations need fakes/contracts locally and separately controlled sandbox E2E only after approval.

## Completed approval outcome

The pure-domain and browser/accessibility packages were adopted with exact versions. Testing Library/jsdom remain deferred until evidence supports a component-test layer. The all-browser matrix remains Chromium-first, and live provider/database tests must use controlled non-production environments.
