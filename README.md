# Backend API Documentation (Low-Code Architecture)

Welcome to the documentation for our Backend API! This guide is specifically written for Frontend Engineers to understand how our backend works.

## 🚀 What is a "Low-Code" Backend?

In standard applications, you might be used to having specific API URLs for different data, like:
- `GET /veh` for Vehicles
- `GET /cus` for Customers
- `GET /ord` for Orders

**Our backend is different: it is a "Low-Code" or "Metadata-Driven" platform.**
This means there are no hardcoded URLs for Vehicles, Customers, or Orders. Instead, the backend provides a completely dynamic way to build your own database tables (which we call **Entity Types**) and add data to them (which we call **Entity Records**).

You tell the backend what a "Vehicle" looks like, and then you can add "Vehicle" data!

### The Two Main Steps
1. **Define the Schema (`EntityType`)**: Tell the backend the name of the object (e.g., "Vehicle") and what fields it has (e.g., "license_plate", "price").
2. **Manage Data (`EntityRecord`)**: Use the dynamic `EntityType ID` to create, read, update, or delete actual data (e.g., adding a specific Toyota car).

---

## Base URL & Authentication

All API endpoints start with:
- **Local:** `http://localhost:8080` (Run with `cd backend && mvn spring-boot:run`)
- **Production:** `https://rent-0xm8.onrender.com`

**Multi-Tenancy**: The application gives each company (tenant) its own database. You must log in first to get a token, and use that token to access the APIs.

### 1. Register a Tenant
- **Method:** `POST /auth/register`
- **Body:**
  ```json
  {
    "username": "mycompany",
    "password": "password123"
  }
  ```

### 2. Login
- **Method:** `POST /auth/login`
- **Body:**
  ```json
  {
    "username": "mycompany",
    "password": "password123"
  }
  ```
- **Response:** You will receive a JWT `token`.
- **Important:** Add this to the header of all future requests:
  `Authorization: Bearer <your_token>`

---

## 🏗️ Step 1: Creating Entity Types (Schemas)

Before you can add a Vehicle or Customer, you must tell the backend what they are by creating an `EntityType`.

### Create "Vehicle" Entity Type
- **Method:** `POST /api/entity-types`
- **Body:**
  ```json
  {
    "name": "Vehicle",
    "description": "Information about our cars",
    "fields": [
      { "key": "vName", "name": "Vehicle Name", "type": "TEXT" },
      { "key": "vPrice", "name": "Price", "type": "NUMBER" },
      { "key": "available", "name": "Is Available?", "type": "BOOLEAN" }
    ]
  }
  ```
- **Response:** You will get back an object containing an `"id"` (e.g., `64b5f9a...`). **Save this ID!** You will need it to add records.

### Create "Customer" Entity Type
- **Method:** `POST /api/entity-types`
- **Body:**
  ```json
  {
    "name": "Customer",
    "description": "Our renters",
    "fields": [
      { "key": "cName", "name": "Customer Name", "type": "TEXT" },
      { "key": "mobileNo", "name": "Mobile Number", "type": "TEXT" }
    ]
  }
  ```

### Create "Order" Entity Type
- **Method:** `POST /api/entity-types`
- **Body:**
  ```json
  {
    "name": "Order",
    "description": "Rental orders",
    "fields": [
      { "key": "vehicleId", "name": "Vehicle ID", "type": "TEXT" },
      { "key": "customerId", "name": "Customer ID", "type": "TEXT" },
      { "key": "total", "name": "Total Price", "type": "NUMBER" }
    ]
  }
  ```

### Get All Entity Types
- **Method:** `GET /api/entity-types`
- **Description:** Use this to see all the schemas you have created and find their IDs.

---

## 📝 Step 2: Creating Entity Records (Data)

Now that the backend knows what a "Vehicle" is (and you have its EntityType ID), you can add actual vehicles.

### Add a Vehicle (Create Record)
- **Method:** `POST /api/records/entity/{vehicle_entity_type_id}`
- **Body:**
  ```json
  {
    "data": {
      "vName": "Toyota Camry",
      "vPrice": 50,
      "available": true
    }
  }
  ```

### Get All Vehicles (Read Records)
- **Method:** `GET /api/records/entity/{vehicle_entity_type_id}`
- **Response:** Returns an array of records. Each record will have its own `"id"` which you use to update or delete it.

### Update a Vehicle (Update Record)
- **Method:** `PUT /api/records/{record_id}`
- **Body:**
  ```json
  {
    "data": {
      "vName": "Toyota Camry",
      "vPrice": 50,
      "available": false
    }
  }
  ```

### Delete a Vehicle (Delete Record)
- **Method:** `DELETE /api/records/{record_id}`

---

## 🚀 Example Frontend Workflow

If you are building the frontend to replace the old `/veh`, `/cus`, `/ord` system, you will do this:

1. Look up the `EntityType ID` for Vehicles (e.g., `id-veh-123`).
2. When the user submits the "Add Vehicle" form, send a `POST` request to `/api/records/entity/id-veh-123` with the form data.
3. When you want to list vehicles in a table, send a `GET` request to `/api/records/entity/id-veh-123` and display the data.

### Need Advanced Queries?
You can search, filter, and sort your data using the Query API!
- **Method:** `POST /api/records/entity/{entity_type_id}/query`
- **Body Example (Find available vehicles):**
  ```json
  {
    "filter": {
      "field": "available",
      "op": "EQUALS",
      "value": true
    }
  }
  ```

## Other Advanced Features
The backend also supports setting up UI Views (`/api/views`), Workflows (`/api/workflows`), and Permissions (`/api/permissions`) to fully customize how data acts in the system. Use the same concepts: Create the configuration with a `POST`, and reference the EntityType ID!
