# 📑 Complete Postman Testing Guide - Pet Wellness API

This guide provides exhaustive, step-by-step instructions to test every feature of the Pet Wellness backend.

---

## 🛠️ SECTION 1: SETUP

### 1. Install Postman
- Download and install from [postman.com/downloads](https://www.postman.com/downloads/).

### 2. Import Collection files
1. Open Postman.
2. Click **Import** (top-left).
3. Select the file: `postman/pet_registry_test_collection.json`.
4. This will create a collection with pre-filled requests.

### 3. Set Up Environment Variables
Using variables makes testing much faster. 
1. Click the **Environment Quick Look** (eye icon) in the top-right.
2. Under **Globals**, add these:
   - `base_url`: `http://localhost:8080`
   - `jwt_token`: (leave blank)
   - `admin_jwt_token`: (leave blank)
   - `user_id`: (leave blank)
   - `pet_id`: (leave blank)
   - `record_id`: (leave blank)

### 4. Organize Tests
- The imported collection is already organized into folders: **Auth**, **Pets**, **Health Records**, and **Admin**.

---

## 🔐 SECTION 2: AUTHENTICATION TESTS

### TEST 1: User Registration
**Goal**: Create a new account.
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body (JSON)**:
```json
{
  "username": "petowner_test",
  "email": "test@example.com",
  "password": "Test123!@#",
  "firstName": "Test",
  "lastName": "User",
  "phoneNumber": "1234567890",
  "address": "123 Pet Lane"
}
```
- **Expected Response**: `200 OK`
- **What to save**: The `id` from the response (save it to your `user_id` variable).

### TEST 2: Email Verification (Manual DB Check)
Since the email server uses placeholders, you must get the token from the database:
1. Open **MongoDB Atlas**.
2. Navigate to your `PetWellnessDB` -> `email_verification_tokens` collection.
3. Find the token associated with your `userId`.
4. Copy the `token` string.

### TEST 3: Verify Email
- **Method**: `GET`
- **URL**: `{{base_url}}/api/auth/verify-email?token={{your_token_from_db}}`
- **Expected Response**: `200 OK` ("Email verified successfully")

### TEST 4: User Login
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/login`
- **Body (JSON)**:
```json
{
  "emailOrUsername": "petowner_test",
  "password": "Test123!@#"
}
```
- **Expected response**: `200 OK` (includes a `token` field).
- **IMPORTANT**: Copy the token and save it to your `jwt_token` global variable.

### TEST 5: Get User Profile (Protected)
- **Method**: `GET`
- **URL**: `{{base_url}}/api/users/profile`
- **Headers**: 
  - `Authorization`: `Bearer {{jwt_token}}`
- **Expected Response**: `200 OK`. Verify `profileCompletionPercentage` is calculated (e.g., 100% if all fields are filled).

### TEST 6: Update User Profile
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/users/profile`
- **Headers**: `Authorization: Bearer {{jwt_token}}`
- **Body (JSON)**:
```json
{
  "firstName": "Updated",
  "lastName": "Owner",
  "phoneNumber": "9876543210",
  "address": "456 Updated St"
}
```

---

## 🐾 SECTION 3: PET MANAGEMENT TESTS

### TEST 7: Add a New Pet
- **Method**: `POST`
- **URL**: `{{base_url}}/api/pets`
- **Headers**: `Authorization: Bearer {{jwt_token}}`
- **Body (JSON)**:
```json
{
  "name": "Buddy",
  "type": "DOG",
  "breed": "Golden Retriever",
  "age": 3,
  "gender": "MALE",
  "weight": 30.5,
  "bio": "Extremely friendly and loves to play fetch."
}
```
- **Expected Response**: `201 Created`.
- **What to save**: Copy the `id` of the pet and save it to your `pet_id` variable.

### TEST 8: Get All My Pets
- **Method**: `GET`
- **URL**: `{{base_url}}/api/pets`
- **Expected Response**: `200 OK` (Array containing "Buddy").

### TEST 9: Get Single Pet
- **Method**: `GET`
- **URL**: `{{base_url}}/api/pets/{{pet_id}}`

### TEST 10: Update Pet
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/pets/{{pet_id}}`
- **Body (JSON)**:
```json
{
  "name": "Buddy Jr.",
  "age": 4,
  "weight": 32.0
}
```

---

## 🏥 SECTION 4: MEDICAL RECORDS TESTS

### TEST 11: Add Medical Record
- **Method**: `POST`
- **URL**: `{{base_url}}/api/pets/{{pet_id}}/health-records`
- **Headers**: `Authorization: Bearer {{jwt_token}}`
- **Body (JSON)**:
```json
{
  "date": "2026-02-08",
  "type": "VACCINATION",
  "description": "Annual Rabies Shot",
  "veterinarian": "Dr. Smith",
  "notes": "No side effects observed.",
  "followUpDate": "2027-02-08"
}
```
- **Expected Response**: `201 Created`.
- **What to save**: Copy the record `id` into your `record_id` variable.

### TEST 12: Get All Records for a Pet
- **Method**: `GET`
- **URL**: `{{base_url}}/api/pets/{{pet_id}}/health-records`

### TEST 13: Update Medical Record
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/pets/{{pet_id}}/health-records/{{record_id}}`
- **Body (JSON)**:
```json
{
  "notes": "Updated note: Slightly drowsy after shot."
}
```

### TEST 14: Delete Medical Record
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/pets/{{pet_id}}/health-records/{{record_id}}`

---

## 🛡️ SECTION 5: ADMIN TESTS

### TEST 15: Register Admin User (Manual Setup)
1. Use **TEST 1** to register a user named `admin_user`.
2. Go to **MongoDB Atlas**.
3. In the `users` collection, edit the document for `admin_user`.
4. Change `"role": "PET_OWNER"` to `"role": "ADMIN"`.
5. Set `"isEmailVerified": true` and `"isApproved": true`.

### TEST 16: Admin Login
- Login with `admin_user`. 
- Save the token to `admin_jwt_token`.

### TEST 17: Get Pending Users
- **Method**: `GET`
- **URL**: `{{base_url}}/api/admin/pending-users`
- **Headers**: `Authorization: Bearer {{admin_jwt_token}}`

### TEST 18: Approve User
- **Method**: `POST`
- **URL**: `{{base_url}}/api/admin/approve-user/{{user_id}}`

---

## ⚠️ SECTION 6: SECURITY TESTS

### TEST 19: No Token
- Try `GET {{base_url}}/api/users/profile` with **No Auth**.
- **Expected**: `403 Forbidden`.

### TEST 20: Wrong Role
- Try `GET {{base_url}}/api/admin/pending-users` using the regular `{{jwt_token}}`.
- **Expected**: `403 Forbidden`.

### TEST 21: Invalid/Expired Token
- Set your Bearer token to `random_text`.
- **Expected**: `401 Unauthorized`.

---

## 🔍 SECTION 7: TROUBLESHOOTING

- **"Could not get any response"**: Ensure the backend is running (`mvnw spring-boot:run`).
- **401 Unauthorized**: Check if you missed the `Bearer ` prefix in the Authorization header.
- **403 Forbidden**: 
  - Ensure the user's `isEmailVerified` is `true`.
  - Ensure the user's `isApproved` is `true`.
- **Reset Database**: If data gets messy, you can delete collections in MongoDB Atlas; Spring Boot will recreate them on restart.
