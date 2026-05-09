const { GoogleGenAI } = require("@google/genai");

async function listModels() {
  require("dotenv").config();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    console.log("Fetching available models...");
    // The new SDK might have a different way to list models, let's try to find it or just try common ones
    // Actually, let's try gemini-1.5-flash-002 or gemini-1.5-flash
    const models = await ai.models.list(); 
    console.log("Models:", JSON.stringify(models, null, 2));
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();
