import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStyles } from '../styles/styleUtils';
import maritimoCrest from '../assets/maritimo-crest.png';
import useIsMobile from '../hooks/useIsMobile';

const LoginPage = () => {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/main');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/main');
    } catch (err: any) {
      setError('Google login failed. Please try again.');
    }
  };

  const styles = createStyles({
    // Estilo global para evitar scrollbar - corrigido com 'as any'
    '@global': {
      'body': {
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
        overflowY: 'hidden',
        boxSizing: 'border-box',
        height: '100vh',
      },
      'html': {
        height: '100vh',
        overflow: 'hidden',
      },
      '*, *:before, *:after': {
        boxSizing: 'inherit',
      },
    } as any,
    // Background styles
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      padding: '1vh 2vw',
      boxSizing: 'border-box',
    },
    solidBackground: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to right, #009759 50%, #FE0000 50%)',
      zIndex: 1,
    },
    solidBackground2: {
      position: 'absolute',
      width: '75%',
      height: '100%',
      background: 'linear-gradient(to right, #009759 50%, #FE0000 50%)',
      zIndex: 5,
    },
    fansBackground: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      backgroundImage: 'url(/images/adeptosmaritimo.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.5,
      mixBlendMode: 'multiply',
      zIndex: 2,
    },
    trianglesContainer: {
      position: 'absolute',
      left: '9.5%',
      top: '20%',
      display: 'flex',
      flexDirection: 'column',
      gap: '5vh',
      zIndex: 5,
    },
    triangle: {
      width: 0,
      height: 0,
      borderLeft: '3vw solid transparent',
      borderRight: '3vw solid transparent',
      borderBottom: '5vh solid #FFBB4C',
      filter: 'drop-shadow(-0.2vw 0.2vh 0.2vh rgba(0, 0, 0, 0.25))',
    },
    
    // Form styles - ajustados para evitar scroll
    formContainer: {
      backgroundColor: 'white',
      padding: '2vw',
      borderRadius: '0.5vw',
      width: '90%',
      height: "85vh",
      maxWidth: '30vw',
      maxHeight: '100vh',
      boxShadow: '-0.4vw 1.1vh 0.5vh rgba(0, 0, 0, 0.25)',
      zIndex: 10,
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    logo: {
      width: '6vw',
      height: 'auto',
      margin: '0 auto 1.5vh',
      display: 'block',
    },
    title: {
      fontSize: '2vw',
      color: '#009759',
      marginBottom: '1.5vh',
      textAlign: 'center',
      fontWeight: 'bold',
      textShadow: '0.1vh 0.1vh 0.1vh rgba(0, 0, 0, 0.1)',
      lineHeight: '1.2',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5vh',
      width: '100%',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8vh',
      width: '100%',
    },
    label: {
      fontSize: '1vw',
      fontWeight: 'bold',
      color: '#333',
    },
    input: {
      padding: '1vh 1vw',
      borderRadius: '0.3vw',
      border: '1px solid #ccc',
      fontSize: '0.9vw',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s',
      outline: 'none',
      backgroundColor: '#FFFFFF',
      color: '#000000',
    },
    activeInput: {
      borderColor: '#009759',
    },
    button: {
      padding: '1.3vh 0',
      backgroundColor: '#FFB74D',
      color: 'white',
      border: 'none',
      borderRadius: '0.4vw',
      fontSize: '1.1vw',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '1.5vh',
      width: '100%',
      transition: 'all 0.3s',
      boxShadow: '-0.2vw 0.4vh 0.2vh rgba(0, 0, 0, 0.25)',
    },
    // Botão do Google corrigido
    googleButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.3vh 1vw',
      backgroundColor: '#fff',
      color: '#757575',
      border: '1px solid #ddd',
      borderRadius: '0.4vw',
      fontSize: '1.1vw',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '1.5vh',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'all 0.3s',
      boxShadow: '0 0.2vh 0.4vh rgba(0, 0, 0, 0.1)',
    },
    googleButtonContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      gap: '1vw',
    },
    googleIcon: {
      width: '1.6vw',
      height: '1.6vw',
      flexShrink: 0,
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      color: '#757575',
      fontSize: '0.9vw',
      margin: '1.5vh 0',
      width: '100%',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#ddd',
    },
    dividerText: {
      padding: '0 1vw',
    },
    error: {
      color: '#FF0000',
      marginTop: '1vh',
      textAlign: 'center',
      fontSize: '0.9vw',
    },
    link: {
      color: '#009759',
      textDecoration: 'none',
      marginTop: '1.5vh',
      textAlign: 'center',
      display: 'block',
      fontSize: '0.9vw',
      transition: 'color 0.3s',
    },
  });

  return (
    <div style={styles.container} className={isMobile ? "mobile-auth-container" : ""}>
      {/* Background elements from HomePage */}
      <div style={styles.solidBackground}></div>
      <div style={styles.solidBackground2}></div>
      <div style={styles.fansBackground}></div>
      
      {/* Golden triangles */}
      <div style={styles.trianglesContainer}>
        <div style={styles.triangle}></div>
        <div style={styles.triangle}></div>
        <div style={styles.triangle}></div>
      </div>
      
      {/* Login form container */}
      <div style={styles.formContainer} className={isMobile ? "mobile-auth-form-container" : ""}>
        <img src={maritimoCrest} alt="CS Marítimo" style={styles.logo} className={isMobile ? "mobile-auth-logo" : ""} />
        <h1 style={styles.title} className={isMobile ? "mobile-auth-title" : ""}>Login to CS Marítimo Voting</h1>
        
        {error && <p style={styles.error} className={isMobile ? "mobile-auth-error" : ""}>{error}</p>}
        
        {/* Google Login Button - corrigido */}
        <button 
          type="button" 
          style={styles.googleButton}
          className={isMobile ? "mobile-auth-google-button" : ""}
          onClick={handleGoogleLogin}
          onMouseOver={(e) => {
            if (!isMobile) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.boxShadow = '0 0.3vh 0.5vh rgba(0, 0, 0, 0.2)';
            }
          }}
          onMouseOut={(e) => {
            if (!isMobile) {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.boxShadow = '0 0.2vh 0.4vh rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          <div style={styles.googleButtonContent}>
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google logo" 
              style={styles.googleIcon} 
            />
            <span>Login with Google</span>
          </div>
        </button>
        
        {/* Divider */}
        <div style={styles.divider} className={isMobile ? "mobile-auth-divider" : ""}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine}></div>
        </div>
        
        {/* Regular login form */}
        <form style={styles.form} className={isMobile ? "mobile-auth-form" : ""} onSubmit={handleSubmit}>
          <div style={styles.inputGroup} className={isMobile ? "mobile-auth-input-group" : ""}>
            <label style={styles.label} className={isMobile ? "mobile-auth-label" : ""} htmlFor="email">Email</label>
            <input
              style={styles.input}
              className={isMobile ? "mobile-auth-input" : ""}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.currentTarget.style.borderColor = '#009759'}
              onBlur={(e) => e.currentTarget.style.borderColor = isMobile ? '#ddd' : '#ccc'}
              required
            />
          </div>
          
          <div style={styles.inputGroup} className={isMobile ? "mobile-auth-input-group" : ""}>
            <label style={styles.label} className={isMobile ? "mobile-auth-label" : ""} htmlFor="password">Password</label>
            <input
              style={styles.input}
              className={isMobile ? "mobile-auth-input" : ""}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => e.currentTarget.style.borderColor = '#009759'}
              onBlur={(e) => e.currentTarget.style.borderColor = isMobile ? '#ddd' : '#ccc'}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            className={isMobile ? "mobile-auth-button" : ""}
            onMouseOver={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = '#FFA726';
                e.currentTarget.style.boxShadow = '-0.3vw 0.7vh 0.3vh rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = '#FFB74D';
                e.currentTarget.style.boxShadow = '-0.2vw 0.4vh 0.2vh rgba(0, 0, 0, 0.25)';
              }
            }}
          >
            Login
          </button>
        </form>
        
        <div className={isMobile ? "mobile-auth-link" : ""}>
          <Link 
            to="/register" 
            style={styles.link}
            onMouseOver={(e) => e.currentTarget.style.color = '#FE0000'}
            onMouseOut={(e) => e.currentTarget.style.color = '#009759'}
          >
            Don't have an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
