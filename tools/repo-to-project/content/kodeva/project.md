# Kodeva

## Technical Overview

`Kodeva` is an end-to-end B2B software commerce storefront and empirical decision-science platform engineered for Indonesian enterprise workflows (covering Point of Sale, HR & Payroll, and modular subscription add-ons). Beyond serving as a high-performance commercial storefront, Kodeva was developed as a production research vehicle to audit black-box AI decision models (specifically **TypeSafe AI's JEV** engine) in real-world lead scoring scenarios.

Built with Next.js 16 App Router and an **embedded Payload CMS 3** runtime over serverless pooled PostgreSQL (Neon), the architecture eliminates API boundaries by co-locating the content management system and storefront within a single Node.js runtime. The platform incorporates an internal **Decision Lab** (`/admin/decision-lab`) that empirically evaluates model calibration, Expected Calibration Error (ECE), and post-hoc Platt scaling across thousands of synthetic data distributions.

## Architecture & Systems Flow

```
[ Inbound Lead / Storefront Funnel ] (/api/leads)
                   │
                   ▼
     [ Feature Extractor ] (UTM source, contact channel, time-to-fill, landing path)
                   │
                   ▼
    [ JevClient Interface ]
    ├── MockJevClient (Positive control: injected decile biases & noise σ)
    └── RealJevClient (TypeSafe AI api.typesafe.ai — noul p + choice margin)
                   │
                   ▼
    [ Decision Calibration Engine ] (src/lib/jev/)
    ├── Expected Calibration Error (ECE vs Ground-Truth pTrue)
    ├── Brier Loss Score
    └── Post-Hoc Platt Scaler: pPlatt = σ(a · logit(p) + b)
                   │
                   ▼
     [ Advisory Sales Pipeline ] (/admin/leads)
    ├── Corrected 'Potensi Konversi' (pPlatt ?? p, rounded to 2dp)
    ├── Qualitative Triage Tiers (🔴 High / 🟡 Medium / 🟢 Low)
    └── Immutable Audit Log (latencyMs, raw model response, decision tokens)
```

## Key Architectural Innovations

1. **Embedded Payload 3 in Next.js 16:** Next.js App Router and Payload CMS operate in the same execution context. Storefront routes query collections through Payload's in-process **Local API**, executing direct database queries with zero HTTP round-trip overhead. Content freshness is maintained via a 2-layer caching strategy: on-demand tag revalidation (`revalidateTag`) purged on admin publish events, paired with a time-based ISR fallback.
2. **Deterministic Ground-Truth Generator (`generator.ts`):** To audit black-box decision models without self-fulfilling bias, the research harness uses a seeded Mulberry32 PRNG to generate 1,570 unique synthetic enterprise inquiries across three macroeconomic worlds:
   - **Baseline:** Standard marketing distribution (18.1% true conversion rate).
   - **Drift-Source:** Covariate shift toward cold acquisition channels (20.4% true conversion rate).
   - **Drift-Price:** Macroeconomic price shock (6.5% true conversion rate).
   The generator maintains the secret ground-truth conversion probabilities (`pTrue`) and binary outcomes, keeping them completely hidden from the AI scoring engine.
3. **Mock-First Positive Control (`MockJevClient`):** Before spending API credits on external providers, the harness verifies its own statistical machinery against a synthetic client where known miscalibrations are deliberately injected. This proved the testing harness could reliably detect bias before evaluating live models.
4. **Empirical JEV Black-Box Audit Findings:**
   - **Raw Miscalibration:** JEV's raw scores clustered tightly around `~0.42` across all distributions, completely blind to macroeconomic drift. In the price-drift scenario (where true conversion fell to 6.5%), JEV still predicted 41.8% (~6.4× overconfident, ECE 0.352).
   - **Platt Scaling Convergence:** Applying a 2-parameter logistic calibration ($a=1.406, b=-1.261$) reduced ECE from 0.267 to `< 0.02`. Learning curves proved that calibration fully saturates at just **$n \approx 50$ labeled outcomes**.
   - **Confidence Margin Validity:** The secondary decision margin metric showed a strong negative rank correlation ($\rho = -0.43 \text{ to } -0.55$) with prediction error, establishing it as a reliable uncalibrated proxy for model uncertainty.
5. **Production Advisory-Only Gate:** Because statistical confidence collapses at the distribution tails, raw AI scores are strictly prohibited from driving automated workflows. Inbound leads are decorated with calibrated conversion potentials and priority tiers for human sales triage.
6. **Zero Cumulative Layout Shift (CLS):** Public storefront pages maintain a verified mobile Lighthouse score of **CLS = 0.000**, with Best Practices (100), SEO (100), and Performance (>90) via deterministic server-rendering and CSS token budgeting.
