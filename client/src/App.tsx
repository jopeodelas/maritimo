import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VotingPage from './pages/VotingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

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
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/voting" 
              element={
                <ProtectedRoute>
                  <VotingPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;