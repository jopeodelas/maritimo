import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import maritimoCrest from '../assets/maritimo-crest.png';
import useIsMobile from '../hooks/useIsMobile';

const RegisterPage = () => {
  const isMobile = useIsMobile();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Apply global body styles for register page
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'hidden';
    document.body.style.boxSizing = 'border-box';
    document.body.style.height = '100vh';
    document.documentElement.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      // Reset on component unmount
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflowX = '';
      document.body.style.overflowY = '';
      document.body.style.boxSizing = '';
      document.body.style.height = '';
      document.documentElement.style.height = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await register(username, email, password);
      navigate('/main');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/main');
    } catch (err: any) {
      setError('Google registration failed. Please try again.');
    }
  };

  return (
    <div className={`register-container ${isMobile ? "mobile-register-container" : ""}`}>
      {/* Background elements from HomePage */}
      <div className="register-solid-background"></div>
      <div className="register-solid-background2"></div>
      <div className="register-fans-background"></div>
      
      {/* Golden triangles - keeping them in mobile version for register */}
      <div className={`register-triangles-container ${isMobile ? "mobile-register-triangles" : ""}`}>
        <div className="register-triangle"></div>
        <div className="register-triangle"></div>
        <div className="register-triangle"></div>
      </div>
      
      {/* Register form container */}
      <div className={`register-form-container ${isMobile ? "mobile-register-form-container" : ""}`}>
        <img src={maritimoCrest} alt="CS Marítimo" className={`register-logo ${isMobile ? "mobile-register-logo" : ""}`} />
        <h1 className={`register-title ${isMobile ? "mobile-register-title" : ""}`}>Register for CS Marítimo Voting</h1>
        
        {error && <p className={`register-error ${isMobile ? "mobile-register-error" : ""}`}>{error}</p>}
        
        {/* Google Register Button */}
        <button 
          type="button" 
          className={`register-google-button ${isMobile ? "mobile-register-google-button" : ""}`}
          onClick={handleGoogleLogin}
        >
          <div className="register-google-button-content">
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google logo" 
              className="register-google-icon"
            />
            <span>Register with Google</span>
          </div>
        </button>
        
        {/* Divider */}
        <div className={`register-divider ${isMobile ? "mobile-register-divider" : ""}`}>
          <div className="register-divider-line"></div>
          <span className="register-divider-text">or</span>
          <div className="register-divider-line"></div>
        </div>
        
        {/* Regular registration form */}
        <form className={`register-form ${isMobile ? "mobile-register-form" : ""}`} onSubmit={handleSubmit}>
          <div className={`register-input-group ${isMobile ? "mobile-register-input-group" : ""}`}>
            <label className={`register-label ${isMobile ? "mobile-register-label" : ""}`} htmlFor="username">Username</label>
            <input
              className={`register-input ${isMobile ? "mobile-register-input" : ""}`}
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className={`register-input-group ${isMobile ? "mobile-register-input-group" : ""}`}>
            <label className={`register-label ${isMobile ? "mobile-register-label" : ""}`} htmlFor="email">Email</label>
            <input
              className={`register-input ${isMobile ? "mobile-register-input" : ""}`}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={`register-input-group ${isMobile ? "mobile-register-input-group" : ""}`}>
            <label className={`register-label ${isMobile ? "mobile-register-label" : ""}`} htmlFor="password">Password</label>
            <input
              className={`register-input ${isMobile ? "mobile-register-input" : ""}`}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className={`register-input-group ${isMobile ? "mobile-register-input-group" : ""}`}>
            <label className={`register-label ${isMobile ? "mobile-register-label" : ""}`} htmlFor="confirmPassword">Confirm Password</label>
            <input
              className={`register-input ${isMobile ? "mobile-register-input" : ""}`}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`register-button ${isMobile ? "mobile-register-button" : ""}`}
          >
            Register
          </button>
        </form>
        
        <div className={isMobile ? "mobile-register-link" : ""}>
          <Link 
            to="/login" 
            className="register-link"
          >
            Already have an account? Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
