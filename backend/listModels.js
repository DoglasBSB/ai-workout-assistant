require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });

    // lista todos os modelos disponíveis
    const models = await genAI.listAvailableModels();

    console.log("\n=== Modelos disponíveis na sua API Key ===\n");
    models.forEach((m) => {
      console.log(`- ${m.name} | Suporta generateContent: ${m.supportedMethods.includes("generateContent")}`);
    });
    console.log("\n==========================================\n");
  } catch (error) {
    console.error("Erro ao listar modelos:", error);
  }
}

listModels();
