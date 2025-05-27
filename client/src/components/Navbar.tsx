import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStyles } from '../styles/styleUtils';
import OptimizedImage from './OptimizedImage';
import maritimoCrest from '../assets/maritimo-crest.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const styles = createStyles({
    navbar: {
      background: 'linear-gradient(135deg, #009759 0%, #006633 100%)',
      padding: '1.5vh 3vw',
      boxShadow: '0 0.3vh 1.5vh rgba(0, 0, 0, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '3px solid #FFBB4C',
    },
    navContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '2vh',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.2vw',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      textDecoration: 'none',
    },
    logoImage: {
      width: '3.5vw',
      height: '3.85vw',
      borderRadius: '50%',
      backgroundColor: 'white',
      padding: '0.3vw',
      boxShadow: '0 0.2vh 0.8vh rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.3s ease',
      objectFit: 'contain',
    },
    logoTextContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    logoText: {
      color: 'white',
      fontSize: '2vw',
      fontWeight: '700',
      margin: 0,
      fontFamily: '"Shockwave", cursive',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.3)',
      lineHeight: '1',
    },
    logoSubtext: {
      color: '#FFBB4C',
      fontSize: '0.9vw',
      margin: 0,
      fontWeight: '400',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.3)',
      lineHeight: '1.2',
    },
    navLinks: {
      display: 'flex',
      gap: '2.5vw',
      alignItems: 'center',
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '1.2vw',
      fontWeight: '600',
      padding: '1.2vh 2vw',
      borderRadius: '0.8vw',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '2px solid transparent',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      display: 'inline-block',
    },
    rightSection: {
      display: 'flex',
      gap: '1.5vw',
      alignItems: 'center',
    },
    logoutButton: {
      backgroundColor: 'rgba(254, 0, 0, 0.1)',
      color: 'white',
      border: '2px solid rgba(254, 0, 0, 0.5)',
      padding: '1.2vh 2.5vw',
      borderRadius: '0.8vw',
      fontSize: '1.1vw',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.3)',
    },
    '@media (max-width: 768px)': {
      navbar: {
        padding: '1vh 2vw',
      },
      navContent: {
        flexDirection: 'column',
        gap: '1.5vh',
      },
      logoImage: {
        width: '8vw',
        height: '8vw',
      },
      logoText: {
        fontSize: '4vw',
      },
      logoSubtext: {
        fontSize: '2vw',
      },
      navLinks: {
        gap: '4vw',
      },
      navLink: {
        fontSize: '3vw',
        padding: '1vh 3vw',
      },
      logoutButton: {
        fontSize: '2.5vw',
        padding: '1vh 4vw',
      },
    } as any,
    '@media (max-width: 480px)': {
      navContent: {
        gap: '1vh',
      },
      logoSection: {
        gap: '2vw',
      },
      navLinks: {
        flexDirection: 'column',
        gap: '1vh',
        width: '100%',
      },
      navLink: {
        width: '100%',
        textAlign: 'center',
      },
    } as any,
  });

  return (
    <nav style={styles.navbar} role="navigation" aria-label="Main navigation">
      <div style={styles.navContent}>
        <Link 
          to="/main"
          style={styles.logoSection} 
          className="hover-logo"
          aria-label="CS Marítimo - Ir para página principal"
        >
          <OptimizedImage 
            src={maritimoCrest} 
            alt="CS Marítimo logo" 
            style={styles.logoImage}
            width="40"
            height="40"
            loading="eager"
          />
          <div style={styles.logoTextContainer}>
            <h2 style={styles.logoText}>CS MARÍTIMO</h2>
            <p style={styles.logoSubtext}>made by fans for fans</p>
          </div>
        </Link>

        <div style={styles.navLinks} role="menubar">
          <Link
            to="/main"
            style={styles.navLink}
            className="hover-nav-link"
            role="menuitem"
            aria-label="Ir para página inicial"
          >
            Início
          </Link>
          <Link
            to="/voting"
            style={styles.navLink}
            className="hover-nav-link"
            role="menuitem"
            aria-label="Ir para página de votação"
          >
            Votação
          </Link>
          <Link
            to="/news"
            style={styles.navLink}
            className="hover-nav-link"
            role="menuitem"
            aria-label="Ir para página de notícias"
          >
            Notícias
          </Link>
        </div>

        <div style={styles.rightSection}>
          <button
            style={styles.logoutButton}
            className="hover-logout"
            onClick={handleLogout}
            aria-label="Terminar sessão"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 