import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { createStyles } from '../styles/styleUtils';

interface Player {
  id: number;
  name: string;
  position: string;
  image_url: string;
  vote_count: number;
}

const VotingPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [userVotes, setUserVotes] = useState<number[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logout } = useAuth();

  const styles = createStyles({
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    topBar: {
      background: 'linear-gradient(135deg, #009759 0%, #006633 100%)',
      padding: '1.5vh 2vw',
      boxShadow: '0 0.2vh 1vh rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    topBarContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '2vh',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1vw',
    },
    logoText: {
      color: 'white',
      fontSize: '1.8vw',
      fontWeight: '700',
      margin: 0,
    },
    logoSubtext: {
      color: '#FFBB4C',
      fontSize: '0.9vw',
      margin: 0,
      fontWeight: '4000',
    },
    topBarButtons: {
      display: 'flex',
      gap: '1vw',
      alignItems: 'center',
    },
    modernButton: {
      padding: '1vh 2vw',
      borderRadius: '0.5vw',
      border: 'none',
      fontSize: '1vw',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5vw',
    },
    confirmButton: {
      backgroundColor: '#FFBB4C',
      color: '#006633',
      disabled: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
        cursor: 'not-allowed',
      },
    },
    logoutButton: {
      backgroundColor: 'transparent',
      color: 'white',
      border: '0.1vh solid rgba(255, 255, 255, 0.3)',
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '3vh 2vw',
    },
    header: {
      textAlign: 'center',
      marginBottom: '4vh',
    },
    title: {
      fontSize: '3vw',
      fontWeight: '800',
      color: '#212529',
      margin: '0 0 1vh 0',
      background: 'linear-gradient(135deg, #009759 0%, #006633 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      fontSize: '1.2vw',
      color: '#6c757d',
      margin: 0,
      fontWeight: '400',
    },
    selectionInfo: {
      background: 'linear-gradient(135deg, #FFBB4C 0%, #FFB74D 100%)',
      color: '#006633',
      padding: '1.5vh 2vw',
      borderRadius: '1vw',
      marginBottom: '3vh',
      textAlign: 'center',
      fontSize: '1.1vw',
      fontWeight: '600',
      boxShadow: '0 0.2vh 1vh rgba(255, 187, 76, 0.3)',
    },
    loading: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '60vh',
      gap: '2vh',
    },
    loadingSpinner: {
      width: '4vw',
      height: '4vw',
      border: '0.3vw solid #e9ecef',
      borderTop: '0.3vw solid #009759',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      fontSize: '1.2vw',
      color: '#6c757d',
      fontWeight: '500',
    },
    positionSection: {
      marginBottom: '5vh',
    },
    positionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1vw',
      marginBottom: '2vh',
      padding: '1vh 0',
      borderBottom: '0.1vh solid #dee2e6',
    },
    positionIcon: {
      fontSize: '1.5vw',
    },
    positionTitle: {
      fontSize: '1.5vw',
      fontWeight: '700',
      color: '#212529',
      margin: 0,
    },
    positionCount: {
      fontSize: '0.9vw',
      color: '#6c757d',
      fontWeight: '500',
    },
    playersGrid: {
      display: 'grid',
      gap: '2vw',
      gridTemplateColumns: 'repeat(auto-fill, minmax(15vw, 1fr))',
    },
    playerCard: {
      backgroundColor: 'white',
      borderRadius: '1vw',
      overflow: 'hidden',
      boxShadow: '0 0.2vh 1vh rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      border: '0.1vh solid transparent',
    },
    selectedCard: {
      border: '0.2vh solid #FFBB4C',
      boxShadow: '0 0.5vh 2vh rgba(255, 187, 76, 0.3)',
      transform: 'translateY(-0.2vh)',
    },
    votedCard: {
      opacity: 0.6,
      cursor: 'not-allowed',
      filter: 'grayscale(50%)',
    },
    playerImageContainer: {
      position: 'relative',
      height: '22vh',
      overflow: 'hidden',
    },
    playerImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center',
      transition: 'transform 0.3s ease',
    },
    selectionOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 187, 76, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    selectedOverlay: {
      opacity: 1,
    },
    checkIcon: {
      width: '3vw',
      height: '3vw',
      backgroundColor: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5vw',
      color: '#009759',
      fontWeight: 'bold',
    },
    votedBadge: {
      position: 'absolute',
      top: '1vh',
      right: '1vw',
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '0.5vh 1vw',
      borderRadius: '2vw',
      fontSize: '0.8vw',
      fontWeight: '600',
      zIndex: 2,
    },
    playerInfo: {
      padding: '1.5vh 1.5vw',
    },
    playerName: {
      fontSize: '1.1vw',
      fontWeight: '6rem',
      color: '#212529',
      margin: '0 0 0.5vh 0',
      lineHeight: '1.3',
    },
    playerPosition: {
      fontSize: '0.9vw',
      color: '#6c757d',
      margin: '0 0 1vh 0',
      fontWeight: '500',
    },
    playerStats: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    voteCount: {
      fontSize: '0.9vw',
      fontWeight: '600',
      color: '#009759',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3vw',
    },
    playerNumber: {
      fontSize: '0.8vw',
      color: '#adb5bd',
      fontWeight: '500',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, votesRes] = await Promise.all([
          axios.get('/api/players', { withCredentials: true }),
          axios.get('/api/votes/user', { withCredentials: true })
        ]);
        
        setPlayers(playersRes.data);
        setUserVotes(votesRes.data.map((vote: any) => vote.player_id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlayerSelect = (playerId: number) => {
    if (userVotes.includes(playerId)) return;
    
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleConfirmVotes = async () => {
    if (selectedPlayers.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedPlayers.map(playerId => 
          axios.post('/api/votes', { playerId }, { withCredentials: true })
        )
      );
      
      setUserVotes([...userVotes, ...selectedPlayers]);
      setPlayers(players.map(player => 
        selectedPlayers.includes(player.id)
          ? { ...player, vote_count: Number(player.vote_count) + 1 }
          : player
      ));
      setSelectedPlayers([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group players by position
  const groupedPlayers = {
    goalkeepers: {
      players: players.filter(player => 
        player.position.toLowerCase().includes('goalkeeper') || 
        player.position.toLowerCase().includes('gk') ||
        player.position.toLowerCase().includes('guarda-redes')
      ),
      title: 'Goalkeepers',
      icon: ''
    },
    defenders: {
      players: players.filter(player => 
        player.position.toLowerCase().includes('defender') || 
        player.position.toLowerCase().includes('defence') ||
        player.position.toLowerCase().includes('defesa') ||
        player.position.toLowerCase().includes('central') ||
        player.position.toLowerCase().includes('lateral')
      ),
      title: 'Defenders',
      icon: ''
    },
    midfielders: {
      players: players.filter(player => 
        player.position.toLowerCase().includes('midfielder') || 
        player.position.toLowerCase().includes('midfield') ||
        player.position.toLowerCase().includes('médio') ||
        player.position.toLowerCase().includes('meio') ||
        player.position.toLowerCase().includes('medio')
      ),
      title: 'Midfielders',
      icon: ''
    },
    forwards: {
      players: players.filter(player => 
        player.position.toLowerCase().includes('forward') || 
        player.position.toLowerCase().includes('striker') ||
        player.position.toLowerCase().includes('winger') ||
        player.position.toLowerCase().includes('extremo') ||
        player.position.toLowerCase().includes('atacante') ||
        player.position.toLowerCase().includes('avançado')
      ),
      title: 'Forwards',
      icon: ''
    }
  };

  const renderPlayerCard = (player: Player, index: number) => {
    const isVoted = userVotes.includes(player.id);
    const isSelected = selectedPlayers.includes(player.id);
    
    return (
      <div 
        key={player.id} 
        style={{
          ...styles.playerCard,
          ...(isSelected ? styles.selectedCard : {}),
          ...(isVoted ? styles.votedCard : {})
        }}
        onClick={() => handlePlayerSelect(player.id)}
        onMouseOver={(e) => {
          if (!isVoted) {
            e.currentTarget.style.transform = 'translateY(-0.3vh)';
            e.currentTarget.style.boxShadow = '0 0.5vh 2vh rgba(0, 0, 0, 0.15)';
            const img = e.currentTarget.querySelector('img');
            if (img) img.style.transform = 'scale(1.05)';
          }
        }}
        onMouseOut={(e) => {
          if (!isVoted) {
            e.currentTarget.style.transform = isSelected ? 'translateY(-0.2vh)' : 'translateY(0)';
            e.currentTarget.style.boxShadow = isSelected 
              ? '0 0.5vh 2vh rgba(255, 187, 76, 0.3)' 
              : '0 0.2vh 1vh rgba(0, 0, 0, 0.08)';
            const img = e.currentTarget.querySelector('img');
            if (img) img.style.transform = 'scale(1)';
          }
        }}
      >
        <div style={styles.playerImageContainer}>
          {isVoted && <div style={styles.votedBadge}>VOTED</div>}
          
          <img 
            src={`/images/${player.image_url.replace('/images/', '')}`}
            alt={player.name} 
            style={styles.playerImage} 
          />
          
          <div style={{
            ...styles.selectionOverlay,
            ...(isSelected ? styles.selectedOverlay : {})
          }}>
            <div style={styles.checkIcon}>✓</div>
          </div>
        </div>
        
        <div style={styles.playerInfo}>
          <h3 style={styles.playerName}>{player.name}</h3>
          <p style={styles.playerPosition}>{player.position}</p>
          <div style={styles.playerStats}>
            <div style={styles.voteCount}>
              👥 {player.vote_count} votes
            </div>
            <div style={styles.playerNumber}>#{index + 1}</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={styles.topBarContent}>
            <div style={styles.logo}>
              <div>
                <h1 style={styles.logoText}>CS Marítimo</h1>
                <p style={styles.logoSubtext}>Player Voting</p>
              </div>
            </div>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.loading}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading players...</p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.topBarContent}>
          <div style={styles.logo}>
            <div>
              <h1 style={styles.logoText}>CS Marítimo</h1>
              <p style={styles.logoSubtext}>Player Voting System</p>
            </div>
          </div>
          <div style={styles.topBarButtons}>
            <button 
              onClick={handleConfirmVotes}
              disabled={selectedPlayers.length === 0 || isSubmitting}
              style={{
                ...styles.modernButton,
                ...styles.confirmButton,
                ...(selectedPlayers.length === 0 || isSubmitting ? styles.confirmButton.disabled : {})
              }}
              onMouseOver={(e) => {
                if (selectedPlayers.length > 0 && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#FFA726';
                  e.currentTarget.style.transform = 'translateY(-0.1vh)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedPlayers.length > 0 && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#FFBB4C';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isSubmitting ? 'Voting...' : `✓ Confirm (${selectedPlayers.length})`}
            </button>
            <button 
              onClick={logout} 
              style={{...styles.modernButton, ...styles.logoutButton}}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-0.1vh)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Vote to Sell Players</h1>
          <p style={styles.subtitle}>Select the players you think should be sold this transfer window</p>
        </div>

        {selectedPlayers.length > 0 && (
          <div style={styles.selectionInfo}>
            {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} selected for voting
          </div>
        )}

        {Object.entries(groupedPlayers).map(([key, group]) => {
          if (group.players.length === 0) return null;
          
          return (
            <div key={key} style={styles.positionSection}>
              <div style={styles.positionHeader}>
                <span style={styles.positionIcon}>{group.icon}</span>
                <h2 style={styles.positionTitle}>{group.title}</h2>
                <span style={styles.positionCount}>({group.players.length} players)</span>
              </div>
              <div style={styles.playersGrid}>
                {group.players.map((player, index) => renderPlayerCard(player, index))}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VotingPage;
