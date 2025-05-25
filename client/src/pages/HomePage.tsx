// src/pages/HomePage.tsx
import { useNavigate } from 'react-router-dom';
import maritimoCrest from '../assets/maritimo-crest.png';
import { createStyles } from '../styles/styleUtils';

const HomePage = () => {
  const navigate = useNavigate();
  
  const handleEnter = () => {
    navigate('/login');
  };
  
  const styles = createStyles({
    homeContainer: {
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    // Solid background colors
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

    // Fan image overlay
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
    // Main content
    content: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 10,
    },
    title: {
      fontFamily: '"Shockwave", cursive',
      fontSize: '4vw',
      color: '#FFBB4C',
      textAlign: 'center',
      position: 'absolute',
      top: '0.9vh',
      width: '100%',
      fontWeight: 'normal',
      textShadow: '-0.3vw 0.4vh 0.2vh rgba(0, 0, 0, 0.25)',
      zIndex: 10,
    },
    logoContainer: {
      width: '30vw',
      height: '30vw',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.5vw',
      boxShadow: '-0.4vw 1.1vh 0.5vh rgba(0, 0, 0, 0.25)',
      zIndex: 10,
    },
    clubLogo: {
      width: '90%',
      height: 'auto',
    },
    enterButton: {
      width: '15vw',
      padding: '2vh 0',
      fontSize: '1.5vw',
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: '#FFB74D',
      border: 'none',
      borderRadius: '0.5vw',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      marginTop: '3vh',
      boxShadow: '-0.3vw 0.7vh 0.2vh rgba(0, 0, 0, 0.25)',
      zIndex: 10,
    },
    hoverMe: {
      position: 'absolute',
      left: '19%',
      bottom: '20%',
      fontFamily: '"Shockwave", cursive',
      color: '#FFBB4C',
      fontSize: '2vw',
      fontWeight: 'normal',
      textShadow: '-0.3vw 0.3vh 0.3vh rgba(0, 0, 0, 0.25)',
      zIndex: 10,
    },
    // Triangle container
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
  });
  
  return (
    <div style={styles.homeContainer}>
      {/* Solid background colors */}
      <div style={styles.solidBackground}></div>
      <div style={styles.solidBackground2}></div>

      {/* Fans background */}
      <div style={styles.fansBackground}></div>
      
      {/* Golden triangles */}
      <div style={styles.trianglesContainer}>
        <div style={styles.triangle}></div>
        <div style={styles.triangle}></div>
        <div style={styles.triangle}></div>
      </div>
      
      <h1 style={styles.title}>made by fans for fans</h1>
      
      <div style={styles.hoverMe}>HOVER ME</div>
      
      <div style={styles.content}>
        <div style={styles.logoContainer}>
          <img src={maritimoCrest} alt="CS Marítimo" style={styles.clubLogo} />
        </div>
        <button 
          style={styles.enterButton} 
          onClick={handleEnter}
          className="hover-button"
        >
          ENTRAR
        </button>
      </div>
    </div>
  );
};

export default HomePage;
