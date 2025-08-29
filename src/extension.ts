import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalyzer } from './projectAnalyzer';
import { DockerGenerator } from './dockerGenerator';

export function activate(context: vscode.ExtensionContext) {
    console.log('Auto Docker extension is now active!');

    let disposable = vscode.commands.registerCommand('auto-docker.generateDockerSetup', async () => {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found. Please open a project folder.');
                return;
            }

            const workspacePath = workspaceFolder.uri.fsPath;
            
            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing project structure...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });

                // Analyze project structure
                const analyzer = new ProjectAnalyzer(workspacePath);
                const projectInfo = await analyzer.analyze();
                
                progress.report({ increment: 50, message: "Generating Docker configurations..." });

                // Generate Docker files
                const generator = new DockerGenerator(workspacePath, projectInfo);
                await generator.generate();

                progress.report({ increment: 100, message: "Docker setup complete!" });
            });

            vscode.window.showInformationMessage('Docker configuration generated successfully!');
            
            // Refresh the explorer to show new files
            await vscode.commands.executeCommand('workbench.action.files.revert');

        } catch (error) {
            console.error('Error generating Docker setup:', error);
            vscode.window.showErrorMessage(`Failed to generate Docker setup: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {} 