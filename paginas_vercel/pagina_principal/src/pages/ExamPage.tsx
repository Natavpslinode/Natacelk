import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, Trophy } from 'lucide-react';
import MEPROCLogo from '@/components/MEPROCLogo';

interface ModuleExam {
  id: string;
  module_number: number;
  title: string;
  description: string;
  total_questions: number;
  passing_score: number;
}

interface ExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  points: number;
  order_number: number;
}

interface MatchingQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  left_items: string[];
  right_items: string[];
  correct_matches: Record<string, string>;
  points: number;
  order_number: number;
}

interface UserAnswer {
  questionId: string;
  answer: string;
  questionType: 'multiple_choice' | 'matching';
}

const ExamPage = () => {
  const { moduleNumber } = useParams<{ moduleNumber: string }>();
  const { user, studentProfile } = useAuth();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<ModuleExam | null>(null);
  const [mcQuestions, setMcQuestions] = useState<ExamQuestion[]>([]);
  const [matchingQuestions, setMatchingQuestions] = useState<MatchingQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState<{
    score: number;
    passed: boolean;
    totalQuestions: number;
  } | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!moduleNumber || (moduleNumber !== '5' && moduleNumber !== '10')) {
      navigate('/dashboard');
      return;
    }

    loadExamData();
    setTimeStarted(new Date());
  }, [user, moduleNumber, navigate]);

  const loadExamData = async () => {
    try {
      setLoading(true);

      // Cargar datos del examen
      const { data: examData, error: examError } = await supabase
        .from('module_exams')
        .select('*')
        .eq('module_number', parseInt(moduleNumber!))
        .eq('is_active', true)
        .maybeSingle();

      if (examError) throw examError;
      if (!examData) {
        alert('Examen no encontrado');
        navigate('/dashboard');
        return;
      }

      setExam(examData);

      // Cargar preguntas de selección múltiple
      const { data: mcData, error: mcError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', examData.id)
        .order('order_number', { ascending: true });

      if (mcError) throw mcError;
      setMcQuestions(mcData || []);

      // Cargar preguntas de emparejar
      const { data: matchingData, error: matchingError } = await supabase
        .from('matching_questions')
        .select('*')
        .eq('exam_id', examData.id)
        .order('order_number', { ascending: true });

      if (matchingError) throw matchingError;
      setMatchingQuestions(matchingData || []);

      // Verificar si ya presentó el examen
      const { data: existingResult, error: resultError } = await supabase
        .from('student_exam_results')
        .select('*')
        .eq('user_id', user!.id)
        .eq('exam_id', examData.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (resultError && resultError.code !== 'PGRST116') {
        console.error('Error checking existing results:', resultError);
      }

      if (existingResult) {
        setExamResult({
          score: existingResult.score,
          passed: existingResult.passed,
          totalQuestions: examData.total_questions
        });
        setExamCompleted(true);
      }

    } catch (err) {
      console.error('Error loading exam:', err);
      alert('Error al cargar el examen');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMCAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, { questionId, answer, questionType: 'multiple_choice' }];
    });
  };

  const handleMatchingAnswer = (questionId: string, leftItem: string, rightItem: string) => {
    setMatchingAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [leftItem]: rightItem
      }
    }));
  };

  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, questionId: string, leftItem: string) => {
    e.preventDefault();
    if (draggedItem) {
      handleMatchingAnswer(questionId, leftItem, draggedItem);
      setDraggedItem(null);
    }
  };

  const submitExam = async () => {
    if (!exam || !user || !timeStarted) return;

    setSubmitting(true);
    try {
      let totalScore = 0;
      let totalPossiblePoints = 0;

      // Evaluar preguntas de selección múltiple
      mcQuestions.forEach(question => {
        totalPossiblePoints += question.points;
        const userAnswer = userAnswers.find(a => a.questionId === question.id);
        if (userAnswer && userAnswer.answer === question.correct_answer) {
          totalScore += question.points;
        }
      });

      // Evaluar preguntas de emparejar
      matchingQuestions.forEach(question => {
        totalPossiblePoints += question.points;
        const userMatches = matchingAnswers[question.id] || {};
        const correctMatches = question.correct_matches;
        
        let correctCount = 0;
        Object.keys(correctMatches).forEach(leftItem => {
          if (userMatches[leftItem] === correctMatches[leftItem]) {
            correctCount++;
          }
        });
        
        // Puntuación proporcional para preguntas de emparejar
        const questionScore = (correctCount / Object.keys(correctMatches).length) * question.points;
        totalScore += questionScore;
      });

      const finalScore = (totalScore / totalPossiblePoints) * 100;
      const passed = finalScore >= exam.passing_score;

      // Guardar resultado
      const { error: insertError } = await supabase
        .from('student_exam_results')
        .insert({
          user_id: user.id,
          exam_id: exam.id,
          multiple_choice_answers: userAnswers.filter(a => a.questionType === 'multiple_choice'),
          matching_answers: matchingAnswers,
          score: finalScore,
          passed: passed,
          attempt_number: 1,
          started_at: timeStarted.toISOString(),
          completed_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      setExamResult({
        score: finalScore,
        passed: passed,
        totalQuestions: exam.total_questions
      });
      setExamCompleted(true);

    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Error al enviar el examen');
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuestions = mcQuestions.length + matchingQuestions.length;
  const allQuestions = [...mcQuestions, ...matchingQuestions];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (examCompleted && examResult) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MEPROCLogo size="md" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                    Resultado del Examen
                  </h1>
                  <p className="text-sm text-blue-600">{studentProfile?.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Volver al Dashboard</span>
              </button>
            </div>
          </div>
        </header>

        {/* Results */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center ${
              examResult.passed ? 'border-2 border-green-200' : 'border-2 border-red-200'
            }`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                examResult.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {examResult.passed ? (
                  <Trophy className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
              
              <h2 className={`text-3xl font-bold mb-2 ${
                examResult.passed ? 'text-green-800' : 'text-red-800'
              }`}>
                {examResult.passed ? '¡Felicitaciones!' : 'No Aprobado'}
              </h2>
              
              <div className="text-6xl font-bold mb-4">
                <span className={examResult.passed ? 'text-green-600' : 'text-red-600'}>
                  {Math.round(examResult.score)}%
                </span>
              </div>
              
              <p className="text-lg text-gray-600 mb-6">
                {examResult.passed 
                  ? `¡Excelente trabajo! Has aprobado el examen del Módulo ${moduleNumber}.`
                  : `Necesitas al menos 70% para aprobar. ¡Sigue estudiando y vuelve a intentarlo!`
                }
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Puntuación Obtenida</p>
                    <p className="text-2xl font-bold text-gray-800">{Math.round(examResult.score)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Puntuación Mínima</p>
                    <p className="text-2xl font-bold text-gray-800">70%</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium"
              >
                Continuar con el Curso
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          Examen no encontrado
        </div>
      </div>
    );
  }

  const currentQuestionData = allQuestions[currentQuestion];
  const isMultipleChoice = currentQuestion < mcQuestions.length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MEPROCLogo size="md" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  {exam.title}
                </h1>
                <p className="text-sm text-blue-600">{studentProfile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Clock className="h-5 w-5" />
                <span>{currentQuestion + 1} de {totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-blue-50 px-4 py-2">
        <div className="container mx-auto">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isMultipleChoice ? (
            // Multiple Choice Question
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                  Pregunta {currentQuestion + 1} - Selección Múltiple
                </span>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">
                  {(currentQuestionData as ExamQuestion).question_text}
                </h2>
              </div>
              
              <div className="space-y-4">
                {['A', 'B', 'C', 'D'].map(option => {
                  const mcQuestion = currentQuestionData as ExamQuestion;
                  const optionText = mcQuestion[`option_${option.toLowerCase()}` as keyof ExamQuestion] as string;
                  const isSelected = userAnswers.find(a => a.questionId === mcQuestion.id)?.answer === option;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => handleMCAnswer(mcQuestion.id, option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-800' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-400 text-gray-400'
                        }`}>
                          {option}
                        </div>
                        <span className="text-lg">{optionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Matching Question
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                  Pregunta {currentQuestion + 1} - Emparejar
                </span>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">
                  {(currentQuestionData as MatchingQuestion).question_text}
                </h2>
                <p className="text-blue-600 text-sm mb-4">
                  Arrastra los elementos de la columna derecha para emparejar con los de la izquierda
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-800 mb-4">Elementos a emparejar:</h3>
                  {(currentQuestionData as MatchingQuestion).left_items.map(leftItem => {
                    const matchingQuestion = currentQuestionData as MatchingQuestion;
                    const matchedItem = matchingAnswers[matchingQuestion.id]?.[leftItem];
                    
                    return (
                      <div
                        key={leftItem}
                        className="p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200 min-h-[60px] flex items-center justify-between"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, matchingQuestion.id, leftItem)}
                      >
                        <span className="font-medium text-blue-800">{leftItem}</span>
                        {matchedItem && (
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                            {matchedItem}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Right Column */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-yellow-800 mb-4">Opciones disponibles:</h3>
                  {(currentQuestionData as MatchingQuestion).right_items.map(rightItem => (
                    <div
                      key={rightItem}
                      draggable
                      onDragStart={(e) => handleDragStart(e, rightItem)}
                      className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 cursor-move hover:bg-yellow-100 transition-colors"
                    >
                      <span className="font-medium text-yellow-800">{rightItem}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Anterior</span>
            </button>
            
            {currentQuestion === totalQuestions - 1 ? (
              <button
                onClick={submitExam}
                disabled={submitting}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Finalizar Examen</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all"
              >
                <span>Siguiente</span>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;