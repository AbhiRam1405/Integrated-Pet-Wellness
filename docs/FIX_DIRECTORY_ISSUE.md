# ⚠️ You're in the Wrong Directory!

## The Problem
You're currently in: `C:\Users\HP`  
But `mvnw.cmd` is located in: `E:\Abhishek\Projects\infosys intern\Integrated Pet Wellness and Service\app\backend`

## Solution - Run These Commands in Order:

### Step 1: Navigate to the Backend Directory
```powershell
cd "E:\Abhishek\Projects\infosys intern\Integrated Pet Wellness and Service\app\backend"
```

### Step 2: Set JAVA_HOME (for current session)
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-22"
```

### Step 3: Verify Maven Wrapper
```powershell
.\mvnw.cmd --version
```

### Step 4: Run Initial Build
```powershell
.\mvnw.cmd clean compile
```

## Complete Command Sequence (Copy & Paste All at Once)

```powershell
cd "E:\Abhishek\Projects\infosys intern\Integrated Pet Wellness and Service\app\backend"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-22"
.\mvnw.cmd --version
```

## Expected Output

After running the above commands, you should see:

```
Apache Maven 3.9.9
Maven home: C:\Users\HP\.m2\wrapper\dists\apache-maven-3.9.9-bin\...
Java version: 22.0.2, vendor: Oracle Corporation
Java home: C:\Program Files\Java\jdk-22
Default locale: en_US, platform encoding: UTF-8
OS name: "windows 11", version: "10.0", arch: "amd64", family: "windows"
```

---

**Copy the complete command sequence above and paste it into your PowerShell window!**
