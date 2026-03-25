import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating initial app load / hydration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2800); // 2.8s total filling cycle
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {loading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      {!loading && (
        <div className="min-h-screen bg-background text-slate-900 flex flex-col font-sans selection:bg-primary/20">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 pb-12 w-full max-w-7xl">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
