import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Clock, 
  Repeat, 
  Target, 
  Info,
  Save,
  Calendar,
  Dumbbell,
  Timer,
  MessageSquare,
  Star
} from 'lucide-react';

function WorkoutDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNewWorkout, setIsNewWorkout] = useState(false);
  const [completingWorkout, setCompletingWorkout] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [notes, setNotes] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (location.state && location.state.newWorkout) {
        setWorkout(location.state.newWorkout);
        setIsNewWorkout(true);
        setLoading(false);
      } else if (id && id !== 'new') {
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
      await api.post('/workouts/save', { workout });
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao salvar treino:', err);
      setError('Erro ao salvar o treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkout = async () => {
    if (!showFeedbackForm) {
      setShowFeedbackForm(true);
      return;
    }

    setCompletingWorkout(true);
    setError('');
    try {
      await api.post(`/workouts/${id}/history`, {
        workoutId: id,
        feedback,
        notes,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao registrar conclusão do treino:', err);
      setError('Erro ao registrar a conclusão do treino. Tente novamente.');
    } finally {
      setCompletingWorkout(false);
    }
  };

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'fácil':
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'médio':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'difícil':
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando treino...</p>
        </div>
      </div>
    );
  }

  if (error && !workout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workout || !workout.workout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Treino não encontrado.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isNewWorkout ? 'Novo Treino Gerado' : 'Detalhes do Treino'}
                </h1>
                <p className="text-sm text-gray-600">
                  {isNewWorkout ? 'Revise e salve seu treino personalizado' : 'Visualize e execute seu treino'}
                </p>
              </div>
            </div>
            
            {isNewWorkout && (
              <Button 
                onClick={handleSaveNewWorkout}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Treino
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Workout Overview */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Treino Personalizado</CardTitle>
                  <CardDescription>
                    Gerado especialmente para seus objetivos
                  </CardDescription>
                </div>
              </div>
              {!isNewWorkout && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Calendar className="h-4 w-4 mr-1" />
                  Salvo
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">
                  <strong>{workout.workout.length}</strong> dia(s) de treino
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">
                  <strong>~45-60</strong> minutos por sessão
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-600">
                  Personalizado com <strong>IA</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout Days */}
        <div className="space-y-6">
          {workout.workout.map((dayWorkout, index) => (
            <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {dayWorkout.day || `Dia ${index + 1}`}
                      </CardTitle>
                      <CardDescription className="text-lg font-medium text-purple-600">
                        {dayWorkout.focus}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">
                    {dayWorkout.exercises?.length || 0} exercícios
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dayWorkout.exercises?.map((exercise, exIndex) => (
                    <div key={exIndex} className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {exercise.name}
                        </h4>
                        <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                          {exercise.difficulty || 'Moderado'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Repeat className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            <strong>Séries:</strong> {exercise.sets}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            <strong>Repetições:</strong> {exercise.reps}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">
                            <strong>Descanso:</strong> {exercise.rest}
                          </span>
                        </div>
                      </div>
                      
                      {exercise.tips && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 mb-1">Dicas de Execução:</p>
                              <p className="text-sm text-blue-700">{exercise.tips}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feedback Form */}
        {showFeedbackForm && !isNewWorkout && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Como foi seu treino?</span>
              </CardTitle>
              <CardDescription>
                Seu feedback nos ajuda a melhorar os próximos treinos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedback">Como você se sentiu durante o treino?</Label>
                <Textarea
                  id="feedback"
                  placeholder="Ex: Treino desafiador, mas consegui completar todos os exercícios..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações adicionais (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Ex: Dor no joelho durante agachamentos, preciso ajustar a carga..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          {!isNewWorkout && !showFeedbackForm && (
            <Button
              onClick={handleCompleteWorkout}
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
              size="lg"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Marcar como Concluído
            </Button>
          )}
          
          {showFeedbackForm && (
            <Button
              onClick={handleCompleteWorkout}
              disabled={completingWorkout}
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
              size="lg"
            >
              {completingWorkout ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registrando...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Finalizar Treino
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutDetailPage;
