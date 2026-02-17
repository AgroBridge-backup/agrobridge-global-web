# Premium Plan Weeks 1-3 (Single Source of Truth)

## Scope and objective

This document is the only planning artifact for Weeks 1-3.
Goal: build a premium B2B brand and conversion foundation for AgroBridge Global with clear governance and low implementation risk.

Planned sequence:

- Week 1: Brand strategy and message system.
- Week 2: Visual direction decision.
- Week 3: Conversion architecture and system handoff.

Execution calendar (UTC-6, MX):

- Week 1: February 16-22, 2026.
- Week 2: February 23-March 1, 2026.
- Week 3: March 2-8, 2026.

## Operating principles

1. Claims without evidence are not published.
2. Conversion clarity is prioritized over decorative design choices.
3. One decision log, one scorecard, one owner per gate.
4. Every section must support executive meeting conversion.

## Week 1 (Brand strategy and message architecture)

### Brand narrative baseline

AgroBridge Global is positioned as a risk-reduction export partner for international buyers through:

- Lot-level verification.
- Compliance-ready documentation.
- Supply continuity planning.

### Audience architecture

1. Importer:
- Focus: consistency, rejection risk, execution continuity.
- Primary CTA: executive supply review.

2. Premium retail:
- Focus: shelf trust, compliance exposure, brand protection.
- Primary CTA: qualification package.

3. Distributor:
- Focus: throughput, documentation speed, multi-destination operations.
- Primary CTA: onboarding call.

### Tone and claims policy

Allowed claim style:

- verified, documented, auditable, program-ready.

Forbidden claim style:

- absolute guarantees, unverifiable technical hype, unsupported market leadership.

Claim classes:

1. Allowed: no special legal review.
2. Conditional: requires legal + evidence review.
3. Forbidden: blocked.

Week 1 exit gate:

- Narrative + audience matrix + claims policy approved.

## Week 2 (Visual direction)

### Visual routes evaluated

1. Route A: Editorial Luxury.
2. Route B: Institutional Tech.
3. Route C: Agro-Heritage Modern.

### Weighted scorecard

Criteria and weights:

- B2B trust clarity: 25%
- Compliance readability: 20%
- Conversion readiness: 20%
- Visual differentiation: 15%
- Content scalability: 10%
- Production feasibility: 10%

Scores:

- Route A: 3.25
- Route B: 4.60
- Route C: 3.85

### Week 2 proposed direction

Proposed route: **Route B (Institutional Tech)**.

Reason:

- Highest score in trust clarity, compliance readability, and conversion readiness.
- Best fit for procurement/commercial stakeholders.
- Most scalable for market and product landing rollout.

Mitigation:

- Blend selected Route C photography cues to avoid an overly cold interface.

Week 2 exit gate:

- Route selected in gate review with rationale and risk mitigation owners.

## Week 3 (Conversion architecture + implementation handoff)

### Home block order (mandatory)

1. Trust proof.
2. Operational capability.
3. Market and product routing.
4. Case evidence.
5. Executive contact.

### Landing templates

Markets:

- US, EU, MEA, Asia.

Products:

- Avocado, Berries.

### Contact qualification model

Required fields:

- Company, role, market, product, volume band, target start date.

Routing:

- High-intent leads to executive callback flow.
- Lower-intent leads to qualification sequence.

### Event taxonomy

- `view_trust_block`
- `view_capability_block`
- `click_market_selector`
- `click_product_selector`
- `click_primary_cta`
- `submit_contact_success`
- `meeting_booked`

Week 3 exit gate:

- Conversion blueprint + landing templates + tracking taxonomy approved.

## Implementation assets

Token baseline for Week 3 implementation:

- `public_html/assets/premium-tokens-v1.css`

## Decision log (inline)

| Date | Decision | Status | Owner |
|---|---|---|---|
| 2026-02-14 | Plan consolidated as single source of truth | Approved | Program owner |
| 2026-02-22 | Week 1 strategy gate | Planned | Brand + Sales + Legal |
| 2026-03-01 | Week 2 route selection gate (Route B proposed) | Planned | Brand + Sales + Design + Legal |
| 2026-03-08 | Week 3 architecture and tracking gate | Planned | Program owner + Frontend |

## Next execution step

Apply Week 3 blueprint to production files in controlled order:

1. Align hero and trust sections in `public_html/index.html`.
2. Adopt semantic tokens from `public_html/assets/premium-tokens-v1.css` in `public_html/assets/main.css`.
3. Add market/product routing modules and executive-contact qualification updates.
