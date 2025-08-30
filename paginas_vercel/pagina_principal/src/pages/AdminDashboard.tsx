import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { getCourseModules, supabase } from '@/lib/database';
import type { CourseModule, CourseMaterial } from '@/lib/database';
import { Upload, Trash2, Users, BarChart3, Settings, LogOut, GraduationCap, Plus, File, Image, Video, FileText } from 'lucide-react';
import MEPROCLogo from '@/components/MEPROCLogo';

const AdminDashboard = () => {
  const { isAdminAuthenticated, adminUser, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, completedCourses: 0, activeModules: 0 });

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    loadData();
  }, [isAdminAuthenticated, navigate]);

  const loadData = async () => {
    try {
      const [modulesData] = await Promise.all([
        getCourseModules(),
        loadStats()
      ]);
      setModules(modulesData);
      
      if (modulesData.length > 0 && !selectedModule) {
        setSelectedModule(modulesData[0].id);
        loadMaterials(modulesData[0].id);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: students } = await supabase
        .from('student_profiles')
        .select('id', { count: 'exact' });
      
      const { data: completed } = await supabase
        .from('student_certificates')
        .select('id', { count: 'exact' });
      
      setStats({
        totalStudents: students?.length || 0,
        completedCourses: completed?.length || 0,
        activeModules: modules.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadMaterials = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_materials')
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_active', true)
        .order('upload_date', { ascending: false });
        
      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    loadMaterials(moduleId);
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !selectedModule) {
      alert('Selecciona un archivo y un módulo');
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('file-upload', {
            body: {
              fileData: reader.result as string,
              fileName: uploadFile.name,
              fileType: uploadFile.type,
              moduleId: selectedModule,
              title: uploadTitle || uploadFile.name,
              description: uploadDescription || '',
              isAdmin: true // Indicate this is an admin upload
            }
          });

          if (error) {
            alert('Error al subir archivo: ' + error.message);
            return;
          }

          if (data?.error) {
            alert('Error al subir archivo: ' + data.error.message);
            return;
          }

          alert('Archivo subido exitosamente');
          setUploadFile(null);
          setUploadTitle('');
          setUploadDescription('');
          loadMaterials(selectedModule);
        } catch (err) {
          alert('Error al subir archivo');
          console.error('Upload error:', err);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(uploadFile);
    } catch (error) {
      setUploading(false);
      alert('Error al procesar el archivo');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este material?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('course_materials')
        .update({ is_active: false })
        .eq('id', materialId);
        
      if (error) throw error;
      
      alert('Material eliminado exitosamente');
      loadMaterials(selectedModule);
    } catch (error) {
      alert('Error al eliminar material');
      console.error('Delete error:', error);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (mimeType?.startsWith('image/')) return <Image className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                  Panel de Administración MEPROC
                </h1>
                <p className="text-sm text-blue-600">Bienvenido, {adminUser?.full_name || adminUser?.username}</p>
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-800">{stats.totalStudents}</h3>
                <p className="text-blue-600">Estudiantes Registrados</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800">{stats.completedCourses}</h3>
                <p className="text-green-600">Cursos Completados</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-3 rounded-full">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-yellow-800">{modules.length}</h3>
                <p className="text-yellow-600">Módulos Activos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Module Selection */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Seleccionar Módulo</span>
            </h2>
            <div className="space-y-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleSelect(module.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedModule === module.id
                      ? 'bg-blue-100 border-2 border-blue-300 text-blue-800'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium">Módulo {module.module_number}</div>
                  <div className="text-sm opacity-75">{module.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Subir Material</span>
            </h2>
            
            {selectedModule && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Archivo</label>
                  <input
                    type="file"
                    accept="video/*,image/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Título del material"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Descripción</label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
                    placeholder="Descripción del material"
                  ></textarea>
                </div>
                
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>{uploading ? 'Subiendo...' : 'Subir Archivo'}</span>
                </button>
              </div>
            )}
            
            {!selectedModule && (
              <p className="text-blue-600 text-center py-8">Selecciona un módulo para subir materiales</p>
            )}
          </div>

          {/* Materials List */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
              <File className="h-5 w-5" />
              <span>Materiales</span>
            </h2>
            
            {selectedModule && (
              <div className="space-y-3">
                {materials.length === 0 ? (
                  <p className="text-blue-600 text-center py-8">No hay materiales en este módulo</p>
                ) : (
                  materials.map((material) => (
                    <div key={material.id} className="border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-blue-600">
                            {getFileIcon(material.mime_type || '')}
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-800">
                              {material.title || material.file_name}
                            </h4>
                            <p className="text-sm text-blue-600">{material.description}</p>
                            <p className="text-xs text-blue-500 mt-1">
                              {new Date(material.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {!selectedModule && (
              <p className="text-blue-600 text-center py-8">Selecciona un módulo para ver materiales</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;