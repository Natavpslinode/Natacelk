import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import StudentDashboard from '@/pages/StudentDashboard';
import ModulePage from '@/pages/ModulePage';
import ExamPage from '@/pages/ExamPage';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AuthCallback from '@/pages/AuthCallback';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-[#FFB57C] via-[#FFCAB0] to-[#FFB57C]">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/module/:moduleId" element={<ModulePage />} />
                <Route path="/exam/:moduleNumber" element={<ExamPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </div>
          </Router>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;