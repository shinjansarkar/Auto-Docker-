import * as fs from 'fs';
import * as path from 'path';

export interface ProjectInfo {
    hasFrontend: boolean;
    hasBackend: boolean;
    frontendType?: 'react' | 'vue' | 'angular';
    backendType?: 'nodejs' | 'python' | 'java' | 'go' | 'php' | 'dotnet' | 'rust';
    frontendPort: number;
    backendPort: number;
    hasDatabase: boolean;
    databaseType?: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite';
    packageJson?: any;
    requirementsTxt?: string[];
    pomXml?: any;
    goMod?: any;
    composerJson?: any;
    csprojFiles?: string[];
    cargoToml?: any;
}

export class ProjectAnalyzer {
    private workspacePath: string;

    constructor(workspacePath: string) {
        this.workspacePath = workspacePath;
    }

    async analyze(): Promise<ProjectInfo> {
        const projectInfo: ProjectInfo = {
            hasFrontend: false,
            hasBackend: false,
            frontendPort: 3000,
            backendPort: 3000,
            hasDatabase: false
        };

        // Check for frontend frameworks
        const frontendInfo = await this.detectFrontend();
        if (frontendInfo) {
            projectInfo.hasFrontend = true;
            projectInfo.frontendType = frontendInfo.type;
            projectInfo.frontendPort = frontendInfo.port;
            projectInfo.packageJson = frontendInfo.packageJson;
        }

        // Check for backend frameworks
        const backendInfo = await this.detectBackend();
        if (backendInfo) {
            projectInfo.hasBackend = true;
            projectInfo.backendType = backendInfo.type;
            projectInfo.backendPort = backendInfo.port;
            
            // Store relevant config files
            if (backendInfo.type === 'nodejs') {
                projectInfo.packageJson = backendInfo.packageJson;
            } else if (backendInfo.type === 'python') {
                projectInfo.requirementsTxt = backendInfo.requirementsTxt;
            } else if (backendInfo.type === 'java') {
                projectInfo.pomXml = backendInfo.pomXml;
            } else if (backendInfo.type === 'go') {
                projectInfo.goMod = backendInfo.goMod;
            } else if (backendInfo.type === 'php') {
                projectInfo.composerJson = backendInfo.composerJson;
            } else if (backendInfo.type === 'dotnet') {
                projectInfo.csprojFiles = backendInfo.csprojFiles;
            } else if (backendInfo.type === 'rust') {
                projectInfo.cargoToml = backendInfo.cargoToml;
            }
        }

        // Check for database dependencies
        const databaseInfo = await this.detectDatabase();
        if (databaseInfo) {
            projectInfo.hasDatabase = true;
            projectInfo.databaseType = databaseInfo.type;
        }

        return projectInfo;
    }

    private async detectFrontend(): Promise<{ type: 'react' | 'vue' | 'angular', port: number, packageJson: any } | null> {
        const packageJsonPath = path.join(this.workspacePath, 'package.json');
        
        if (await this.fileExists(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(await this.readFile(packageJsonPath));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

                if (dependencies.react || dependencies['react-dom']) {
                    return { type: 'react', port: 3000, packageJson };
                } else if (dependencies.vue || dependencies['@vue/cli-service']) {
                    return { type: 'vue', port: 3000, packageJson };
                } else if (dependencies['@angular/core'] || dependencies['@angular/cli']) {
                    return { type: 'angular', port: 4200, packageJson };
                }
            } catch (error) {
                console.error('Error parsing package.json:', error);
            }
        }

        return null;
    }

    private async detectBackend(): Promise<any> {
        // Check Node.js/Express
        const nodejsInfo = await this.detectNodejsBackend();
        if (nodejsInfo) return nodejsInfo;

        // Check Python
        const pythonInfo = await this.detectPythonBackend();
        if (pythonInfo) return pythonInfo;

        // Check Java
        const javaInfo = await this.detectJavaBackend();
        if (javaInfo) return javaInfo;

        // Check Go
        const goInfo = await this.detectGoBackend();
        if (goInfo) return goInfo;

        // Check PHP
        const phpInfo = await this.detectPhpBackend();
        if (phpInfo) return phpInfo;

        // Check .NET
        const dotnetInfo = await this.detectDotnetBackend();
        if (dotnetInfo) return dotnetInfo;

        // Check Rust
        const rustInfo = await this.detectRustBackend();
        if (rustInfo) return rustInfo;

        return null;
    }

    private async detectNodejsBackend(): Promise<any> {
        const packageJsonPath = path.join(this.workspacePath, 'package.json');
        
        if (await this.fileExists(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(await this.readFile(packageJsonPath));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

                // Check if it's a backend project (has express, koa, fastify, etc. but no React)
                const hasBackendFramework = dependencies.express || dependencies.koa || dependencies.fastify || 
                                          dependencies['@nestjs/core'] || dependencies.hapi || dependencies.restify;
                const hasFrontendFramework = dependencies.react || dependencies['react-dom'] || 
                                           dependencies.vue || dependencies['@vue/cli-service'] ||
                                           dependencies['@angular/core'] || dependencies['@angular/cli'];

                if (hasBackendFramework && !hasFrontendFramework) {
                    return { type: 'nodejs', port: 3000, packageJson };
                }
            } catch (error) {
                console.error('Error parsing package.json:', error);
            }
        }

        return null;
    }

    private async detectPythonBackend(): Promise<any> {
        const requirementsPath = path.join(this.workspacePath, 'requirements.txt');
        
        if (await this.fileExists(requirementsPath)) {
            try {
                const requirementsContent = await this.readFile(requirementsPath);
                const requirements = requirementsContent.split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#'));

                // Check for common Python web frameworks
                const hasWebFramework = requirements.some(req => 
                    req.includes('flask') || req.includes('django') || req.includes('fastapi') ||
                    req.includes('tornado') || req.includes('bottle') || req.includes('pyramid')
                );

                if (hasWebFramework) {
                    return { type: 'python', port: 5000, requirementsTxt: requirements };
                }
            } catch (error) {
                console.error('Error reading requirements.txt:', error);
            }
        }

        return null;
    }

    private async detectJavaBackend(): Promise<any> {
        const pomXmlPath = path.join(this.workspacePath, 'pom.xml');
        
        if (await this.fileExists(pomXmlPath)) {
            try {
                const pomXmlContent = await this.readFile(pomXmlPath);
                
                // Simple check for Spring Boot or other web frameworks
                if (pomXmlContent.includes('spring-boot') || 
                    pomXmlContent.includes('spring-web') || 
                    pomXmlContent.includes('servlet-api')) {
                    return { type: 'java', port: 8080, pomXml: pomXmlContent };
                }
            } catch (error) {
                console.error('Error reading pom.xml:', error);
            }
        }

        return null;
    }

    private async detectGoBackend(): Promise<any> {
        const goModPath = path.join(this.workspacePath, 'go.mod');
        
        if (await this.fileExists(goModPath)) {
            try {
                const goModContent = await this.readFile(goModPath);
                
                // Check for common Go web frameworks
                if (goModContent.includes('gin-gonic/gin') || 
                    goModContent.includes('gorilla/mux') || 
                    goModContent.includes('echo') ||
                    goModContent.includes('fiber')) {
                    return { type: 'go', port: 8080, goMod: goModContent };
                }
            } catch (error) {
                console.error('Error reading go.mod:', error);
            }
        }

        return null;
    }

    private async detectPhpBackend(): Promise<any> {
        const composerJsonPath = path.join(this.workspacePath, 'composer.json');
        
        if (await this.fileExists(composerJsonPath)) {
            try {
                const composerJson = JSON.parse(await this.readFile(composerJsonPath));
                const require = { ...composerJson.require, ...composerJson['require-dev'] };

                // Check for common PHP frameworks
                if (require.laravel || require.symfony || require['slim/slim'] || 
                    require['silex/silex'] || require['zendframework/zend-mvc']) {
                    return { type: 'php', port: 8000, composerJson };
                }
            } catch (error) {
                console.error('Error parsing composer.json:', error);
            }
        }

        return null;
    }

    private async detectDotnetBackend(): Promise<any> {
        const csprojFiles = await this.findFiles('*.csproj');
        
        if (csprojFiles.length > 0) {
            try {
                const csprojContent = await this.readFile(csprojFiles[0]);
                
                // Check for ASP.NET Core
                if (csprojContent.includes('Microsoft.AspNetCore') || 
                    csprojContent.includes('Microsoft.NET.Sdk.Web')) {
                    return { type: 'dotnet', port: 5000, csprojFiles };
                }
            } catch (error) {
                console.error('Error reading .csproj file:', error);
            }
        }

        return null;
    }

    private async detectRustBackend(): Promise<any> {
        const cargoTomlPath = path.join(this.workspacePath, 'Cargo.toml');
        
        if (await this.fileExists(cargoTomlPath)) {
            try {
                const cargoTomlContent = await this.readFile(cargoTomlPath);
                
                // Check for common Rust web frameworks
                if (cargoTomlContent.includes('actix-web') || 
                    cargoTomlContent.includes('rocket') || 
                    cargoTomlContent.includes('warp') ||
                    cargoTomlContent.includes('axum')) {
                    return { type: 'rust', port: 8080, cargoToml: cargoTomlContent };
                }
            } catch (error) {
                console.error('Error reading Cargo.toml:', error);
            }
        }

        return null;
    }

    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    private async readFile(filePath: string): Promise<string> {
        return await fs.promises.readFile(filePath, 'utf-8');
    }

    private async detectDatabase(): Promise<{ type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite' } | null> {
        // Check for database dependencies in package.json
        const packageJsonPath = path.join(this.workspacePath, 'package.json');
        if (await this.fileExists(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(await this.readFile(packageJsonPath));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

                // Check for database drivers
                if (dependencies.pg || dependencies['pg-native'] || dependencies['postgres']) {
                    return { type: 'postgresql' };
                } else if (dependencies.mysql || dependencies['mysql2']) {
                    return { type: 'mysql' };
                } else if (dependencies.mongodb || dependencies.mongoose) {
                    return { type: 'mongodb' };
                } else if (dependencies.redis || dependencies['ioredis']) {
                    return { type: 'redis' };
                } else if (dependencies.sqlite3 || dependencies['better-sqlite3']) {
                    return { type: 'sqlite' };
                }
            } catch (error) {
                console.error('Error parsing package.json for database detection:', error);
            }
        }

        // Check for database dependencies in requirements.txt
        const requirementsPath = path.join(this.workspacePath, 'requirements.txt');
        if (await this.fileExists(requirementsPath)) {
            try {
                const requirementsContent = await this.readFile(requirementsPath);
                const requirements = requirementsContent.split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#'));

                if (requirements.some(req => req.includes('psycopg2') || req.includes('postgresql'))) {
                    return { type: 'postgresql' };
                } else if (requirements.some(req => req.includes('mysql') || req.includes('pymysql'))) {
                    return { type: 'mysql' };
                } else if (requirements.some(req => req.includes('pymongo') || req.includes('mongoengine'))) {
                    return { type: 'mongodb' };
                } else if (requirements.some(req => req.includes('redis') || req.includes('redis-py'))) {
                    return { type: 'redis' };
                } else if (requirements.some(req => req.includes('sqlite') || req.includes('sqlite3'))) {
                    return { type: 'sqlite' };
                }
            } catch (error) {
                console.error('Error reading requirements.txt for database detection:', error);
            }
        }

        // Check for database dependencies in pom.xml
        const pomXmlPath = path.join(this.workspacePath, 'pom.xml');
        if (await this.fileExists(pomXmlPath)) {
            try {
                const pomXmlContent = await this.readFile(pomXmlPath);
                
                if (pomXmlContent.includes('postgresql') || pomXmlContent.includes('postgres')) {
                    return { type: 'postgresql' };
                } else if (pomXmlContent.includes('mysql')) {
                    return { type: 'mysql' };
                } else if (pomXmlContent.includes('mongodb')) {
                    return { type: 'mongodb' };
                } else if (pomXmlContent.includes('redis')) {
                    return { type: 'redis' };
                } else if (pomXmlContent.includes('sqlite')) {
                    return { type: 'sqlite' };
                }
            } catch (error) {
                console.error('Error reading pom.xml for database detection:', error);
            }
        }

        // Check for database dependencies in go.mod
        const goModPath = path.join(this.workspacePath, 'go.mod');
        if (await this.fileExists(goModPath)) {
            try {
                const goModContent = await this.readFile(goModPath);
                
                if (goModContent.includes('lib/pq') || goModContent.includes('postgres')) {
                    return { type: 'postgresql' };
                } else if (goModContent.includes('mysql')) {
                    return { type: 'mysql' };
                } else if (goModContent.includes('mongo')) {
                    return { type: 'mongodb' };
                } else if (goModContent.includes('redis')) {
                    return { type: 'redis' };
                } else if (goModContent.includes('sqlite')) {
                    return { type: 'sqlite' };
                }
            } catch (error) {
                console.error('Error reading go.mod for database detection:', error);
            }
        }

        // Check for database dependencies in composer.json
        const composerJsonPath = path.join(this.workspacePath, 'composer.json');
        if (await this.fileExists(composerJsonPath)) {
            try {
                const composerJson = JSON.parse(await this.readFile(composerJsonPath));
                const require = { ...composerJson.require, ...composerJson['require-dev'] };

                if (require['doctrine/dbal'] || require['postgresql']) {
                    return { type: 'postgresql' };
                } else if (require['mysql'] || require['mysqli']) {
                    return { type: 'mysql' };
                } else if (require['mongodb']) {
                    return { type: 'mongodb' };
                } else if (require['redis']) {
                    return { type: 'redis' };
                } else if (require['sqlite']) {
                    return { type: 'sqlite' };
                }
            } catch (error) {
                console.error('Error parsing composer.json for database detection:', error);
            }
        }

        // Check for database dependencies in Cargo.toml
        const cargoTomlPath = path.join(this.workspacePath, 'Cargo.toml');
        if (await this.fileExists(cargoTomlPath)) {
            try {
                const cargoTomlContent = await this.readFile(cargoTomlPath);
                
                if (cargoTomlContent.includes('postgres') || cargoTomlContent.includes('tokio-postgres')) {
                    return { type: 'postgresql' };
                } else if (cargoTomlContent.includes('mysql')) {
                    return { type: 'mysql' };
                } else if (cargoTomlContent.includes('mongodb')) {
                    return { type: 'mongodb' };
                } else if (cargoTomlContent.includes('redis')) {
                    return { type: 'redis' };
                } else if (cargoTomlContent.includes('rusqlite')) {
                    return { type: 'sqlite' };
                }
            } catch (error) {
                console.error('Error reading Cargo.toml for database detection:', error);
            }
        }

        return null;
    }

    private async findFiles(pattern: string): Promise<string[]> {
        const files: string[] = [];
        
        const findFilesRecursive = async (dir: string): Promise<void> => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        await findFilesRecursive(fullPath);
                    } else if (entry.isFile() && entry.name.match(pattern)) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                console.error(`Error reading directory ${dir}:`, error);
            }
        };

        await findFilesRecursive(this.workspacePath);
        return files;
    }
} 