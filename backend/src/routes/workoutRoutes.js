const express = require("express");
const { generateWorkout, getWorkouts, getWorkoutById, saveWorkout, updateWorkoutHistory, saveProfile, getWorkoutHistory } = require("../controllers/workoutController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // Todas as rotas abaixo exigem autenticação

router.post("/profile", saveProfile); // Nova rota para salvar/atualizar o perfil
router.post("/generate", generateWorkout);
router.get("/", getWorkouts);
router.get("/:id", getWorkoutById);
router.post("/:id/save", saveWorkout); // Para salvar um treino gerado
router.post("/:id/history", updateWorkoutHistory); // Para registrar o histórico de um treino
router.get("/history", getWorkoutHistory); // Nova rota para buscar o histórico de treinos

module.exports = router;