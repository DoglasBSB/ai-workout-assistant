import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await api.get('/workouts');
        setWorkouts(response.data.workouts);
      } catch (err) {
        console.error('Erro ao buscar treinos:', err);
        setError('Não foi possível carregar seus treinos.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const handleGenerateNewWorkout = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/workouts/generate');
      // A IA retorna o treino, mas ele não é salvo automaticamente. O usuário precisa salvar.
      // Por enquanto, vamos apenas redirecionar para uma página de visualização do treino gerado.
      // Em uma implementação real, você pode querer exibir o treino gerado aqui e ter um botão 'Salvar'.
      alert('Novo treino gerado! Verifique a seção de treinos para salvá-lo.');
      // Recarregar a lista de treinos para ver se o novo treino foi salvo (se a lógica de save for automática)
      // Ou redirecionar para uma página de visualização do treino recém-gerado para o usuário salvar
      navigate('/workout/new', { state: { newWorkout: response.data.workout } });
    } catch (err) {
      console.error('Erro ao gerar novo treino:', err);
      setError('Não foi possível gerar um novo treino. Verifique seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Bem-vindo, {user?.name || user?.email}!</h2>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sair
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Seus Treinos</h3>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            onClick={handleGenerateNewWorkout}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
            disabled={loading}
          >
            Gerar Novo Treino com IA
          </button>

          {workouts.length === 0 ? (
            <p>Você ainda não tem treinos salvos. Gere um novo treino para começar!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/workout/${workout.id}`)}
                >
                  <h4 className="font-bold text-lg">Treino de {new Date(workout.createdAt).toLocaleDateString()}</h4>
                  {/* Exibir um resumo do treino, se workout.workoutData tiver um campo de título ou resumo */}
                  <p className="text-gray-600">Clique para ver detalhes</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Progresso e Histórico</h3>
          <p>Funcionalidade de acompanhamento de progresso e histórico de treinos virá aqui.</p>
          <Link to="/history" className="text-blue-500 hover:underline">Ver Histórico Completo</Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
