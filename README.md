# Assistente de Treinos com IA

Um aplicativo full-stack que atua como um "Assistente de Treinos com IA", projetado para gerar treinos personalizados com base nos objetivos, nível de experiência e equipamentos de cada usuário, utilizando a API Gemini do Google para a inteligência artificial.

## ✨ Funcionalidades

-   ✅ **Autenticação de Usuários:** Cadastro e login seguros com JWT (JSON Web Tokens).
-   📝 **Questionário Detalhado:** Coleta de informações essenciais do usuário (objetivo, nível, equipamentos, restrições) para criar um perfil de treino.
-   🤖 **Geração de Treino com IA:** Utiliza a API Google Gemini para criar rotinas de exercícios personalizadas e dinâmicas.
-   💾 **Gerenciamento de Treinos:** Salva os treinos gerados e permite que o usuário os acesse a qualquer momento.
-   📊 **Histórico e Acompanhamento:** Registra os treinos concluídos, permitindo que o usuário acompanhe seu progresso e adicione feedback.

## 🚀 Stack Tecnológica

| Componente              | Tecnologia                                                                   |
| ----------------------- | ---------------------------------------------------------------------------- |
| **Frontend** | React (Vite), React Router, Tailwind CSS, Shadcn/ui                                     |
| **Backend** | Node.js, Express.js                                                                      |
| **Banco de Dados** | PostgreSQL com Prisma ORM                                                         |
| **Autenticação** | JWT (JSON Web Tokens)                                                               |
| **Inteligência Artificial** | Google Generative AI (Gemini)                                            |

## 📂 Estrutura do Projeto


assistente-treinos/
├── backend/          # Código do servidor Node.js (API)
├── frontend/         # Código da aplicação React (Cliente)
└── README.md         # Este arquivo

## 🛠️ Guia de Configuração e Execução

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
-   [PostgreSQL](https://www.postgresql.org/)
-   [Git](https://git-scm.com/)
-   Uma chave de API do **Google Generative AI** ([obtenha aqui](https://aistudio.google.com/app/apikey))

---

### 1. Configuração do Backend

```bash
# 1. Navegue até o diretório do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Crie e configure o arquivo .env com base no .env.example
# Preencha com suas credenciais do banco de dados e chaves de API
cp .env.example .env

Seu arquivo .env deve conter as seguintes variáveis:

# URL de conexão do seu banco de dados PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Chave secreta para gerar os tokens JWT
JWT_SECRET="SUA_CHAVE_SECRETA_AQUI"

# Sua chave de API do Google Generative AI (Gemini)
GOOGLE_API_KEY="SUA_CHAVE_DO_GOOGLE_AI_AQUI"

# Porta em que o servidor irá rodar
PORT=3001
```
---

## 2. Configuração do Frontend

 1. Em um novo terminal, navegue até o diretório do frontend
cd frontend

 2. Instale as dependências
npm install

 3. Crie o arquivo .env para definir a URL da API
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env

 4. Inicie a aplicação de desenvolvimento
npm run dev

A aplicação frontend estará disponível em http://localhost:5173 (ou outra porta indicada no terminal).


## 📚 Documentação da API
Este projeto inclui uma documentação interativa da API gerada com Swagger (OpenAPI).

Inicie o servidor backend (npm run dev).

Acesse http://localhost:3001/api-docs no seu navegador para visualizar e testar todos os endpoints.

## 🧪 Testes
Para garantir a qualidade e a estabilidade da API, o projeto utiliza Jest e Supertest.


A partir da pasta /backend, execute o seguinte comando:
npm test
## 📄 Licença
Este projeto está licenciado sob a Licença MIT.

![Linguagem](https://img.shields.io/github/languages/top/doglasbsb/ai-workout-assistant?style=for-the-badge)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge)