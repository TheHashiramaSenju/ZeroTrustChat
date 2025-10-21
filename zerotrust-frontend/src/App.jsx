import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import SecurityDashboard from './pages/SecurityDashboard';
import MFASetupPage from './pages/MFASetupPage';
import MFAVerifyPage from './pages/MFAVerifyPage';
import EmailVerifyPage from './pages/EmailVerifyPage';
import OAuthCallback from './pages/OAuthCallback';
import SetupPassword from './pages/SetupPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/setup-password" element={<SetupPassword />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/security" element={<SecurityDashboard />} />
          <Route path="/mfa-setup" element={<MFASetupPage />} />
          <Route path="/mfa-verify" element={<MFAVerifyPage />} />
          <Route path="/verify-email" element={<EmailVerifyPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
