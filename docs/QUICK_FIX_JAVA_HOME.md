# Quick Fix: Set JAVA_HOME and Run Maven Wrapper

## Your Java Installation Location
**Found**: `C:\Program Files\Java\jdk-22`

## Quick Solution (Choose One)

### Option 1: Set JAVA_HOME for Current PowerShell Session (Fastest)

Copy and paste this command in your PowerShell:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-22"
```

Then verify:
```powershell
.\mvnw.cmd --version
```

### Option 2: Set JAVA_HOME Permanently (Recommended)

Run this PowerShell command **as Administrator**:

```powershell
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Java\jdk-22', 'Machine')
```

Then:
1. **Close and reopen** your PowerShell window
2. Verify: `.\mvnw.cmd --version`

### Option 3: Manual GUI Method

1. Press `Windows + R`
2. Type: `sysdm.cpl` and press Enter
3. Click **"Advanced"** tab
4. Click **"Environment Variables"**
5. Under **"System variables"**, click **"New"**
6. Variable name: `JAVA_HOME`
7. Variable value: `C:\Program Files\Java\jdk-22`
8. Click **OK** on all dialogs
9. **Restart PowerShell**
10. Verify: `.\mvnw.cmd --version`

## After Setting JAVA_HOME

Run these commands to verify everything works:

```powershell
# Verify Maven Wrapper
.\mvnw.cmd --version

# Run initial build
.\mvnw.cmd clean compile
```

## Expected Output

```
Apache Maven 3.9.9
Maven home: ...
Java version: 22.0.2, vendor: Oracle Corporation
Java home: C:\Program Files\Java\jdk-22
```

---

**Use Option 1 for immediate testing, then set it permanently with Option 2 or 3.**
