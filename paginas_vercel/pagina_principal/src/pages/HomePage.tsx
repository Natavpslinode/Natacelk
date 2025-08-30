import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, Phone, CheckCircle, Star, GraduationCap } from 'lucide-react';
import MEPROCLogo from '@/components/MEPROCLogo';

const HomePage = () => {
  const whatsappNumber = "+57123456789"; // Número de WhatsApp a configurar
  const whatsappMessage = "Hola, me interesa obtener más información sobre el Curso de Reparación de Celulares MEPROC";
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MEPROCLogo size="lg" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  MEPROC
                </h1>
                <p className="text-sm text-blue-600">Ministerio Educativo de Profesionales Cristianos</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/login" className="text-blue-700 hover:text-blue-900 font-medium transition-colors">
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all font-medium shadow-lg"
              >
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Curso Virtual y Práctico de Reparación de Celulares
            </h2>
            <p className="text-xl text-blue-700 mb-8 leading-relaxed">
              Conviértete en un experto en reparación de dispositivos móviles con nuestra formación integral de 10 módulos especializados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                to="/register"
                className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all font-bold text-lg shadow-lg transform hover:scale-105"
              >
                Comenzar Ahora
              </Link>
              <button 
                onClick={handleWhatsAppClick}
                className="bg-gradient-to-r from-green-500 to-green-400 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-500 transition-all font-bold text-lg shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Contáctanos</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-4">
              ¿Por Qué Elegir MEPROC?
            </h3>
            <p className="text-blue-700 text-lg">Formación profesional con excelencia y valores cristianos</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-blue-800 mb-4">10 Módulos Especializados</h4>
              <p className="text-blue-600">Desde conceptos básicos hasta técnicas avanzadas de microsoldadura y gestión de negocio.</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-blue-800 mb-4">Acompañamiento Personal</h4>
              <p className="text-blue-600">Seguimiento individual del progreso y soporte técnico profesional durante todo el curso.</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-blue-800 mb-4">Certificación Profesional</h4>
              <p className="text-blue-600">Certificado oficial que valida tus competencias técnicas en reparación de dispositivos móviles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Modules Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-4">
              Contenido del Curso
            </h3>
            <p className="text-blue-700 text-lg">10 módulos diseñados para formar profesionales exitosos</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              "Introducción a la Reparación de Celulares",
              "Herramientas y Equipos Básicos", 
              "Diagnóstico de Fallas Comunes",
              "Reparación de Pantallas",
              "Problemas de Batería",
              "Fallas de Carga",
              "Problemas de Audio",
              "Reparación de Cámaras",
              "Software y Firmware",
              "Casos Prácticos Avanzados"
            ].map((module, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg flex items-center space-x-4 hover:shadow-xl transition-all">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <h5 className="text-blue-800 font-semibold">{module}</h5>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-6">
              ¿Listo para Comenzar tu Transformación Profesional?
            </h3>
            <p className="text-xl text-blue-700 mb-8">
              Únete a MEPROC y conviértete en un experto en reparación de celulares con formación de calidad y valores cristianos.
            </p>
            <Link 
              to="/register"
              className="inline-block bg-gradient-to-r from-blue-700 to-blue-600 text-white px-10 py-4 rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all font-bold text-xl shadow-lg transform hover:scale-105"
            >
              Registrarse Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900/95 backdrop-blur-sm text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <MEPROCLogo size="lg" />
              <div>
                <h4 className="text-2xl font-bold">MEPROC</h4>
                <p className="text-blue-200 text-sm">Ministerio Educativo de Profesionales Cristianos</p>
              </div>
            </div>
            <p className="text-blue-200 mb-6">Formando profesionales con excelencia y valores cristianos</p>
            <button 
              onClick={handleWhatsAppClick}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto font-medium"
            >
              <Phone className="h-5 w-5" />
              <span>Soporte WhatsApp</span>
            </button>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <button 
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl z-50 transition-all transform hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <Phone className="h-6 w-6" />
      </button>
    </div>
  );
};

export default HomePage;