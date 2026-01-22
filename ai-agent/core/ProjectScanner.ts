/**
 * Project Scanner
 * Recursively scans the project directory and builds a comprehensive file tree
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  size?: number;
  children?: FileNode[];
  metadata?: {
    lines?: number;
    imports?: string[];
    exports?: string[];
  };
}

export interface ScanOptions {
  maxDepth?: number;
  ignorePatterns?: string[];
  includeExtensions?: string[];
  excludeExtensions?: string[];
}

export class ProjectScanner {
  private readonly defaultIgnorePatterns = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    'coverage',
    '.cache',
    '.turbo',
    '.vercel'
  ];

  async scanProject(rootPath: string, options: ScanOptions = {}): Promise<FileNode> {
    const {
      maxDepth = 10,
      ignorePatterns = [],
      includeExtensions,
      excludeExtensions = []
    } = options;

    const allIgnorePatterns = [...this.defaultIgnorePatterns, ...ignorePatterns];

    return this.scanDirectory(rootPath, rootPath, 0, maxDepth, allIgnorePatterns, includeExtensions, excludeExtensions);
  }

  private async scanDirectory(
    rootPath: string,
    currentPath: string,
    depth: number,
    maxDepth: number,
    ignorePatterns: string[],
    includeExtensions?: string[],
    excludeExtensions?: string[]
  ): Promise<FileNode> {
    const stats = await fs.stat(currentPath);
    const name = path.basename(currentPath);
    const relativePath = path.relative(rootPath, currentPath);

    if (stats.isFile()) {
      const extension = path.extname(name);
      
      // Check extension filters
      if (includeExtensions && !includeExtensions.includes(extension)) {
        return null as any;
      }
      if (excludeExtensions.includes(extension)) {
        return null as any;
      }

      return {
        name,
        path: relativePath || name,
        type: 'file',
        extension,
        size: stats.size
      };
    }

    // Check if directory should be ignored
    if (ignorePatterns.some(pattern => name === pattern || relativePath.includes(pattern))) {
      return null as any;
    }

    // Check depth limit
    if (depth >= maxDepth) {
      return {
        name,
        path: relativePath || name,
        type: 'directory',
        children: []
      };
    }

    const entries = await fs.readdir(currentPath);
    const children: FileNode[] = [];

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry);
      try {
        const node = await this.scanDirectory(
          rootPath,
          entryPath,
          depth + 1,
          maxDepth,
          ignorePatterns,
          includeExtensions,
          excludeExtensions
        );
        if (node) {
          children.push(node);
        }
      } catch (error) {
        console.warn(`Error scanning ${entryPath}:`, error);
      }
    }

    return {
      name,
      path: relativePath || name,
      type: 'directory',
      children: children.sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
    };
  }

  async getFilesByExtension(root: FileNode, extension: string): Promise<FileNode[]> {
    const files: FileNode[] = [];

    const traverse = (node: FileNode) => {
      if (node.type === 'file' && node.extension === extension) {
        files.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(root);
    return files;
  }

  async getFilesByPattern(root: FileNode, pattern: RegExp): Promise<FileNode[]> {
    const files: FileNode[] = [];

    const traverse = (node: FileNode) => {
      if (node.type === 'file' && pattern.test(node.name)) {
        files.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(root);
    return files;
  }

  generateTreeString(root: FileNode, indent = ''): string {
    let result = `${indent}${root.name}\n`;

    if (root.children) {
      root.children.forEach((child, index) => {
        const isLast = index === root.children!.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        const childIndent = indent + (isLast ? '    ' : '│   ');
        result += `${indent}${prefix}${child.name}\n`;
        if (child.children) {
          result += this.generateTreeString(child, childIndent).split('\n').slice(1).join('\n');
        }
      });
    }

    return result;
  }

  async calculateStatistics(root: FileNode): Promise<{
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    filesByExtension: Record<string, number>;
  }> {
    let totalFiles = 0;
    let totalDirectories = 0;
    let totalSize = 0;
    const filesByExtension: Record<string, number> = {};

    const traverse = (node: FileNode) => {
      if (node.type === 'file') {
        totalFiles++;
        totalSize += node.size || 0;
        const ext = node.extension || 'no-extension';
        filesByExtension[ext] = (filesByExtension[ext] || 0) + 1;
      } else {
        totalDirectories++;
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(root);

    return {
      totalFiles,
      totalDirectories,
      totalSize,
      filesByExtension
    };
  }
}
