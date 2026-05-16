import dotenv from 'dotenv';
dotenv.config();

async function list() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error(e.message);
  }
}
list();
