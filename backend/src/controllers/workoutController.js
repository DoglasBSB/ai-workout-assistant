const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const prisma = new PrismaClient();

// Função auxiliar para gerar o prompt para o modelo de IA
function generatePrompt(profile) {
  return `
Crie um plano de treino de musculação personalizado para um indivíduo com as seguintes características:
- Objetivo: ${profile.objective}
- Nível: ${profile.level}
- Equipamentos disponíveis: ${profile.availableEquipment.join(", ")}
- Restrições: ${profile.restrictions || "Nenhuma"}

O plano de treino deve ser dividido em treinos para 3 a 5 dias da semana (ex: Treino A, Treino B, Treino C).
Para cada dia de treino, liste os exercícios, o número de séries e repetições.
Foque em uma progressão lógica e segura, adequada ao nível de experiência do usuário.
Inclua uma breve explicação sobre a importância da periodização e da sobrecarga progressiva.
O resultado deve ser um JSON estruturado.
`;
}

// Salva ou atualiza o perfil do usuário
exports.saveProfile = async (req, res) => {
  const userId = req.user;
  const { objective, level, availableEquipment, restrictions } = req.body;

  try {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { objective, level, availableEquipment, restrictions },
      create: { userId, objective, level, availableEquipment, restrictions },
    });
    res.status(200).json(profile);
  } catch (error) {
    console.error("Erro ao salvar o perfil:", error);
    res.status(500).json({ message: "Erro ao salvar o perfil." });
  }
};

// Gera um novo treino
exports.generateWorkout = async (req, res) => {
  const userId = req.user;

  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ message: "Perfil não encontrado." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-09-2025" });
    const prompt = generatePrompt(profile);

    // Gera o conteúdo
    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();

    // Extrai o JSON do retorno (caso venha entre ```json ... ```)
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/i);
    const cleanedText = jsonMatch ? jsonMatch[1] : rawText;
    const jsonResponse = JSON.parse(cleanedText);

    // Cria o registro no Prisma
    const newWorkout = await prisma.workout.create({
      data: {
        userId,
        workoutData: jsonResponse, // salva o JSON completo
        workouts: {
          create: jsonResponse.workouts.map((w) => ({
            day: w.day,
            exercises: {
              create: w.exercises.map((e) => ({
                name: e.name,
                sets: e.sets,
                reps: e.reps,
              })),
            },
          })),
        },
      },
      include: {
        workouts: {
          include: {
            exercises: true,
          },
        },
      },
    });

    res.status(201).json(newWorkout);
  } catch (error) {
    console.error("Erro ao gerar treino:", error);
    res.status(500).json({ message: "Erro ao gerar treino personalizado." });
  }
};

// Busca todos os treinos de um usuário
exports.getWorkouts = async (req, res) => {
  const userId = req.user;
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: { workouts: { include: { exercises: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(workouts);
  } catch (error) {
    console.error("Erro ao buscar treinos:", error);
    res.status(500).json({ message: "Erro ao buscar treinos." });
  }
};

// Busca um treino específico pelo ID
exports.getWorkoutById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user;

  try {
    const workout = await prisma.workout.findFirst({
      where: { id, userId },
      include: {
        workouts: {
          include: { exercises: true },
        },
      },
    });

    if (!workout) {
      return res.status(404).json({ message: "Treino não encontrado." });
    }

    res.json(workout);
  } catch (error) {
    console.error("Erro ao buscar treino:", error);
    res.status(500).json({ message: "Erro ao buscar treino." });
  }
};

// Atualiza o histórico de um treino
exports.updateWorkoutHistory = async (req, res) => {
  const userId = req.user;
  const { workoutId } = req.body;

  try {
    const history = await prisma.history.create({
      data: {
        userId,
        workoutId,
        completedAt: new Date(),
      },
    });
    res.status(201).json(history);
  } catch (error) {
    console.error("Erro ao atualizar histórico:", error);
    res.status(500).json({ message: "Erro ao salvar no histórico." });
  }
};

// Busca o histórico de treinos do usuário
exports.getWorkoutHistory = async (req, res) => {
  const userId = req.user;

  try {
    const history = await prisma.history.findMany({
      where: { userId },
      include: { workout: true },
      orderBy: { completedAt: "desc" },
    });
    res.json(history);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ message: "Erro ao buscar histórico de treinos." });
  }
};

// Função placeholder para salvar um treino manualmente (implementação futura)
exports.saveWorkout = async (req, res) => {
  res.status(501).json({ message: "Funcionalidade não implementada." });
};
