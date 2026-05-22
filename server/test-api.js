import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log('Key starts with:', key?.substring(0, 8));
  
  const genAI = new GoogleGenerativeAI(key || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  try {
    const result = await model.generateContent('Say hello world in valid JSON { "msg": "hello world" }');
    console.log('Result:', result.response.text());
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
