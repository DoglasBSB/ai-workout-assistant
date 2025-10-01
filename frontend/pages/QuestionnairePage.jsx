import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function QuestionnairePage() {
  const navigate = useNavigate();
  const [objective, setObjective] = useState('');
  const [level, setLevel] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [restrictions, setRestrictions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEquipmentChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAvailableEquipment([...availableEquipment, value]);
    } else {
      setAvailableEquipment(availableEquipment.filter((item) => item !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/workouts/profile', {
        objective,
        level,
        availableEquipment: availableEquipment.join(','),
        restrictions,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setError('Erro ao salvar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">Seu Perfil de Treino</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="objective">
              Qual é o seu principal objetivo?
            </label>
            <select
              id="objective"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              <option value="hipertrofia">Hipertrofia (Ganho de Massa Muscular)</option>
              <option value="perda_de_peso">Perda de Peso (Emagrecimento)</option>
              <option value="condicionamento">Condicionamento Físico Geral</option>
              <option value="forca">Aumento de Força</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="level">
              Qual o seu nível de experiência?
            </label>
            <select
              id="level"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Equipamentos disponíveis:</label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  value="halteres"
                  onChange={handleEquipmentChange}
                />
                <span className="ml-2">Halteres</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  value="barra"
                  onChange={handleEquipmentChange}
                />
                <span className="ml-2">Barra</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  value="bandas_resistencia"
                  onChange={handleEquipmentChange}
                />
                <span className="ml-2">Bandas de Resistência</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  value="maquinas_academia"
                  onChange={handleEquipmentChange}
                />
                <span className="ml-2">Máquinas de Academia</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  value="peso_corporal"
                  onChange={handleEquipmentChange}
                />
                <span className="ml-2">Peso Corporal</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  value="nenhum"
                  onChange={handleEquipmentChange}
                />
                <span className="ml-2">Nenhum</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="restrictions">
              Restrições ou observações (lesões, limitações, etc.)
            </label>
            <textarea
              id="restrictions"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ex: Dor no joelho, não posso fazer agachamento profundo."
              rows="4"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
            ></textarea>
          </div>

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Perfil e Gerar Treino'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionnairePage;
