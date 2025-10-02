// File: backend/src/controllers/workoutController.js

const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require("@google/generative-ai"); 

const prisma = new PrismaClient();

// Função auxiliar para gerar o prompt para a IA
const generatePrompt = (profile) => {
  const { objective, level, availableEquipment, restrictions } = profile;
  return `Gere um plano de treino personalizado para um indivíduo com os seguintes dados:
  - Objetivo: ${objective}
  - Nível: ${level}
  - Equipamentos disponíveis: ${availableEquipment.join(", ") || "Nenhum"}
  - Restrições: ${restrictions || "Nenhuma"}

  O treino deve ser detalhado, incluindo exercícios, séries, repetições, tempo de descanso e dicas de execução. Formate a resposta como um objeto JSON válido, sem nenhum texto ou formatação extra como 
  . O objeto deve ter uma chave 'workout' que contém um array de objetos, onde cada objeto representa um dia de treino e inclui 'day', 'focus' e 'exercises' (um array de objetos com 'name', 'sets', 'reps', 'rest' e 'tips').
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

exports.saveProfile = async (req, res) => {
  const userId = req.user;
  const { objective, level, availableEquipment, restrictions } = req.body;

  try {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        objective,
        level,
        availableEquipment,
        restrictions,
      },
      create: {
        userId,
        objective,
        level,
        availableEquipment,
        restrictions,
      },
    });
    res.status(200).json({ message: "Perfil salvo com sucesso!", profile });
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    res.status(500).json({ message: "Erro ao salvar o perfil." });
  }
};

exports.generateWorkout = async (req, res) => {
  const userId = req.user; 

  try {
    // --- INÍCIO DAS CORREÇÕES ---
    // CORREÇÃO 1: Usa a classe importada e passa a API Key diretamente como string.
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    // --- FIM DAS CORREÇÕES ---

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ message: "Perfil do usuário não encontrado. Por favor, complete seu perfil primeiro." });
    }

    const prompt = generatePrompt(profile);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-09-2025" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extrai a parte do JSON da resposta de texto
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    const jsonText = text.substring(startIndex, endIndex + 1);
    
    const workoutData = JSON.parse(jsonText);
    res.status(200).json(workoutData);

  } catch (error) {
    console.error("Erro ao gerar treino com Gemini:", error);
    res.status(500).json({ message: "Erro ao gerar treino personalizado." });
  }
};

/* exports.saveWorkout = async (req, res) => {
  const userId = req.user;
  const { workout } = req.body; 

  try {
    const savedWorkout = await prisma.workout.create({
      data: {
        userId,
        workoutData: workout,
      },
    });
    res.status(201).json({ message: "Treino salvo com sucesso!", workout: savedWorkout });
  } catch (error) {
    console.error("Erro ao salvar treino:", error);
    res.status(500).json({ message: "Erro ao salvar o treino." });
  }
}; */

exports.saveWorkout = async (req, res) => {
  const userId = req.user;
  const { workout, workoutId } = req.body; // workoutId é opcional

  try {
    let savedWorkout;

    if (workoutId) {
      // Se houver workoutId, podemos criar uma cópia ou atualizar (aqui vamos criar uma cópia)
      const existingWorkout = await prisma.workout.findUnique({
        where: { id: workoutId }
      });

      if (!existingWorkout) {
        return res.status(404).json({ message: "Treino original não encontrado." });
      }

      savedWorkout = await prisma.workout.create({
        data: {
          userId,
          workoutData: workout
        }
      });
    } else {
      // Novo treino gerado pela IA
      savedWorkout = await prisma.workout.create({
        data: {
          userId,
          workoutData: workout
        }
      });
    }

    res.status(201).json({ message: "Treino salvo com sucesso!", workout: savedWorkout });

  } catch (error) {
    console.error("Erro ao salvar treino:", error);
    res.status(500).json({ message: "Erro ao salvar o treino." });
  }
};

exports.getWorkouts = async (req, res) => {
  const userId = req.user;

  try {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ workouts });
  } catch (error) {
    console.error("Erro ao buscar treinos:", error);
    res.status(500).json({ message: "Erro ao buscar treinos." });
  }
};

exports.getWorkoutById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user;

  try {
    const workout = await prisma.workout.findUnique({
      where: { id, userId },
    });

    if (!workout) {
      return res.status(404).json({ message: "Treino não encontrado." });
    }
    res.status(200).json({ workout });
  } catch (error) {
    console.error("Erro ao buscar treino por ID:", error);
    res.status(500).json({ message: "Erro ao buscar treino por ID." });
  }
};

exports.updateWorkoutHistory = async (req, res) => {
  const userId = req.user;
  const { id: workoutId } = req.params; // Correção: Obter ID da rota
  const { feedback, notes } = req.body;

  try {
    // 1. Verificar se o treino existe e pertence ao usuário
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId, userId },
    });

    if (!workout) {
      return res.status(404).json({ message: "Treino não encontrado." });
    }

    // 2. Criar a entrada no histórico
    const historyEntry = await prisma.history.create({
      data: {
        workoutId, // Usar o ID verificado
        userId,
        feedback,
        notes,
        completedAt: new Date(),
      },
    });
    res.status(201).json({ message: "Histórico de treino atualizado com sucesso!", historyEntry });
  } catch (error) {
    console.error("Erro ao atualizar histórico de treino:", error);
    res.status(500).json({ message: "Erro ao atualizar histórico de treino." });
  }
};

exports.getWorkoutHistory = async (req, res) => {
  const userId = req.user;

  try {
    const history = await prisma.history.findMany({
      where: { userId },
      include: { workout: true },
      orderBy: { completedAt: "desc" },
    });
    res.status(200).json({ history });
  } catch (error) {
    console.error("Erro ao buscar histórico de treinos:", error);
    res.status(500).json({ message: "Erro ao buscar histórico de treinos." });
  }
};