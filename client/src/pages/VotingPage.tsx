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

const styles = createStyles({
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem 0',
    borderBottom: '2px solid #006633',
  },
  title: {
    color: '#006633',
    margin: 0,
    fontSize: '2rem',
  },
  logoutButton: {
    backgroundColor: '#FF0000',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: '1.5rem',
    color: '#006633',
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '2rem',
  },
  playerCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  playerImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  playerInfo: {
    padding: '1rem',
  },
  playerName: {
    margin: '0 0 0.5rem 0',
    color: '#006633',
  },
  playerPosition: {
    margin: '0 0 0.5rem 0',
    color: '#666',
  },
  voteCount: {
    fontWeight: 'bold',
    margin: '0.5rem 0',
  },
  voteButton: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#006633',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '0.5rem',
    transition: 'background-color 0.3s',
  },
  votedButton: {
    backgroundColor: '#cccccc',
    cursor: 'default',
  }
});

const VotingPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [userVotes, setUserVotes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

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

  const handleVote = async (playerId: number) => {
    try {
      await axios.post('/api/votes', { playerId }, { withCredentials: true });
      
      // Update local state
      setUserVotes([...userVotes, playerId]);
      setPlayers(players.map(player => 
        player.id === playerId 
          ? { ...player, vote_count: player.vote_count + 1 } 
          : player
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>CS Marítimo - Vote to Sell Players</h1>
        <button 
          onClick={logout} 
          style={styles.logoutButton}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#cc0000'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF0000'}
        >
          Logout
        </button>
      </header>

      <div style={styles.playersGrid}>
        {players.map(player => (
          <div key={player.id} style={styles.playerCard}>
            <img 
              src={`http://localhost:5000${player.image_url}`}
              alt={player.name} 
              style={styles.playerImage} 
            />
            <div style={styles.playerInfo}>
              <h3 style={styles.playerName}>{player.name}</h3>
              <p style={styles.playerPosition}>Position: {player.position}</p>
              <p style={styles.voteCount}>Votes: {player.vote_count}</p>
              
              <button 
                onClick={() => handleVote(player.id)}
                style={{
                  ...styles.voteButton,
                  ...(userVotes.includes(player.id) ? styles.votedButton : {})
                }}
                disabled={userVotes.includes(player.id)}
                onMouseOver={(e) => {
                  if (!userVotes.includes(player.id)) {
                    e.currentTarget.style.backgroundColor = '#004d26';
                  }
                }}
                onMouseOut={(e) => {
                  if (!userVotes.includes(player.id)) {
                    e.currentTarget.style.backgroundColor = '#006633';
                  }
                }}
              >
                {userVotes.includes(player.id) ? 'Voted' : 'Vote to Sell'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotingPage;