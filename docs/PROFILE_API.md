# Profile Management API Documentation

Complete API reference for user profile management endpoints.

---

## Base URL
```
http://localhost:8080
```

---

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Get Current User Profile

Retrieve the profile of the currently authenticated user.

**Endpoint:** `GET /api/users/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "john@example.com",
  "roles": ["ROLE_USER"],
  "isEmailVerified": true,
  "isApproved": true,
  "profileCompletion": 100,
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, Springfield, IL 62701",
  "profileImageUrl": null,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-02-12T14:20:00"
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - Invalid or missing JWT token |
| 404 | User not found |

---

### 2. Update Profile

Update the current user's profile information.

**Endpoint:** `PUT /api/users/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "address": "456 Oak Avenue, Springfield, IL 62701"
}
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | String | No | User's first name |
| lastName | String | No | User's last name |
| phoneNumber | String | No | User's phone number |
| address | String | No | User's address |

**Notes:**
- All fields are optional (partial updates allowed)
- Cannot update: email, role, isEmailVerified, password

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "address": "456 Oak Avenue, Springfield, IL 62701",
  "profileCompletion": 100,
  ...
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - Invalid or missing JWT token |
| 404 | User not found |

---

### 3. Change Password

Change the password for the current user.

**Endpoint:** `PUT /api/users/change-password`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Field Details:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| oldPassword | String | Yes | Must match current password |
| newPassword | String | Yes | Minimum 6 characters |

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

| Status Code | Description | Example Message |
|-------------|-------------|-----------------|
| 400 | Bad Request - Invalid old password | "Current password is incorrect" |
| 400 | Bad Request - Validation failed | "New password must be at least 6 characters long" |
| 401 | Unauthorized - Invalid or missing JWT token | - |
| 404 | User not found | - |

---

## Security

### Password Encryption
- All passwords are encrypted using BCrypt
- Old password is validated before allowing change
- Passwords are never exposed in API responses

### User Identification
- User is automatically extracted from JWT token
- No need to pass user ID or username in request body
- Prevents users from modifying other users' profiles

### Protected Fields
The following fields cannot be updated via the profile update endpoint:
- `email` - Use dedicated email change endpoint (if implemented)
- `role` - Admin-only operation
- `isEmailVerified` - Controlled by verification flow
- `isApproved` - Admin-only operation
- `password` - Use change-password endpoint

---

## Testing with cURL

### Get Profile
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer <your_jwt_token>"
```

### Update Profile
```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+1234567890",
    "address": "456 Oak Ave, Springfield, IL"
  }'
```

### Change Password
```bash
curl -X PUT http://localhost:8080/api/users/change-password \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "currentPassword123",
    "newPassword": "newSecurePassword456"
  }'
```

---

## Common Use Cases

### 1. Complete Profile After Registration
```javascript
// After user registers and logs in
const updateProfile = async (token) => {
  const response = await fetch('http://localhost:8080/api/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      address: '123 Main St, Springfield, IL'
    })
  });
  return response.json();
};
```

### 2. Display User Profile
```javascript
const getProfile = async (token) => {
  const response = await fetch('http://localhost:8080/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const profile = await response.json();
  console.log(`Welcome, ${profile.firstName} ${profile.lastName}!`);
};
```

### 3. Change Password Flow
```javascript
const changePassword = async (token, oldPassword, newPassword) => {
  const response = await fetch('http://localhost:8080/api/users/change-password', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      oldPassword,
      newPassword
    })
  });
  
  if (response.ok) {
    alert('Password changed successfully!');
  } else {
    const error = await response.json();
    alert(error.message);
  }
};
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "timestamp": "2024-02-12T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Current password is incorrect",
  "path": "/api/users/change-password"
}
```

### Handling Errors in Frontend
```javascript
const handleApiError = (error) => {
  switch (error.status) {
    case 400:
      // Validation error or incorrect password
      alert(error.message);
      break;
    case 401:
      // Unauthorized - redirect to login
      window.location.href = '/login';
      break;
    case 404:
      // User not found
      alert('User not found');
      break;
    default:
      alert('An error occurred');
  }
};
```
