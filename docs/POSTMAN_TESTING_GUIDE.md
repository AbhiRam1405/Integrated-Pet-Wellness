# 🚀 Postman Testing Guide - Pet Wellness API

This guide provides step-by-step instructions for testing the authentication and user management endpoints using Postman.

---

## ⚡ Quick Start

### 1. Import Collection
You can find the pre-configured Postman collection at:
`postman/pet_registry_test_collection.json`

**How to Import:**
1. Open Postman.
2. Click **Import** in the top-left corner.
3. Drag and drop the `pet_registry_test_collection.json` file.

### 2. Set Up Environment Variables
To avoid re-typing the URL and tokens, use Postman Variables:
1. Click the **Environment Quick Look** (eye icon) in the top-right.
2. Under **Globals**, set:
   - `base_url`: `http://localhost:8080`
   - `jwt_token`: (Leave empty, the Login request will fill this automatically)
   - `pet_id`: (Leave empty, Register Pet will fill this)

---

## 🧪 Authentication Tests

### TEST 1: User Registration
**Goal**: Create a new account.
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body (JSON)**:
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "1234567890",
    "address": "123 Pet Street"
}
```
- **Expected Status**: `200 OK`
- **Expected Response**: JSON with success message.

---

### TEST 2: Email Verification
**Goal**: Verify the account so you can log in.
- **Method**: `GET`
- **URL**: `{{base_url}}/api/auth/verify-email?token={token}`
- **How to get the token**:
  - Check the **Spring Boot Console Logs** (the app prints the token during registration).
  - Alternatively, check the `email_verification_tokens` collection in MongoDB.
- **Expected Status**: `200 OK`
- **Expected Response**: JSON confirmation message.

---

### TEST 3: User Login
**Goal**: Authenticate and receive a JWT token.
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/login`
- **Body (JSON)**:
```json
{
    "emailOrUsername": "testuser",
    "password": "password123"
}
```
- **Expected Status**: `200 OK`
- **Response**:
```json
{
    "token": "eyJhbG..",
    "type": "Bearer",
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "roles": ["ROLE_PET_OWNER"]
}
```
- **Post-Script**: The imported collection automatically saves this `token` into your `jwt_token` variable.

---

### TEST 4: Get User Profile (Protected)
**Goal**: Verify that the JWT token allows access to protected data.
- **Method**: `GET`
- **URL**: `{{base_url}}/api/users/profile`
- **Auth Tab**: Select **Bearer Token** and use `{{jwt_token}}`.
- **Expected Status**: `200 OK`
- **Expected Response**: User profile details including email, names, and profile completion %.

---

### TEST 5: Update User Profile
**Goal**: Modify user details.
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/users/profile`
- **Auth Tab**: **Bearer Token**
- **Body (JSON)**:
```json
{
    "phoneNumber": "9876543210",
    "address": "456 Updated Lane"
}
```
- **Expected Status**: `200 OK`

---

### TEST 6: Forgot Password
**Goal**: Request a password reset.
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/forgot-password`
- **Body (JSON)**:
```json
{
    "email": "test@example.com"
}
```
- **Expected Status**: `200 OK`

---

### TEST 7: Reset Password
**Goal**: Actually change the password using the reset token.
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/reset-password`
- **Body (JSON)**:
```json
{
    "token": "{token_from_logs_or_db}",
    "newPassword": "newPassword456"
}
```
- **Expected Status**: `200 OK`

---

## 🛡️ Admin Tests

### TEST 8: Get Pending Users (Admin only)
**Goal**: View users awaiting approval.
- **Method**: `GET`
- **URL**: `{{base_url}}/api/admin/pending-users`
- **Auth**: Must be logged in as an **ADMIN**.
- **Expected Status**: `200 OK` (Returns a list of users).

### TEST 9: Admin - Approve User
**Goal**: Approve a pet owner so they can use full app features.
- **Method**: `POST`
- **URL**: `{{base_url}}/api/admin/approve-user/{userId}`
- **Auth**: **Bearer Token** (Admin)
- **Expected Status**: `200 OK`

---

## 🛠️ Troubleshooting

- **401 Unauthorized**:
  - Missing `Authorization` header.
  - Token has expired.
  - Token is malformed (ensure the "Bearer " prefix is present if manually adding).
- **403 Forbidden**:
  - User is logged in but doesn't have the `ADMIN` role required for that specific endpoint.
  - User email is not verified.
  - User profile is not approved by admin.
- **MongoDB Connection**:
  - Ensure the URI in `application.properties` is correct.
  - Ensure your IP is whitelisted in MongoDB Atlas.
- **500 Internal Server Error**:
  - Check the Java console for the stack trace. Common issues: Invalid database types, null values for required fields.
