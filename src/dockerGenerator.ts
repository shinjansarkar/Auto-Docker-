import * as fs from 'fs';
import * as path from 'path';
import { ProjectInfo } from './projectAnalyzer';

export class DockerGenerator {
    private workspacePath: string;
    private projectInfo: ProjectInfo;

    constructor(workspacePath: string, projectInfo: ProjectInfo) {
        this.workspacePath = workspacePath;
        this.projectInfo = projectInfo;
    }

    async generate(): Promise<void> {
        if (this.projectInfo.hasFrontend && this.projectInfo.hasBackend) {
            // Full-stack application
            await this.generateFullStackSetup();
        } else if (this.projectInfo.hasFrontend) {
            // Frontend only
            await this.generateFrontendOnlySetup();
        } else if (this.projectInfo.hasBackend) {
            // Backend only
            await this.generateBackendOnlySetup();
        } else {
            throw new Error('No supported project type detected');
        }
    }

    private async generateFullStackSetup(): Promise<void> {
        // Generate frontend Dockerfile
        await this.generateFrontendDockerfile();
        
        // Generate backend Dockerfile
        await this.generateBackendDockerfile();
        
        // Generate nginx configuration
        await this.generateNginxConfig();
        
        // Generate docker-compose.yml
        await this.generateDockerCompose();
    }

    private async generateFrontendOnlySetup(): Promise<void> {
        // Generate frontend Dockerfile
        await this.generateFrontendDockerfile();
        
        // Generate nginx configuration
        await this.generateNginxConfig();
    }

    private async generateBackendOnlySetup(): Promise<void> {
        // Generate backend Dockerfile
        await this.generateBackendDockerfile();
    }

    private async generateFrontendDockerfile(): Promise<void> {
        const dockerfileContent = `# Multi-stage build for frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]`;

        await this.writeFile('Dockerfile', dockerfileContent);
    }

    private async generateBackendDockerfile(): Promise<void> {
        let dockerfileContent = '';

        switch (this.projectInfo.backendType) {
            case 'nodejs':
                dockerfileContent = this.generateNodejsDockerfile();
                break;
            case 'python':
                dockerfileContent = this.generatePythonDockerfile();
                break;
            case 'java':
                dockerfileContent = this.generateJavaDockerfile();
                break;
            case 'go':
                dockerfileContent = this.generateGoDockerfile();
                break;
            case 'php':
                dockerfileContent = this.generatePhpDockerfile();
                break;
            case 'dotnet':
                dockerfileContent = this.generateDotnetDockerfile();
                break;
            case 'rust':
                dockerfileContent = this.generateRustDockerfile();
                break;
            default:
                throw new Error(`Unsupported backend type: ${this.projectInfo.backendType}`);
        }

        const filename = this.projectInfo.hasFrontend ? 'Dockerfile.backend' : 'Dockerfile';
        await this.writeFile(filename, dockerfileContent);
    }

    private generateNodejsDockerfile(): string {
        return `# Node.js backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE ${this.projectInfo.backendPort}

# Start the application
CMD ["npm", "start"]`;
    }

    private generatePythonDockerfile(): string {
        return `# Python backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE ${this.projectInfo.backendPort}

# Start the application
CMD ["python", "app.py"]`;
    }

    private generateJavaDockerfile(): string {
        return `# Java backend Dockerfile
FROM maven:3.8.4-openjdk-17 AS builder

WORKDIR /app

# Copy pom.xml
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17-jre-slim

WORKDIR /app

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE ${this.projectInfo.backendPort}

# Start the application
CMD ["java", "-jar", "app.jar"]`;
    }

    private generateGoDockerfile(): string {
        return `# Go backend Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder stage
COPY --from=builder /app/main .

# Expose port
EXPOSE ${this.projectInfo.backendPort}

# Start the application
CMD ["./main"]`;
    }

    private generatePhpDockerfile(): string {
        return `# PHP backend Dockerfile
FROM php:8.2-apache

WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    git \\
    curl \\
    libpng-dev \\
    libonig-dev \\
    libxml2-dev \\
    zip \\
    unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy source code
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]`;
    }

    private generateDotnetDockerfile(): string {
        return `# .NET backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS builder

WORKDIR /app

# Copy csproj files
COPY *.csproj ./

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build the application
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:7.0

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/out .

# Expose port
EXPOSE ${this.projectInfo.backendPort}

# Start the application
CMD ["dotnet", "app.dll"]`;
    }

    private generateRustDockerfile(): string {
        return `# Rust backend Dockerfile
FROM rust:1.70-alpine AS builder

WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies
RUN cargo build --release

# Remove dummy main.rs and copy real source code
RUN rm src/main.rs
COPY src ./src

# Build the application
RUN cargo build --release

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/target/release/app .

# Expose port
EXPOSE ${this.projectInfo.backendPort}

# Start the application
CMD ["./app"]`;
    }

    private async generateNginxConfig(): Promise<void> {
        const nginxContent = `server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}`;

        await this.writeFile('nginx.conf', nginxContent);
    }

    private async generateDockerCompose(): Promise<void> {
        const composeContent = `version: '3.8'

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
      - "${this.projectInfo.backendPort}:${this.projectInfo.backendPort}"
    environment:
      - NODE_ENV=production
    networks:
      - app-network

networks:
  app-network:
    driver: bridge`;

        await this.writeFile('docker-compose.yml', composeContent);
    }

    private async writeFile(filename: string, content: string): Promise<void> {
        const filePath = path.join(this.workspacePath, filename);
        await fs.promises.writeFile(filePath, content, 'utf-8');
    }
} 