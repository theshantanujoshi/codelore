import fs from 'fs';
import path from 'path';

function pLimit(concurrency: number) {
  const queue: (() => void)[] = [];
  let activeCount = 0;

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      queue.shift()!();
    }
  };

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    if (activeCount >= concurrency) {
      await new Promise<void>(resolve => queue.push(resolve));
    }
    activeCount++;
    try {
      return await fn();
    } finally {
      next();
    }
  };
}

const fsLimit = pLimit(50);

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
  size?: number;
  lines?: number;
  language?: string;
}

export interface DepInfo {
  name: string;
  version: string;
  type: 'production' | 'development';
}

export interface ArchNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'page' | 'component' | 'api' | 'util' | 'external';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArchEdge {
  from: string;
  to: string;
}

export class Analyzer {
  private dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  async getFileTree(currentDir: string = this.dir, relativePath: string = ''): Promise<FileNode[]> {
    console.log(`[analyzer]: Scanning directory: ${relativePath || '/'}`);
    const entries = await fsLimit(() => fs.promises.readdir(currentDir, { withFileTypes: true }));

    const textExtensions = new Set([
      '.ts', '.tsx', '.mts', '.cts',
      '.js', '.jsx', '.mjs', '.cjs',
      '.py', '.pyw',
      '.java', '.class',
      '.cpp', '.cc', '.cxx', '.c', '.h', '.hpp', '.hh',
      '.cs',
      '.go',
      '.rs',
      '.rb', '.rbw',
      '.php',
      '.swift',
      '.kt', '.kts',
      '.scala',
      '.sh', '.bash', '.zsh',
      '.ps1', '.psm1',
      '.sql',
      '.html', '.htm', '.xhtml',
      '.css', '.scss', '.sass', '.less',
      '.md', '.markdown', '.txt',
      '.json',
      '.yml', '.yaml',
      '.xml'
    ]);

    const nodes = await Promise.all(entries.map(async (entry) => {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next') return null;

      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      const id = relPath.replace(/\\/g, '-').replace(/\//g, '-');

      if (entry.isDirectory()) {
        return {
          id,
          name: entry.name,
          type: 'directory',
          path: relPath,
          children: await this.getFileTree(fullPath, relPath),
        } as FileNode;
      } else {
        const stats = await fsLimit(() => fs.promises.stat(fullPath));
        const ext = path.extname(entry.name).toLowerCase();
        
        const isNoExtTextFile = ['dockerfile', 'makefile', 'gemfile', 'pipfile'].includes(entry.name.toLowerCase());
        
        let lines = 0;
        if ((textExtensions.has(ext) || isNoExtTextFile) && stats.size < 1048576) {
          try {
            const content = await fsLimit(() => fs.promises.readFile(fullPath, 'utf-8'));
            lines = content.split('\n').length;
          } catch (e) {
            console.warn(`[analyzer]: Could not read file ${relPath}:`, e);
          }
        }

        return {
          id,
          name: entry.name,
          type: 'file',
          path: relPath,
          size: stats.size,
          lines: lines,
          language: this.detectLanguage(entry.name),
        } as FileNode;
      }
    }));

    return nodes.filter(Boolean) as FileNode[];
  }

  private detectLanguage(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const name = filename.toLowerCase();
    
    if (name === 'dockerfile') return 'Docker';
    if (name === 'makefile') return 'Makefile';
    if (name === 'gemfile') return 'Ruby';
    if (name === 'pipfile') return 'Python';
    
    const map: Record<string, string> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.mts': 'TypeScript',
      '.cts': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.mjs': 'JavaScript',
      '.cjs': 'JavaScript',
      '.py': 'Python',
      '.pyw': 'Python',
      '.java': 'Java',
      '.cs': 'C#',
      '.cpp': 'C++',
      '.cc': 'C++',
      '.cxx': 'C++',
      '.c': 'C',
      '.h': 'C/C++ Header',
      '.hpp': 'C/C++ Header',
      '.hh': 'C/C++ Header',
      '.go': 'Go',
      '.rs': 'Rust',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.kts': 'Kotlin',
      '.scala': 'Scala',
      '.sh': 'Shell',
      '.bash': 'Shell',
      '.zsh': 'Shell',
      '.ps1': 'PowerShell',
      '.psm1': 'PowerShell',
      '.sql': 'SQL',
      '.html': 'HTML',
      '.htm': 'HTML',
      '.xhtml': 'HTML',
      '.css': 'CSS',
      '.scss': 'CSS',
      '.sass': 'CSS',
      '.less': 'CSS',
      '.md': 'Markdown',
      '.markdown': 'Markdown',
      '.json': 'JSON',
      '.yml': 'YAML',
      '.yaml': 'YAML',
      '.xml': 'XML',
      '.txt': 'Text',
    };
    return map[ext] || 'Text';
  }

  async parseDependencies(): Promise<DepInfo[]> {
    const deps: DepInfo[] = [];
    const pkgPaths = await this.findPackageJsons(this.dir, '', 2);

    for (const pkgPath of pkgPaths) {
      try {
        const raw = await fs.promises.readFile(pkgPath, 'utf-8');
        const pkg = JSON.parse(raw);

        if (pkg.dependencies) {
          for (const [name, version] of Object.entries(pkg.dependencies)) {
            if (!deps.find(d => d.name === name)) {
              deps.push({ name, version: String(version), type: 'production' });
            }
          }
        }
        if (pkg.devDependencies) {
          for (const [name, version] of Object.entries(pkg.devDependencies)) {
            if (!deps.find(d => d.name === name)) {
              deps.push({ name, version: String(version), type: 'development' });
            }
          }
        }
      } catch (e) {
        console.warn(`[analyzer]: Could not parse ${pkgPath}:`, e);
      }
    }

    return deps;
  }

  private async findPackageJsons(dir: string, rel: string, maxDepth: number): Promise<string[]> {
    if (maxDepth <= 0) return [];
    const results: string[] = [];
    try {
      const entries = await fsLimit(() => fs.promises.readdir(dir, { withFileTypes: true }));
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
        if (entry.name === 'package.json' && entry.isFile()) {
          results.push(path.join(dir, entry.name));
        }
        if (entry.isDirectory()) {
          const children = await this.findPackageJsons(path.join(dir, entry.name), path.join(rel, entry.name), maxDepth - 1);
          results.push(...children);
        }
      }
    } catch (_) {}
    return results;
  }

  generateArchitecture(tree: FileNode[]): { nodes: ArchNode[]; edges: ArchEdge[] } {
    const nodes: ArchNode[] = [];
    const edges: ArchEdge[] = [];

    // Collect top-level directories and important files
    const topDirs = tree.filter(n => n.type === 'directory');
    const topFiles = tree.filter(n => n.type === 'file' && (n.name.endsWith('.ts') || n.name.endsWith('.js') || n.name.endsWith('.tsx') || n.name.endsWith('.jsx') || n.name.endsWith('.py')));

    const colWidth = 160;
    const maxCols = 4;
    const startX = 40;

    const typeYMap: Record<string, number> = {
      page: 55,
      component: 195,
      api: 335,
      util: 475,
      external: 475
    };

    const typeCounts: Record<string, number> = {
      page: 0,
      component: 0,
      api: 0,
      util: 0,
      external: 0
    };

    // Classify directories
    const classify = (name: string): ArchNode['type'] => {
      const n = name.toLowerCase();
      if (['pages', 'views', 'routes', 'app'].includes(n)) return 'page';
      if (['components', 'ui', 'widgets'].includes(n)) return 'component';
      if (['api', 'server', 'backend', 'routes'].includes(n)) return 'api';
      if (['lib', 'utils', 'helpers', 'services', 'hooks', 'store', 'context'].includes(n)) return 'util';
      return 'component';
    };

    // Add top-level directories as nodes
    for (const dir of topDirs) {
      const nodeType = classify(dir.name);
      const childCount = dir.children ? dir.children.length : 0;
      if (typeCounts[nodeType] >= 6) continue;

      const y = typeYMap[nodeType] || 195;
      const col = typeCounts[nodeType] || 0;
      typeCounts[nodeType] = col + 1;

      nodes.push({
        id: dir.id,
        label: dir.name,
        sublabel: `${childCount} items`,
        type: nodeType,
        x: startX + col * colWidth,
        y: y,
        width: 130,
        height: 44,
      });
    }

    // Add important root files
    for (const file of topFiles.slice(0, 4)) {
      const nodeType = 'util';
      const y = typeYMap[nodeType];
      const col = typeCounts[nodeType] || 0;
      typeCounts[nodeType] = col + 1;

      if (typeCounts[nodeType] >= 6) continue;

      nodes.push({
        id: file.id,
        label: file.name,
        sublabel: `${file.lines || 0} lines`,
        type: nodeType,
        x: startX + col * colWidth,
        y: y,
        width: 130,
        height: 44,
      });
    }

    // Generate edges between related directories
    const nodeIds = new Set(nodes.map(n => n.id));
    for (const dir of topDirs) {
      if (dir.children) {
        for (const child of dir.children) {
          if (child.type === 'directory' && nodeIds.has(child.id)) {
            edges.push({ from: dir.id, to: child.id });
          }
        }
      }
    }

    // Connect src-like dirs to server-like dirs
    const srcNode = nodes.find(n => ['src', 'app', 'frontend', 'client'].includes(n.label.toLowerCase()));
    const serverNode = nodes.find(n => ['server', 'backend', 'api'].includes(n.label.toLowerCase()));
    if (srcNode && serverNode) {
      edges.push({ from: srcNode.id, to: serverNode.id });
    }

    return { nodes, edges };
  }

  async parseReadme(): Promise<string> {
    const readmePaths = ['README.md', 'readme.md', 'README.MD', 'Readme.md'];
    for (const name of readmePaths) {
      const fullPath = path.join(this.dir, name);
      try {
        const stats = await fs.promises.stat(fullPath);
        if (stats.isFile() && stats.size < 1048576) {
          const content = await fs.promises.readFile(fullPath, 'utf-8');
          return content.slice(0, 3000); // Limit to 3000 chars
        }
      } catch (_) {}
    }
    return '';
  }

  async getMetrics(): Promise<any> {
    const tree = await this.getFileTree();
    let totalFiles = 0;
    let totalLines = 0;
    const languages: Record<string, number> = {};

    const traverse = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          const name = node.name.toLowerCase();
          const isLockFile = name.endsWith('lock.json') || 
                             name.endsWith('lock.yaml') || 
                             name === 'yarn.lock' || 
                             name === 'cargo.lock' || 
                             name === 'gemfile.lock' || 
                             name === 'pnpm-lock.yaml' ||
                             name === 'composer.lock';
          const isMinified = name.endsWith('.min.js') || name.endsWith('.min.css');
          const isMapFile = name.endsWith('.map');

          if (!isLockFile && !isMinified && !isMapFile) {
            totalFiles++;
            const lines = node.lines || 0;
            totalLines += lines;
            if (lines > 0) {
              const lang = node.language || 'Other';
              languages[lang] = (languages[lang] || 0) + lines;
            }
          }
        } else if (node.children) {
          traverse(node.children);
        }
      }
    };

    traverse(tree);

    let score = 50;
    if (totalFiles > 10) score += 10;
    if (totalFiles > 50) score += 10;
    if (totalLines > 500) score += 10;
    if (totalLines > 2000) score += 10;
    const numLanguages = Object.keys(languages).length;
    if (numLanguages > 1) score += 5;
    if (numLanguages > 3) score += 4;
    score = Math.min(score, 99);

    const dependencies = await this.parseDependencies();
    const architecture = this.generateArchitecture(tree);
    const readme = await this.parseReadme();

    return {
      totalFiles,
      totalLines,
      languages,
      tree,
      score,
      dependencies,
      architecture,
      readme,
    };
  }
}
