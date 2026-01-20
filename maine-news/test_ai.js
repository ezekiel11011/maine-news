const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log("Key found:", key ? "YES (starts with " + key.substring(0, 5) + "...)" : "NO");

    if (!key) return;

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello, can you hear me? Respond with 'YES' if you can.");
        const response = await result.response;
        console.log("Gemini Response:", response.text());
    } catch (e) {
        console.error("Gemini Error:", e.message);
    }
}

testGemini();
