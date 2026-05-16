import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
  try {
    console.log("Fetching models...");
    // The correct way to list models is via the GenerativeLanguageClient or similar, 
    // but the simple SDK doesn't always have it.
    // Let's try to hit a generic endpoint or check the models property.
    
    // Actually, let's try gemini-1.5-flash-8b-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b-latest" });
    const result = await model.generateContent("hello");
    console.log("Success with flash-8b-latest:", result.response.text());
  } catch (e: any) {
    console.error("Error with flash-8b-latest:", e.message);
    
    try {
      console.log("Trying gemini-1.5-pro-latest...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const result = await model.generateContent("hello");
      console.log("Success with pro-latest:", result.response.text());
    } catch (e2: any) {
      console.error("Error with pro-latest:", e2.message);
    }
  }
}
list();
