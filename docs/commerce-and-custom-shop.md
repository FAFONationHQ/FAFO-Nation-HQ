# Commerce V1 and Custom Shop V1 Specifications

These are provider-neutral implementation proposals. The current repository has no native catalog, cart, checkout, payments, orders, fulfillment, submissions, uploads, or project workflow. Existing Store and Custom Shop pages must remain truthful until each capability is operational.

# Commerce V1

## Recommended shape

Use a guest-first cart so browsing and purchasing do not require a member account. Keep application-owned catalog, cart, order ledger, and fulfillment state. Payment providers handle payment credentials; fulfillment providers receive only the minimum approved order data through adapters.

```text
Published catalog -> server-priced cart -> checkout intent
  -> payment provider confirmation/webhook
  -> application order ledger
  -> fulfillment adapter -> shipment/tracking events
  -> customer and operator status views
```

## Catalog and pricing

- `Product` owns public identity, copy, publication state, and merchandising data.
- `ProductVariant` owns SKU, option values, availability, provider mappings, weight, and price per supported currency.
- `Collection` and placement records control grouping and ordering without duplicating products.
- Product imagery should reference approved assets; source artwork remains outside transactional records.
- Server-side catalog services are the price/availability source of truth. Never accept client-submitted price, discount, tax, shipping, or provider SKU as authoritative.
- Cart lines should store variant IDs and quantity; order lines take an immutable purchase-time snapshot of product, variant, unit price, tax, discount, and fulfillment mapping.

## Add to Loadout and cart

- `Add to Loadout` is the branded add-to-cart action, not a promise that checkout exists before it does.
- Anonymous carts use high-entropy, HTTP-only ownership tokens and expiry; authenticated users may attach or merge carts through a reviewed conflict policy.
- Validate quantity, publication, availability, currency, and price on every server mutation and again when checkout begins.
- Define stock/back-order semantics before exposing availability.

## Checkout and payments

- Create a provider-neutral payment attempt linked to an application order/checkout record.
- Stripe and PayPal, if both approved, are separate adapters with a common result model; do not force provider events into identical raw schemas.
- Use hosted or provider-controlled payment collection where practical. Never store raw card or PayPal credentials.
- Calculate final totals on the server and bind the provider submission to the exact currency and amount.
- Treat browser redirects as user experience only; verified server webhooks establish authoritative payment state.
- Use a clear order state machine, for example `DRAFT -> PENDING_PAYMENT -> PAID -> FULFILLMENT_PENDING -> IN_PRODUCTION -> SHIPPED -> COMPLETED`, with explicit cancelled, failed, partially refunded, and refunded paths.

## Webhooks and recovery

- Verify provider signature, timestamp tolerance, expected environment/account, and payload size before parsing domain data.
- Persist provider + event ID under a unique constraint before applying effects.
- Make handlers idempotent and transactionally record the event and state transition.
- Permit safe retry; record attempt count, last error, next action, and dead-letter/operator state.
- Handle out-of-order events using provider timestamps/version rules and current state invariants.
- Retain only minimized payload data according to an approved policy; redact secrets and payment details from logs.
- Reconciliation jobs should compare unresolved application state with provider state without silently rewriting financial history.

## Fulfillment abstraction

Define a narrow adapter for quote/availability if needed, submit, cancel where supported, retrieve status, and normalize tracking events. Printify and Printful mappings remain provider-specific records attached to variants/orders. The application order ledger—not either provider—is the customer-facing source of truth.

Provider submission requires a paid/approved order, immutable address snapshot, validated variant mapping, idempotency key, and audit record. Failure must place the order in an operator-visible exception state rather than repeatedly creating jobs.

## CAD and USD

Choose whether the catalog has explicit per-currency prices or one settlement currency with displayed conversion. Recommended default: explicit approved prices per sell currency, stored as integer minor units with ISO currency, so checkout never depends on a live client-side exchange rate. Define tax, duties, shipping, rounding, settlement, and refund-currency policy before launch.

## Refunds and cancellations

- Store requests, provider actions, financial events, reasons, actor, and amounts separately.
- Enforce maximum refundable amount and currency on the server.
- Cancellation eligibility depends on payment and fulfillment states; provider inability to cancel must be visible.
- Partial refunds and fulfillment exceptions must not overwrite original order/payment history.
- Administrative refund actions require scoped permission, step-up authentication, and audit.

## Admin visibility

Operators need read-only-first views for order/payment/fulfillment state, mismatch indicators, webhook failures, tracking, and permitted customer contact. Payment actions, resubmission, cancellation, and refunds require narrower permissions and confirmation/audit.

## Commerce owner decisions

- Sell countries, currencies, tax ownership, duties, and shipping policies
- Stripe, PayPal, both, or staged rollout; merchant entities and settlement currencies
- Printify, Printful, both, manual fulfillment, and source-of-truth rules
- Product/variant source and inventory/back-order semantics
- Guest checkout, optional account attachment, cart expiry/merge rules
- returns, refunds, cancellations, damaged/lost shipment, fraud, and chargeback policies
- pricing and promotion approval process
- required receipts, terms, privacy notices, and retention periods

# Custom Shop V1

## Boundary

Custom Shop is a project workflow, not a standard cart. A project may lead to a versioned quote and later a commerce order, but project requirements, private assets, discussion, approval, and production state remain separate from catalog/order records.

## Proposed state machine

```text
DRAFT
  -> SUBMITTED
  -> INTAKE_REVIEW
  -> NEEDS_INFORMATION <-> INTAKE_REVIEW
  -> QUOTING
  -> QUOTE_SENT
  -> QUOTE_ACCEPTED -> PAYMENT_PENDING -> APPROVED_FOR_PRODUCTION
  -> IN_PRODUCTION -> QUALITY_REVIEW -> COMPLETED

Terminal/exception paths:
DECLINED, CUSTOMER_WITHDREW, QUOTE_EXPIRED, CANCELLED, ON_HOLD

Optional publication after completion:
PRIVATE -> GALLERY_CONSENT_PENDING -> APPROVED_FOR_GALLERY -> PUBLISHED -> UNPUBLISHED
```

Every transition should define allowed actor roles, required fields, notifications, audit event, and reversibility. Payment and production transitions must be idempotent and must not be inferred from a client redirect.

## Intake and identity

- Start with authenticated customers unless the owner explicitly accepts guest project identity/recovery risks.
- Capture structured project type, purpose, quantity/range, target date, budget range where approved, requirements, and acknowledgements.
- Do not request sensitive or unnecessary data in free text.
- Assign a public-safe reference separate from database IDs; never expose projects by guessable ID without ownership authorization.

## Quotes, approvals, and revisions

- Quotes are immutable versions with scope, line items, currency, taxes/shipping assumptions, expiry, and terms version.
- Acceptance records user, time, quote version, and terms version.
- Revisions create a new quote or requirements version; they do not rewrite accepted history.
- Design/customer approvals need explicit artifact/version references and acceptance evidence.
- A project status view returns a customer-safe projection, not internal production or operator notes.

## Upload security

- Use private object storage with short-lived signed upload/download operations; never stream untrusted uploads through public static directories.
- Restrict allowed types, actual content signatures, size/count, filenames, and archive handling.
- Quarantine every upload until malware scanning succeeds. Reject or isolate failures and alert operators without exposing scanner details.
- Use randomized object keys and private buckets; strip metadata or generate safe derivatives where required.
- Store asset classification, uploader, scan state, checksum, size/type, created/expiry dates, and access audit.
- Do not render active content or serve user uploads from the application origin without a reviewed isolation policy.

## Retention and publication consent

Define retention for drafts, withdrawn/declined projects, quotes, production assets, customer messages, and completed projects. Gallery publication is a separate explicit consent with approved asset/copy scope, attribution preference, grant/revoke times, and unpublish workflow. Private project acceptance never grants public gallery rights.

## Admin workflow

Modules should provide an intake queue, assignment, requirements/version history, quote creation/approval, asset scan status, transition controls, production exceptions, customer-safe updates, gallery review, and audit trail. Least-privilege roles should separate intake/creative, quoting, production, publishing, and financial actions.

## Custom Shop owner decisions

- account-required versus guest intake
- accepted project categories and prohibited content
- required information, response-time claims, and quoting policy
- supported file types/sizes/count, storage region, scan vendor, and retention
- intellectual-property warranties and content moderation
- deposits/full payment, expiry, revisions, cancellation, and refund policy
- customer communication channel and record retention
- gallery consent, attribution, revocation, and reuse terms
