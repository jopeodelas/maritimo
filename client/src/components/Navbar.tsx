import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStyles } from '../styles/styleUtils';
import OptimizedImage from './OptimizedImage';
import maritimoCrest from '../assets/maritimo-crest.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
      gap: '2vw',
      minHeight: '6vh',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1vw',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      textDecoration: 'none',
      flex: '0 0 auto',
      minWidth: 'fit-content',
    },
    logoImage: {
      width: '3vw',
      height: '3vw',
      borderRadius: '50%',
      backgroundColor: 'white',
      padding: '0.2vw',
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
      fontSize: '1.6vw',
      fontWeight: '700',
      margin: 0,
      fontFamily: '"Shockwave", cursive',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.3)',
      lineHeight: '1',
      whiteSpace: 'nowrap',
    },
    logoSubtext: {
      color: '#FFBB4C',
      fontSize: '0.7vw',
      margin: 0,
      fontWeight: '400',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.3)',
      lineHeight: '1.2',
      whiteSpace: 'nowrap',
    },
    navLinks: {
      display: 'flex',
      gap: '2vw',
      alignItems: 'center',
      flex: '1 1 auto',
      justifyContent: 'center',
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '1.1vw',
      fontWeight: '600',
      padding: '1vh 1.5vw',
      borderRadius: '0.6vw',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '2px solid transparent',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      display: 'inline-block',
      whiteSpace: 'nowrap',
    },
    rightSection: {
      display: 'flex',
      gap: '1.5vw',
      alignItems: 'center',
      flex: '0 0 auto',
    },
    logoutButton: {
      backgroundColor: 'rgba(254, 0, 0, 0.1)',
      color: 'white',
      border: '2px solid rgba(254, 0, 0, 0.5)',
      padding: '1vh 2vw',
      borderRadius: '0.6vw',
      fontSize: '1vw',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.3)',
      whiteSpace: 'nowrap',
    },
    '@media (max-width: 1200px)': {
      logoText: {
        fontSize: '2vw',
      },
      logoSubtext: {
        fontSize: '0.9vw',
      },
      navLink: {
        fontSize: '1.3vw',
      },
      logoutButton: {
        fontSize: '1.2vw',
      },
    } as any,
    '@media (max-width: 768px)': {
      navbar: {
        padding: '1vh 2vw',
      },
      navContent: {
        gap: '1vw',
      },
      logoImage: {
        width: '6vw',
        height: '6vw',
      },
      logoText: {
        fontSize: '3vw',
      },
      logoSubtext: {
        fontSize: '1.5vw',
      },
      navLinks: {
        gap: '2vw',
      },
      navLink: {
        fontSize: '2.5vw',
        padding: '0.8vh 2vw',
      },
      logoutButton: {
        fontSize: '2.2vw',
        padding: '0.8vh 2.5vw',
      },
    } as any,
    '@media (max-width: 480px)': {
      navContent: {
        flexWrap: 'wrap',
        gap: '1vh',
      },
      logoSection: {
        order: 1,
        width: '100%',
        justifyContent: 'center',
      },
      navLinks: {
        order: 2,
        width: '100%',
        justifyContent: 'center',
        gap: '3vw',
      },
      rightSection: {
        order: 3,
        width: '100%',
        justifyContent: 'center',
      },
      navLink: {
        fontSize: '3.5vw',
        padding: '1vh 3vw',
      },
      logoutButton: {
        fontSize: '3vw',
        padding: '1vh 4vw',
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
            to="/squad"
            style={styles.navLink}
            className="hover-nav-link"
            role="menuitem"
            aria-label="Ir para página do plantel"
          >
            Plantel
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
          <Link
            to="/history"
            style={styles.navLink}
            className="hover-nav-link"
            role="menuitem"
            aria-label="Ir para página de história"
          >
            História
          </Link>
          <Link
            to="/chat"
            style={styles.navLink}
            className="hover-nav-link"
            role="menuitem"
            aria-label="Ir para página de discussões"
          >
            Discussão
          </Link>
          {user?.is_admin && (
            <Link
              to="/admin"
              style={{
                ...styles.navLink,
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                border: '2px solid #FFD700',
                boxShadow: '0 0.2vh 0.8vh rgba(255, 107, 53, 0.3)',
              }}
              className="hover-nav-link"
              role="menuitem"
              aria-label="Ir para painel de administração"
            >
              Admin
            </Link>
          )}
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