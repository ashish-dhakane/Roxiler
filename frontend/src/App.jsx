import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/UsersManagement';
import UserDetails from './pages/admin/UserDetails';
import StoresManagement from './pages/admin/StoresManagement';
import StoreListing from './pages/user/StoreListing';
import OwnerDashboard from './pages/owner/Dashboard';
import './styles/App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <main className={user ? 'main-content' : ''}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to={getHomePath(user.role)} /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to={getHomePath(user.role)} /> : <Signup />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersManagement /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={['admin']}><UserDetails /></ProtectedRoute>} />
          <Route path="/admin/stores" element={<ProtectedRoute allowedRoles={['admin']}><StoresManagement /></ProtectedRoute>} />

          {/* Normal user routes */}
          <Route path="/stores" element={<ProtectedRoute allowedRoles={['normal']}><StoreListing /></ProtectedRoute>} />

          {/* Store owner routes */}
          <Route path="/owner" element={<ProtectedRoute allowedRoles={['store_owner']}><OwnerDashboard /></ProtectedRoute>} />

          {/* Shared routes */}
<Route path="/change-password" element={<ProtectedRoute allowedRoles={['admin', 'normal', 'store_owner']}><ChangePassword /></ProtectedRoute>} />
          {/* Default redirect */}
          <Route path="/" element={<Navigate to={user ? getHomePath(user.role) : '/login'} />} />
          <Route path="*" element={<Navigate to={user ? getHomePath(user.role) : '/login'} />} />
        </Routes>
      </main>
    </>
  );
}

function getHomePath(role) {
  switch (role) {
    case 'admin': return '/admin';
    case 'normal': return '/stores';
    case 'store_owner': return '/owner';
    default: return '/login';
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
