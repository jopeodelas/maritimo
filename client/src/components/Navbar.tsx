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
      padding: '1vh 1.5vw',
      boxShadow: '0 0.3vh 1.5vh rgba(0, 0, 0, 0.15)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      borderBottom: '3px solid #FFBB4C',
    },
    navContent: {
      maxWidth: '1600px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1.5vw',
      minHeight: '6vh',
      width: '100%',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.6vw',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      textDecoration: 'none',
      flex: '0 0 auto',
      minWidth: 'fit-content',
      marginRight: '1vw',
    },
    logoImage: {
      width: '2.5vw',
      height: '2.5vw',
      borderRadius: '50%',
      backgroundColor: 'white',
      padding: '0.15vw',
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
      fontSize: '1.4vw',
      fontWeight: '800',
      margin: 0,
      fontFamily: '"Shockwave", cursive',
      textShadow: '0.1vh 0.1vh 0.3vh rgba(0, 0, 0, 0.3)',
      lineHeight: '1',
      whiteSpace: 'nowrap',
    },
    logoSubtext: {
      color: '#FFBB4C',
      fontSize: '0.6vw',
      margin: 0,
      fontWeight: '400',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.3)',
      lineHeight: '1.2',
      whiteSpace: 'nowrap',
    },
    navLinks: {
      display: 'flex',
      gap: '0.8vw',
      alignItems: 'center',
      flex: '1 1 auto',
      justifyContent: 'center',
      flexWrap: 'nowrap',
      overflow: 'hidden',
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '1vw',
      fontWeight: '800',
      padding: '0.8vh 1.2vw',
      borderRadius: '0.4vw',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '2px solid transparent',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
    rightSection: {
      display: 'flex',
      gap: '1vw',
      alignItems: 'center',
      flex: '0 0 auto',
      marginLeft: '1vw',
    },
    logoutButton: {
      backgroundColor: 'rgba(254, 0, 0, 0.1)',
      color: 'white',
      border: '2px solid rgba(254, 0, 0, 0.5)',
      padding: '0.8vh 1.2vw',
      borderRadius: '0.4vw',
      fontSize: '1vw',
      fontWeight: '800',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '0.05vh 0.05vh 0.2vh rgba(0, 0, 0, 0.3)',
      whiteSpace: 'nowrap',
    },
    '@media (max-width: 1200px)': {
      navbar: {
        padding: '1vh 1vw',
      },
      navContent: {
        gap: '1vw',
      },
      logoText: {
        fontSize: '1.8vw',
      },
      logoSubtext: {
        fontSize: '0.8vw',
      },
      navLink: {
        fontSize: '1.2vw',
        padding: '0.7vh 1vw',
      },
      logoutButton: {
        fontSize: '1.1vw',
        padding: '0.7vh 1.1vw',
      },
    } as any,
    '@media (max-width: 768px)': {
      navbar: {
        padding: '1vh 1vw',
      },
      navContent: {
        gap: '0.8vw',
      },
      logoSection: {
        gap: '0.4vw',
        marginRight: '0.5vw',
      },
      logoImage: {
        width: '5vw',
        height: '5vw',
      },
      logoText: {
        fontSize: '2.5vw',
      },
      logoSubtext: {
        fontSize: '1.2vw',
      },
      navLinks: {
        gap: '0.8vw',
      },
      navLink: {
        fontSize: '2.2vw',
        padding: '0.6vh 1.6vw',
      },
      logoutButton: {
        fontSize: '2vw',
        padding: '0.6vh 2.1vw',
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
          to="/home"
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
            to="/home"
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
            to="/ratings"
            style={styles.navLink}
            className="hover-nav-link"
            role="menuitem"
            aria-label="Ir para página de avaliação dos jogadores"
          >
            Avaliações
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
            to="/schedule"
            style={styles.navLink}
            className="hover-nav-link"
            role="menuitem"
            aria-label="Ir para página de calendário"
          >
            Calendário
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