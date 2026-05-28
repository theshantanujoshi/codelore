import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

const locks = new Map<string, Promise<string>>();

export class GitService {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async clone(url: string): Promise<string> {
    const githubRegex = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?\/?$/;
    const match = url.match(githubRegex);
    if (!match) {
      throw new Error("Invalid URL: Only public github.com repositories are supported.");
    }

    const owner = match[1];
    const repo = match[2];

    try {
      const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.size > 50000) {
          throw new Error(`Repository too large (${Math.round(data.size / 1024)}MB). Maximum size is 50MB.`);
        }
      }
    } catch (err: any) {
      if (err.message.includes('too large')) throw err;
      // Ignore network errors, isomorphic-git will fail later anyway if repo doesn't exist
    }

    const hash = Buffer.from(`${owner}/${repo}`).toString('hex');
    const repoName = hash.slice(-12) + hash.slice(0, 8);
    const dir = path.join(this.baseDir, repoName);

    if (locks.has(dir)) {
      return locks.get(dir)!;
    }

    const clonePromise = (async () => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }

      await git.clone({
        fs,
        http,
        dir,
        url,
        singleBranch: true,
        depth: 1,
      });

      return dir;
    })();

    locks.set(dir, clonePromise);

    try {
      return await clonePromise;
    } finally {
      locks.delete(dir);
    }
  }
}
