import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStyles } from '../styles/styleUtils';
import maritimoCrest from '../assets/maritimo-crest.png';

const LoginPage = () => {
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
      navigate('/voting');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/voting');
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
        boxSizing: 'border-box',
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
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      padding: '2vw',
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
    
    // Form styles - ajustados para resolução de problemas
    formContainer: {
      backgroundColor: 'white',
      padding: '2.5vw',
      borderRadius: '0.5vw',
      width: '90%',
      maxWidth: '30vw',
      boxShadow: '-0.4vw 1.1vh 0.5vh rgba(0, 0, 0, 0.25)',
      zIndex: 10,
      position: 'relative',
      boxSizing: 'border-box',
    },
    logo: {
      width: '6vw',
      height: 'auto',
      margin: '0 auto 2vh',
      display: 'block',
    },
    title: {
      fontSize: '2vw',
      color: '#009759',
      marginBottom: '2vh',
      textAlign: 'center',
      fontWeight: 'bold',
      textShadow: '0.1vh 0.1vh 0.1vh rgba(0, 0, 0, 0.1)',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2vh',
      width: '100%',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1vh',
      width: '100%',
    },
    label: {
      fontSize: '1.2vw',
      fontWeight: 'bold',
      color: '#333',
    },
    input: {
      padding: '1.2vh 1vw',
      borderRadius: '0.3vw',
      border: '1px solid #ccc',
      fontSize: '1vw',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s',
      outline: 'none',
    },
    activeInput: {
      borderColor: '#009759',
    },
    button: {
      padding: '1.5vh 0',
      backgroundColor: '#FFB74D',
      color: 'white',
      border: 'none',
      borderRadius: '0.4vw',
      fontSize: '1.2vw',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '2vh',
      width: '100%',
      transition: 'all 0.3s',
      boxShadow: '-0.2vw 0.4vh 0.2vh rgba(0, 0, 0, 0.25)',
    },
    // Botão do Google corrigido
    googleButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5vh 1vw',
      backgroundColor: '#fff',
      color: '#757575',
      border: '1px solid #ddd',
      borderRadius: '0.4vw',
      fontSize: '1.2vw',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '2vh',
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
      width: '1.8vw',
      height: '1.8vw',
      flexShrink: 0,
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      color: '#757575',
      fontSize: '1vw',
      margin: '2vh 0',
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
      marginTop: '1.5vh',
      textAlign: 'center',
      fontSize: '1vw',
    },
    link: {
      color: '#009759',
      textDecoration: 'none',
      marginTop: '2vh',
      textAlign: 'center',
      display: 'block',
      fontSize: '1vw',
      transition: 'color 0.3s',
    },
  });

  return (
    <div style={styles.container}>
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
      <div style={styles.formContainer}>
        <img src={maritimoCrest} alt="CS Marítimo" style={styles.logo} />
        <h1 style={styles.title}>Login to CS Marítimo Voting</h1>
        
        {error && <p style={styles.error}>{error}</p>}
        
        {/* Google Login Button - corrigido */}
        <button 
          type="button" 
          style={styles.googleButton}
          onClick={handleGoogleLogin}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
            e.currentTarget.style.boxShadow = '0 0.3vh 0.5vh rgba(0, 0, 0, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.boxShadow = '0 0.2vh 0.4vh rgba(0, 0, 0, 0.1)';
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
        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine}></div>
        </div>
        
        {/* Regular login form */}
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              style={styles.input}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.currentTarget.style.borderColor = '#009759'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#ccc'}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              style={styles.input}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => e.currentTarget.style.borderColor = '#009759'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#ccc'}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#FFA726';
              e.currentTarget.style.boxShadow = '-0.3vw 0.7vh 0.3vh rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFB74D';
              e.currentTarget.style.boxShadow = '-0.2vw 0.4vh 0.2vh rgba(0, 0, 0, 0.25)';
            }}
          >
            Login
          </button>
        </form>
        
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
  );
};

export default LoginPage;
