import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
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
      background: `
        radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)
      `,
      fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      position: "relative",
      overflow: "hidden",
    },
    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        linear-gradient(30deg, transparent 40%, rgba(76, 175, 80, 0.03) 40%, rgba(76, 175, 80, 0.03) 60%, transparent 60%),
        linear-gradient(-30deg, transparent 40%, rgba(244, 67, 54, 0.03) 40%, rgba(244, 67, 54, 0.03) 60%, transparent 60%)
      `,
      backgroundSize: "clamp(3rem, 8vw, 6rem) clamp(3rem, 8vw, 6rem)",
      animation: "float 20s ease-in-out infinite",
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '3vh 2vw',
      position: "relative",
      zIndex: 2,
    },
    header: {
      textAlign: 'center',
      marginBottom: '4vh',
    },
    title: {
      fontSize: '3vw',
      fontWeight: '800',
      color: '#FFFFFF',
      margin: '0 0 1vh 0',
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: "0 0.125rem 0.25rem rgba(255, 215, 0, 0.3)",
    },
    subtitle: {
      fontSize: '1.2vw',
      color: '#B0BEC5',
      margin: 0,
      fontWeight: '400',
    },
    selectionInfo: {
      background: 'linear-gradient(135deg, #FFD700 0%, #FF8F00 100%)',
      color: '#1A252F',
      padding: '1.5vh 2vw',
      borderRadius: '1vw',
      marginBottom: '3vh',
      textAlign: 'center',
      fontSize: '1.1vw',
      fontWeight: '600',
      boxShadow: '0 0.5rem 1.5rem rgba(255, 215, 0, 0.4)',
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
      border: '0.3vw solid rgba(76, 175, 80, 0.2)',
      borderTop: '0.3vw solid #4CAF50',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      fontSize: '1.2vw',
      color: '#B0BEC5',
      fontWeight: '500',
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
      background: 'linear-gradient(135deg, #FFD700 0%, #FF8F00 100%)',
      color: '#1A252F',
      boxShadow: '0 0.5rem 1.5rem rgba(255, 215, 0, 0.4)',
      disabled: {
        backgroundColor: 'rgba(40, 55, 70, 0.9)',
        color: '#78909C',
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
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
      borderBottom: '0.1vh solid rgba(76, 175, 80, 0.3)',
    },
    positionIcon: {
      fontSize: '1.5vw',
    },
    positionTitle: {
      fontSize: '1.5vw',
      fontWeight: '700',
      color: '#FFFFFF',
      margin: 0,
    },
    positionCount: {
      fontSize: '0.9vw',
      color: '#B0BEC5',
      fontWeight: '500',
    },
    playersGrid: {
      display: 'grid',
      gap: '2vw',
      gridTemplateColumns: 'repeat(auto-fill, minmax(15vw, 1fr))',
    },
    playerCard: {
      background: 'rgba(40, 55, 70, 0.9)',
      border: '1px solid rgba(76, 175, 80, 0.2)',
      borderRadius: '1vw',
      overflow: 'hidden',
      boxShadow: '0 0.2vh 1vh rgba(0, 0, 0, 0.4)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      backdropFilter: 'blur(20px)',
    },
    selectedCard: {
      border: '0.2vh solid #FFD700',
      boxShadow: '0 0.5vh 2vh rgba(255, 215, 0, 0.4)',
      transform: 'translateY(-0.2vh)',
      background: 'rgba(50, 70, 90, 0.95)',
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
      backgroundColor: 'rgba(255, 215, 0, 0.9)',
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
      backgroundColor: '#1A252F',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5vw',
      color: '#4CAF50',
      fontWeight: 'bold',
    },
    votedBadge: {
      position: 'absolute',
      top: '1vh',
      right: '1vw',
      backgroundColor: '#F44336',
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
      fontWeight: '600',
      color: '#FFFFFF',
      margin: '0 0 0.5vh 0',
      lineHeight: '1.3',
    },
    playerPosition: {
      fontSize: '0.9vw',
      color: '#B0BEC5',
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
      color: '#4CAF50',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3vw',
    },
    playerNumber: {
      fontSize: '0.8vw',
      color: '#78909C',
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
        
        setPlayers(playersRes.data.players || playersRes.data);
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
            e.currentTarget.style.boxShadow = '0 1vh 2vh rgba(76, 175, 80, 0.3)';
            e.currentTarget.style.borderColor = '#4CAF50';
            e.currentTarget.style.background = 'rgba(50, 70, 90, 0.95)';
            const img = e.currentTarget.querySelector('img');
            if (img) img.style.transform = 'scale(1.05)';
          }
        }}
        onMouseOut={(e) => {
          if (!isVoted) {
            e.currentTarget.style.transform = isSelected ? 'translateY(-0.2vh)' : 'translateY(0)';
            e.currentTarget.style.boxShadow = isSelected 
              ? '0 0.5vh 2vh rgba(255, 215, 0, 0.4)' 
              : '0 0.2vh 1vh rgba(0, 0, 0, 0.4)';
            e.currentTarget.style.borderColor = isSelected ? '#FFD700' : 'rgba(76, 175, 80, 0.2)';
            e.currentTarget.style.background = isSelected ? 'rgba(50, 70, 90, 0.95)' : 'rgba(40, 55, 70, 0.9)';
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
        <div style={styles.backgroundPattern}></div>
        <Navbar />
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
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(5px) rotate(-1deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <Navbar />

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

        <div style={{ textAlign: 'center', marginBottom: '3vh' }}>
          <button 
            onClick={handleConfirmVotes}
            disabled={selectedPlayers.length === 0 || isSubmitting}
            style={{
              ...styles.modernButton,
              ...styles.confirmButton,
              ...(selectedPlayers.length === 0 || isSubmitting ? styles.confirmButton.disabled : {}),
              padding: '1.5vh 3vw',
              fontSize: '1.2vw'
            }}
            onMouseOver={(e) => {
              if (selectedPlayers.length > 0 && !isSubmitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FFA726 0%, #FF8F00 100%)';
                e.currentTarget.style.transform = 'translateY(-0.1vh) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 1vh 2vh rgba(255, 215, 0, 0.6)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedPlayers.length > 0 && !isSubmitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700 0%, #FF8F00 100%)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 0.5rem 1.5rem rgba(255, 215, 0, 0.4)';
              }
            }}
          >
            {isSubmitting ? 'Voting...' : `✓ Confirm Votes (${selectedPlayers.length})`}
          </button>
        </div>

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
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

export default VotingPage;
