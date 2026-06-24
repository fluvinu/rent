# Gap Analysis for Extending the Dynamic Metadata Platform

To evolve the current dynamic metadata platform into a robust foundation capable of supporting comprehensive enterprise applications like Human Resource Management (HRM), School Management, Hotel Management, or Restaurant Management, several critical gaps must be addressed.

The current system excels at providing dynamic schemas, generic CRUD APIs, and simple workflows (update field, create record). However, complex systems require far more nuance in business logic, data integrity, security, and presentation.

## 1. Advanced Business Logic (The Immediate Priority)

**Gap:**
Currently, workflows only support basic actions (`UPDATE_FIELD`, `CREATE_RECORD`, `LOG`). Real-world systems require complex side effects:
* **HRM:** When a leave request is approved, calculate the new leave balance, send an email to the employee, and ping a slack channel.
* **Hotel Management:** When a booking is confirmed, charge the credit card via Stripe, and generate a PDF invoice.
* **School Management:** If a student fails a core class, automatically enroll them in a remediation program, which might involve complex prerequisite logic.

**Solution:**
We must extend the `WorkflowEngine` to support:
* **Webhooks:** Allow actions to fire HTTP requests to external services (e.g., Zapier, payment gateways, custom microservices).
* **Custom Scripting (Serverless Functions):** Allow execution of custom JavaScript/Python snippets securely in the backend. This lets users write small pieces of custom logic (e.g., `record.leave_balance -= record.requested_days;`) without altering the core Java application.
* **Scheduled Jobs (Cron):** Allow workflows to be triggered by time, not just by record creation/update (e.g., daily check for overdue invoices).

## 2. Complex Relationships and Data Integrity

**Gap:**
The current `RELATION` field allows linking records, but lacks depth.
* **Cascading Deletes:** In an HRM, if an Employee is deleted, their Payslips should either be deleted or anonymized. Currently, there is no declarative cascade behavior.
* **Master-Detail (Sub-records):** An Invoice has many InvoiceLineItems. The UI needs to allow creating both in a single transaction (a grid view inside the form).
* **Uniqueness Constraints:** Ensure an employee ID or a Hotel Room Number is unique within the tenant.

**Solution:**
* Introduce `CascadeType` to the `FieldDef` for relations.
* Enhance the `EntityRecordService` to handle nested creation payloads (transactional master-detail creation).
* Add unique index support at the database level tied to the `EntityType` definition.

## 3. Fine-Grained Security and Row-Level Permissions

**Gap:**
The `PermissionService` likely handles object-level permissions (e.g., "User can Read Employee records").
* **Row-level:** An employee should only see *their own* payslips, not everyone's.
* **State-based:** A leave request can only be edited if its status is `PENDING`. Once `APPROVED`, it becomes read-only.

**Solution:**
* Implement Row-Level Security (RLS) policies using the Query DSL. A policy could dictate: `record.userId == currentUser.id`.
* Allow workflows to modify record-level ownership or permissions dynamically.

## 4. Audit Logging and Versioning

**Gap:**
Enterprise systems require strict auditability. If a hotel booking price changes, we need to know *who* changed it, *when*, and what the *previous value* was.

**Solution:**
* Implement an `AuditLog` collection.
* Hook into `EntityRecordService` to automatically record a diff of the `data` map on every update/delete.

## 5. Advanced UI Components (Frontend)

**Gap:**
The dynamic rendering handles standard inputs nicely, but complex systems need more specific UI components.
* **Kanban Boards:** For tracking applicant states in an ATS (HRM).
* **Calendars/Gantt Charts:** For hotel room availability or employee scheduling.
* **Custom Actions UI:** Buttons on the record view to trigger specific workflows manually (e.g., "Approve Booking" button).

**Solution:**
* Introduce "View Configurations" beyond the basic table. Allow defining how an EntityType is visualized (Table, Kanban, Calendar).
* Add "Action Buttons" to the UI that explicitly trigger server-side workflows.

---

## Action Plan

To immediately start addressing **Gap 1 (Advanced Business Logic)**, we will update the backend `WorkflowEngine` in Java to support two new Action types:
1. `WEBHOOK`
2. `SCRIPT`

This will immensely expand the capabilities of the platform right now, allowing it to integrate with external systems and run arbitrary business logic.