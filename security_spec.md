# Security Specification - DenteCloud

## Data Invariants
1. A patient must always belong to a clinic (`clinicId`).
2. An appointment must reference a valid patient and dentist within the same clinic.
3. Access to any record (patient, appointment, transaction) is strictly limited to users who belong to the same `clinicId`.
4. Users cannot change their own `role` or `clinicId` after creation (only admins can, but for now we'll keep it simple).
5. Only `admin` or `finance` roles can see financial transactions.

## The "Dirty Dozen" Payloads

1. **Identity Theft (Patients)**: Attempting to create a patient with a different `clinicId` than the user's assigned clinic.
2. **Unauthorized Read**: A user from Clinic A trying to read a patient from Clinic B.
3. **Role Escalation**: A `receptionist` attempting to update their own role to `admin`.
4. **PII Leak**: A non-authenticated user attempting to list patients.
5. **Financial Peeking**: A `receptionist` attempting to list transactions.
6. **Orphaned Appointment**: Creating an appointment for a patient ID that doesn't exist.
7. **Malicious Transaction Override**: Updating a 'paid' transaction to 'pending' as a non-finance user.
8. **Clinic Hijacking**: Attempting to update the `ownerId` of a clinic document.
9. **Spam Records**: Creating a patient with a name size > 500 characters.
10. **Future Poisoning**: Setting a `lastVisit` date in the future (relative to request.time).
11. **Cross-Clinic Appointment**: Creating an appointment in Clinic A for a patient in Clinic B.
12. **System Field Tampering**: Modifying `createdAt` during an update.

## Test Runner (Draft Logic)
- Verify `allow read: if isSignedIn() && getUserClinic() == resource.data.clinicId`
- Verify `allow list: if isSignedIn() && resource.data.clinicId == getUserClinic()`
- Verify `allow write: if isClinicAdmin() || (isClinicMember() && isValidSchema())`
