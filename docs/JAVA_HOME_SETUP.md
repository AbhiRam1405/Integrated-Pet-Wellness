# Maven Wrapper Setup - JAVA_HOME Configuration Required

## ✅ Maven Wrapper Installation Complete

The following files have been successfully created:
- `mvnw` - Linux/macOS executable script
- `mvnw.cmd` - Windows batch script  
- `.mvn/wrapper/maven-wrapper.properties` - Configuration
- `.mvn/wrapper/maven-wrapper.jar` - Wrapper implementation

## ⚠️ JAVA_HOME Environment Variable Required

Maven Wrapper requires the `JAVA_HOME` environment variable to be set.

### Current Status
- Java 22.0.2 is installed and accessible via `java -version`
- However, `JAVA_HOME` is not set in your system environment

### How to Set JAVA_HOME (Windows)

#### Option 1: Set Permanently (Recommended)

1. **Find Your Java Installation**
   - Open Command Prompt or PowerShell
   - Run: `where java`
   - Look for a path like: `C:\Program Files\Java\jdk-22\bin\java.exe`
   - Your JAVA_HOME should be: `C:\Program Files\Java\jdk-22` (without `\bin`)

2. **Set JAVA_HOME Environment Variable**
   - Press `Windows + R`, type `sysdm.cpl`, press Enter
   - Click **"Advanced"** tab
   - Click **"Environment Variables"**
   - Under **"System variables"**, click **"New"**
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Java\jdk-22` (your actual path)
   - Click **"OK"** on all dialogs

3. **Verify**
   - Open a **NEW** terminal window
   - Run: `echo %JAVA_HOME%`
   - Should show: `C:\Program Files\Java\jdk-22`

4. **Test Maven Wrapper**
   ```cmd
   cd backend
   .\mvnw.cmd --version
   ```

#### Option 2: Set Temporarily (For Current Session)

In PowerShell:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-22"
.\mvnw.cmd --version
```

In Command Prompt:
```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-22
mvnw.cmd --version
```

### Expected Output After Setting JAVA_HOME

```
Apache Maven 3.9.9
Maven home: C:\Users\<YourUser>\.m2\wrapper\dists\apache-maven-3.9.9-bin\...
Java version: 22.0.2, vendor: Oracle Corporation
Java home: C:\Program Files\Java\jdk-22
Default locale: en_US, platform encoding: UTF-8
OS name: "windows 11", version: "10.0", arch: "amd64", family: "windows"
```

## 🚀 Next Steps

Once JAVA_HOME is set:

1. **Verify Maven Wrapper**
   ```cmd
   cd backend
   .\mvnw.cmd --version
   ```

2. **Run Initial Build**
   ```cmd
   .\mvnw.cmd clean compile
   ```

3. **Proceed with Step 2**
   - I will begin implementing the authentication module
   - All subsequent builds will use `.\mvnw.cmd` instead of `mvn`

## 📝 Quick Reference

| Task | Command |
|------|---------|
| Check Maven version | `.\mvnw.cmd --version` |
| Build project | `.\mvnw.cmd clean install` |
| Run application | `.\mvnw.cmd spring-boot:run` |
| Run tests | `.\mvnw.cmd test` |
| Compile only | `.\mvnw.cmd clean compile` |

---

**Please set JAVA_HOME and verify Maven Wrapper is working before proceeding to Step 2 implementation.**
