import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';
import { Textarea } from '~/components/ui/textarea';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { 
  Target, 
  TrendingUp, 
  Dumbbell, 
  AlertCircle, 
  CheckCircle2,
  User,
  Activity,
  Settings
} from 'lucide-react';

function QuestionnairePage() {
  const navigate = useNavigate();
  const [objective, setObjective] = useState('');
  const [level, setLevel] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [restrictions, setRestrictions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const objectives = [
    { value: 'perda_peso', label: 'Perda de Peso', icon: '🔥' },
    { value: 'ganho_massa', label: 'Ganho de Massa Muscular', icon: '💪' },
    { value: 'resistencia', label: 'Melhora da Resistência', icon: '🏃' },
    { value: 'forca', label: 'Aumento de Força', icon: '🏋️' },
    { value: 'tonificacao', label: 'Tonificação', icon: '✨' },
    { value: 'saude_geral', label: 'Saúde Geral', icon: '❤️' }
  ];

  const levels = [
    { value: 'iniciante', label: 'Iniciante', description: 'Pouca ou nenhuma experiência com exercícios' },
    { value: 'intermediario', label: 'Intermediário', description: 'Pratica exercícios regularmente há alguns meses' },
    { value: 'avancado', label: 'Avançado', description: 'Experiência consistente há mais de 1 ano' }
  ];

  const equipmentOptions = [
    { id: 'halteres', label: 'Halteres', icon: '🏋️‍♀️' },
    { id: 'barras', label: 'Barras', icon: '🏋️‍♂️' },
    { id: 'bandas_resistencia', label: 'Bandas de Resistência', icon: '🎯' },
    { id: 'maquinas_academia', label: 'Máquinas de Academia', icon: '🏢' },
    { id: 'peso_corporal', label: 'Peso Corporal', icon: '🤸‍♀️' },
    { id: 'kettlebells', label: 'Kettlebells', icon: '⚫' },
    { id: 'medicine_ball', label: 'Medicine Ball', icon: '🏀' },
    { id: 'nenhum', label: 'Nenhum equipamento', icon: '🚫' }
  ];

  const handleEquipmentChange = (equipmentId, checked) => {
    if (checked) {
      setAvailableEquipment([...availableEquipment, equipmentId]);
    } else {
      setAvailableEquipment(availableEquipment.filter((item) => item !== equipmentId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Salva o perfil do usuário
      await api.post('/workouts/profile', {
        objective,
        level,
        availableEquipment,
        restrictions,
      });

      // 2. Gera um novo treino com base no perfil salvo
      const response = await api.post('/workouts/generate');
      
      // 3. Navega para a página de detalhes do novo treino
      navigate('/workout/new', { state: { newWorkout: response.data } });

    } catch (err) {
      console.error('Erro ao salvar perfil e gerar treino:', err);
      setError('Erro ao salvar seu perfil ou gerar o treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return objective !== '';
      case 2: return level !== '';
      case 3: return availableEquipment.length > 0;
      default: return true;
    }
  };

  const nextStep = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-600 p-3 rounded-full">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Seu Perfil de Treino
          </h1>
          <p className="text-lg text-gray-600">
            Vamos personalizar seus treinos com base nas suas necessidades
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso</span>
            <span className="text-sm font-medium text-gray-700">{currentStep}/4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Objetivo */}
          {currentStep === 1 && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Target className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Qual é o seu principal objetivo?</CardTitle>
                <CardDescription>
                  Escolha o objetivo que melhor descreve o que você quer alcançar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {objectives.map((obj) => (
                    <div
                      key={obj.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        objective === obj.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setObjective(obj.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{obj.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{obj.label}</h3>
                        </div>
                        {objective === obj.value && (
                          <CheckCircle2 className="h-5 w-5 text-purple-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Nível */}
          {currentStep === 2 && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <TrendingUp className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Qual o seu nível de experiência?</CardTitle>
                <CardDescription>
                  Isso nos ajuda a ajustar a intensidade dos seus treinos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {levels.map((lvl) => (
                    <div
                      key={lvl.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        level === lvl.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setLevel(lvl.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{lvl.label}</h3>
                          <p className="text-sm text-gray-600">{lvl.description}</p>
                        </div>
                        {level === lvl.value && (
                          <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Equipamentos */}
          {currentStep === 3 && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Dumbbell className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Equipamentos disponíveis</CardTitle>
                <CardDescription>
                  Selecione todos os equipamentos que você tem acesso (pode escolher múltiplos)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipmentOptions.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={equipment.id}
                        checked={availableEquipment.includes(equipment.id)}
                        onCheckedChange={(checked) => handleEquipmentChange(equipment.id, checked)}
                      />
                      <span className="text-xl">{equipment.icon}</span>
                      <Label htmlFor={equipment.id} className="flex-1 cursor-pointer">
                        {equipment.label}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {availableEquipment.length > 0 && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Equipamentos selecionados:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {availableEquipment.map((equipId) => {
                        const equipment = equipmentOptions.find(eq => eq.id === equipId);
                        return (
                          <Badge key={equipId} variant="secondary" className="bg-purple-100 text-purple-800">
                            {equipment?.icon} {equipment?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Restrições */}
          {currentStep === 4 && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Settings className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Restrições e observações</CardTitle>
                <CardDescription>
                  Conte-nos sobre lesões, limitações ou preferências especiais (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="restrictions" className="text-base font-medium">
                      Restrições médicas ou limitações físicas
                    </Label>
                    <Textarea
                      id="restrictions"
                      placeholder="Ex: Dor no joelho direito, não posso fazer agachamento profundo. Problemas na lombar, evitar exercícios com impacto..."
                      value={restrictions}
                      onChange={(e) => setRestrictions(e.target.value)}
                      className="mt-2 min-h-[120px]"
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Importante</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Essas informações nos ajudam a criar treinos mais seguros e adequados para você. 
                          Sempre consulte um profissional de saúde antes de iniciar um novo programa de exercícios.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-8"
            >
              Anterior
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
                className="px-8 bg-purple-600 hover:bg-purple-700"
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="px-8 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  'Salvar Perfil e Gerar Treino'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionnairePage;
