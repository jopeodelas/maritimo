import { createStyles } from '../styles/styleUtils';
import OptimizedImage from './OptimizedImage';
import maritimoCrest from '../assets/maritimo-crest.png';

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

const MobileHeader = ({ onMenuToggle }: MobileHeaderProps) => {
  const styles = createStyles({
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: 'linear-gradient(135deg, #009759 0%, #006633 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      zIndex: 1000,
      borderBottom: '3px solid #FFBB4C',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    },
    menuButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      padding: '0.5rem',
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flex: 1,
      justifyContent: 'center',
      marginRight: '44px', // Para compensar o espaço do menu button
    },
    logoImage: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: 'white',
      padding: '3px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
    },
    logoText: {
      color: 'white',
      fontSize: '1rem',
      fontWeight: '800',
      margin: 0,
      fontFamily: '"Shockwave", cursive',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    },
    spacer: {
      width: '44px', // Para manter o logo centralizado
    },
  });

  return (
    <header style={styles.header}>
      <button 
        style={styles.menuButton}
        onClick={onMenuToggle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Abrir menu"
      >
        ☰
      </button>
      
      <div style={styles.logoSection}>
        <OptimizedImage 
          src={maritimoCrest} 
          alt="CS Marítimo logo" 
          style={styles.logoImage}
          width="32"
          height="32"
          loading="eager"
        />
        <h1 style={styles.logoText}>CS MARÍTIMO</h1>
      </div>
      
      <div style={styles.spacer}></div>
    </header>
  );
};

export default MobileHeader; 