# Rent - Dynamic Metadata Platform

This project is a dynamic metadata-driven web application composed of a **Spring Boot** backend and a **Next.js** frontend. It allows users (tenants) to define custom entity schemas (Entity Types) on the fly and create records corresponding to those schemas.

## 1. Architecture and Core Concepts

The platform is designed around the following core concepts:

- **Multi-Tenancy:** Each user registers as a `Tenant`. Data is logically segregated per tenant (tenant isolation is enforced at the data level). Tenants receive a JWT upon login which is used to authenticate subsequent requests.
- **Dynamic Entity Types:** Instead of fixed database tables, the system allows defining `EntityType` objects. An `EntityType` acts as a schema, detailing the fields (name, type, required status, options, relations) a record can have. Supported field types include `TEXT`, `NUMBER`, `BOOLEAN`, `DATE`, `SELECT`, `MULTI_SELECT`, `RELATION`, `FILE`, and `JSON`.
- **Entity Records:** The actual data entries are stored as `EntityRecord` objects. These contain a schemaless JSON payload (stored as a map in MongoDB) bound to a specific `entityTypeId`.
- **Query DSL:** The application features a rich query domain-specific language (DSL) defined by `QueryRequest`. It supports advanced filtering (AND/OR trees), sorting, pagination, and relation expansion.

The backend uses **Spring Boot** and **MongoDB** for flexible schema-less data storage, making it ideal for dynamic metadata. The frontend is built with **Next.js 14+** (App Router) and uses React Server Components and Client Components to deliver a highly dynamic portal.

---

## 2. Backend APIs

base url = https://rent-0xm8.onrender.com

The backend exposes several REST APIs under `/api` and `/auth`.

### Authentication (`/auth`)
- `POST /auth/register`: Registers a new tenant. Expects `{ "username": "...", "password": "..." }`.
- `POST /auth/login`: Authenticates a tenant and returns a JWT token. Expects `{ "username": "...", "password": "..." }`.

### Entity Types (`/api/entity-types`)
- `GET /api/entity-types`: Lists all entity types for the current tenant.
- `POST /api/entity-types`: Creates a new entity type. Expects a JSON body with `name`, `description`, and a list of `fields` (each having `name`, `type`, `required`, etc.).
- `GET /api/entity-types/{id}`: Retrieves a specific entity type.
- `PUT /api/entity-types/{id}`: Updates an entity type.
- `DELETE /api/entity-types/{id}`: Deletes an entity type.
- `POST /api/entity-types/{id}/fields`: Adds a field definition to an existing entity type.
- `DELETE /api/entity-types/{id}/fields/{fieldKey}`: Removes a field definition.

### Entity Records (`/api/records`)
- `GET /api/records/entity/{entityTypeId}`: Lists all records belonging to a specific entity type.
- `POST /api/records/entity/{entityTypeId}`: Creates a new record. Expects `{ "data": { ... } }` matching the fields defined in the entity type.
- `POST /api/records/entity/{entityTypeId}/query`: Executes a complex query using the Query DSL. Accepts a JSON payload containing `filter`, `sort`, `expand`, and `page` parameters.
- `GET /api/records/{id}`: Retrieves a specific record by ID.
- `PUT /api/records/{id}`: Updates a specific record.
- `DELETE /api/records/{id}`: Deletes a specific record.

### Other APIs
The backend also features endpoints for managing Permissions, Workflows, and Views:
- **Permissions (`/api/permissions`)**: CRUD operations for `Permission` entities to manage role-based access control.
- **Workflows (`/api/workflows`)**: CRUD operations for `Workflow` entities to define automated states/transitions for records.
- **Views (`/api/views`)**: CRUD operations for saved user interface `View` configurations.

---

## 3. Frontend Functionality and Portal Integration

The frontend is a React application built with Next.js that interacts with the backend APIs to render the dynamic platform.

### Authentication & Login Flow
- Users landing on the root page (`/`) will be presented with a **Login/Register screen** if they do not have a valid JWT token in their `localStorage`.
- Upon submitting the form, the frontend calls `/auth/login` or `/auth/register`. A successful response yields a JWT token, which is stored in `localStorage`.
- The user is then authenticated, and the main "Metadata Platform" portal is displayed.

### Dynamic Entity Type Creation (`/entity/create`)
- From the portal, users can navigate to the **Create Entity Type** page.
- This view provides a dynamic form to name the Entity Type and dynamically add/remove **Fields**.
- For each field, the user can select its data type (`TEXT`, `NUMBER`, `BOOLEAN`, `DATE`, `SELECT`, `MULTI_SELECT`, `RELATION`, etc.) and specify whether it is required.
- If the type is `SELECT` or `MULTI_SELECT`, they can provide comma-separated options.
- Upon submission, the frontend transforms this configuration into a JSON payload and posts it to `/api/entity-types`.

### Dynamic Record Rendering (`/entity/[entityId]`)
- Once an entity type is created, it appears as a card on the main dashboard (`/`).
- Clicking the card routes the user to the dynamic entity page `/[entityId]`.
- This page dynamically pulls both the **EntityType definition** and the **EntityRecords**.
- **Data Table Representation:**
  - The table headers are generated dynamically by reading the `fields` array from the `EntityType` definition.
  - The rows correspond to the actual `EntityRecord` items, pulling data out of the schemaless `data` JSON blob.
- **Dynamic Data Entry:**
  - Clicking "+ New Record" opens a form generated dynamically from the EntityType's fields.
  - The UI uses conditional rendering to display the correct HTML input element: `type="checkbox"` for `BOOLEAN`, `<select>` for `SELECT`/`MULTI_SELECT`, `type="date"` for `DATE`, and standard inputs for `TEXT` and `NUMBER`.
  - When the form is saved, the input values are bundled into a `data` object and sent to `POST /api/records/entity/{entityTypeId}`.

This architecture enables a fully customizable platform where users are not constrained by fixed UI elements or static database columns. Both the UI and backend dynamically adapt to the user-defined schema in real-time.
