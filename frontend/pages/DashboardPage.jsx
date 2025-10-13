import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { 
  Dumbbell, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock, 
  User, 
  LogOut,
  Zap,
  Award,
  Activity,
  History,
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingWorkout, setGeneratingWorkout] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workoutsResponse, historyResponse] = await Promise.all([
          api.get('/workouts'),
          api.get('/workouts/history')
        ]);
        setWorkouts(workoutsResponse.data.workouts);
        setHistory(historyResponse.data.history);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Não foi possível carregar seus dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateNewWorkout = async () => {
    setGeneratingWorkout(true);
    setError('');
    try {
      const response = await api.post('/workouts/generate');
      // Navegar para a página de detalhes do treino gerado
      navigate('/workout/new', { state: { newWorkout: response.data } });
    } catch (err) {
      console.error('Erro ao gerar treino:', err);
      setError('Não foi possível gerar um novo treino. Tente novamente.');
    } finally {
      setGeneratingWorkout(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getWorkoutPreview = (workoutData) => {
    if (workoutData && workoutData.workout && workoutData.workout.length > 0) {
      const firstDay = workoutData.workout[0];
      return {
        focus: firstDay.focus || 'Treino Personalizado',
        exerciseCount: firstDay.exercises ? firstDay.exercises.length : 0,
        totalDays: workoutData.workout.length
      };
    }
    return {
      focus: 'Treino Personalizado',
      exerciseCount: 0,
      totalDays: 1
    };
  };

  const completedWorkoutsCount = new Set(history.map(h => h.workoutId)).size;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Assistente de Treinos</h1>
                <p className="text-sm text-gray-600">Bem-vindo (a), {user?.name || 'Usuário'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Treinos</p>
                  <p className="text-3xl font-bold">{workouts.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Dumbbell className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Esta Semana</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Sequência</p>
                  <p className="text-3xl font-bold">0 dias</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generate New Workout */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Gerar Novo Treino</CardTitle>
                    <CardDescription>
                      Crie um treino personalizado com Inteligência Artificial
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGenerateNewWorkout}
                  disabled={generatingWorkout}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                  size="lg"
                >
                  {generatingWorkout ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Gerando treino personalizado...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Gerar Treino com IA</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Workouts */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-xl">Seus Treinos</CardTitle>
                  </div>
                  {workouts.length > 3 && (
                    <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
                      Ver todos
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {workouts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Dumbbell className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum treino ainda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Gere seu primeiro treino personalizado para começar sua jornada fitness!
                    </p>
                    <Button 
                      onClick={handleGenerateNewWorkout}
                      disabled={generatingWorkout}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Treino
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workouts.slice(0, 3).map((workout) => {
                      const preview = getWorkoutPreview(workout.workoutData);
                      return (
                        <div
                          key={workout.id}
                          className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                          onClick={() => navigate(`/workout/${workout.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {preview.focus}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {formatDate(workout.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Target className="h-4 w-4" />
                                  <span>{preview.exerciseCount} exercícios</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{preview.totalDays} dia(s)</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Ações Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/questionnaire')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Atualizar Perfil
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/history')}
                >
                  <History className="h-4 w-4 mr-2" />
                  Ver Histórico
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2 text-orange-800">
                  <TrendingUp className="h-5 w-5" />
                  <span>Dica do Dia</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  💡 <strong>Consistência é a chave!</strong> Treinos regulares, mesmo que curtos, 
                  são mais eficazes que treinos longos esporádicos.
                </p>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2 text-green-800">
                  <Award className="h-5 w-5" />
                  <span>Seu Progresso</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Treinos Concluídos</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {completedWorkoutsCount}/{workouts.length}
                    </Badge>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${workouts.length > 0 ? (completedWorkoutsCount / workouts.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-green-600">
                    Continue assim! Cada treino te aproxima dos seus objetivos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
