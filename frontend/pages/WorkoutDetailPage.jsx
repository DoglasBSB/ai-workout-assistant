import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

function WorkoutDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNewWorkout, setIsNewWorkout] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (location.state && location.state.newWorkout) {
        setWorkout(location.state.newWorkout);
        setIsNewWorkout(true);
        setLoading(false);
      } else if (id) {
        try {
          const response = await api.get(`/workouts/${id}`);
          setWorkout(response.data.workout.workoutData);
        } catch (err) {
          console.error('Erro ao buscar detalhes do treino:', err);
          setError('Não foi possível carregar os detalhes do treino.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchWorkout();
  }, [id, location.state]);

  const handleSaveNewWorkout = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/workouts/${id}/save`, { workout });
      alert('Treino salvo com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao salvar novo treino:', err);
      setError('Não foi possível salvar o treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkout = async () => {
    setLoading(true);
    setError('');
    try {
      // Em uma aplicação real, você coletaria feedback e notas do usuário aqui
      await api.post(`/workouts/${id}/history`, { workoutId: id, feedback: 'ideal', notes: 'Treino concluído com sucesso.' });
      alert('Treino registrado no histórico!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao registrar treino:', err);
      setError('Não foi possível registrar o treino no histórico. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!workout) {
    return <div className="min-h-screen flex items-center justify-center">Treino não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6">Detalhes do Treino</h2>

        {isNewWorkout && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">Novo Treino Gerado!</p>
            <p>Este treino foi gerado pela IA. Revise-o e clique em 'Salvar Treino' para adicioná-lo ao seu histórico.</p>
            <button
              onClick={handleSaveNewWorkout}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Treino'}
            </button>
          </div>
        )}

        {workout.workout && workout.workout.map((dayWorkout, index) => (
          <div key={index} className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-2xl font-semibold mb-4">Dia {index + 1}: {dayWorkout.focus}</h3>
            <ul className="space-y-4">
              {dayWorkout.exercises.map((exercise, exIndex) => (
                <li key={exIndex} className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-bold text-lg">{exercise.name}</p>
                  <p>Séries: {exercise.sets}</p>
                  <p>Repetições: {exercise.reps}</p>
                  <p>Descanso: {exercise.rest}</p>
                  {exercise.tips && <p className="text-sm text-gray-600">Dicas: {exercise.tips}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {!isNewWorkout && (
          <button
            onClick={handleCompleteWorkout}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-6"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Marcar como Concluído'}
          </button>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-6"
        >
          Voltar para o Dashboard
        </button>
      </div>
    </div>
  );
}

export default WorkoutDetailPage;
