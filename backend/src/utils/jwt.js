// Este arquivo pode ser usado para encapsular funções relacionadas a JWT,
// como gerar e verificar tokens, para manter o código mais organizado.
// Atualmente, a lógica de JWT está diretamente no authController.js e authMiddleware.js.

// Exemplo de como poderia ser:
// const jwt = require("jsonwebtoken");
// const JWT_SECRET = process.env.JWT_SECRET;

// exports.generateToken = (userId) => {
//   return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
// };

// exports.verifyToken = (token) => {
//   return jwt.verify(token, JWT_SECRET);
// };
