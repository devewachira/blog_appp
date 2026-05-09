const { GoogleGenAI } = require("@google/genai");

async function testAI() {
  require("dotenv").config();
  
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
    console.error("Error: GEMINI_API_KEY is not set or is still the placeholder.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    console.log("Testing AI generation with model gemini-flash-latest...");
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: "Hello, this is a test. Reply with 'Success'.",
    });

    console.log("Response text:", response.text);
    console.log("AI Test: PASSED");
  } catch (error) {
    console.error("AI Test: FAILED");
    console.error("Error details:", error.message);
    if (error.response) {
      console.error("Error response:", JSON.stringify(error.response, null, 2));
    }
  }
}

testAI();
