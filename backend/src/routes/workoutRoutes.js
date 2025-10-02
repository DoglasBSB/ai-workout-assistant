// File: backend/src/routes/workouts.js

const express = require("express");
const {
  generateWorkout,
  getWorkouts,
  getWorkoutById,
  saveWorkout,
  updateWorkoutHistory,
  saveProfile,
  getWorkoutHistory
} = require("../controllers/workoutController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // Todas as rotas abaixo exigem autenticação

// Perfil do usuário
router.post("/profile", saveProfile); // Salvar/atualizar perfil

// Gerar treino com IA
router.post("/generate", generateWorkout);

// Histórico de treinos
router.get("/history", getWorkoutHistory); // Buscar histórico de treinos

// Treinos do usuário
router.get("/", getWorkouts);
router.get("/:id", getWorkoutById);

// Salvar treino
router.post("/save", saveWorkout); // Novo endpoint para salvar treino sem ID

// Histórico de treinos
router.post("/:id/history", updateWorkoutHistory); // Registrar histórico de um treino

module.exports = router;