# Domain Model

This document describes the core entities, relationships, business rules, and tenant boundaries of the Field Service ERP.

The application supports multiple service companies using the same platform while keeping each company's data isolated.

## 1. Core Entities

### Tenant
Represents a company using the Field Service ERP. Each tenant has its own customers, jobs, invoices, payments, and users.

### User
Represents an individual account in the system. A user can belong to one or more tenants through memberships.

### Membership
Connects a user to a tenant and defines their role.

Supported roles:
- `owner`: Manages the company, users, customers, jobs, invoices, and payments.
- `technician`: Handles assigned jobs, adds work notes, uploads job photos, and updates job progress.

### Invitation
Stores invitations sent by a tenant owner to new users.

### Customer
Stores customer information, including name, phone number, email, and structured address:
- Street
- City
- State
- ZIP code

### Job
Represents a service task requested by a customer. A job belongs to a customer and can be assigned to a technician.

### JobPhoto
Stores references to photographs uploaded as evidence of work performed on a job. The actual image files will be stored in object storage, not PostgreSQL.

### Invoice
Represents the amount a customer owes for completed work. An invoice belongs to a customer and may be associated with a completed job.

### InvoiceLineItem
Represents an individual charge on an invoice, such as labour, materials, or additional services.

### Payment
Records payments received against invoices.

### StripeEvent
Stores processed Stripe webhook event IDs to prevent duplicate event processing.

### OutboxEvent
Stores business events created by database transactions for reliable background processing through BullMQ workers.

## 2. Entity Relationship Diagram

```mermaid
erDiagram
    TENANT ||--o{ MEMBERSHIP : has
    USER ||--o{ MEMBERSHIP : joins
    TENANT ||--o{ INVITATION : sends
    TENANT ||--o{ CUSTOMER : owns
    TENANT ||--o{ JOB : owns
    TENANT ||--o{ INVOICE : owns
    TENANT ||--o{ PAYMENT : owns
    TENANT ||--o{ STRIPE_EVENT : records
    TENANT ||--o{ OUTBOX_EVENT : creates

    CUSTOMER ||--o{ JOB : requests
    CUSTOMER ||--o{ INVOICE : receives
    JOB ||--o{ JOB_PHOTO : contains
    JOB ||--o| INVOICE : generates
    INVOICE ||--|{ INVOICE_LINE_ITEM : contains
    INVOICE ||--o{ PAYMENT : receives

    MEMBERSHIP o|--o{ JOB : assigned_to
    USER ||--o{ INVITATION : invited_by

    TENANT {
        uuid id PK
        string name
        datetime created_at
        datetime updated_at
    }

    USER {
        uuid id PK
        string name
        string email UK
        datetime created_at
        datetime updated_at
    }

    MEMBERSHIP {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        string role
        datetime created_at
        datetime updated_at
    }

    INVITATION {
        uuid id PK
        uuid tenant_id FK
        string email
        string role
        uuid invited_by_user_id FK
        datetime expires_at
        datetime created_at
        datetime updated_at
    }

    CUSTOMER {
        uuid id PK
        uuid tenant_id FK
        string name
        string phone
        string email
        string street
        string city
        string state
        string zip
        datetime created_at
        datetime updated_at
    }

    JOB {
        uuid id PK
        uuid tenant_id FK
        uuid customer_id FK
        uuid assigned_membership_id FK
        string description
        string priority
        string status
        datetime scheduled_at
        datetime created_at
        datetime updated_at
    }

    JOB_PHOTO {
        uuid id PK
        uuid tenant_id FK
        uuid job_id FK
        string storage_key
        string file_name
        datetime created_at
        datetime updated_at
    }

    INVOICE {
        uuid id PK
        uuid tenant_id FK
        uuid customer_id FK
        uuid job_id FK
        string status
        bigint subtotal_cents
        int tax_rate_bps
        bigint tax_cents
        bigint total_cents
        datetime created_at
        datetime updated_at
    }

    INVOICE_LINE_ITEM {
        uuid id PK
        uuid tenant_id FK
        uuid invoice_id FK
        string description
        int quantity
        bigint unit_price_cents
        bigint amount_cents
        datetime created_at
        datetime updated_at
    }

    PAYMENT {
        uuid id PK
        uuid tenant_id FK
        uuid invoice_id FK
        bigint amount_cents
        string currency
        string stripe_payment_intent_id
        datetime created_at
        datetime updated_at
    }

    STRIPE_EVENT {
        uuid id PK
        uuid tenant_id FK
        string stripe_event_id UK
        string event_type
        datetime processed_at
        datetime created_at
        datetime updated_at
    }

    OUTBOX_EVENT {
        uuid id PK
        uuid tenant_id FK
        string event_type
        string payload
        datetime processed_at
        datetime created_at
        datetime updated_at
    }
```

## 3. Job State Machine

Jobs move through defined stages during the service process.

### Available statuses

- `scheduled`
- `in_progress`
- `completed`
- `cancelled`

### Job transitions

```mermaid
stateDiagram-v2
    [*] --> scheduled

    scheduled --> in_progress: Start job
    scheduled --> cancelled: Cancel job

    in_progress --> completed: Complete job
    in_progress --> cancelled: Cancel job

    completed --> [*]
    cancelled --> [*]
```

### Who can trigger each transition?

| Transition | Authorized person |
|---|---|
| Create → Scheduled | Owner |
| Scheduled → In Progress | Assigned Technician or Owner |
| In Progress → Completed | Assigned Technician or Owner |
| Scheduled → Cancelled | Owner |
| In Progress → Cancelled | Owner |

A completed or cancelled job cannot be reopened through the normal workflow.

A technician can only update jobs assigned to their membership.

## 4. Invoice State Machine

Invoices have their own lifecycle, separate from jobs.

### Available statuses

- `draft`
- `sent`
- `paid`
- `void`

### Invoice transitions

```mermaid
stateDiagram-v2
    [*] --> draft

    draft --> sent: Send invoice
    draft --> void: Void invoice

    sent --> paid: Successful payment confirmation
    sent --> void: Void invoice

    paid --> [*]
    void --> [*]
```

### Who can trigger each transition?

| Transition | Authorized person |
|---|---|
| Create → Draft | Owner |
| Draft → Sent | Owner |
| Draft → Void | Owner |
| Sent → Paid | Verified Stripe webhook |
| Sent → Void | Owner |

A successful Stripe payment webhook is responsible for confirming payment and changing the invoice status to `paid`.

A paid or void invoice cannot be reopened through the normal workflow.

## 5. Multi-Tenancy and Data Isolation

The system uses a multi-tenant architecture.

Each company is represented by a `Tenant` record. Tenant-owned records must include a `tenant_id` to identify the company that owns them.

### Tenant-owned entities

- Membership
- Invitation
- Customer
- Job
- JobPhoto
- Invoice
- InvoiceLineItem
- Payment
- StripeEvent
- OutboxEvent

The `User` entity represents a global account and is connected to companies through `Membership`.

### Isolation rules

1. Every tenant-owned record must belong to a valid tenant.
2. Users can only access tenant data through an active membership.
3. Owners can manage data belonging to their tenant.
4. Technicians can only access jobs assigned to their membership and the information required to perform those jobs.
5. Database queries must be scoped to the authenticated tenant.
6. PostgreSQL Row-Level Security (RLS) will provide an additional layer of tenant isolation.
7. Composite foreign keys and database constraints should prevent records from being connected across different tenants.

The application database role must use `NOBYPASSRLS` so normal application connections cannot bypass row-level security.

## 6. Important Business Rules

- Every job belongs to one customer.
- A job may be assigned to one technician.
- Job photos belong to a specific job.
- An invoice belongs to one customer and may be linked to one job.
- An invoice contains one or more line items.
- An invoice can receive multiple payment records.
- Stripe webhook events must be processed idempotently.
- Business events must be written to the outbox within the same database transaction as the operation that creates them.
- Background workers process outbox events asynchronously.

## 7. Money and Calculation Reference

All monetary values are stored as integer cents. Floating-point numbers must not be used for financial calculations.

Tax rates are stored as basis points, and labour time is stored as integer minutes.

The detailed calculation and rounding rules are documented in `DECISIONS.md`.

## 8. Implementation Status

This document defines the intended domain model for the Field Service ERP.

The entities and relationships will be implemented in PostgreSQL through Prisma migrations. Tenant isolation will be enforced through application-level authorization, database constraints, and PostgreSQL Row-Level Security.