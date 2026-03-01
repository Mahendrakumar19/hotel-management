# API Documentation

## Complete API Reference for Hotel Management System

Base URL: `http://localhost:5000/api` (development)

### Authentication

All endpoints except `/auth/login` and `/auth/register` require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. User Login
- **Endpoint:** `POST /auth/login`
- **Public:** Yes
- **Request Body:**
  ```json
  {
    "email": "admin@hotel.com",
    "password": "admin@123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@hotel.com",
      "role": "admin"
    }
  }
  ```

### 2. User Registration
- **Endpoint:** `POST /auth/register`
- **Public:** Yes
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@hotel.com",
    "password": "password123",
    "role": "front_desk"
  }
  ```
- **Response:** User object with message

### 3. Get Profile
- **Endpoint:** `GET /auth/profile`
- **Auth Required:** Yes
- **Response:** User profile object

### 4. Update Password
- **Endpoint:** `POST /auth/update-password`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "oldPassword": "old@123",
    "newPassword": "new@123"
  }
  ```
- **Response:** Success message

---

## Room Management

### 1. Get All Rooms
- **Endpoint:** `GET /rooms`
- **Auth Required:** Yes
- **Query Parameters:**
  - `status` (optional): 'vacant', 'occupied', 'dirty'
- **Response:** Array of room objects

### 2. Get Room by ID
- **Endpoint:** `GET /rooms/:id`
- **Auth Required:** Yes
- **Response:** Single room object

### 3. Get Room Statistics
- **Endpoint:** `GET /rooms/statistics`
- **Auth Required:** Yes
- **Response:**
  ```json
  {
    "total_rooms": 20,
    "occupied_rooms": 8,
    "dirty_rooms": 2,
    "vacant_rooms": 10,
    "occupancy_rate": 40.00
  }
  ```

### 4. Get Available Rooms
- **Endpoint:** `GET /rooms/available`
- **Auth Required:** Yes
- **Query Parameters:**
  - `checkInDate` (required): YYYY-MM-DD
  - `checkOutDate` (required): YYYY-MM-DD
  - `capacity` (optional): number of guests
- **Response:** Array of available rooms

### 5. Update Room Status
- **Endpoint:** `PATCH /rooms/:id/status`
- **Auth Required:** Yes
- **Role Required:** admin, front_desk
- **Request Body:**
  ```json
  {
    "status": "occupied"
  }
  ```
- **Valid Statuses:** vacant, occupied, dirty
- **Response:** Updated room object

---

## Reservations

### 1. Create Reservation
- **Endpoint:** `POST /reservations`
- **Auth Required:** Yes
- **Role Required:** front_desk, admin
- **Request Body:**
  ```json
  {
    "guestId": "uuid",
    "roomId": "uuid",
    "checkInDate": "2024-12-20",
    "checkOutDate": "2024-12-22",
    "numberOfGuests": 2,
    "advancePayment": 1000,
    "notes": "Early check-in requested"
  }
  ```
- **Response:** Reservation object

### 2. Get Reservation by ID
- **Endpoint:** `GET /reservations/:id`
- **Auth Required:** Yes
- **Response:** Reservation with guest and room details

### 3. Get Reservation by Number
- **Endpoint:** `GET /reservations/by-number/:number`
- **Auth Required:** Yes
- **Response:** Reservation object

### 4. Search Reservations
- **Endpoint:** `GET /reservations/search`
- **Auth Required:** Yes
- **Query Parameters:**
  - `query` (required): Min 2 characters, searches guest name or reservation number
- **Response:** Array of matching reservations

### 5. Get Upcoming Reservations
- **Endpoint:** `GET /reservations/upcoming`
- **Auth Required:** Yes
- **Query Parameters:**
  - `days` (optional): Default 7
- **Response:** Array of upcoming reservations

### 6. Update Reservation Status
- **Endpoint:** `PATCH /reservations/:id/status`
- **Auth Required:** Yes
- **Role Required:** front_desk, admin
- **Request Body:**
  ```json
  {
    "status": "confirmed"
  }
  ```
- **Valid Statuses:** pending, confirmed, checked_in, checked_out, cancelled
- **Response:** Updated reservation

### 7. Cancel Reservation
- **Endpoint:** `DELETE /reservations/:id/cancel`
- **Auth Required:** Yes
- **Role Required:** front_desk, admin
- **Response:** Cancellation confirmation

---

## Guest Management

### 1. Create Guest
- **Endpoint:** `POST /guests`
- **Auth Required:** Yes
- **Role Required:** front_desk, admin
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+91-9876543210",
    "email": "john@example.com",
    "idType": "passport",
    "idNumber": "AB123456",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  }
  ```
- **Response:** Guest object

### 2. Get Guest by ID
- **Endpoint:** `GET /guests/:id`
- **Auth Required:** Yes
- **Response:** Guest object

### 3. Search Guests
- **Endpoint:** `GET /guests/search`
- **Auth Required:** Yes
- **Query Parameters:**
  - `query`: Search by name, phone, email, or ID number
- **Response:** Array of matching guests

### 4. Get Guest History
- **Endpoint:** `GET /guests/:id/history`
- **Auth Required:** Yes
- **Response:** Guest stay history

### 5. Update Guest
- **Endpoint:** `PATCH /guests/:id`
- **Auth Required:** Yes
- **Role Required:** front_desk, admin
- **Request Body:** Any guest fields to update
- **Response:** Updated guest object

### 6. Get Frequent Guests
- **Endpoint:** `GET /guests/frequent`
- **Auth Required:** Yes
- **Query Parameters:**
  - `limit` (optional): Default 10
- **Response:** Top spending/frequent guests

---

## Check-In/Check-Out

### 1. Check-In Guest
- **Endpoint:** `POST /check-ins`
- **Auth Required:** Yes
- **Role Required:** front_desk, admin
- **Request Body:**
  ```json
  {
    "reservationId": "uuid",
    "roomId": "uuid",
    "guestId": "uuid",
    "notes": "Special requests"
  }
  ```
- **Response:** Check-in record

### 2. Check-Out Guest
- **Endpoint:** `POST /check-ins/checkout`
- **Auth Required:** Yes
- **Role Required:** front_desk, admin
- **Request Body:**
  ```json
  {
    "checkInId": "uuid"
  }
  ```
- **Response:** Check-out confirmation

### 3. Get Active Check-Ins
- **Endpoint:** `GET /check-ins/active`
- **Auth Required:** Yes
- **Response:** Array of currently checked-in guests

### 4. Get Check-In by ID
- **Endpoint:** `GET /check-ins/:id`
- **Auth Required:** Yes
- **Response:** Check-in details with guest and room info

### 5. Get Check-In Summary
- **Endpoint:** `GET /check-ins/:checkInId/summary`
- **Auth Required:** Yes
- **Response:**
  ```json
  {
    "guest": {...},
    "room": {...},
    "total_charges": 5000,
    "total_payments": 0,
    "current_balance": 5000
  }
  ```

### 6. Get Guest Ledger
- **Endpoint:** `GET /check-ins/:checkInId/ledger`
- **Auth Required:** Yes
- **Response:** Array of ledger entries (charges, payments, adjustments)

### 7. Add Ledger Entry
- **Endpoint:** `POST /check-ins/ledger/entry`
- **Auth Required:** Yes
- **Role Required:** front_desk, admin
- **Request Body:**
  ```json
  {
    "checkInId": "uuid",
    "guestId": "uuid",
    "roomId": "uuid",
    "entryType": "f_and_b",
    "description": "Restaurant charge",
    "amount": 500
  }
  ```
- **Entry Types:** room_charge, f_and_b, adjustment, payment
- **Response:** Ledger entry with updated balance

---

## Billing

### 1. Create Bill
- **Endpoint:** `POST /bills`
- **Auth Required:** Yes
- **Role Required:** f_and_b, admin
- **Request Body:**
  ```json
  {
    "guestId": "uuid",
    "roomId": "uuid",
    "settlementMode": "cash",
    "items": [
      {
        "itemName": "Coffee",
        "quantity": 2,
        "rate": 150
      }
    ]
  }
  ```
- **Settlement Modes:** cash, card, upi, room_charge
- **Response:** Bill object

### 2. Get Bill by ID
- **Endpoint:** `GET /bills/:id`
- **Auth Required:** Yes
- **Response:** Bill with all items

### 3. Get Open Bills
- **Endpoint:** `GET /bills/open`
- **Auth Required:** Yes
- **Query Parameters:**
  - `guestId` (optional): Filter by guest
- **Response:** Array of unsettled bills

### 4. Get Guest Bills
- **Endpoint:** `GET /bills/guest/:guestId`
- **Auth Required:** Yes
- **Response:** All bills for a guest

### 5. Settle Bill
- **Endpoint:** `POST /bills/settle`
- **Auth Required:** Yes
- **Role Required:** f_and_b, admin
- **Request Body:**
  ```json
  {
    "billId": "uuid"
  }
  ```
- **Response:** Settlement confirmation

### 6. Add Item to Bill
- **Endpoint:** `POST /bills/:billId/item`
- **Auth Required:** Yes
- **Role Required:** f_and_b, admin
- **Request Body:**
  ```json
  {
    "itemName": "Dinner",
    "quantity": 1,
    "rate": 800
  }
  ```
- **Response:** Updated bill total

### 7. Get Daily Billing Report
- **Endpoint:** `GET /bills/report/daily`
- **Auth Required:** Yes
- **Query Parameters:**
  - `date` (required): YYYY-MM-DD
- **Response:**
  ```json
  {
    "total_revenue": 25000,
    "total_bills": 15,
    "cash_revenue": 10000,
    "card_revenue": 12000,
    "upi_revenue": 3000
  }
  ```

---

## Reports

### 1. Get Daily Report
- **Endpoint:** `GET /reports/daily`
- **Auth Required:** Yes
- **Role Required:** admin, front_desk
- **Query Parameters:**
  - `date` (required): YYYY-MM-DD
- **Response:** Daily statistics

### 2. Get Monthly Report
- **Endpoint:** `GET /reports/monthly`
- **Auth Required:** Yes
- **Role Required:** admin, front_desk
- **Query Parameters:**
  - `year` (required): 2024
  - `month` (required): 1-12
- **Response:** Daily breakdown with totals

### 3. Get Occupancy Report
- **Endpoint:** `GET /reports/occupancy`
- **Auth Required:** Yes
- **Role Required:** admin, front_desk
- **Query Parameters:**
  - `startDate`: YYYY-MM-DD
  - `endDate`: YYYY-MM-DD
- **Response:** Occupancy trends

### 4. Get Revenue Report
- **Endpoint:** `GET /reports/revenue`
- **Auth Required:** Yes
- **Role Required:** admin, front_desk
- **Query Parameters:**
  - `startDate`: YYYY-MM-DD
  - `endDate`: YYYY-MM-DD
- **Response:** Revenue by mode and date

### 5. Get Guest Statistics
- **Endpoint:** `GET /reports/guests/statistics`
- **Auth Required:** Yes
- **Role Required:** admin, front_desk
- **Response:**
  ```json
  {
    "total_guests": 150,
    "guests_last_30_days": 42,
    "upcoming_guests": 15
  }
  ```

### 6. Get Top Spending Guests
- **Endpoint:** `GET /reports/guests/top-spenders`
- **Auth Required:** Yes
- **Role Required:** admin, front_desk
- **Query Parameters:**
  - `limit` (optional): Default 10
- **Response:** Top guests by total spending

---

## Error Responses

All errors return appropriate HTTP status codes:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Error Codes:
- **400:** Bad Request - Invalid input
- **401:** Unauthorized - Missing/invalid token
- **403:** Forbidden - Insufficient permissions
- **404:** Not Found - Resource doesn't exist
- **500:** Internal Server Error

---

## Rate Limiting

Coming soon: API rate limiting (100 requests/minute per user)

## Webhooks

Coming soon: Webhook support for integration

---

**Last Updated:** 2024
**API Version:** 1.0.0
