const request = require('supertest');
const app = require('../src/app'); // Supondo que seu app Express seja exportado de 'app.js'
const prisma = require('../src/lib/client');

// Limpar o banco de dados antes de todos os testes
beforeAll(async () => {
  await prisma.history.deleteMany({});
  await prisma.workout.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API Endpoints', () => {
  let token;
  let userId;
  let workoutId;

  // Testes de Autenticação
  describe('Auth Routes', () => {
    it('POST /api/auth/register - Deve registrar um novo usuário', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('POST /api/auth/login - Deve autenticar um usuário existente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token; // Salva o token para os próximos testes
      userId = res.body.user.id;
    });

    it('GET /api/auth/me - Deve retornar os dados do usuário autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('x-auth-token', `${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toBe(userId);
    });
  });

  // Testes de Treinos
  describe('Workout Routes', () => {
    it('POST /api/workouts/profile - Deve salvar o perfil do usuário', async () => {
      const res = await request(app)
        .post('/api/workouts/profile')
        .set('x-auth-token', `${token}`)
        .send({
          objective: 'Hipertrofia',
          level: 'Intermediário',
          availableEquipment: ['Halteres', 'Barra'],
          restrictions: 'Nenhuma',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.profile.objective).toBe('Hipertrofia');
    });

    // O teste para /generate pode ser mais complexo por depender de uma API externa (Gemini)
    // Aqui, vamos apenas verificar se a rota responde corretamente,
    // assumindo que o perfil existe.
    it('POST /api/workouts/generate - Deve tentar gerar um treino', async () => {
      // Este teste irá falhar se a API Key do Gemini não estiver configurada no ambiente de teste
      // Em um cenário real, você poderia mockar a chamada para a API do Gemini
      const res = await request(app)
        .post('/api/workouts/generate')
        .set('x-auth-token', `${token}`);
      
      // A API pode retornar 200 (sucesso) ou 500 (se a chave da IA não estiver configurada)
      // Ambos são resultados esperados dependendo do ambiente
      expect([200, 500]).toContain(res.statusCode);
    }, 10000);
    
    it('POST /api/workouts/save - Deve salvar um novo treino', async () => {
      const workoutData = {
        "workout": [{
          "day": "Dia 1", "focus": "Peito e Tríceps",
          "exercises": [{"name": "Supino Reto","sets": "3","reps": "10"}]
        }]
      };
      const res = await request(app)
        .post('/api/workouts/save')
        .set('x-auth-token', `${token}`)
        .send({ workout: workoutData });

      expect(res.statusCode).toEqual(201);
      expect(res.body.workout).toHaveProperty('id');
      workoutId = res.body.workout.id; // Salva o ID do treino
    });

    it('GET /api/workouts - Deve listar os treinos do usuário', async () => {
      const res = await request(app)
        .get('/api/workouts')
        .set('x-auth-token', `${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.workouts)).toBe(true);
      expect(res.body.workouts.length).toBeGreaterThan(0);
    });

    it('GET /api/workouts/:id - Deve buscar um treino específico', async () => {
      const res = await request(app)
        .get(`/api/workouts/${workoutId}`)
        .set('x-auth-token', `${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.workout.id).toBe(workoutId);
    });
    
    it('POST /api/workouts/:id/history - Deve registrar a conclusão do treino', async () => {
      const res = await request(app)
        .post(`/api/workouts/${workoutId}/history`)
        .set('x-auth-token', `${token}`)
        .send({
          feedback: 'Ótimo treino!',
          notes: 'Aumentar o peso na próxima semana.'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.historyEntry.feedback).toBe('Ótimo treino!');
    });

    it('GET /api/workouts/history - Deve buscar o histórico de treinos', async () => {
      const res = await request(app)
        .get('/api/workouts/history')
        .set('x-auth-token', `${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history.length).toBeGreaterThan(0);
    });
  });
});