import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStyles } from '../styles/styleUtils';
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
    },
    logoImage: {
      width: '3.5vw',
      height: '3.5vw',
      borderRadius: '50%',
      backgroundColor: 'white',
      padding: '0.3vw',
      boxShadow: '0 0.2vh 0.8vh rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.3s ease',
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
    <nav style={styles.navbar}>
      <div style={styles.navContent}>
        <div 
          style={styles.logoSection} 
          onClick={() => navigate('/main')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            const img = e.currentTarget.querySelector('img');
            if (img) img.style.transform = 'rotate(5deg) scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            const img = e.currentTarget.querySelector('img');
            if (img) img.style.transform = 'rotate(0deg) scale(1)';
          }}
        >
          <img src={maritimoCrest} alt="CS Marítimo" style={styles.logoImage} />
          <div style={styles.logoTextContainer}>
            <h2 style={styles.logoText}>CS MARÍTIMO</h2>
            <p style={styles.logoSubtext}>made by fans for fans</p>
          </div>
        </div>

        <div style={styles.navLinks}>
          <a
            style={styles.navLink}
            onClick={() => navigate('/main')}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 187, 76, 0.2)';
              e.currentTarget.style.color = '#FFBB4C';
              e.currentTarget.style.borderColor = '#FFBB4C';
              e.currentTarget.style.transform = 'translateY(-0.1vh)';
              e.currentTarget.style.boxShadow = '0 0.3vh 1vh rgba(255, 187, 76, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Início
          </a>
          <a
            style={styles.navLink}
            onClick={() => navigate('/voting')}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 187, 76, 0.2)';
              e.currentTarget.style.color = '#FFBB4C';
              e.currentTarget.style.borderColor = '#FFBB4C';
              e.currentTarget.style.transform = 'translateY(-0.1vh)';
              e.currentTarget.style.boxShadow = '0 0.3vh 1vh rgba(255, 187, 76, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Votação
          </a>
          <a
            style={styles.navLink}
            onClick={() => navigate('/news')}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 187, 76, 0.2)';
              e.currentTarget.style.color = '#FFBB4C';
              e.currentTarget.style.borderColor = '#FFBB4C';
              e.currentTarget.style.transform = 'translateY(-0.1vh)';
              e.currentTarget.style.boxShadow = '0 0.3vh 1vh rgba(255, 187, 76, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Notícias
          </a>
        </div>

        <div style={styles.rightSection}>
          <button
            style={styles.logoutButton}
            onClick={handleLogout}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(254, 0, 0, 0.2)';
              e.currentTarget.style.borderColor = '#FE0000';
              e.currentTarget.style.transform = 'translateY(-0.1vh)';
              e.currentTarget.style.boxShadow = '0 0.3vh 1vh rgba(254, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(254, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(254, 0, 0, 0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 