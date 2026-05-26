import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Candidates } from './pages/Candidates';
import { Clients } from './pages/Clients';
import { Jobs } from './pages/Jobs';
import { Applications } from './pages/Applications';
import { CandidateHistory } from './pages/History';
import { Profile } from './pages/Profile';
import { useUserRole } from './hooks/useUserRole';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const { role, loading: roleLoading, isAdmin, isCandidate } = useUserRole();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-eon-teal rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen relative">
        {/* Subtle Architectural Background Watermark */}
        <div 
          className="fixed inset-0 z-0 opacity-[0.1] pointer-events-none"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <Sidebar />
        <main className="flex-1 overflow-auto relative z-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {isAdmin && (
               <>
                 <Route path="/candidates" element={<Candidates />} />
                 <Route path="/clients" element={<Clients />} />
                 <Route path="/history" element={<CandidateHistory />} />
               </>
            )}

            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            
            {isCandidate && (
              <Route path="/profile" element={<Profile />} />
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
