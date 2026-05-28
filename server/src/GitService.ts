import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

export class GitService {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async clone(url: string): Promise<string> {
    const hash = Buffer.from(url).toString('hex');
    const repoName = hash.slice(-12) + hash.slice(0, 8);
    const dir = path.join(this.baseDir, repoName);

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
  }
}
