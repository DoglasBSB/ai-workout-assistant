import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/workouts/history'); // Supondo que você tenha uma rota para histórico
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando histórico...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6">Histórico de Treinos</h2>

        {history.length === 0 ? (
          <p>Você ainda não tem treinos registrados no histórico.</p>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <p className="font-bold text-lg">Treino de {new Date(entry.completedAt).toLocaleDateString()}</p>
                <p>Feedback: {entry.feedback || 'N/A'}</p>
                <p>Notas: {entry.notes || 'N/A'}</p>
                <Link to={`/workout/${entry.workoutId}`} className="text-blue-500 hover:underline text-sm">
                  Ver Detalhes do Treino
                </Link>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/dashboard"
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-6"
        >
          Voltar para o Dashboard
        </Link>
      </div>
    </div>
  );
}

export default HistoryPage;
