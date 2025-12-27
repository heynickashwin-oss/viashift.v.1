import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CompanyInput } from './pages/CompanyInput';
import { Shift } from './pages/Shift';
import { ViewShift } from './pages/ViewShift';
import FeedbackDropbox from './components/FeedbackDropbox';
import { StakeholderSankeyPOC } from './pages/StakeholderSankeyPOC';

function RootRedirect() {
  const { user, loading } = useAuth();

if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0E14'
      }}>
        <div style={{ color: '#6B7A8C' }}>Loading...</div>
      </div>
    );
  }

  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/view/:id" element={<ViewShift />} />
          <Route path="/feedback" element={<FeedbackDropbox />} />
          <Route path="/poc" element={<StakeholderSankeyPOC />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CompanyInput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shift/:id"
            element={
              <ProtectedRoute>
                <Shift />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
