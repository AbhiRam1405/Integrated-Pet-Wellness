# Maven Wrapper Guide

## What is Maven Wrapper?

Maven Wrapper is a tool that allows you to run Maven builds **without requiring a global Maven installation**. It ensures that everyone working on the project uses the same Maven version, making builds more consistent and portable.

## Benefits

✅ **No Global Installation Required** - Maven downloads automatically on first use  
✅ **Consistent Builds** - Everyone uses the same Maven version (3.9.9)  
✅ **Portable** - Works on Windows, Linux, and macOS  
✅ **Team Collaboration** - No "works on my machine" issues  

## How to Use Maven Wrapper

### Windows (PowerShell/CMD)
Use `mvnw.cmd` or `./mvnw`:
```powershell
./mvnw clean install
./mvnw spring-boot:run
./mvnw test
```

### Linux/macOS (Bash/Zsh)
Use `./mvnw`:
```bash
./mvnw clean install
./mvnw spring-boot:run
./mvnw test
```

## Common Commands

### Build the Project
```bash
./mvnw clean install
```
Compiles code, runs tests, and creates JAR file.

### Run the Application
```bash
./mvnw spring-boot:run
```
Starts the Spring Boot application on port 8080.

### Run Tests Only
```bash
./mvnw test
```
Executes all unit and integration tests.

### Clean Build Artifacts
```bash
./mvnw clean
```
Removes the `target/` directory.

### Compile Without Tests
```bash
./mvnw clean install -DskipTests
```
Faster build when you don't need to run tests.

### Check for Dependency Updates
```bash
./mvnw versions:display-dependency-updates
```

### Package Application (JAR)
```bash
./mvnw package
```
Creates executable JAR in `target/` directory.

## Maven Wrapper vs Global Maven

| Command | Maven Wrapper | Global Maven |
|---------|---------------|--------------|
| Version Check | `./mvnw --version` | `mvn --version` |
| Build | `./mvnw clean install` | `mvn clean install` |
| Run App | `./mvnw spring-boot:run` | `mvn spring-boot:run` |

**Recommendation**: Always use Maven Wrapper (`./mvnw`) for this project.

## Configuration

Maven Wrapper is configured in:
- `.mvn/wrapper/maven-wrapper.properties` - Maven version and download URL
- `mvnw` - Linux/macOS script
- `mvnw.cmd` - Windows script

**Current Maven Version**: 3.9.9

## Troubleshooting

### Permission Denied (Linux/macOS)
```bash
chmod +x mvnw
./mvnw --version
```

### PowerShell Execution Policy (Windows)
If you get an execution policy error:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
./mvnw --version
```

### Maven Not Downloading
- Check internet connection
- Verify `.mvn/wrapper/maven-wrapper.properties` is correct
- Delete `~/.m2/wrapper` and try again

### First Run is Slow
Maven Wrapper downloads Maven on first use. Subsequent runs are fast.

## Files Included

```
backend/
├── mvnw              # Linux/macOS executable
├── mvnw.cmd          # Windows executable
└── .mvn/
    └── wrapper/
        ├── maven-wrapper.jar         # Wrapper implementation
        └── maven-wrapper.properties  # Configuration
```

## Next Steps

1. Verify installation: `./mvnw --version`
2. Build the project: `./mvnw clean install`
3. Run the application: `./mvnw spring-boot:run`

---

**Note**: You can still install global Maven if you prefer, but Maven Wrapper ensures everyone on the team uses the same version.
