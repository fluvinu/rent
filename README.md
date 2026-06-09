Certainly! Below is a `README.md` file that combines all the REST API endpoints for managing orders, vehicles, and customers, with proper descriptions :

---

# API Documentation

This API allows you to manage orders, vehicles, and customers, segmented per tenant using MongoDB.

## Authentication

All endpoints (except `/auth/**`) require a valid JWT passed in the `Authorization` header as a Bearer token.

### Register Tenant
- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Body:**
  ```json
  {
    "username": "tenant1",
    "password": "password123",
    "tenantName": "tenant_1_db"
  }
  ```
- **Description:** Registers a new tenant and provisions access to the specified tenant database (e.g., `tenant_1_db`). If `tenantName` is not provided, one will be generated based on the username.

### Login Tenant
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Body:**
  ```json
  {
    "username": "tenant1",
    "password": "password123"
  }
  ```
- **Description:** Authenticates a tenant and returns a JWT token. This token should be included in the `Authorization` header (`Bearer <token>`) for all subsequent requests to access the specific tenant's data.

## Base URL

All API endpoints are prefixed with the base URL:  
`[https://rent-0xm8.onrender.com]`
## getApi examplrs
https://rent-0xm8.onrender.com/ord/
https://rent-0xm8.onrender.com/veh

## Endpoints

### Orders

1. **Test Endpoint**
   - **Method:** `GET`
   - **Endpoint:** `/ord/hi`
   - **Description:** Test if the orders service is up.

2. **Get All Orders**
   - **Method:** `GET`
   - **Endpoint:** `/ord/`
   - **Description:** Retrieve a list of all orders.

3. **Get Specific Order**
   - **Method:** `GET`
   - **Endpoint:** `/ord/{id}`
   - **Description:** Retrieve details of a specific order by its ID.

4. **Create Order (Take Vehicle)**
   - **Method:** `POST`
   - **Endpoint:** `/ord/{vehicleId}/{customerId}`
   - **Description:** Create a new order by specifying the vehicle ID and customer ID.

5. **Update Order (Submit Vehicle)**
   - **Method:** `PUT`
   - **Endpoint:** `/ord/{id}`
   - **Description:** Update an existing order by its ID.

6. **Delete Order**
   - **Method:** `DELETE`
   - **Endpoint:** `/ord/{id}`
   - **Description:** Delete an order by its ID.

### Vehicles

1. **Test Endpoint**
   - **Method:** `GET`
   - **Endpoint:** `/veh/hi`
   - **Description:** Test if the vehicles service is up.

2. **Get All Vehicles**
   - **Method:** `GET`
   - **Endpoint:** `/veh/`
   - **Description:** Retrieve a list of all vehicles.

3. **Get One Vehicle**
   - **Method:** `GET`
   - **Endpoint:** `/veh/{id}`
   - **Description:** Retrieve details of a specific vehicle by its ID.

4. **Create Vehicle**
   - **Method:** `POST`
   - **Endpoint:** `/veh/`
   - **Description:** Create a new vehicle record.

5. **Update Vehicle**
   - **Method:** `PUT`
   - **Endpoint:** `/veh/{id}`
   - **Description:** Update an existing vehicle by its ID.

6. **Delete Vehicle**
   - **Method:** `DELETE`
   - **Endpoint:** `/veh/{id}`
   - **Description:** Delete a vehicle by its ID.

### Customers

1. **Test Endpoint**
   - **Method:** `GET`
   - **Endpoint:** `/cus/hi`
   - **Description:** Test if the customers service is up.

2. **Get All Customers**
   - **Method:** `GET`
   - **Endpoint:** `/cus/`
   - **Description:** Retrieve a list of all customers.

3. **Get One Customer by ID**
   - **Method:** `GET`
   - **Endpoint:** `/cus/{id}`
   - **Description:** Retrieve details of a specific customer by their ID.

4. **Create Customer**
   - **Method:** `POST`
   - **Endpoint:** `/cus/`
   - **Description:** Create a new customer record.

5. **Update Customer**
   - **Method:** `PUT`
   - **Endpoint:** `/cus/{id}`
   - **Description:** Update an existing customer by their ID.

6. **Delete Customer**
   - **Method:** `DELETE`
   - **Endpoint:** `/cus/{id}`
   - **Description:** Delete a customer by their ID.

---

Replace `{id}`, `{vehicleId}`, and `{customerId}` with the actual identifiers when making requests. 
This documentation provides an overview of the available API endpoints for interacting with the order, vehicle, and customer resources.
