# Dependency Security Triage

Date: 2026-08-08  
Status: read-only investigation; no dependency or lockfile changes

## Result

`npm audit` reports **9 high, 0 critical, 0 moderate, 0 low** vulnerability entries. The count remains the same as the prior shift, but the advisory set is current as of this audit. `npm ls --all` completed and confirmed the installed tree. No `npm audit fix`, install, update, or lockfile mutation was run.

| Package/family | Relationship | Current exposure in this repository | Reported fix path |
| --- | --- | --- | --- |
| `next@16.2.9` | Direct runtime dependency | The application runs Next App Router. Several advisories concern features not currently present (middleware/proxy, Server Actions, custom-server rewrites); image optimization is used for local images and the framework itself remains directly reachable. Treat as the highest-priority remediation. | Audit proposes `next@16.3.0`, outside the exact pinned version and therefore requiring owner approval and full regression verification. |
| `sharp@0.34.5` | Transitive runtime dependency of Next | Used by Next image optimization on supported deployments. The audit reports inherited libvips issues. Current image inputs are repository-owned, which reduces attacker-controlled input exposure but does not remove the framework endpoint from review. | Resolved through the proposed Next update according to audit. |
| `postcss` | Transitive build/runtime tooling through Next and Tailwind | Findings require malicious CSS or source-map input. All current CSS is repository-owned; no user CSS/upload pipeline exists. Primarily build-tool exposure today. | Audit indicates ordinary transitive fixes and/or the proposed Next update. |
| `prisma@6.19.2`, `@prisma/config`, `effect@3.18.4` | Direct development CLI plus transitive config/runtime library | Prisma generation runs during verification. No application query imports, database connection, migration, seed, or production data path exists. The Effect advisory concerns concurrent RPC/AsyncLocalStorage behavior, not the current generate-only use. | Audit proposes `prisma@6.19.3`; exact pins require an approved coordinated Prisma CLI/client patch. |
| `brace-expansion` | Transitive lint/type tooling | Denial-of-service patterns require hostile glob/brace input. Repository scripts use fixed local patterns. Development/CI exposure only. | Audit reports a non-forced transitive fix available. |
| `js-yaml` | Transitive ESLint configuration tooling | Hostile YAML is not accepted from users. Development/CI exposure only. | Audit reports a non-forced transitive fix available. |
| `nanoid` | Transitive PostCSS tooling | Advisories affect invalid custom size arguments; the application does not call this package. Build-tool exposure only. | Audit reports a non-forced transitive fix available. |

## Reachability judgment

The numerical “high” rating should not be dismissed, but it is not equivalent to nine independently reachable production exploits. The current site is statically generated, has no Server Actions, auth, uploads, payment handlers, database calls, custom server, or request-controlled CSS. That materially reduces several advisory paths. The direct Next finding and its Sharp/PostCSS dependency chain still warrant prompt controlled remediation before deployment or dynamic work.

## Recommended remediation package for approval

1. Approve a dedicated dependency-only branch/checkpoint.
2. Update Next and `eslint-config-next` together from 16.2.9 to the first patched stable release confirmed by the advisory (audit currently proposes 16.3.0).
3. Update `prisma` and `@prisma/client` together from 6.19.2 to the audited patched line (audit currently proposes 6.19.3).
4. Regenerate the lockfile through the normal package manager; do not use a blind `npm audit fix --force`.
5. Resolve remaining transitive `brace-expansion`, `js-yaml`, `nanoid`, and PostCSS entries through their owning direct packages rather than lockfile overrides unless a reviewed override is necessary.
6. Run Prisma generation, lint, route checks, all domain invariants, type-check, production build, and targeted smoke/browser tests. Inspect Next 16.3 and Prisma patch release notes before acceptance.
7. Re-run `npm audit` and document any residual advisories with feature reachability.

This package requires owner approval because dependency upgrades were expressly excluded from Day Shift #3.
