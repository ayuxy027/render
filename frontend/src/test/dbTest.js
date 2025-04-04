import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.VITE_MONGODB_URI;
if (!uri) {
  console.error("❌ MongoDB URI is missing from environment variables.");
  process.exit(1);
}

console.log("🔍 Connecting to MongoDB...");

(async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ MongoDB Connected Successfully!");
    await client.db().admin().ping(); // Verify connection
    await client.close();
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
})();
