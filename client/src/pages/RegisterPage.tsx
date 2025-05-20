import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStyles } from '../styles/styleUtils';

const styles = createStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(to right, #006633 50%, #FF0000 50%)',
    padding: '20px',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '1.8rem',
    color: '#006633',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  input: {
    padding: '0.8rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '0.8rem',
    backgroundColor: '#006633',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'background-color 0.3s',
  },
  error: {
    color: '#FF0000',
    marginTop: '1rem',
    textAlign: 'center',
  },
  link: {
    color: '#006633',
    textDecoration: 'none',
    marginTop: '1rem',
    textAlign: 'center',
    display: 'block',
  },
});

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await register(username, email, password);
      navigate('/voting');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Register for CS Marítimo Voting</h1>
        
        {error && <p style={styles.error}>{error}</p>}
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="username">Username</label>
            <input
              style={styles.input}
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              style={styles.input}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#004d26'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#006633'}
          >
            Register
          </button>
        </form>
        
        <Link to="/login" style={styles.link}>
          Already have an account? Login here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;