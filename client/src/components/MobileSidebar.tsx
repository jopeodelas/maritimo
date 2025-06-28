import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStyles } from '../styles/styleUtils';
import OptimizedImage from './OptimizedImage';
import maritimoCrest from '../assets/maritimo-crest.png';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const styles = createStyles({
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? 'visible' : 'hidden',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(5px)',
    },
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '280px',
      maxWidth: '80vw',
      backgroundColor: '#1A252F',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
      borderRight: '3px solid #4CAF50',
    },
    header: {
      padding: '1.5rem 1rem',
      borderBottom: '2px solid rgba(76, 175, 80, 0.3)',
      background: 'linear-gradient(135deg, #009759 0%, #006633 100%)',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.5rem',
    },
    logoImage: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'white',
      padding: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    },
    logoText: {
      color: 'white',
      fontSize: '1.2rem',
      fontWeight: '800',
      margin: 0,
      fontFamily: '"Shockwave", cursive',
      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
    },
    logoSubtext: {
      color: '#FFBB4C',
      fontSize: '0.75rem',
      margin: 0,
      fontWeight: '400',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    },
    userInfo: {
      color: 'white',
      fontSize: '0.9rem',
      opacity: 0.9,
      marginTop: '0.5rem',
    },
    navigation: {
      flex: 1,
      padding: '1rem 0',
      overflowY: 'auto',
    },
    navSection: {
      marginBottom: '1.5rem',
    },
    sectionTitle: {
      color: '#4CAF50',
      fontSize: '0.8rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '0 1rem',
      marginBottom: '0.5rem',
      opacity: 0.8,
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.875rem 1rem',
      color: 'white',
      textDecoration: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      borderLeft: '4px solid transparent',
      cursor: 'pointer',
    },
    navLinkHover: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderLeftColor: '#4CAF50',
      color: '#4CAF50',
    },
    navIcon: {
      marginRight: '0.75rem',
      fontSize: '1.1rem',
      width: '20px',
      textAlign: 'center',
    },
    adminLink: {
      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      borderLeftColor: '#FFD700',
      margin: '0 0.5rem',
      borderRadius: '8px',
      border: '2px solid #FFD700',
    },
    footer: {
      padding: '1rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    logoutButton: {
      width: '100%',
      backgroundColor: 'rgba(244, 67, 54, 0.2)',
      color: 'white',
      border: '2px solid rgba(244, 67, 54, 0.5)',
      padding: '0.875rem 1rem',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '1.2rem',
      transition: 'all 0.2s ease',
    },
  });

  const navigationItems = [
    { section: 'Principal', items: [
      { label: 'Início', path: '/main', icon: '🏠' },
      { label: 'Votação', path: '/voting', icon: '🗳️' },
      { label: 'Avaliações', path: '/ratings', icon: '⭐' },
    ]},
    { section: 'Equipa', items: [
      { label: 'Plantel', path: '/squad', icon: '👥' },
      { label: 'Calendário', path: '/schedule', icon: '📅' },
      { label: 'História', path: '/history', icon: '📚' },
    ]},
    { section: 'Comunidade', items: [
      { label: 'Notícias', path: '/news', icon: '📰' },
      { label: 'Discussão', path: '/chat', icon: '💬' },
      { label: 'Maritôdle', path: '/maritodle', icon: '🎮' },
    ]},
  ];

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.sidebar}>
        <button style={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        <div style={styles.header}>
          <div style={styles.logoSection}>
            <OptimizedImage 
              src={maritimoCrest} 
              alt="CS Marítimo logo" 
              style={styles.logoImage}
              width="40"
              height="40"
              loading="eager"
            />
            <div>
              <h2 style={styles.logoText}>CS MARÍTIMO</h2>
              <p style={styles.logoSubtext}>made by fans for fans</p>
            </div>
          </div>
          <div style={styles.userInfo}>
            Olá, {user?.username}! 👋
          </div>
        </div>

        <nav style={styles.navigation}>
          {navigationItems.map((section) => (
            <div key={section.section} style={styles.navSection}>
              <div style={styles.sectionTitle}>{section.section}</div>
              {section.items.map((item) => (
                <div
                  key={item.path}
                  style={styles.navLink}
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, styles.navLinkHover);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, styles.navLink);
                  }}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
          
          {user?.is_admin && (
            <div style={styles.navSection}>
              <div style={styles.sectionTitle}>Administração</div>
              <div
                style={{...styles.navLink, ...styles.adminLink}}
                onClick={() => handleNavigation('/admin')}
              >
                <span style={styles.navIcon}>⚙️</span>
                Admin Panel
              </div>
            </div>
          )}
        </nav>

        <div style={styles.footer}>
          <button
            style={styles.logoutButton}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.2)';
            }}
          >
            <span>🚪</span>
            Terminar Sessão
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar; 