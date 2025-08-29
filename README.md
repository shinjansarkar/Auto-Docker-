# Auto Docker Extension

<div align="center">

![Docker Logo](https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png)

# 🐳 Auto Docker Extension

*A powerful VS Code extension that automatically analyzes your project structure and generates production-ready Docker configurations with zero manual configuration required.*

[![VS Code Version](https://img.shields.io/badge/VS%20Code-1.74.0+-blue.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

</div>

## 🚀 Features

### 🎯 **Smart Project Detection**
- **Automatic Analysis**: Scans your workspace to detect project types
- **Multi-Language Support**: Supports 8+ programming languages and frameworks
- **Intelligent Port Detection**: Automatically assigns appropriate ports based on framework
- **Dependency Analysis**: Reads package.json, requirements.txt, pom.xml, and more

### 🐳 **Docker Configuration Generation**
- **Multi-Stage Builds**: Optimized Dockerfiles for production deployment
- **Nginx Integration**: Automatic nginx configuration for frontend applications
- **Docker Compose**: Multi-service orchestration for full-stack applications
- **Production Ready**: Security-focused configurations with best practices

### 📁 **File Type Support**

#### Frontend Frameworks
| Framework | Detection Files | Default Port | Generated Files |
|-----------|----------------|--------------|-----------------|
| **React** | `package.json` (react/react-dom) | 3000 | `Dockerfile`, `nginx.conf` |
| **Vue.js** | `package.json` (vue/@vue/cli-service) | 3000 | `Dockerfile`, `nginx.conf` |
| **Angular** | `package.json` (@angular/core) | 4200 | `Dockerfile`, `nginx.conf` |

#### Backend Frameworks
| Framework | Detection Files | Default Port | Generated Files |
|-----------|----------------|--------------|-----------------|
| **Node.js/Express** | `package.json` (express/koa/fastify) | 3000 | `Dockerfile` |
| **Python/Flask** | `requirements.txt` (flask/django/fastapi) | 5000 | `Dockerfile` |
| **Java/Spring Boot** | `pom.xml` (spring-boot/spring-web) | 8080 | `Dockerfile` |
| **Go/Gin** | `go.mod` (gin-gonic/gin/echo/fiber) | 8080 | `Dockerfile` |
| **PHP/Laravel** | `composer.json` (laravel/symfony) | 8000 | `Dockerfile` |
| **.NET Core** | `*.csproj` (Microsoft.AspNetCore) | 5000 | `Dockerfile` |
| **Rust/Actix** | `Cargo.toml` (actix-web/rocket/warp) | 8080 | `Dockerfile` |

## 📋 Installation

### Option 1: Install from VSIX
1. Download `auto-docker-0.0.1.vsix`
2. In VS Code: `Ctrl+Shift+P` → "Extensions: Install from VSIX"
3. Select the downloaded file

### Option 2: Development Installation
```bash
# Clone the repository
git clone <repository-url>
cd auto-docker

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Press F5 in VS Code to launch extension
```

## 🎮 Usage

### Quick Start
1. **Open Project**: Open your project folder in VS Code
2. **Run Command**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. **Generate**: Type "Generate Docker Setup" and select the command
4. **Wait**: The extension will analyze your project and generate configurations
5. **Deploy**: Use the generated Docker files to deploy your application

### Command Palette
```
Generate Docker Setup
├── Analyzes project structure
├── Detects frontend/backend frameworks
├── Generates appropriate Docker configurations
└── Creates nginx.conf and docker-compose.yml if needed
```

## 📁 Generated File Structure

### Frontend Only Projects
```
project-root/
├── Dockerfile          # Multi-stage build with nginx
└── nginx.conf          # Nginx configuration for SPA routing
```

### Backend Only Projects
```
project-root/
├── Dockerfile          # Language-specific optimized build
└── (framework-specific files)
```

### Full-Stack Projects
```
project-root/
├── Dockerfile          # Frontend multi-stage build
├── Dockerfile.backend  # Backend language-specific build
├── docker-compose.yml  # Multi-service orchestration
└── nginx.conf          # Nginx configuration
```

## 🔧 Configuration Examples

### React Frontend + Node.js Backend

**Generated `Dockerfile` (Frontend)**:
```dockerfile
# Multi-stage build for frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Generated `Dockerfile.backend` (Backend)**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Generated `docker-compose.yml`**:
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Generated `nginx.conf`**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Python Flask Backend

**Generated `Dockerfile`**:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 🚀 Deployment

### Single Service Deployment
```bash
# Build the image
docker build -t myapp .

# Run the container
docker run -p 80:80 myapp
```

### Multi-Service Deployment
```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

## 🔍 Project Detection Logic

### Frontend Detection
The extension scans `package.json` for:
- **React**: `react` or `react-dom` dependencies
- **Vue**: `vue` or `@vue/cli-service` dependencies  
- **Angular**: `@angular/core` or `@angular/cli` dependencies

### Backend Detection
The extension scans multiple files:

#### Node.js Backend
- **File**: `package.json`
- **Detection**: Express/Koa/Fastify/NestJS dependencies
- **Exclusion**: No React/Vue/Angular dependencies

#### Python Backend
- **File**: `requirements.txt`
- **Detection**: Flask/Django/FastAPI/Tornado/Bottle/Pyramid
- **Filtering**: Removes comments and empty lines

#### Java Backend
- **File**: `pom.xml`
- **Detection**: Spring Boot/Spring Web/Servlet API references

#### Go Backend
- **File**: `go.mod`
- **Detection**: Gin/Echo/Fiber/Gorilla Mux references

#### PHP Backend
- **File**: `composer.json`
- **Detection**: Laravel/Symfony/Slim/Silex/Zend references

#### .NET Backend
- **File**: `*.csproj` (recursive search)
- **Detection**: ASP.NET Core/Microsoft.NET.Sdk.Web references

#### Rust Backend
- **File**: `Cargo.toml`
- **Detection**: Actix-web/Rocket/Warp/Axum references

## 🛠 Development

### Project Structure
```
auto-docker/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── projectAnalyzer.ts    # Project detection logic
│   └── dockerGenerator.ts    # Docker file generation
├── examples/                 # Test projects
│   ├── react-frontend/
│   ├── nodejs-backend/
│   ├── python-backend/
│   └── fullstack-react-node/
├── out/                      # Compiled JavaScript
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

### Build Commands
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package extension
vsce package

# Run tests
npm test
```

### Debugging
1. Press `F5` in VS Code to launch extension in debug mode
2. Open a test project from `examples/` folder
3. Run "Generate Docker Setup" command
4. Check the Debug Console for logs

## 📊 Supported File Extensions

### Configuration Files
- `.json` - package.json, composer.json, tsconfig.json
- `.txt` - requirements.txt, go.mod
- `.xml` - pom.xml, *.csproj
- `.toml` - Cargo.toml
- `.lock` - package-lock.json, composer.lock, Cargo.lock

### Source Files (for detection)
- `.js` - JavaScript files
- `.ts` - TypeScript files
- `.py` - Python files
- `.java` - Java files
- `.go` - Go files
- `.php` - PHP files
- `.cs` - C# files
- `.rs` - Rust files

## 🔧 Customization

### Port Configuration
The extension uses default ports but you can modify them in the generated files:
- **Frontend**: 80 (nginx), 3000 (dev server)
- **Backend**: 3000 (Node.js), 5000 (Python/.NET), 8080 (Java/Go/Rust), 8000 (PHP)

### Build Commands
The extension assumes standard build commands:
- **React**: `npm run build`
- **Vue**: `npm run build`
- **Angular**: `ng build`
- **Node.js**: `npm start`
- **Python**: `python app.py`
- **Java**: `java -jar app.jar`
- **Go**: `./main`
- **PHP**: Apache/FPM
- **.NET**: `dotnet app.dll`
- **Rust**: `./app`

## 🐛 Troubleshooting

### Common Issues

#### "No supported project type detected"
- Ensure your project has the required configuration files
- Check that dependencies are properly listed
- Verify file permissions

#### "Failed to generate Docker setup"
- Check VS Code console for detailed error messages
- Ensure workspace folder is accessible
- Verify TypeScript compilation

#### Docker build fails
- Check generated Dockerfile syntax
- Verify build commands in package.json
- Ensure all required files are present

### Debug Mode
Enable debug logging by:
1. Opening VS Code Developer Tools (`Ctrl+Shift+I`)
2. Running the extension command
3. Checking console output for detailed logs

## 🤝 Contributing

### Adding New Framework Support
1. **Update Detection Logic**: Modify `projectAnalyzer.ts`
2. **Add Docker Template**: Update `dockerGenerator.ts`
3. **Create Test Project**: Add example in `examples/` folder
4. **Update Documentation**: Modify this README

### Testing
1. Create a test project with the new framework
2. Run the extension command
3. Verify generated files are correct
4. Test Docker build and run

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- VS Code Extension API
- Docker best practices community
- Nginx configuration examples
- Multi-stage build patterns

---

**Made with ❤️ for developers who love automation** 