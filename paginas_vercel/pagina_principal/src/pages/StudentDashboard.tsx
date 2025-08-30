import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCourseModules, getStudentProgress, getStudentExamResults, hasStudentPassedExam } from '@/lib/database';
import type { CourseModule, StudentProgress, StudentExamResult } from '@/lib/database';
import { BookOpen, Trophy, Clock, CheckCircle, LogOut, Download, GraduationCap, BarChart3, Award } from 'lucide-react';
import MEPROCLogo from '@/components/MEPROCLogo';
import CertificateGenerator from '@/components/CertificateGenerator';

const StudentDashboard = () => {
  const { user, studentProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [examResults, setExamResults] = useState<StudentExamResult[]>([]);
  const [examsPassed, setExamsPassed] = useState<{[key: number]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      const [modulesData, progressData, examResultsData] = await Promise.all([
        getCourseModules(),
        getStudentProgress(user!.id),
        getStudentExamResults(user!.id)
      ]);
      setModules(modulesData);
      setProgress(progressData);
      setExamResults(examResultsData);
      
      // Verificar qué exámenes ha pasado
      const examStatus: {[key: number]: boolean} = {};
      for (const moduleNum of [5, 10]) {
        examStatus[moduleNum] = await hasStudentPassedExam(user!.id, moduleNum);
      }
      setExamsPassed(examStatus);
    } catch (err) {
      setError('Error al cargar los datos del curso');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string) => {
    return progress.find(p => p.module_id === moduleId);
  };

  const completedModules = progress.filter(p => p.is_completed).length;
  const passedExams = Object.values(examsPassed).filter(Boolean).length;
  const progressPercentage = modules.length > 0 ? (completedModules / modules.length) * 100 : 0;
  const canGenerateCertificate = completedModules === modules.length && modules.length === 10 && passedExams === 2;

  const handleCertificateSuccess = () => {
    alert('¡Certificado PDF generado y descargado exitosamente!');
  };

  const handleCertificateError = (error: string) => {
    alert('Error al generar el certificado: ' + error);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
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
              <MEPROCLogo size="lg" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  Dashboard - {studentProfile?.full_name}
                </h1>
                <p className="text-sm text-blue-600">Curso de Reparación de Celulares</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-800">{Math.round(progressPercentage)}%</h3>
                <p className="text-blue-600">Progreso del Curso</p>
              </div>
            </div>
            <div className="mt-4 w-full bg-blue-100 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800">{completedModules}</h3>
                <p className="text-green-600">Módulos Completados</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-3 rounded-full">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-800">{passedExams}</h3>
                <p className="text-purple-600">Exámenes Aprobados</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-yellow-800">{modules.length - completedModules}</h3>
                <p className="text-yellow-600">Módulos Restantes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Section */}
        {canGenerateCertificate && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="text-xl font-bold text-yellow-800">¡Felicitaciones!</h3>
                  <p className="text-yellow-700">Has completado todos los módulos y exámenes. Puedes generar tu certificado.</p>
                </div>
              </div>
              <CertificateGenerator
                userId={user!.id}
                studentName={studentProfile.full_name}
                onSuccess={handleCertificateSuccess}
                onError={handleCertificateError}
              />
            </div>
          </div>
        )}

        {/* Course Modules */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center space-x-3">
            <BookOpen className="h-6 w-6" />
            <span>Módulos del Curso</span>
          </h2>
          
          <div className="grid gap-4">
            {modules.map((module, index) => {
              const moduleProgress = getModuleProgress(module.id);
              const isCompleted = moduleProgress?.is_completed || false;
              const hasExam = module.module_number === 5 || module.module_number === 10;
              const examPassed = hasExam ? examsPassed[module.module_number] : false;
              
              return (
                <div 
                  key={module.id}
                  className={`border-2 rounded-xl p-6 transition-all cursor-pointer hover:shadow-lg ${
                    isCompleted 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-blue-200 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => navigate(`/module/${module.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-6 w-6" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-800">{module.title}</h3>
                        <p className="text-blue-600 text-sm">{module.description}</p>
                        {moduleProgress?.last_accessed && (
                          <div className="flex items-center space-x-1 text-xs text-blue-500 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Último acceso: {new Date(moduleProgress.last_accessed).toLocaleDateString()}</span>
                          </div>
                        )}
                        {hasExam && (
                          <div className="mt-2">
                            {examPassed ? (
                              <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                <Award className="h-3 w-3" />
                                <span>Examen Aprobado</span>
                              </span>
                            ) : isCompleted ? (
                              <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                <BookOpen className="h-3 w-3" />
                                <span>Examen Disponible</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                <Clock className="h-3 w-3" />
                                <span>Examen Bloqueado</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isCompleted ? 'Completado' : 'Pendiente'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;