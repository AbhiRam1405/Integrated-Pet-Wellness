# 📥 Postman Import & Testing Guide

This guide explains how to import and use the Postman collections to test the Pet Wellness API effectively.

---

## 📍 Step 1: Import Collections

### Available Files
1. **[Pet Wellness - Complete API](file:///e:/Abhishek/Projects/infosys intern/Integrated Pet Wellness and Service/app/postman/pet_wellness_complete_collection.json)** (Recommended - Contains EVERYTHING)
2. **[Pet Wellness - Auth](file:///e:/Abhishek/Projects/infosys intern/Integrated Pet Wellness and Service/app/postman/auth_test_collection.json)** (Specialized for login/registration)
3. **[Pet Wellness - Registry](file:///e:/Abhishek/Projects/infosys intern/Integrated Pet Wellness and Service/app/postman/pet_registry_test_collection.json)** (Specialized for pets and medical history)

### How to Import
1. Open the **Postman** desktop application.
2. Click the **Import** button in the top-left sidebar.
3. Drag and drop the `.json` files from the `postman/` directory into Postman.
4. Click **Import** to confirm.

---

## ⚙️ Step 2: Set Up Environment Variables

To make testing seamless, we use variables.
1. Click the **Environment Quick Look** (eye icon) in the top-right corner.
2. Under **Globals**, ensure the following are defined:
   - `base_url`: `http://localhost:8080`
   - `jwt_token`: Leave empty (Login will fill this)
   - `user_id`: Leave empty (Login/Register will fill this)
   - `pet_id`: Leave empty (Register Pet will fill this)

---

## 🧪 Step 3: Recommended Testing Order

Following this order ensures dependencies (like tokens and IDs) are handled automatically by the scripts in the collection.

### 1. User Onboarding
- **Register User**: Create a test account.
- **Manual Verification**: Since SMTP is in demo mode, go to MongoDB Atlas and set `isEmailVerified: true` for your user.
- **Login**: This script will automatically save your `jwt_token` and `user_id`.

### 2. Profile Management
- **Get My Profile**: Verify you can access protected data.
- **Update Profile**: Test updating your details.

### 3. Pet Registry
- **Add Pet**: This script will automatically save your `pet_id`.
- **Get My Pets**: Verify the pet appears in your list.
- **Get Single Pet**: Test retrieval of specific pet data.

### 4. Health History
- **Add Medical Record**: Uses the `pet_id` from the previous step.
- **Get Pet History**: View the vaccination/medical timeline.

### 5. Admin Workflow
- **Login (Admin)**: Change your user role to `ADMIN` in MongoDB, then login to get an admin token.
- **Get Pending Users**: View users awaiting approval.
- **Approve User**: Approve a specific pet owner by their `user_id`.

---

## 💡 Advanced Features Included

### Automated Token Management
The **Login** request includes a "Tests" script:
```javascript
var jsonData = pm.response.json();
if (jsonData.token) {
    pm.environment.set("jwt_token", jsonData.token);
}
```
This means as soon as you log in, all other requests (which use `{{jwt_token}}` in their Authorization tab) are ready to go!

### Response Validation
Every request includes built-in tests to verify:
- HTTP Status Codes (200 OK, 201 Created, etc.)
- JSON structure and mandatory fields.
- Backend logic success.

---

## 🛠️ Troubleshooting

- **"Forbidden" (403)**: Ensure your user is both `isEmailVerified` AND `isApproved` in the database.
- **"Unauthorized" (401)**: Your JWT token might have expired. Simply run the **Login** request again.
- **Port Conflict**: If requests fail with "Connection Refused", ensure the Java app is running on port 8080.
