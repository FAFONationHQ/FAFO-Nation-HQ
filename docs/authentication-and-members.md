# Authentication and Member System V1 Decision Package

This is a proposed architecture only. Accounts, registration, sessions, and member profiles are not implemented.

## Architecture categories

### Managed identity

A managed provider can own credential storage, verification, recovery, session issuance, OAuth connections, and future MFA. Application records retain the provider subject identifier and FAFO-specific profile/privacy data. This reduces security-sensitive code and operational burden, but introduces vendor cost, portability constraints, and provider-specific behavior.

### Self-managed identity

A self-managed library and database can provide greater control and portability. FAFO Nation would then own credential security, verification tokens, recovery, session invalidation, OAuth configuration, abuse controls, security updates, and incident response. This is justified only if requirements cannot be met by a managed approach and the operational ownership is explicit.

### Recommended default

Prefer a managed, standards-based identity boundary unless owner requirements establish a reason to self-manage credentials. Keep FAFO profile, consent, role, and public-presence data in the application database so identity vendors remain replaceable. No vendor commitment is made here.

## Session and authorization model

- Use secure, HTTP-only, same-site cookies for browser sessions; do not store bearer tokens in browser storage.
- Resolve the authenticated identity on the server and authorize every protected operation there.
- Treat UI hiding as convenience, never authorization.
- Start with least-privilege roles such as `MEMBER`, `CONTENT_EDITOR`, `SUPPORT_OPERATOR`, `COMMERCE_OPERATOR`, and `ADMIN`; avoid a mutable free-form role string as the enforcement boundary.
- Keep high-risk functions separated. A content editor should not gain refunds, role management, or private member-data access.
- Record privileged actions in immutable audit events with actor, action, target, outcome, time, and request correlation data.

## Sign-up and recovery flow

1. User submits an approved email-based or OAuth identity method.
2. Apply rate limits, bot/abuse controls, normalized identifiers, and non-enumerating responses.
3. Verify email ownership before enabling community publishing or sensitive changes.
4. Create a private account record and default-deny privacy settings in one controlled server workflow.
5. Establish a session and route to a minimal dashboard.
6. Recovery invalidates or rotates relevant sessions and tokens; responses must not reveal whether an account exists.

If email/password is approved, require modern provider/library password hashing, breached-password protections where available, verification, secure reset tokens, and password-change session invalidation. OAuth account linking must require proof of control and defend against account-confusion attacks.

## Member data boundaries

### Authentication identity

- provider subject/account connection
- verified email state
- session and recovery state
- MFA state when introduced

### Private account data

- legal/customer identifiers when actually required
- email and phone
- operational preferences
- consent history
- account status and deletion request

### Public profile

- callsign or approved display name
- optional avatar and biography
- optional public recognition
- optional coarse location only
- explicit publication state

### Community metadata

- preferences and participation settings
- moderation state
- achievements/recognition provenance
- optional deployment date if the owner defines its meaning

These boundaries should be separate records or DTOs. Private identity and contact data must never be serialized into public profile or map responses.

## Callsigns and public profiles

- Callsigns require normalization, uniqueness policy, reserved words, impersonation handling, and moderation.
- A public profile is opt-in and unpublished by default.
- Location sharing is an independent, revocable consent—not implied by profile creation or purchase.
- City/region display should use approved coarse coordinates, never a shipping or street address.
- Public recognition needs source/provenance and owner policy for removal or correction.

## Account dashboard V1

The first dashboard should be intentionally narrow:

- account/security state
- callsign/display-name settings
- communication and community preferences
- public-profile preview and explicit publish/unpublish control
- FAFO World visibility consent and coarse location review
- audio preference only if it becomes account-synced; otherwise retain local browser behavior
- data export/deletion request entry points

Order and Custom Shop modules should appear only after their own authorized implementations exist.

## Security and abuse baseline

- server-side authorization on every object and action
- CSRF protection appropriate to the chosen session/framework pattern
- login, recovery, verification, callsign, and publishing rate limits
- session rotation, expiration, revocation, device/session visibility, and security-event notification policy
- safe redirect allowlists and OAuth state/PKCE where applicable
- escaped rendering and content limits for all profile fields
- audit and alerting for role changes, repeated failures, recovery, and public-data changes
- staged moderation, reporting, suspension, appeal, and evidence-retention policies
- account deletion that distinguishes deletable profile data from legally retained transaction/audit records

## MFA future-readiness

Choose an identity architecture that can add passkeys or standards-based MFA without changing application identity keys. Require step-up authentication for role management and other high-risk administrative actions before those modules launch.

## OWNER DECISIONS REQUIRED

1. Managed identity or self-managed credentials?
2. Which first-release methods: email link/code, email/password, and/or specific OAuth providers?
3. Is verified email mandatory before any member-facing capability?
4. What MFA or step-up standard is required for operators and administrators?
5. Which roles exist at V1, and who can grant or revoke them?
6. What callsign rules, moderation process, and rename limits apply?
7. Is every public profile and map appearance explicit opt-in by default? Recommended: yes.
8. What coarse location granularity may be published?
9. What deletion, export, retention, suspension, and appeal policies apply?
10. What age eligibility and consent requirements apply to accounts and community features?
