// src/pages/HomePage.tsx
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import maritimoCrest from '../assets/maritimo-crest.png';
import useIsMobile from '../hooks/useIsMobile';
import '../styles/AllpagesStyles.css';
import Seo from '../components/Seo';

const HomePage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleEnter = () => {
    navigate('/login');
  };
  
  return (
    <>
      <Seo 
        title="CS Marítimo Fans Made by Fans for Fans" 
        description="Portal dos adeptos do CS Marítimo. Votações de jogador, Maritodle, notícias, transferências e chat ao vivo." 
      />
      <div className={`homepage-container ${isMobile ? "mobile-homepage-container" : ""}`}>
        {/* Solid background colors */}
        <div className="homepage-solid-background"></div>
        <div className="homepage-solid-background-2"></div>

        {/* Fans background */}
        <div className="homepage-fans-background"></div>
        
        {/* Golden triangles */}
        <div className={`homepage-triangles-container ${isMobile ? "mobile-homepage-triangles" : ""}`}>
          <div className="homepage-triangle"></div>
          <div className="homepage-triangle"></div>
          <div className="homepage-triangle"></div>
        </div>
        
        <h1 className={`homepage-title ${isMobile ? "mobile-homepage-title" : ""}`}> 
          Marítimo Fans – Made by Fans for Fans
        </h1>
        
      
        
        <div className="homepage-content">
          <div className={`homepage-logo-container ${isMobile ? "mobile-homepage-logo-container" : ""}`}>
            <OptimizedImage 
              src={maritimoCrest} 
              alt="CS Marítimo" 
              className="homepage-club-logo"
              loading="eager"
              width="300"
              height="273"
            />
          </div>
          <button 
            className={`homepage-enter-button ${isMobile ? "mobile-homepage-button" : ""}`}
            onClick={handleEnter}
          >
            ENTRAR
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
