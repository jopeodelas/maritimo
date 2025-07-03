import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/PageLayout';
import MobileHeader from '../components/MobileHeader';
import MobileSidebar from '../components/MobileSidebar';
import { createStyles } from '../styles/styleUtils';
import useIsMobile from '../hooks/useIsMobile';
import api from '../services/api';
import type { Discussion, Comment } from '../types';

// Icon components
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22,2 15,22 11,13 2,9"></polygon>
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ChatPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Form states
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionDescription, setNewDiscussionDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Refs
  const chatInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDiscussions();
  }, [sortBy]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/discussions?sort=${sortBy}`);
      setDiscussions(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (discussionId: number) => {
    try {
      const response = await api.get(`/discussions/${discussionId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim() || !newDiscussionDescription.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post('/discussions', {
        title: newDiscussionTitle.trim(),
        description: newDiscussionDescription.trim()
      });
      
      setDiscussions(prev => [response.data, ...prev]);
      setNewDiscussionTitle('');
      setNewDiscussionDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Erro ao criar discussão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim() || !selectedDiscussion || submitting) return;

    try {
      setSubmitting(true);
      const response = await api.post(`/discussions/${selectedDiscussion.id}/comments`, {
        content: newComment.trim()
      });
      
      setComments(prev => [...prev, response.data]);
      setNewComment('');
      
      // Update discussion comment count
      setDiscussions(prev => prev.map(d => 
        d.id === selectedDiscussion.id 
          ? { ...d, comment_count: Number(d.comment_count) + 1, last_activity: new Date().toISOString() }
          : d
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openDiscussion = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setIsDrawerOpen(true);
    fetchComments(discussion.id);
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.focus();
      }
    }, 300);
  };

  const closeDiscussion = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedDiscussion(null);
      setComments([]);
    }, 300);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `Há ${diffMinutes} minutos`;
    if (diffHours < 24) return `Há ${diffHours} horas`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-PT');
  };

  const formatChatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteDiscussion = async (discussionId: number) => {
    if (!window.confirm('Tem certeza que deseja apagar esta discussão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await api.delete(`/discussions/${discussionId}`);
      
      // Remove from local state
      setDiscussions(prev => prev.filter(d => d.id !== discussionId));
      
      // Close drawer if this discussion was open
      if (selectedDiscussion?.id === discussionId) {
        closeDiscussion();
      }
      
      alert('Discussão apagada com sucesso!');
    } catch (error: any) {
      console.error('Error deleting discussion:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao apagar discussão.';
      alert(errorMessage);
    }
  };

  const styles = createStyles({
    // CONTAINER PRINCIPAL
    container: {
      minHeight: "100vh",
      background: `
        radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F1419 0%, #1A252F 50%, #2C3E50 100%)
      `,
      fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      position: "relative",
      overflow: "hidden",
      color: '#FFFFFF',
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
      animation: "optimized-float 20s ease-in-out infinite",
    },

    // PÁGINA INICIAL (lista de discussões)
    discussionsPage: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: isMobile ? "80px 1rem 2rem" : "100px 2rem 2rem", // CORRETO: espaço suficiente para header
      position: "relative",
      zIndex: 2,
      display: isDrawerOpen ? 'none' : 'block',
    },

    // Hero Section
    heroSection: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "2px solid rgba(76, 175, 80, 0.4)",
      borderRadius: "1rem",
      padding: isMobile ? "1.5rem" : "2.5rem",
      marginBottom: isMobile ? "1rem" : "2rem",
      color: "white",
      textAlign: "center",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(10px)",
      position: "relative",
      overflow: "hidden",
    },

    heroAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: "linear-gradient(90deg, #4CAF50 0%, #FFD700 50%, #F44336 100%)",
      borderRadius: "1rem 1rem 0 0",
    },

    heroTitle: {
      fontSize: isMobile ? "2rem" : "3rem",
      fontWeight: "800",
      margin: "0 0 0.5rem 0",
      background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      letterSpacing: "-0.02em",
    },

    heroSubtitle: {
      fontSize: isMobile ? "1rem" : "1.2rem",
      margin: 0,
      fontWeight: "500",
      color: "#B0BEC5",
    },

    // Controles
    controls: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "1rem" : "1.5rem",
      marginBottom: isMobile ? "1rem" : "2rem",
      padding: "1rem 0",
    },

    leftControls: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "1rem" : "1.5rem",
      flex: "1 1 auto",
    },

    searchInput: {
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "#FFFFFF",
      fontSize: "1rem",
      width: "100%",
      outline: "none",
      transition: "all 0.3s ease",
    },

    sortSelect: {
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      border: "1px solid rgba(76, 175, 80, 0.3)",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "#FFFFFF",
      fontSize: "1rem",
      cursor: "pointer",
      outline: "none",
      width: isMobile ? "100%" : "auto",
    },

    createButton: {
      backgroundColor: "#009759",
      color: "white",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      width: isMobile ? "100%" : "auto",
    },

    // Lista de discussões
    discussionsList: {
      display: "grid",
      gap: "1rem",
    },

    discussionCard: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      border: "1px solid rgba(76, 175, 80, 0.2)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
    },

    discussionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "0.75rem",
    },

    discussionTitle: {
      fontSize: isMobile ? "1.1rem" : "1.3rem",
      fontWeight: "600",
      color: "#FFFFFF",
      margin: 0,
    },

    discussionMeta: {
      fontSize: "0.85rem",
      color: "#FFBB4C",
      marginBottom: "0.5rem",
    },

    discussionDescription: {
      fontSize: "0.95rem",
      color: "#E0E0E0",
      marginBottom: "0.75rem",
      lineHeight: "1.5",
    },

    discussionStats: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "0.8rem",
      color: "#B0B0B0",
    },

    // INTERFACE DE CHAT (quando uma discussão está aberta)
    chatOverlay: {
      position: 'fixed',
      top: isMobile ? 0 : '70px', // No desktop, começa após a navbar
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: isDrawerOpen ? 'block' : 'none',
    },

    chatContainer: {
      position: 'fixed',
      top: isMobile ? '60px' : '70px', // Adiciona espaço para a navbar tanto no mobile quanto desktop
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: isMobile ? 'calc(100vh - 60px)' : 'calc(100vh - 70px)', // Ajusta altura para acomodar navbar
      backgroundColor: '#1e293b',
      display: isDrawerOpen ? 'flex' : 'none',
      flexDirection: isMobile ? 'column' : 'row',
      overflow: 'hidden',
      zIndex: 1001,
    },

    // SIDEBAR (lista de discussões no chat) - oculta no mobile
    sidebar: {
      width: isMobile ? '100%' : '350px',
      height: isMobile ? '40%' : '100%',
      backgroundColor: '#0f172a',
      borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
      borderBottom: isMobile ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
      display: isMobile ? 'none' : 'flex', // Oculta sidebar no mobile
      flexDirection: 'column',
      flexShrink: 0,
    },

    sidebarHeader: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },

    sidebarTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#f8fafc',
      margin: '0 0 0.5rem 0',
    },

    sidebarSubtitle: {
      fontSize: '0.8rem',
      color: '#94a3b8',
      margin: '0 0 1rem 0',
    },

    sidebarControls: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },

    sidebarSearch: {
      width: '100%',
      padding: '0.6rem',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '0.9rem',
      outline: 'none',
    },

    sidebarSelect: {
      width: '100%',
      padding: '0.6rem',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '0.9rem',
      outline: 'none',
      cursor: 'pointer',
    },

    newDiscussionBtn: {
      width: '100%',
      padding: '0.7rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },

    discussionList: {
      flex: 1,
      overflow: 'auto',
      padding: '0',
    },

    discussionItem: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },

    discussionItemActive: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderLeft: '3px solid #3b82f6',
    },

    discussionItemTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#f8fafc',
      marginBottom: '0.3rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    discussionItemMeta: {
      fontSize: '0.75rem',
      color: '#64748b',
      marginBottom: '0.2rem',
    },

    discussionItemStats: {
      fontSize: '0.75rem',
      color: '#94a3b8',
    },

    // ÁREA DE CHAT
    chatArea: {
      flex: 1,
      width: isMobile ? '100%' : 'auto', // Ocupa toda a largura no mobile
      height: isMobile ? '100%' : '100%', // Ocupa toda a altura no mobile
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e293b',
    },

    chatHeader: {
      padding: isMobile ? '1rem' : '1.5rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexShrink: 0,
    },

    chatHeaderContent: {
      flex: 1,
      marginRight: '1rem',
    },

    chatHeaderTitle: {
      fontSize: isMobile ? '1.1rem' : '1.3rem',
      fontWeight: '700',
      color: '#f8fafc',
      margin: '0 0 0.3rem 0',
      lineHeight: '1.3',
    },

    chatHeaderMeta: {
      fontSize: '0.8rem',
      color: '#64748b',
      marginBottom: '0.5rem',
    },

    chatHeaderDescription: {
      fontSize: '0.85rem',
      color: '#94a3b8',
      lineHeight: '1.4',
    },

    chatHeaderActions: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'flex-start',
      flexShrink: 0,
    },

    actionButton: {
      width: '40px',
      height: '40px',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontSize: '16px',
    },

    deleteButton: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },

    closeButton: {
      backgroundColor: 'rgba(156, 163, 175, 0.15)',
      color: '#9ca3af',
      border: '1px solid rgba(156, 163, 175, 0.2)',
    },

    // ÁREA DE MENSAGENS
    messagesArea: {
      flex: 1,
      padding: isMobile ? '1rem' : '1.5rem',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      minHeight: 0,
    },

    messageUser: {
      alignSelf: 'flex-end',
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '1rem 1rem 0.25rem 1rem',
      maxWidth: '70%',
      wordBreak: 'break-word',
    },

    messageOther: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#f8fafc',
      padding: '0.75rem 1rem',
      borderRadius: '1rem 1rem 1rem 0.25rem',
      maxWidth: '70%',
      wordBreak: 'break-word',
    },

    messageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.25rem',
      fontSize: '0.75rem',
    },

    messageAuthor: {
      fontWeight: '600',
      color: '#94a3b8',
    },

    messageAuthorUser: {
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.8)',
    },

    messageTime: {
      color: 'rgba(255, 255, 255, 0.6)',
    },

    messageContent: {
      fontSize: '0.9rem',
      lineHeight: '1.4',
    },

    // ÁREA DE INPUT
    chatInputArea: {
      padding: isMobile ? '1rem' : '1.5rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      flexShrink: 0,
    },

    chatInputContainer: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
    },

    chatInput: {
      flex: 1,
      padding: '0.75rem',
      borderRadius: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '0.9rem',
      outline: 'none',
    },

    sendButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },

    // ESTADOS ESPECIAIS
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      textAlign: 'center',
      flex: 1,
    },

    emptyStateIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },

    emptyStateText: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#f8fafc',
      marginBottom: '0.5rem',
    },

    emptyStateSubtext: {
      fontSize: '0.9rem',
      color: '#94a3b8',
    },

    loading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: '#64748b',
      fontSize: '0.9rem',
    },

    // MODAL
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
    },

    modalContent: {
      backgroundColor: '#1e293b',
      borderRadius: '1rem',
      padding: '2rem',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },

    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },

    modalTitle: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#f8fafc',
      margin: 0,
    },

    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },

    input: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '0.9rem',
      outline: 'none',
    },

    textarea: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '0.9rem',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
      outline: 'none',
    },

    submitButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
  });

  return (
    <PageLayout>
      {/* Navbar mobile para a segunda página (chat) */}
      {isMobile && isDrawerOpen && (
        <>
          <MobileHeader onMenuToggle={() => setIsMobileSidebarOpen(true)} />
          <MobileSidebar 
            isOpen={isMobileSidebarOpen} 
            onClose={() => setIsMobileSidebarOpen(false)} 
          />
        </>
      )}
      
      {/* Layout original - primeira página (lista de discussões) */}
      {!isDrawerOpen && (
        <>
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        
        <div style={{
          ...styles.discussionsPage,
        }}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroAccent}></div>
          <h1 style={styles.heroTitle}>Discussões</h1>
          <p style={styles.heroSubtitle}>Partilhe as suas opiniões sobre o CS Marítimo</p>
        </div>

        <div style={styles.controls}>
          <div style={styles.leftControls}>
            <input
              type="text"
              placeholder="Pesquisar discussões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
              style={styles.sortSelect}
            >
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigas</option>
              <option value="popular">Mais Populares</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            style={styles.createButton}
            className="hover-button"
          >
            Nova Discussão
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>
            <div className="spinner"></div>
            A carregar discussões...
          </div>
        ) : (
          <div style={styles.discussionsList}>
            {filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                style={styles.discussionCard}
                className="hover-card"
                onClick={() => openDiscussion(discussion)}
              >
                <div style={styles.discussionHeader}>
                  <div>
                    <h3 style={styles.discussionTitle}>
                      {discussion.title}
                    </h3>
                    <div style={styles.discussionMeta}>
                      Por {discussion.author_username} • {formatDate(discussion.created_at)}
                    </div>
                  </div>
                </div>
                <p style={styles.discussionDescription}
                >
                  {discussion.description.length > 200 
                    ? `${discussion.description.substring(0, 200)}...` 
                    : discussion.description}
                </p>
                <div style={styles.discussionStats}>
                  <span>{discussion.comment_count} comentários</span>
                  <span>Última atividade: {formatDate(discussion.last_activity)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      
      <style>{`
        @keyframes optimized-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        .spinner.small {
          width: 16px;
          height: 16px;
          border-width: 2px;
          margin: 0;
        }

        .hover-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.4);
          border-color: rgba(76, 175, 80, 0.6);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.12) 100%);
        }

        .hover-button:hover {
          background: linear-gradient(135deg, #00b366 0%, #00d474 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 151, 89, 0.5);
        }

        .discussion-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .action-button:hover {
          transform: scale(1.05);
        }

        .delete-btn:hover {
          background-color: rgba(239, 68, 68, 0.25) !important;
        }

        .close-btn:hover {
          background-color: rgba(156, 163, 175, 0.25) !important;
        }

        .send-btn:hover:not(:disabled) {
          background-color: #2563eb !important;
        }

        input:focus, textarea:focus, select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        ::placeholder {
          color: #64748b !important;
        }
      `}</style>
        </>
      )}

      {/* Create Discussion Modal */}
      {showCreateForm && (
        <div style={styles.modal} onClick={() => setShowCreateForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nova Discussão</h2>
              <button
                style={{ ...styles.actionButton, ...styles.closeButton }}
                onClick={() => setShowCreateForm(false)}
                className="action-button"
              >
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleCreateDiscussion} style={styles.form}>
              <input
                type="text"
                placeholder="Título da discussão"
                value={newDiscussionTitle}
                onChange={(e) => setNewDiscussionTitle(e.target.value)}
                style={styles.input}
                required
                maxLength={200}
              />
              <textarea
                placeholder="Descreva o que quer discutir..."
                value={newDiscussionDescription}
                onChange={(e) => setNewDiscussionDescription(e.target.value)}
                style={styles.textarea}
                required
                maxLength={2000}
              />
              <button
                type="submit"
                style={styles.submitButton}
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner small"></div>
                    A criar...
                  </>
                ) : 'Criar Discussão'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Chat Interface - segunda página */}
      {isDrawerOpen && (
        <>
      <div style={styles.chatOverlay} onClick={closeDiscussion}></div>
      
      <div 
        style={styles.chatContainer} 
        onClick={(e) => e.stopPropagation()}
      >
            {/* Sidebar - oculta no mobile */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Discussões</h2>
            <p style={styles.sidebarSubtitle}>Conversas da comunidade</p>
            
            <div style={styles.sidebarControls}>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.sidebarSearch}
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
                style={styles.sidebarSelect}
              >
                <option value="newest">Mais Recentes</option>
                <option value="oldest">Mais Antigas</option>
                <option value="popular">Mais Populares</option>
              </select>
              
              <button
                onClick={() => setShowCreateForm(true)}
                style={styles.newDiscussionBtn}
                className="new-discussion-btn"
              >
                <PlusIcon />
                Nova Discussão
              </button>
            </div>
          </div>

          <div style={styles.discussionList}>
            {loading ? (
              <div style={styles.loading}>
                <div className="spinner"></div>
                A carregar...
              </div>
            ) : filteredDiscussions.length === 0 ? (
              <div style={{ ...styles.emptyState, padding: '40px 24px' }}>
                <div style={styles.emptyStateText}>Nenhuma discussão encontrada</div>
              </div>
            ) : (
              filteredDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  style={{
                    ...styles.discussionItem,
                    ...(selectedDiscussion?.id === discussion.id ? styles.discussionItemActive : {}),
                  }}
                  className="discussion-item"
                  onClick={() => openDiscussion(discussion)}
                >
                  <div style={styles.discussionItemTitle}>{discussion.title}</div>
                  <div style={styles.discussionItemMeta}>
                    {discussion.author_username} • {formatDate(discussion.created_at)}
                  </div>
                  <div style={styles.discussionItemStats}>
                    {discussion.comment_count} comentários
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div 
          style={styles.chatArea}
        >
          {selectedDiscussion ? (
            <>
              <div 
                style={styles.chatHeader}
              >
                <div style={styles.chatHeaderContent}>
                  <h1 
                    style={styles.chatHeaderTitle}
                  >
                    {selectedDiscussion.title}
                  </h1>
                  <div 
                    style={styles.chatHeaderMeta}
                  >
                    Por {selectedDiscussion.author_username} • {formatDate(selectedDiscussion.created_at)}
                  </div>
                  <div 
                    style={styles.chatHeaderDescription}
                  >
                    {selectedDiscussion.description}
                  </div>
                </div>
                
                <div style={styles.chatHeaderActions}>
                  {user && selectedDiscussion.author_id === Number(user.id) && (
                    <button
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onClick={() => handleDeleteDiscussion(selectedDiscussion.id)}
                      className={`action-button delete-btn`}
                      title="Apagar discussão"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                  <button
                    style={{ ...styles.actionButton, ...styles.closeButton }}
                    onClick={closeDiscussion}
                    className={`action-button close-btn`}
                    title="Fechar"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div 
                style={styles.messagesArea}
              >
                {comments.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>💬</div>
                    <div style={styles.emptyStateText}>Nenhum comentário ainda</div>
                    <div style={styles.emptyStateSubtext}>Seja o primeiro a comentar!</div>
                  </div>
                ) : (
                  <>
                    {comments.map((comment) => {
                      const isCurrentUser = user && comment.author_id === Number(user.id);
                      return (
                        <div 
                          key={comment.id} 
                          style={isCurrentUser ? styles.messageUser : styles.messageOther}
                        >
                          <div style={styles.messageHeader}>
                            <span style={isCurrentUser ? styles.messageAuthorUser : styles.messageAuthor}>{comment.author_username}</span>
                            <span style={styles.messageTime}>{formatChatTime(comment.created_at)}</span>
                          </div>
                          <div style={styles.messageContent}>{comment.content}</div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div style={styles.chatInputArea}>
                <div style={styles.chatInputContainer}>
                  <input
                    ref={chatInputRef}
                    type="text"
                    placeholder="Escreva uma mensagem..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={styles.chatInput}
                    disabled={submitting}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    style={styles.sendButton}
                    className="send-btn"
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting ? (
                      <div className="spinner small"></div>
                    ) : (
                      <SendIcon />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>💭</div>
              <div style={styles.emptyStateText}>Selecione uma discussão</div>
              <div style={styles.emptyStateSubtext}>Escolha uma discussão para começar a conversar</div>
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Create Discussion Modal */}
      {showCreateForm && (
        <div style={styles.modal} onClick={() => setShowCreateForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nova Discussão</h2>
              <button
                style={{ ...styles.actionButton, ...styles.closeButton }}
                onClick={() => setShowCreateForm(false)}
                className="action-button"
              >
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleCreateDiscussion} style={styles.form}>
              <input
                type="text"
                placeholder="Título da discussão"
                value={newDiscussionTitle}
                onChange={(e) => setNewDiscussionTitle(e.target.value)}
                style={styles.input}
                required
                maxLength={200}
              />
              <textarea
                placeholder="Descreva o que quer discutir..."
                value={newDiscussionDescription}
                onChange={(e) => setNewDiscussionDescription(e.target.value)}
                style={styles.textarea}
                required
                maxLength={2000}
              />
              <button
                type="submit"
                style={styles.submitButton}
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner small"></div>
                    A criar...
                  </>
                ) : 'Criar Discussão'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes optimized-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        .spinner.small {
          width: 16px;
          height: 16px;
          border-width: 2px;
          margin: 0;
        }

        .hover-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.4);
          border-color: rgba(76, 175, 80, 0.6);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.12) 100%);
        }

        .hover-button:hover {
          background: linear-gradient(135deg, #00b366 0%, #00d474 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 151, 89, 0.5);
        }

        .discussion-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .action-button:hover {
          transform: scale(1.05);
        }

        .delete-btn:hover {
          background-color: rgba(239, 68, 68, 0.25) !important;
        }

        .close-btn:hover {
          background-color: rgba(156, 163, 175, 0.25) !important;
        }

        .send-btn:hover:not(:disabled) {
          background-color: #2563eb !important;
        }

        input:focus, textarea:focus, select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        ::placeholder {
          color: #64748b !important;
        }
      `}</style>
    </PageLayout>
  );
};

export default ChatPage;
