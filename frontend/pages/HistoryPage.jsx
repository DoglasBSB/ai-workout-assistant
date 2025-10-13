import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({}); // controla quais dias estão expandidos

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/workouts/history');
        console.log('Histórico recebido:', response.data.history);
        setHistory(response.data.history);
      } catch (err) {
        console.error('Erro ao buscar histórico:', err);
        setError('Não foi possível carregar o histórico de treinos.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleDay = (historyId, dayIndex) => {
    setExpanded(prev => ({
      ...prev,
      [`${historyId}-${dayIndex}`]: !prev[`${historyId}-${dayIndex}`]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando histórico...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        
        <h2 className="text-3xl font-bold mb-6">Histórico de Treinos</h2>
      <Link
          to="/dashboard"
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-6"
        >
          Voltar para o Dashboard
        </Link>
        {history.length === 0 ? (
          <p>Você ainda não tem treinos registrados no histórico.</p>
        ) : (
          <div className="space-y-6">
            {history.map((entry) => (
              <div key={entry.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <p className="font-bold text-lg">
                  Treino de {new Date(entry.completedAt).toLocaleDateString()}
                </p>
                <p>Feedback: {entry.feedback || 'N/A'}</p>
                <p>Notas: {entry.notes || 'N/A'}</p>

                {entry.workout && entry.workout.workoutData?.workout ? (
                  <div className="mt-2">
                    <p className="font-semibold">Resumo do Treino:</p>
                    {entry.workout.workoutData.workout.map((day, dayIndex) => (
                      <div key={dayIndex} className="mt-2 border rounded p-2 bg-gray-100">
                        <button
                          onClick={() => toggleDay(entry.id, dayIndex)}
                          className="w-full text-left font-medium flex justify-between items-center"
                        >
                          <span>{day.day} - {day.focus}</span>
                          <span>{expanded[`${entry.id}-${dayIndex}`] ? '-' : '+'}</span>
                        </button>
                        {expanded[`${entry.id}-${dayIndex}`] && (
                          <ul className="list-disc list-inside mt-2 text-sm">
                            {day.exercises.map((ex, i) => (
                              <li key={i}>
                                {ex.name} ({ex.sets}x{ex.reps}) - Descanso: {ex.rest} - Dica: {ex.tips}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mt-1">Treino não disponível</p>
                )}

                <Link
                  to={`/workout/${entry.workout?.id}`}
                  className="text-blue-500 hover:underline text-sm mt-2 block"
                >
                  Ver Detalhes do Treino
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;