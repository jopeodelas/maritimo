import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import PlayerImage from '../components/PlayerImage';
import { createStyles } from '../styles/styleUtils';
import useIsMobile from '../hooks/useIsMobile';
import api from '../services/api';

interface CustomPoll {
  id: number;
  title: string;
  options: string[];
  created_by: number;
  created_at: string;
  is_active: boolean;
  votes: number[];
  total_votes: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

interface Player {
  id: number;
  name: string;
  position: string;
  image_url: string;
  vote_count: number;
}

interface TransferRumor {
  id: string | number; // Pode ser string (unique_id) ou number (database id)
  dbId?: number; // ID da base de dados
  player_name: string;
  type: "compra" | "venda" | "renovação";
  club: string;
  value: string;
  status: "rumor" | "negociação" | "confirmado";
  date: string;
  source: string;
  reliability: number;
  description?: string;
  isMainTeam?: boolean;
  category?: string;
  position?: string;
  isApproved?: boolean;
}

type TabType = 'polls' | 'users' | 'banned' | 'players' | 'rumors';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabType>('polls');
  
  // Poll states
  const [polls, setPolls] = useState<CustomPoll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [creatingPoll, setCreatingPoll] = useState(false);

  // User management states
  const [users, setUsers] = useState<User[]>([]);
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBannedUsers, setLoadingBannedUsers] = useState(false);

  // Player management states
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('');
  const [newPlayerImageFile, setNewPlayerImageFile] = useState<File | null>(null);
  const [creatingPlayer, setCreatingPlayer] = useState(false);

  // Transfer rumors management states
  const [rumors, setRumors] = useState<TransferRumor[]>([]);
  const [loadingRumors, setLoadingRumors] = useState(false);
  const [showRumorModal, setShowRumorModal] = useState(false);
  const [editingRumor, setEditingRumor] = useState<TransferRumor | null>(null);
  const [newRumorPlayerName, setNewRumorPlayerName] = useState('');
  const [newRumorType, setNewRumorType] = useState<"compra" | "venda" | "renovação">('compra');
  const [newRumorClub, setNewRumorClub] = useState('');
  const [newRumorValue, setNewRumorValue] = useState('');
  const [newRumorStatus, setNewRumorStatus] = useState<"rumor" | "negociação" | "confirmado">('rumor');
  const [newRumorSource, setNewRumorSource] = useState('');
  const [newRumorReliability, setNewRumorReliability] = useState(3);
  const [newRumorDescription, setNewRumorDescription] = useState('');
  const [creatingRumor, setCreatingRumor] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user?.is_admin) {
      navigate('/main');
      return;
    }
    if (activeTab === 'polls') {
      fetchPolls();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'banned') {
      fetchBannedUsers();
    } else if (activeTab === 'players') {
      fetchPlayers();
    } else if (activeTab === 'rumors') {
      fetchRumors();
    }
  }, [user, navigate, activeTab]);

  const fetchPolls = async () => {
    setLoadingPolls(true);
    console.log('Fetching polls from /custom-polls...');
    try {
      const response = await api.get('/custom-polls');
      console.log('Polls response:', response);
      console.log('Polls data:', response.data);
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
      alert('Erro ao carregar polls: ' + (error as any)?.response?.data?.message || (error as any)?.message);
    } finally {
      setLoadingPolls(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Erro ao carregar utilizadores: ' + (error as any)?.response?.data?.message || (error as any)?.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBannedUsers = async () => {
    setLoadingBannedUsers(true);
    try {
      const response = await api.get('/admin/users/banned');
      setBannedUsers(response.data);
    } catch (error) {
      console.error('Error fetching banned users:', error);
    } finally {
      setLoadingBannedUsers(false);
    }
  };

  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const response = await api.get('/players');
      // Fix: The API returns { players: [...], totalUniqueVoters: number }
      setPlayers(response.data.players || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      alert('Erro ao carregar jogadores: ' + (error as any)?.response?.data?.message || (error as any)?.message);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const fetchRumors = async () => {
    setLoadingRumors(true);
    try {
      const response = await api.get('/admin/transfer/rumors');
      setRumors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rumors:', error);
      alert('Erro ao carregar rumores: ' + (error as any)?.response?.data?.message || (error as any)?.message);
    } finally {
      setLoadingRumors(false);
    }
  };

  const addOption = () => {
    if (newPollOptions.length < 10) {
      setNewPollOptions([...newPollOptions, '']);
    }
  };

  const removeOption = (index: number) => {
    if (newPollOptions.length > 2) {
      setNewPollOptions(newPollOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newPollOptions];
    updated[index] = value;
    setNewPollOptions(updated);
  };

  const createPoll = async () => {
    if (!newPollTitle.trim()) {
      alert('Por favor, insira um título para a poll');
      return;
    }

    const validOptions = newPollOptions.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Por favor, insira pelo menos 2 opções válidas');
      return;
    }

    setCreatingPoll(true);
    try {
      await api.post('/custom-polls', {
        title: newPollTitle.trim(),
        options: validOptions
      });
      
      setNewPollTitle('');
      setNewPollOptions(['', '']);
      setShowCreateModal(false);
      fetchPolls();
    } catch (error: any) {
      console.error('Error creating poll:', error);
      alert(error.response?.data?.message || 'Erro ao criar poll');
    } finally {
      setCreatingPoll(false);
    }
  };

  const deactivatePoll = async (pollId: number) => {
    try {
      await api.delete(`/custom-polls/${pollId}`);
      fetchPolls();
    } catch (error: any) {
      console.error('Error deactivating poll:', error);
      alert(error.response?.data?.message || 'Erro ao desativar poll');
    }
  };

  const banUser = async (userId: number) => {
    if (window.confirm('Tem a certeza que deseja banir este utilizador?')) {
      try {
        await api.post(`/admin/users/${userId}/ban`);
        fetchUsers();
        alert('Utilizador banido com sucesso');
      } catch (error: any) {
        console.error('Error banning user:', error);
        alert(error.response?.data?.message || 'Erro ao banir utilizador');
      }
    }
  };

  const unbanUser = async (userId: number) => {
    if (window.confirm('Tem a certeza que deseja desbanir este utilizador?')) {
      try {
        await api.post(`/admin/users/${userId}/unban`);
        fetchBannedUsers();
        fetchUsers(); // Refresh users list as well
        alert('Utilizador desbanido com sucesso');
      } catch (error: any) {
        console.error('Error unbanning user:', error);
        alert(error.response?.data?.message || 'Erro ao desbanir utilizador');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openPlayerModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setNewPlayerName(player.name);
      setNewPlayerPosition(player.position);
      setNewPlayerImageFile(null);
    } else {
      setEditingPlayer(null);
      setNewPlayerName('');
      setNewPlayerPosition('');
      setNewPlayerImageFile(null);
    }
    setShowPlayerModal(true);
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setEditingPlayer(null);
    setNewPlayerName('');
    setNewPlayerPosition('');
    setNewPlayerImageFile(null);
  };

  const createOrUpdatePlayer = async () => {
    if (!newPlayerName.trim() || !newPlayerPosition.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!editingPlayer && !newPlayerImageFile) {
      alert('Por favor, selecione uma imagem para o jogador');
      return;
    }

    setCreatingPlayer(true);
    try {
      const formData = new FormData();
      formData.append('name', newPlayerName.trim());
      formData.append('position', newPlayerPosition.trim());
      
      if (newPlayerImageFile) {
        formData.append('image', newPlayerImageFile);
      }

      if (editingPlayer) {
        await api.put(`/players/${editingPlayer.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/players', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      closePlayerModal();
      fetchPlayers();
    } catch (error: any) {
      console.error('Error creating/updating player:', error);
      alert(error.response?.data?.message || 'Erro ao salvar jogador');
    } finally {
      setCreatingPlayer(false);
    }
  };

  const deletePlayer = async (playerId: number) => {
    if (window.confirm('Tem a certeza que deseja remover este jogador?')) {
      try {
        await api.delete(`/players/${playerId}`);
        fetchPlayers();
        alert('Jogador removido com sucesso');
      } catch (error: any) {
        console.error('Error deleting player:', error);
        alert(error.response?.data?.message || 'Erro ao remover jogador');
      }
    }
  };

  // Rumor management functions
  const openRumorModal = (rumor?: TransferRumor) => {
    if (rumor) {
      setEditingRumor(rumor);
      setNewRumorPlayerName(rumor.player_name);
      setNewRumorType(rumor.type);
      setNewRumorClub(rumor.club);
      setNewRumorValue(rumor.value);
      setNewRumorStatus(rumor.status);
      setNewRumorSource(rumor.source);
      setNewRumorReliability(rumor.reliability);
      setNewRumorDescription(rumor.description || '');
    } else {
      setEditingRumor(null);
      setNewRumorPlayerName('');
      setNewRumorType('compra');
      setNewRumorClub('');
      setNewRumorValue('');
      setNewRumorStatus('rumor');
      setNewRumorSource('Admin');
      setNewRumorReliability(5);
      setNewRumorDescription('');
    }
    setShowRumorModal(true);
  };

  const closeRumorModal = () => {
    setShowRumorModal(false);
    setEditingRumor(null);
  };

  const createOrUpdateRumor = async () => {
    if (!newRumorPlayerName.trim() || !newRumorClub.trim()) {
      alert('Por favor, preencha pelo menos o nome do jogador e o clube');
      return;
    }

    setCreatingRumor(true);
    try {
      const rumorData = {
        player_name: newRumorPlayerName.trim(),
        type: newRumorType,
        club: newRumorClub.trim(),
        value: newRumorValue.trim() || 'Valor não revelado',
        status: newRumorStatus,
        source: newRumorSource.trim() || 'Admin',
        reliability: newRumorReliability,
        description: newRumorDescription.trim()
      };

      if (editingRumor) {
        // Use dbId if available, otherwise try to parse from id string
        const numericId = editingRumor.dbId || (typeof editingRumor.id === 'number' ? editingRumor.id : parseInt(String(editingRumor.id).split('_')[1]) || Date.now());
        await api.put(`/admin/transfer/rumors/${numericId}`, rumorData);
      } else {
        await api.post('/admin/transfer/rumors', rumorData);
      }
      
      closeRumorModal();
      fetchRumors();
      alert(editingRumor ? 'Rumor atualizado com sucesso' : 'Rumor criado com sucesso');
    } catch (error: any) {
      console.error('Error creating/updating rumor:', error);
      alert(error.response?.data?.message || 'Erro ao salvar rumor');
    } finally {
      setCreatingRumor(false);
    }
  };

  const deleteRumor = async (rumorId: string | number, rumor?: TransferRumor) => {
    if (window.confirm('Tem a certeza que deseja remover este rumor?')) {
      try {
        // Use dbId if available, otherwise try to parse from id string
        const numericId = rumor?.dbId || (typeof rumorId === 'number' ? rumorId : parseInt(String(rumorId).split('_')[1]) || Date.now());
        await api.delete(`/admin/transfer/rumors/${numericId}`);
        fetchRumors();
        alert('Rumor removido com sucesso');
      } catch (error: any) {
        console.error('Error deleting rumor:', error);
        alert(error.response?.data?.message || 'Erro ao remover rumor');
      }
    }
  };

  const approveRumor = async (rumorId: string | number, rumor?: TransferRumor) => {
    try {
      // Use dbId if available, otherwise try to parse from id string
      const numericId = rumor?.dbId || (typeof rumorId === 'number' ? rumorId : parseInt(String(rumorId).split('_')[1]) || Date.now());
      await api.post(`/admin/transfer/rumors/${numericId}/approve`);
      fetchRumors();
      alert('Rumor aprovado com sucesso');
    } catch (error: any) {
      console.error('Error approving rumor:', error);
      alert(error.response?.data?.message || 'Erro ao aprovar rumor');
    }
  };

  const styles = createStyles({
    container: {
      minHeight: "100vh",
      background: `
        radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)
      `,
      fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: isMobile 
        ? "70px 1rem 1rem" // Mobile: padding top para header + spacing
        : "clamp(8rem, 10vh, 10rem) 1rem 2rem", // Desktop original
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "3rem",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "700",
      color: "#FFD700",
      marginBottom: "0.5rem",
    },
    subtitle: {
      fontSize: "1.2rem",
      color: "#B0BEC5",
    },
    tabNavigation: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "2rem",
      gap: "1rem",
    },
    tab: {
      padding: "1rem 2rem",
      background: "rgba(40, 55, 70, 0.8)",
      border: "2px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "0.75rem",
      color: "#B0BEC5",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontWeight: "600",
    },
    activeTab: {
      background: "rgba(76, 175, 80, 0.9)",
      border: "2px solid #4CAF50",
      color: "white",
    },
    section: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "1rem",
      padding: "2rem",
      backdropFilter: "blur(10px)",
      boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.4)",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
    },
    sectionTitle: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: "#FFFFFF",
    },
    button: {
      background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
      color: "white",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    dangerButton: {
      background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
    },
    successButton: {
      background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
      marginTop: "1rem",
    },
    tableHeader: {
      background: "rgba(76, 175, 80, 0.2)",
      borderBottom: "2px solid rgba(76, 175, 80, 0.3)",
    },
    tableHeaderCell: {
      padding: "1rem",
      textAlign: "left" as const,
      fontWeight: "600",
      color: "#FFFFFF",
      fontSize: "0.95rem",
    },
    tableRow: {
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      transition: "background-color 0.2s ease",
    },
    tableCell: {
      padding: "1rem",
      color: "#B0BEC5",
      fontSize: "0.9rem",
    },
    pollCard: {
      background: "rgba(40, 55, 70, 0.8)",
      border: "1px solid rgba(76, 175, 80, 0.2)",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginBottom: "1rem",
    },
    pollTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#FFFFFF",
      marginBottom: "1rem",
    },
    pollMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "0.875rem",
      color: "#78909C",
      marginBottom: "1rem",
    },
    pollOptions: {
      marginBottom: "1rem",
    },
    pollOption: {
      display: "flex",
      justifyContent: "space-between",
      padding: "0.5rem 0",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#FFFFFF",
    },
    modal: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      background: "rgba(30, 40, 50, 0.98)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "1rem",
      padding: "2rem",
      width: "90%",
      maxWidth: "500px",
      backdropFilter: "blur(10px)",
    },
    modalTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: "1.5rem",
      textAlign: "center" as const,
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      background: "rgba(40, 55, 70, 0.8)",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      borderRadius: "0.5rem",
      color: "#FFFFFF",
      fontSize: "1rem",
      marginBottom: "1rem",
    },
    optionGroup: {
      marginBottom: "1rem",
    },
    optionInput: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "0.5rem",
    },
    removeButton: {
      background: "#F44336",
      color: "white",
      border: "none",
      borderRadius: "0.25rem",
      padding: "0.5rem",
      cursor: "pointer",
      fontSize: "0.875rem",
    },
    addOptionButton: {
      background: "transparent",
      color: "#4CAF50",
      border: "1px dashed #4CAF50",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
      fontSize: "0.875rem",
      marginBottom: "1rem",
    },
    modalActions: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
    },
    cancelButton: {
      background: "transparent",
      color: "#B0BEC5",
      border: "1px solid rgba(176, 190, 197, 0.3)",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
    },
    userStatus: {
      padding: "0.25rem 0.75rem",
      borderRadius: "1rem",
      fontSize: "0.75rem",
      fontWeight: "600",
      textTransform: "uppercase" as const,
    },
    adminStatus: {
      background: "rgba(255, 193, 7, 0.2)",
      color: "#FFD700",
      border: "1px solid rgba(255, 193, 7, 0.3)",
    },
    bannedStatus: {
      background: "rgba(244, 67, 54, 0.2)",
      color: "#F44336",
      border: "1px solid rgba(244, 67, 54, 0.3)",
    },
    activeStatus: {
      background: "rgba(76, 175, 80, 0.2)",
      color: "#4CAF50",
      border: "1px solid rgba(76, 175, 80, 0.3)",
    },
    loading: {
      textAlign: "center" as const,
      color: "#4CAF50",
      fontSize: "1.2rem",
      padding: "2rem",
    },
    emptyState: {
      textAlign: "center" as const,
      color: "#78909C",
      fontSize: "1.1rem",
      padding: "3rem",
    },
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'polls':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Gerir Polls Personalizadas</h2>
              <button 
                style={styles.button} 
                onClick={() => setShowCreateModal(true)}
              >
                + Nova Poll
              </button>
            </div>
            
            {loadingPolls ? (
              <div style={styles.loading}>A carregar polls...</div>
            ) : polls.length === 0 ? (
              <div style={styles.emptyState}>Nenhuma poll criada ainda</div>
            ) : (
              polls.map(poll => (
                <div key={poll.id} style={styles.pollCard}>
                  <h3 style={styles.pollTitle}>{poll.title}</h3>
                  <div style={styles.pollMeta}>
                    <span>Criada em: {formatDate(poll.created_at)}</span>
                    <span>Total de votos: {poll.total_votes}</span>
                  </div>
                  <div style={styles.pollOptions}>
                    {poll.options.map((option, index) => (
                      <div key={index} style={styles.pollOption}>
                        <span>{option}</span>
                        <span>{poll.votes[index] || 0} votos</span>
                      </div>
                    ))}
                  </div>
                  {poll.is_active && (
                    <button 
                      style={{...styles.button, ...styles.dangerButton}}
                      onClick={() => deactivatePoll(poll.id)}
                    >
                      Desativar Poll
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'users':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Gerir Utilizadores</h2>
              <button 
                style={styles.button} 
                onClick={fetchUsers}
                disabled={loadingUsers}
              >
                {loadingUsers ? 'A carregar...' : 'Atualizar'}
              </button>
            </div>
            
            {loadingUsers ? (
              <div style={styles.loading}>A carregar utilizadores...</div>
            ) : users.length === 0 ? (
              <div style={styles.emptyState}>Nenhum utilizador encontrado</div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>ID</th>
                    <th style={styles.tableHeaderCell}>Username</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Registado em</th>
                    <th style={styles.tableHeaderCell}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(userData => (
                    <tr key={userData.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{userData.id}</td>
                      <td style={styles.tableCell}>{userData.username}</td>
                      <td style={styles.tableCell}>{userData.email}</td>
                      <td style={styles.tableCell}>
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                          {userData.is_admin && (
                            <span style={{...styles.userStatus, ...styles.adminStatus}}>
                              Admin
                            </span>
                          )}
                          {userData.is_banned ? (
                            <span style={{...styles.userStatus, ...styles.bannedStatus}}>
                              Banido
                            </span>
                          ) : (
                            <span style={{...styles.userStatus, ...styles.activeStatus}}>
                              Ativo
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={styles.tableCell}>{formatDate(userData.created_at)}</td>
                      <td style={styles.tableCell}>
                        {!userData.is_banned && !userData.is_admin && userData.id.toString() !== user?.id && (
                          <button 
                            style={{...styles.button, ...styles.dangerButton}}
                            onClick={() => banUser(userData.id)}
                          >
                            Banir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'banned':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Utilizadores Banidos</h2>
              <button 
                style={styles.button} 
                onClick={fetchBannedUsers}
                disabled={loadingBannedUsers}
              >
                {loadingBannedUsers ? 'A carregar...' : 'Atualizar'}
              </button>
            </div>
            
            {loadingBannedUsers ? (
              <div style={styles.loading}>A carregar utilizadores banidos...</div>
            ) : bannedUsers.length === 0 ? (
              <div style={styles.emptyState}>Nenhum utilizador banido</div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>ID</th>
                    <th style={styles.tableHeaderCell}>Username</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Banido em</th>
                    <th style={styles.tableHeaderCell}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedUsers.map(userData => (
                    <tr key={userData.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{userData.id}</td>
                      <td style={styles.tableCell}>{userData.username}</td>
                      <td style={styles.tableCell}>{userData.email}</td>
                      <td style={styles.tableCell}>{formatDate(userData.created_at)}</td>
                      <td style={styles.tableCell}>
                        <button 
                          style={{...styles.button, ...styles.successButton}}
                          onClick={() => unbanUser(userData.id)}
                        >
                          Desbanir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'players':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Gerir Jogadores</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  style={styles.button} 
                  onClick={() => openPlayerModal()}
                >
                  + Novo Jogador
                </button>
                <button 
                  style={styles.button} 
                  onClick={fetchPlayers}
                  disabled={loadingPlayers}
                >
                  {loadingPlayers ? 'A carregar...' : 'Atualizar'}
                </button>
              </div>
            </div>
            
            {loadingPlayers ? (
              <div style={styles.loading}>A carregar jogadores...</div>
            ) : players.length === 0 ? (
              <div style={styles.emptyState}>Nenhum jogador encontrado</div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>ID</th>
                    <th style={styles.tableHeaderCell}>Nome</th>
                    <th style={styles.tableHeaderCell}>Posição</th>
                    <th style={styles.tableHeaderCell}>Imagem</th>
                    <th style={styles.tableHeaderCell}>Votos</th>
                    <th style={styles.tableHeaderCell}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => (
                    <tr key={player.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{player.id}</td>
                      <td style={styles.tableCell}>{player.name}</td>
                      <td style={styles.tableCell}>{player.position}</td>
                      <td style={styles.tableCell}>
                        <PlayerImage
                          imageUrl={player.image_url}
                          playerName={player.name}
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '2px solid rgba(76, 175, 80, 0.3)'
                          }}
                          width="50"
                          height="50"
                          showFallbackText={true}
                        />
                      </td>
                      <td style={styles.tableCell}>{player.vote_count}</td>
                      <td style={styles.tableCell}>
                        <button 
                          style={styles.button} 
                          onClick={() => openPlayerModal(player)}
                        >
                          Editar
                        </button>
                        <button 
                          style={{...styles.button, ...styles.dangerButton}}
                          onClick={() => deletePlayer(player.id)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'rumors':
        return (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Gerir Rumores de Transferências</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  style={styles.button} 
                  onClick={() => openRumorModal()}
                >
                  + Novo Rumor
                </button>
                <button 
                  style={styles.button} 
                  onClick={fetchRumors}
                  disabled={loadingRumors}
                >
                  {loadingRumors ? 'A carregar...' : 'Atualizar'}
                </button>
              </div>
            </div>
            
            {loadingRumors ? (
              <div style={styles.loading}>A carregar rumores...</div>
            ) : rumors.length === 0 ? (
              <div style={styles.emptyState}>Nenhum rumor encontrado</div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Jogador</th>
                    <th style={styles.tableHeaderCell}>Tipo</th>
                    <th style={styles.tableHeaderCell}>Clube</th>
                    <th style={styles.tableHeaderCell}>Valor</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Fonte</th>
                    <th style={styles.tableHeaderCell}>Confiabilidade</th>
                    <th style={styles.tableHeaderCell}>Data</th>
                    <th style={styles.tableHeaderCell}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rumors.map(rumor => (
                    <tr key={rumor.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{rumor.player_name}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.userStatus,
                          ...(rumor.type === 'compra' ? styles.activeStatus : 
                              rumor.type === 'venda' ? styles.bannedStatus : styles.adminStatus)
                        }}>
                          {rumor.type}
                        </span>
                      </td>
                      <td style={styles.tableCell}>{rumor.club}</td>
                      <td style={styles.tableCell}>{rumor.value}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.userStatus,
                          ...(rumor.status === 'confirmado' ? styles.activeStatus : 
                              rumor.status === 'negociação' ? styles.adminStatus : styles.bannedStatus)
                        }}>
                          {rumor.status}
                        </span>
                      </td>
                      <td style={styles.tableCell}>{rumor.source}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.userStatus,
                          ...(rumor.reliability >= 4 ? styles.activeStatus : 
                              rumor.reliability >= 3 ? styles.adminStatus : styles.bannedStatus)
                        }}>
                          {rumor.reliability}/5
                        </span>
                      </td>
                      <td style={styles.tableCell}>{rumor.date}</td>
                      <td style={styles.tableCell}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button 
                            style={{...styles.button, fontSize: '0.8rem', padding: '0.5rem'}} 
                            onClick={() => openRumorModal(rumor)}
                          >
                            Editar
                          </button>
                          {!rumor.isApproved && (
                            <button 
                              style={{...styles.button, ...styles.successButton, fontSize: '0.8rem', padding: '0.5rem'}}
                              onClick={() => approveRumor(rumor.id, rumor)}
                            >
                              Aprovar
                            </button>
                          )}
                          <button 
                            style={{...styles.button, ...styles.dangerButton, fontSize: '0.8rem', padding: '0.5rem'}}
                            onClick={() => deleteRumor(rumor.id, rumor)}
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <PageLayout>
      <div style={styles.container}>
        <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Painel de Administração</h1>
          <p style={styles.subtitle}>Bem-vindo, {user?.username}</p>
        </div>

        <div style={styles.tabNavigation}>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'polls' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('polls')}
          >
            Polls Personalizadas
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'users' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('users')}
          >
            Gerir Utilizadores
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'banned' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('banned')}
          >
            Utilizadores Banidos
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'players' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('players')}
          >
            Jogadores
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'rumors' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('rumors')}
          >
            Rumores de Transferências
          </button>
        </div>

        {renderTabContent()}

        {/* Create Poll Modal */}
        {showCreateModal && (
          <div style={styles.modal} onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>Criar Nova Poll</h2>
              
              <input
                style={styles.input}
                type="text"
                placeholder="Título da poll"
                value={newPollTitle}
                onChange={(e) => setNewPollTitle(e.target.value)}
              />
              
              <div style={styles.optionGroup}>
                <label style={{color: '#B0BEC5', marginBottom: '0.5rem', display: 'block'}}>
                  Opções da poll:
                </label>
                {newPollOptions.map((option, index) => (
                  <div key={index} style={styles.optionInput}>
                    <input
                      style={{...styles.input, margin: 0, flex: 1}}
                      type="text"
                      placeholder={`Opção ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {newPollOptions.length > 2 && (
                      <button
                        style={styles.removeButton}
                        onClick={() => removeOption(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                {newPollOptions.length < 10 && (
                  <button style={styles.addOptionButton} onClick={addOption}>
                    + Adicionar Opção
                  </button>
                )}
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelButton} 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  style={styles.button} 
                  onClick={createPoll}
                  disabled={creatingPoll}
                >
                  {creatingPoll ? 'A criar...' : 'Criar Poll'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Modal */}
        {showPlayerModal && (
          <div style={styles.modal} onClick={(e) => {
            if (e.target === e.currentTarget) closePlayerModal();
          }}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>{editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}</h2>
              
              <input
                style={styles.input}
                type="text"
                placeholder="Nome"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
              />
              
              <select
                style={styles.input}
                value={newPlayerPosition}
                onChange={(e) => setNewPlayerPosition(e.target.value)}
              >
                <option value="">Selecionar Posição</option>
                <option value="Guarda-redes">Guarda-redes</option>
                <option value="Defesa">Defesa</option>
                <option value="Médio">Médio</option>
                <option value="Atacante">Atacante</option>
              </select>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  color: '#B0BEC5', 
                  marginBottom: '0.5rem', 
                  display: 'block',
                  fontSize: '0.9rem'
                }}>
                  Imagem do Jogador:
                </label>
                <input
                  style={{
                    ...styles.input,
                    padding: '0.5rem',
                    backgroundColor: 'rgba(40, 55, 70, 0.8)',
                    border: '2px dashed rgba(76, 175, 80, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPlayerImageFile(e.target.files?.[0] || null)}
                />
                {newPlayerImageFile && (
                  <p style={{
                    color: '#4CAF50',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    marginBottom: '0'
                  }}>
                    Ficheiro selecionado: {newPlayerImageFile.name}
                  </p>
                )}
                {editingPlayer && !newPlayerImageFile && (
                  <p style={{
                    color: '#78909C',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    marginBottom: '0'
                  }}>
                    Deixe em branco para manter a imagem atual
                  </p>
                )}
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelButton} 
                  onClick={closePlayerModal}
                >
                  Cancelar
                </button>
                <button 
                  style={styles.button} 
                  onClick={createOrUpdatePlayer}
                  disabled={creatingPlayer}
                >
                  {creatingPlayer ? 'A salvar...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rumor Modal */}
        {showRumorModal && (
          <div style={styles.modal} onClick={(e) => {
            if (e.target === e.currentTarget) closeRumorModal();
          }}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>{editingRumor ? 'Editar Rumor' : 'Novo Rumor'}</h2>
              
              <input
                style={styles.input}
                type="text"
                placeholder="Nome do Jogador *"
                value={newRumorPlayerName}
                onChange={(e) => setNewRumorPlayerName(e.target.value)}
              />
              
              <select
                style={styles.input}
                value={newRumorType}
                onChange={(e) => setNewRumorType(e.target.value as "compra" | "venda" | "renovação")}
              >
                <option value="compra">Compra</option>
                <option value="venda">Venda</option>
                <option value="renovação">Renovação</option>
              </select>

              <input
                style={styles.input}
                type="text"
                placeholder="Clube *"
                value={newRumorClub}
                onChange={(e) => setNewRumorClub(e.target.value)}
              />

              <input
                style={styles.input}
                type="text"
                placeholder="Valor (ex: 1M€, Livre, Valor não revelado)"
                value={newRumorValue}
                onChange={(e) => setNewRumorValue(e.target.value)}
              />

              <select
                style={styles.input}
                value={newRumorStatus}
                onChange={(e) => setNewRumorStatus(e.target.value as "rumor" | "negociação" | "confirmado")}
              >
                <option value="rumor">Rumor</option>
                <option value="negociação">Negociação</option>
                <option value="confirmado">Confirmado</option>
              </select>

              <input
                style={styles.input}
                type="text"
                placeholder="Fonte"
                value={newRumorSource}
                onChange={(e) => setNewRumorSource(e.target.value)}
              />

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  color: '#B0BEC5', 
                  marginBottom: '0.5rem', 
                  display: 'block',
                  fontSize: '0.9rem'
                }}>
                  Confiabilidade: {newRumorReliability}/5
                </label>
                <input
                  style={{
                    ...styles.input,
                    marginBottom: '0'
                  }}
                  type="range"
                  min="1"
                  max="5"
                  value={newRumorReliability}
                  onChange={(e) => setNewRumorReliability(parseInt(e.target.value))}
                />
              </div>

              <textarea
                style={{
                  ...styles.input,
                  minHeight: '80px',
                  resize: 'vertical' as const
                }}
                placeholder="Descrição (opcional)"
                value={newRumorDescription}
                onChange={(e) => setNewRumorDescription(e.target.value)}
              />
              
              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelButton} 
                  onClick={closeRumorModal}
                >
                  Cancelar
                </button>
                <button 
                  style={styles.button} 
                  onClick={createOrUpdateRumor}
                  disabled={creatingRumor}
                >
                  {creatingRumor ? 'A salvar...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageLayout>
  );
};

export default AdminPage; 