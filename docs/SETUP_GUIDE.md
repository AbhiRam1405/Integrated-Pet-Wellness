# Setup Guide - Integrated Pet Wellness and Service Platform

This guide will help you complete the development environment setup.

## Prerequisites Status

✅ **Java JDK 22** - Installed  
✅ **Node.js v22.20.0** - Installed  
✅ **Git v2.52.0** - Installed  
⏳ **Maven** - To be installed  
⏳ **Postman** - To be installed  
⏳ **MongoDB Atlas** - To be configured  

---

## Task 3: Install Maven

Maven is required for building the Spring Boot project.

### Windows Installation Steps:

1. **Download Maven**
   - Go to: https://maven.apache.org/download.cgi
   - Download `apache-maven-3.9.x-bin.zip`

2. **Extract Maven**
   - Extract to: `C:\Program Files\Apache\maven`

3. **Add to System PATH**
   - Search "Environment Variables" in Windows Start Menu
   - Click "Edit the system environment variables"
   - Click "Environment Variables" button
   - Under "System variables", find and select "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\Apache\maven\bin`
   - Click "OK" on all dialogs

4. **Verify Installation**
   ```bash
   # Open a NEW terminal window
   mvn -version
   ```
   You should see Maven version information.

---

## Task 4: Install Postman

Postman is used for API testing and development.

### Installation Steps:

1. Go to: https://www.postman.com/downloads/
2. Download the Windows installer
3. Run the installer and follow the prompts
4. (Optional) Create a free Postman account for cloud sync

---

## Task 5: Set Up MongoDB Atlas

MongoDB Atlas is your cloud database.

### Step 1: Create Account & Cluster

1. **Sign Up**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose **"Shared"** (FREE tier)
   - Provider: **AWS**
   - Region: Choose closest to your location
   - Cluster Name: `PetWellness`
   - Click "Create"

### Step 2: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `petadmin`
5. Password: Generate a secure password (SAVE THIS!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### Step 3: Allow IP Access

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For development only! Restrict in production.
4. Click "Confirm"

### Step 4: Get Connection String

1. Go back to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Java**, Version: **4.3 or later**
5. Copy the connection string:
   ```
   mongodb+srv://petadmin:<password>@petwellness.xxxxx.mongodb.net/
   ```

---

## Task 6: Update application.properties

1. Open: `backend/src/main/resources/application.properties`

2. Replace the MongoDB URI with your actual connection string:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://petadmin:YOUR_ACTUAL_PASSWORD@petwellness.xxxxx.mongodb.net/PetWellnessDB?retryWrites=true&w=majority
   ```

3. Replace:
   - `YOUR_ACTUAL_PASSWORD` with the password you created
   - `petwellness.xxxxx.mongodb.net` with your actual cluster address

4. Save the file

---

## 🧪 Test Your Setup

Once Maven is installed and MongoDB is configured:

```bash
cd backend
mvn clean install
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX.XXX s
```

---

## 📊 Setup Checklist

- [ ] Maven installed and verified (`mvn -version` works)
- [ ] Postman installed
- [ ] MongoDB Atlas cluster created
- [ ] Database user created (username: `petadmin`)
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] `application.properties` updated with real credentials
- [ ] GitHub repository created at `https://github.com/AbhiRam1405/Integrated-Pet-Wellness`
- [ ] Code pushed to GitHub (`git push -u origin main`)
- [ ] Maven build successful (`mvn clean install`)

---

## ❓ Troubleshooting

### Maven not found after installation
- **Solution**: Restart your terminal/IDE completely
- **Verify**: Check if `C:\Program Files\Apache\maven\bin` is in PATH
- **Test**: Run `echo %PATH%` in terminal to see all paths

### Git push fails
- **Solution**: Ensure GitHub repository is created first
- **Verify**: Run `git remote -v` to check remote URL
- **Auth**: You may need to authenticate with GitHub (use Personal Access Token)

### MongoDB connection fails
- **Check**: Username and password are correct (no typos)
- **Check**: IP address is whitelisted (0.0.0.0/0 for dev)
- **Check**: Connection string format is correct
- **Test**: Use MongoDB Compass to test connection first

### Maven build fails
- **Check**: Java version is 17 or higher (we have Java 22 ✓)
- **Check**: `pom.xml` is in the correct directory
- **Solution**: Run `mvn clean` first, then `mvn install`

---

## 📞 Ready for Next Step?

Once you complete all tasks above, you're ready for **Step 2: Authentication & Profiles**.

We will build:
- User entity and MongoDB schema
- Registration and login APIs
- JWT authentication
- Email verification system
- Admin approval workflow
