// Este arquivo pode ser usado para encapsular a lógica de autenticação
// Atualmente, a lógica de registro e login está diretamente no authController.js
// Mas para um projeto maior, seria bom ter um serviço separado para isso.

// Exemplo de como poderia ser:
// const { PrismaClient } = require("@prisma/client");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET;

// exports.registerUser = async (email, password, name) => {
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = await prisma.user.create({
//     data: {
//       email,
//       password: hashedPassword,
//       name,
//     },
//   });
//   const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
//   return { user, token };
// };

// exports.loginUser = async (email, password) => {
//   const user = await prisma.user.findUnique({ where: { email } });
//   if (!user) throw new Error("Credenciais inválidas.");

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) throw new Error("Credenciais inválidas.");

//   const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
//   return { user, token };
// };
