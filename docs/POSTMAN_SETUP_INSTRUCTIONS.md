# 📮 Postman Setup & Import Instructions

This comprehensive guide will walk you through setting up Postman to test the Pet Wellness API effectively.

---

## 🏗️ SECTION A: Install Postman

1. **Download**: Go to [postman.com/downloads](https://www.postman.com/downloads/).
2. **Installation**: 
   - Run the downloaded `.exe` file.
   - Follow the on-screen instructions to complete the installation.
3. **Account Creation** (Optional but Recommended):
   - Creating a free account allows you to sync your work, save history, and collaborate.
   - Sign up with your email or use a Google account.

---

## 📥 SECTION B: Import the Collection

1. **Open Postman**: Launch the application on your computer.
2. **Click "Import"**: Look for the **Import** button in the top-left section of the sidebar.
3. **Select File**: Drag and drop the collection file into the import window, or click **"Upload Files"**.
4. **File Location**: Navigate to your project directory and select:
   `postman/pet_wellness_complete_collection.json`
5. **Confirm**: Click **Import** to add the collection.
6. **Verify**: You should now see **"Pet Wellness - Complete API"** in your Collections tab in the left sidebar.

---

## ⚙️ SECTION C: Create Environment Variables

To make testing seamless, you need to set up a local environment.

1. **Open Environments**: Click **"Environments"** in the left sidebar.
2. **Create New**: Click the **"+"** icon to create a new environment.
3. **Name**: Name it **"Pet Wellness Local"**.
4. **Add Variables**: Enter the following values:

| Variable Name | Initial Value | Current Value |
|---------------|---------------|---------------|
| `base_url`    | `http://localhost:8080` | `http://localhost:8080` |
| `jwt_token`   | (leave empty) | (leave empty) |
| `admin_token` | (leave empty) | (leave empty) |
| `user_id`     | (leave empty) | (leave empty) |
| `pet_id`      | (leave empty) | (leave empty) |
| `record_id`   | (leave empty) | (leave empty) |

5. **Save**: Click the **"Save"** button at the top.
6. **Activate**: Select **"Pet Wellness Local"** from the environment dropdown menu in the top-right corner of Postman.

---

## 📁 SECTION D: Understanding the Collection Structure

The collection is organized logically by functional area:

- **01. Auth**: Tasks for user onboarding (Register, Login, Email Verification, Password Reset).
- **02. User Profile**: Access and manage your personal user details.
- **03. Pet Management**: Complete CRUD operations for your pets (Add, View, Update, Delete).
- **04. Health Records**: Manage medical history and vaccinations for your registered pets.
- **05. Admin**: Workflow for approving pending user accounts (requires Admin role).

---

## 🧪 SECTION E: How to Use Variables

- **Syntax**: Use `{{variable_name}}` in URLs, headers, or bodies. Postman will automatically replace this with the value from your active environment.
- **Auto-Population**: Most requests in this collection have **Tests** scripts that automatically save IDs and tokens into your environment so you don't have to copy-paste them manually.
- **Manual Override**: You can always click the Quick Look (eye icon) top-right to manually edit any variable value.

---

## 📜 SECTION F: Pre-Request Scripts

Pre-request scripts run **before** the request is sent. In this collection, they are used to ensure the environment is ready for the specific request.
- **Inheritance**: Some scripts are set at the folder level to apply to all requests within that folder (e.g., ensuring headers are set correctly).

---

## 🏁 SECTION G: Tests Tab

The **Tests** tab contains scripts that run **after** a response is received.
- **Validation**: They check if the status code is correct (e.g., `200 OK` or `201 Created`).
- **Data Capture**: They extract data from the response (like `token` or `id`) and save it to your environment variables for use in subsequent requests.
- **View Results**: You can see the verification results in the **"Test Results"** tab in the bottom response pane of Postman.
