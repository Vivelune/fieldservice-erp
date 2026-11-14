# Architecture Decisions

## 1. Money and Financial Calculations

### Decision

All monetary values in the Field Service ERP will be stored and calculated using integer cents. Floating-point numbers must never be used for financial calculations.

### Monetary Storage

- All monetary amounts will use `Int` or `BigInt` in the database, depending on the expected value range.
- For example, $125.50 will be stored as 12550 cents.
- Invoice totals, payments, labour charges, material costs, and tax amounts will be represented as integer cents.
- AI-generated financial values must also be validated and converted into integer cents before being accepted.
- JSON payloads must use integer monetary values, not floating-point amounts.

### Tax Calculation

Tax rates will be stored as basis points.

For example:
- 500 = 5%
- 825 = 8.25%
- 1000 = 10%

Tax amounts will be calculated using integer arithmetic.

**Rounding rule:** Tax will be calculated on the invoice subtotal and rounded half up once at the invoice level to the nearest cent.

### Labour Calculation

Labour time will be stored as integer minutes rather than fractional hours.

For example:
- 30 minutes = 30
- 60 minutes = 60
- 90 minutes = 90

Labour charges will be calculated using:

`Labour cost = (Total minutes × Hourly rate in cents) / 60`

The calculation will use exact integer or rational arithmetic, with half-up rounding to the nearest cent when producing the stored labour charge.

### Example Invoice

Assume:
- Labour time: 120 minutes
- Hourly rate: $50.00
- Materials: $25.00
- Tax rate: 8.25%

Calculation:

- Labour: 10000 cents ($100.00)
- Materials: 2500 cents ($25.00)
- Subtotal: 12500 cents ($125.00)
- Tax: 1031 cents ($10.31)
- Total: 13531 cents ($135.31)

### Reason for This Decision

Floating-point calculations can introduce precision errors when handling money.

Using integer cents provides predictable calculations, consistent invoice totals, and reliable payment processing.

## 2. Multi-Tenancy

Every tenant-owned database record must include a `tenant_id`.

Tenant isolation will be enforced through application authorization, database constraints, and PostgreSQL Row-Level Security (RLS).

## 3. Background Processing

BullMQ with Redis will handle asynchronous tasks such as invoice PDF generation and email notifications.

Business events will be written to an outbox table within the same database transaction as the operation that creates them.

## 4. Payment Processing

Stripe Checkout Sessions will handle payment collection.

Stripe webhook events must be processed idempotently using a unique Stripe event ID to prevent duplicate payment processing.