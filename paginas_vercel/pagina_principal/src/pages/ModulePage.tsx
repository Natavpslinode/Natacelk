import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCourseModules, getStudentProgress, updateModuleProgress, supabase, hasStudentPassedExam } from '@/lib/database';
import type { CourseModule, StudentProgress, CourseMaterial } from '@/lib/database';
import { ArrowLeft, CheckCircle, Clock, Play, Image, FileText, Download, BookOpen, Trophy } from 'lucide-react';
import MEPROCLogo from '@/components/MEPROCLogo';

const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user, studentProfile } = useAuth();
  const navigate = useNavigate();
  const [module, setModule] = useState<CourseModule | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [hasExam, setHasExam] = useState(false);
  const [examPassed, setExamPassed] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!moduleId) {
      navigate('/dashboard');
      return;
    }

    loadModuleData();
  }, [user, moduleId, navigate]);

  const loadModuleData = async () => {
    try {
      setLoading(true);
      
      // Get module details
      const { data: moduleData, error: moduleError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('id', moduleId)
        .maybeSingle();

      if (moduleError) throw moduleError;
      if (!moduleData) {
        setError('Módulo no encontrado');
        return;
      }

      setModule(moduleData);

      // Get student progress for this module
      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Progress error:', progressError);
      }
      
      setProgress(progressData);

      // Get course materials for this module
      const { data: materialsData, error: materialsError } = await supabase
        .from('course_materials')
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_active', true)
        .order('upload_date', { ascending: true });

      if (materialsError) {
        console.error('Materials error:', materialsError);
      } else {
        setMaterials(materialsData || []);
      }

      // Verificar si el módulo tiene examen (módulos 5 y 10)
      const moduleNum = moduleData.module_number;
      if (moduleNum === 5 || moduleNum === 10) {
        setHasExam(true);
        // Verificar si ya pasó el examen
        const passed = await hasStudentPassedExam(user!.id, moduleNum);
        setExamPassed(passed);
      }

    } catch (err) {
      setError('Error al cargar el módulo');
      console.error('Module load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteModule = async () => {
    if (!user || !moduleId || completing) return;

    setCompleting(true);
    try {
      await updateModuleProgress(user.id, moduleId, true);
      setProgress(prev => prev ? { ...prev, is_completed: true, completion_date: new Date().toISOString() } : null);
      alert('¡Módulo completado exitosamente!');
    } catch (err) {
      alert('Error al completar el módulo');
      console.error('Complete module error:', err);
    } finally {
      setCompleting(false);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error || 'Módulo no encontrado'}
        </div>
      </div>
    );
  }

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
                  Módulo {module.module_number}: {module.title}
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

      <div className="container mx-auto px-4 py-8">
        {/* Module Info */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-blue-800">{module.title}</h2>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              progress?.is_completed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {progress?.is_completed ? 'Completado' : 'En Progreso'}
            </div>
          </div>
          
          <p className="text-blue-600 text-lg mb-4">{module.description}</p>
          
          {module.content_overview && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">¿Qué aprenderás?</h3>
              <p className="text-blue-700">{module.content_overview}</p>
            </div>
          )}
        </div>

        {/* Course Materials */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-blue-800 mb-6">Materiales del Módulo</h3>
          
          {materials.length > 0 ? (
            <div className="grid gap-4">
              {materials.map((material) => (
                <div key={material.id} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600">
                        {getMaterialIcon(material.material_type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800">{material.title || material.file_name}</h4>
                        <p className="text-sm text-blue-600 capitalize">{material.material_type}</p>
                        {material.description && (
                          <p className="text-sm text-blue-500 mt-1">{material.description}</p>
                        )}
                      </div>
                    </div>
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Ver</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-600">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no hay materiales disponibles para este módulo.</p>
              <p className="text-sm mt-2">Los materiales serán agregados próximamente por el administrador.</p>
            </div>
          )}
        </div>

        {progress?.is_completed && hasExam && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center space-x-3">
              <BookOpen className="h-6 w-6" />
              <span>Evaluación del Módulo</span>
            </h3>
            
            {examPassed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <Trophy className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="text-lg font-bold text-green-800">¡Examen Aprobado!</h4>
                    <p className="text-green-600">Ya has completado exitosamente la evaluación de este módulo.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-blue-800 mb-2">
                      Examen del Módulo {module.module_number}
                    </h4>
                    <p className="text-blue-600 mb-2">
                      Evalúa tus conocimientos con 15 preguntas sobre los temas de este módulo.
                    </p>
                    <ul className="text-sm text-blue-500 list-disc list-inside">
                      <li>10 preguntas de selección múltiple</li>
                      <li>5 preguntas de emparejar</li>
                      <li>Puntuación mínima: 70% para aprobar</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => navigate(`/exam/${module.module_number}`)}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium flex items-center space-x-2 shadow-lg"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Realizar Examen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complete Module Button */}
        {!progress?.is_completed && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center">
            <h3 className="text-xl font-bold text-blue-800 mb-4">¿Completaste este módulo?</h3>
            <p className="text-blue-600 mb-6">Marca este módulo como completado para continuar con tu progreso en el curso.</p>
            <button
              onClick={handleCompleteModule}
              disabled={completing}
              className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-600 transition-all font-medium disabled:opacity-50 flex items-center space-x-2 mx-auto shadow-lg"
            >
              {completing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Completando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Marcar como Completado</span>
                </>
              )}
            </button>
          </div>
        )}

        {progress?.is_completed && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800 mb-2">¡Módulo Completado!</h3>
            <p className="text-green-600 mb-4">
              Completaste este módulo el {new Date(progress.completion_date!).toLocaleDateString('es-ES')}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium"
            >
              Continuar con el Curso
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulePage;