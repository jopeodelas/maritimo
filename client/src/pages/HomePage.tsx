// src/pages/HomePage.tsx
import { useNavigate } from 'react-router-dom';
import maritimoCrest from '../assets/maritimo-crest.png';
import { createStyles } from '../styles/styleUtils';

const styles = createStyles({
  homeContainer: {
    display: 'flex',
    height: '100vh',
    background: 'linear-gradient(to right, #009759 50%, #FE0000 50%)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '2.5rem',
    color: '#FFBB4C', /* gold color */
    textAlign: 'center',
    marginBottom: '2rem',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  },
  logoContainer: {
    width: '300px',
    height: '300px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    marginBottom: '2rem',
  },
  clubLogo: {
    width: '80%',
    height: 'auto',
  },
  enterButton: {
    padding: '1rem 3rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#FFB74D', /* amber color */
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#FFA726',
    }
  },
});

const HomePage = () => {
  const navigate = useNavigate();
  
  const handleEnter = () => {
    navigate('/login');
  };
  
  return (
    <div style={styles.homeContainer}>
      <div style={styles.content}>
        <h1 style={styles.title}>PARA OS MARITMISTAS DE GEMA</h1>
        <div style={styles.logoContainer}>
          <img src={maritimoCrest} alt="CS Marítimo" style={styles.clubLogo} />
        </div>
        <button 
          style={styles.enterButton} 
          onClick={handleEnter}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFA726'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFB74D'}
        >
          ENTRAR
        </button>
      </div>
    </div>
  );
};

export default HomePage;
