# Firestore Security Specification - Fallon Project

## Data Invariants
1. A patient can have multiple appointments and transactions.
2. An appointment must always reference a valid patient ID.
3. A transaction must either be an income or an expense.
4. Users must be authenticated to read or write any data (for now, assuming a clinic-staff only model).

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **The ID Poison** - Create a patient with a 2MB string as ID.
2. **Identity Spoof** - Authenticated User A tries to update a patient document they don't "own" (if we had multiple clinics).
3. **Ghost Field** - Adding `isAdmin: true` to a patient document.
4. **State Shortcut** - Changing an appointment status directly from `scheduled` to `finished` by bypassing a clinical note required state.
5. **PII Leak** - Unauthenticated user trying to list all patients.
6. **Immutable Break** - Trying to change a patient's `code` after creation.
7. **Negative Money** - Creating a transaction with a negative amount (if not handled).
8. **Orphaned Appointment** - Creating an appointment for a patient ID that doesn't exist.
9. **Timestamp Cheat** - Sending a client-side `updatedAt` instead of `serverTimestamp()`.
10. **Type Mismatch** - Sending a string for the `amount` field in transactions.
11. **Huge Array** - Sending 10,000 alergies in one patient document to hit document size limits.
12. **Blanket Query** - Trying to read all documents without a valid clinic association (if multi-tenant).

## Final Rules Logic
- Rules are strictly gated by authentication.
- Field-level validation on all writes.
- Immortality for critical fields like `code` and `id`.
- Terminal state locking for finished appointments (cannot change after finished).
