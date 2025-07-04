import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import './styles/optimizedStyles.css';
import './styles/accessibility.css';
import LayoutStabilizer from './components/LayoutStabilizer';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';
import Footer from './components/Footer';

// PERFORMANCE: Immediately loaded components (critical pages)
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// PERFORMANCE: Lazy loaded components (less critical pages)
const NewsPage = lazy(() => import('./pages/NewsPage'));
const Squad = lazy(() => import('./pages/Squad'));
const VotingPage = lazy(() => import('./pages/VotingPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const Schedule = lazy(() => import('./pages/Schedule'));
const PlayerRatings = lazy(() => import('./pages/PlayerRatings'));
const MaritodlePage = lazy(() => import('./pages/MaritodlePage'));

// PERFORMANCE: Loading component for lazy routes
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)',
    color: '#4CAF50',
    fontSize: '1.2rem',
    fontWeight: '600'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        width: '3rem',
        height: '3rem',
        border: '3px solid rgba(76, 175, 80, 0.2)',
        borderTop: '3px solid #4CAF50',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      A carregar...
    </div>
  </div>
);

// Global styles
const globalStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
  }
  
  button {
    cursor: pointer;
  }
`;

function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <LayoutStabilizer>
              <NetworkStatusIndicator />
              <div className="App">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Critical routes - immediately loaded */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected routes with lazy loading */}
                    <Route 
                      path="/main" 
                      element={
                        <ProtectedRoute>
                          <MainPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/news" 
                      element={
                        <ProtectedRoute>
                          <NewsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/squad" 
                      element={
                        <ProtectedRoute>
                          <Squad />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/voting" 
                      element={
                        <ProtectedRoute>
                          <VotingPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/chat" 
                      element={
                        <ProtectedRoute>
                          <ChatPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/history" 
                      element={
                        <ProtectedRoute>
                          <HistoryPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/schedule" 
                      element={
                        <ProtectedRoute>
                          <Schedule />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/ratings" 
                      element={
                        <ProtectedRoute>
                          <PlayerRatings />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/maritodle" 
                      element={
                        <ProtectedRoute>
                          <MaritodlePage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin routes with lazy loading */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedAdminRoute>
                          <AdminPage />
                        </ProtectedAdminRoute>
                      } 
                    />
                    
                    {/* 404 fallback route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
                <Footer />
              </div>
            </LayoutStabilizer>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;