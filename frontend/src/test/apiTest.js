import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;
const apiUrl = process.env.VITE_GEMINI_API_URL;

if (!apiKey || !apiUrl) {
  console.error("❌ Gemini API key or URL is missing from environment variables.");
  process.exit(1);
}

console.log("🔍 Gemini API Key and URL found.");