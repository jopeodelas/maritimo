import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import maritimoCrest from '../assets/maritimo-crest.png';
import useIsMobile from '../hooks/useIsMobile';
import { useAnalytics } from '../hooks/useAnalytics';
import '../styles/AllpagesStyles.css';

const LoginPage = () => {
  const isMobile = useIsMobile();
  const analytics = useAnalytics();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      analytics.trackButtonClick('login_submit', 'auth_form');
      await login(email, password);
      analytics.trackAuth('login');
      analytics.trackFormSubmit('login_form', true);
      navigate('/main');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      analytics.trackError(errorMessage, 'login_form');
      analytics.trackFormSubmit('login_form', false, [errorMessage]);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      analytics.trackButtonClick('google_login', 'auth_form');
      await loginWithGoogle();
      analytics.trackAuth('login');
      analytics.trackEvent('google_login_success', 'auth');
      navigate('/main');
    } catch (err: any) {
      const errorMessage = 'Google login failed. Please try again.';
      setError(errorMessage);
      analytics.trackError(errorMessage, 'google_login');
      analytics.trackEvent('google_login_failed', 'auth', { error: err.message });
    }
  };

  return (
    <div className={`login-container ${isMobile ? "mobile-auth-container" : ""}`}>
      {/* Background elements from HomePage */}
      <div className="login-solid-background"></div>
      <div className="login-solid-background-2"></div>
      <div className="login-fans-background"></div>
      
      {/* Golden triangles */}
      <div className={`login-triangles-container ${isMobile ? "mobile-login-triangles" : ""}`}>
        <div className="login-triangle"></div>
        <div className="login-triangle"></div>
        <div className="login-triangle"></div>
      </div>
      
      {/* Login form container */}
      <div className={`login-form-container ${isMobile ? "mobile-auth-form-container" : ""}`}>
        <img 
          src={maritimoCrest} 
          alt="CS Marítimo" 
          className={`login-logo ${isMobile ? "mobile-auth-logo" : ""}`} 
        />
        <h1 className={`login-title ${isMobile ? "mobile-auth-title" : ""}`}>
          Login to CS Marítimo Voting
        </h1>
        
        {error && (
          <p className={`login-error ${isMobile ? "mobile-auth-error" : ""}`}>
            {error}
          </p>
        )}
        
        {/* Google Login Button */}
        <button 
          type="button" 
          className={`login-google-button ${isMobile ? "mobile-auth-google-button" : ""}`}
          onClick={handleGoogleLogin}
        >
          <div className="login-google-button-content">
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google logo" 
              className="login-google-icon" 
            />
            <span>Login with Google</span>
          </div>
        </button>
        
        {/* Divider */}
        <div className={`login-divider ${isMobile ? "mobile-auth-divider" : ""}`}>
          <div className="login-divider-line"></div>
          <span className="login-divider-text">or</span>
          <div className="login-divider-line"></div>
        </div>
        
        {/* Regular login form */}
        <form 
          className={`login-form ${isMobile ? "mobile-auth-form" : ""}`} 
          onSubmit={handleSubmit}
        >
          <div className={`login-input-group ${isMobile ? "mobile-auth-input-group" : ""}`}>
            <label 
              className={`login-label ${isMobile ? "mobile-auth-label" : ""}`} 
              htmlFor="email"
            >
              Email
            </label>
            <input
              className={`login-input ${isMobile ? "mobile-auth-input" : ""}`}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={`login-input-group ${isMobile ? "mobile-auth-input-group" : ""}`}>
            <label 
              className={`login-label ${isMobile ? "mobile-auth-label" : ""}`} 
              htmlFor="password"
            >
              Password
            </label>
            <input
              className={`login-input ${isMobile ? "mobile-auth-input" : ""}`}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`login-button ${isMobile ? "mobile-auth-button" : ""}`}
          >
            Login
          </button>
        </form>
        
        <div className={isMobile ? "mobile-auth-link" : ""}>
          <Link 
            to="/register" 
            className="login-link"
          >
            Don't have an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
