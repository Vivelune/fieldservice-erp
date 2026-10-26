# Field Service ERP

> Multi-tenant ERP slice for HVAC and plumbing businesses. Onboard a company, schedule a technician, complete a job with photos, invoice with line items, collect payment — with AI-assisted extraction from handwritten work orders.

[![CI](https://github.com/OWNER/fieldservice-erp/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/fieldservice-erp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## What this is

A **vertical ERP** — an operating system for one industry's daily business. Not a generic CRM. Every screen is shaped around how a field-service business actually works: customer → job → dispatch → completion → invoice → payment.

It is **not** a full ERP. It is a **3-week, production-shaped slice** of one complete workflow, built to be defended in a code review. Payroll, inventory, scheduling optimization, and compliance modules are deliberately out of scope — the point is to prove domain depth on the slice that matters most, not to boil the ocean.

The AI feature ("extract line items from a photo of a handwritten work order") is **instrumented by a sibling observability platform**. That integration is part of the deliverable.

---

## Why this stack (and why no Kafka)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components for dense data views; one deploy target |
| Language | TypeScript (strict) | Non-negotiable for money and domain logic |
| Database | **Neon Postgres** | Serverless, branching per PR for preview envs |
| ORM | **Prisma 7** + `@prisma/adapter-pg` | Type-safe schema, migrations, native Neon support |
| Auth | **Better Auth** (`better-auth` on npm) | Self-hosted, session-based, no vendor lock-in |
| Multi-tenancy | **Postgres RLS + `tenant_id`** | DB-enforced isolation, not app-layer filtering |
| Async jobs | **BullMQ + Redis** | Invoice PDFs, emails, webhook fan-out |
| Outbox | **`outbox_events` table + BullMQ** | Reliable event dispatch without Kafka |
| Payments | **Stripe** (test mode) | Checkout Sessions + idempotent webhooks |
| File storage | **Cloudflare R2 / S3** | Job photos, invoice PDFs — never in Postgres |
| UI | Tailwind + shadcn/ui + TanStack Table | Dense data entry, keyboard nav |
| Testing | Vitest + Playwright | Money math + tenant isolation + one E2E |

### The Kafka decision — read before proposing Kafka

**This project does not use Kafka. This is deliberate.**

1. The ERP's async work is **job-shaped**, not **stream-shaped**: "generate this invoice," "send this email," "sync this payment." BullMQ is built exactly for this.
2. Kafka requires operating a broker/cluster — real operational tax with no MVP benefit.
3. The moat is **domain workflows**, not infrastructure. Every hour on Kafka is an hour not spent on job costing, dispatch logic, or invoice correctness.
4. Reliability is achieved with the **transactional outbox pattern**: every state-changing action writes to `outbox_events` in the same transaction as the domain change; a BullMQ worker drains the outbox and fans out. Same guarantee, no broker.

**When to revisit:** when there are 3+ independent consumer services (analytics + integrations + audit + search) and single-queue throughput is exceeded. That is a month 9–18 decision.

If someone proposes Kafka before then, they must write a note in `docs/DECISIONS.md` addressing the above.

---

## Domain model

```mermaid
erDiagram
    TENANT ||--o{ USER : "has"
    TENANT ||--o{ CUSTOMER : "has"
    TENANT ||--o{ JOB : "has"
    TENANT ||--o{ INVOICE : "has"
    CUSTOMER ||--o{ JOB : "requests"
    CUSTOMER ||--o{ INVOICE : "billed"
    JOB ||--o{ JOB_PHOTO : "has"
    JOB ||--|| INVOICE : "generates"
    INVOICE ||--o{ LINE_ITEM : "contains"
    INVOICE ||--o{ PAYMENT : "settled by"
    USER ||--o{ JOB : "assigned to"
