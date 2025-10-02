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
router.post("/profile", saveProfile);

// Histórico de treinos
router.get("/history", getWorkoutHistory);
router.post("/:id/history", updateWorkoutHistory);

// Treinos
router.post("/generate", generateWorkout);
router.get("/", getWorkouts);
router.get("/:id", getWorkoutById);
router.post("/:id/save", saveWorkout);

module.exports = router;
