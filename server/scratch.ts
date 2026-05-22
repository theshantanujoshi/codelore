import { GitService } from './src/GitService.js';
import path from 'path';

async function test() {
  const gitService = new GitService(path.join(process.cwd(), 'data', 'repos'));
  try {
    await gitService.clone('https://github.com/sparshsharma-dev/manshverse-web');
    console.log('Clone successful');
  } catch (e: any) {
    console.error('Clone failed:', e.message);
  }
}

test();
