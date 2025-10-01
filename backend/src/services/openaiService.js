const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateWorkoutPrompt = (profile) => {
  const { objective, level, availableEquipment, restrictions } = profile;
  return `Gere um plano de treino personalizado para um indivíduo com os seguintes dados:
  - Objetivo: ${objective}
  - Nível: ${level}
  - Equipamentos disponíveis: ${availableEquipment.join(", ") || "Nenhum"}
  - Restrições: ${restrictions || "Nenhuma"}

  O treino deve ser detalhado, incluindo exercícios, séries, repetições, tempo de descanso e dicas de execução. Formate a resposta como um objeto JSON, com uma chave 'workout' que contém um array de objetos, onde cada objeto representa um dia de treino e inclui 'day', 'focus' e 'exercises' (um array de objetos com 'name', 'sets', 'reps', 'rest' e 'tips').
  Exemplo de formato:
  {
    "workout": [
      {
        "day": "Dia 1",
        "focus": "Peito e Tríceps",
        "exercises": [
          {
            "name": "Supino Reto com Barra",
            "sets": "3-4",
            "reps": "8-12",
            "rest": "60-90s",
            "tips": "Mantenha a barra na linha do meio do peito."
          }
        ]
      }
    ]
  }
  `;
};

exports.generateWorkoutWithAI = async (profile) => {
  const prompt = generateWorkoutPrompt(profile);
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Ou outro modelo disponível, como "gpt-3.5-turbo"
      messages: [{
        role: "user",
        content: prompt
      }],
      response_format: { type: "json_object" },
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Erro na API da OpenAI:", error);
    throw new Error("Não foi possível gerar o treino com IA.");
  }
};
