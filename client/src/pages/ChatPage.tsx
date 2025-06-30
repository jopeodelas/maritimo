import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/PageLayout';
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
    // Layout original quando não há gaveta
    content: {
      maxWidth: "min(98vw, 110rem)",
      margin: "0 auto",
      padding: "clamp(8rem, 10vh, 10rem) clamp(0.5rem, 1vw, 1.5rem) clamp(1rem, 2vh, 2rem)",
      position: "relative",
      zIndex: 2,
      display: isDrawerOpen ? 'none' : 'block',
    },
    header: {
      textAlign: 'center',
      marginBottom: '3vh',
    },
    heroSection: {
      background: "rgba(30, 40, 50, 0.95)",
      border: "2px solid rgba(76, 175, 80, 0.4)",
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem)",
      padding: "clamp(2rem, 4vh, 3rem) clamp(1.5rem, 3vw, 2.5rem)",
      marginBottom: "clamp(1.5rem, 3vh, 2.5rem)",
      color: "white",
      textAlign: "center",
      boxShadow: `
        0 clamp(0.5rem, 1.5vh, 1rem) clamp(2rem, 4vh, 3rem) rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(76, 175, 80, 0.3)
      `,
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
      borderRadius: "clamp(1rem, 2.5vw, 1.5rem) clamp(1rem, 2.5vw, 1.5rem) 0 0",
    },
    heroTitle: {
      fontSize: "clamp(2rem, 5vw, 3.5rem)",
      fontWeight: "800",
      margin: "0 0 clamp(0.5rem, 1.5vh, 1rem) 0",
      background: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textShadow: "0 0.125rem 0.25rem rgba(255, 215, 0, 0.3)",
      letterSpacing: "-0.02em",
      position: "relative",
    },
    heroSubtitle: {
      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
      margin: 0,
      fontWeight: "500",
      color: "#B0BEC5",
      textShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
    },
    title: {
      fontSize: '3.5vw',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '1vh',
      textShadow: '0.2vh 0.2vh 0.5vh rgba(0, 0, 0, 0.5)',
    },
    subtitle: {
      fontSize: '1.3vw',
      color: '#FFBB4C',
      fontWeight: '400',
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2vh',
      flexWrap: 'wrap',
      gap: '2vh',
      padding: '1vh 0',
    },
    leftControls: {
      display: 'flex',
      gap: '1.5vw',
      alignItems: 'center',
      flex: '1 1 auto',
      minWidth: '300px',
    },
    searchInput: {
      padding: '1vh 1.5vw',
      borderRadius: '0.8vw',
      border: '2px solid rgba(255, 187, 76, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      fontSize: '1vw',
      width: '20vw',
      transition: 'all 0.3s ease',
    },
    sortSelect: {
      padding: '1vh 1.5vw',
      borderRadius: '0.8vw',
      border: '2px solid rgba(255, 187, 76, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      fontSize: '1vw',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1vw center',
      backgroundSize: '1.2vw',
      paddingRight: '3vw',
      minWidth: '12vw',
    },
    createButton: {
      backgroundColor: '#009759',
      color: 'white',
      border: 'none',
      padding: '1.2vh 2vw',
      borderRadius: '0.8vw',
      fontSize: '1.1vw',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 0.3vh 1vh rgba(0, 151, 89, 0.3)',
    },
    discussionsList: {
      display: 'grid',
      gap: '1.5vh',
    },
    discussionCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '1vw',
      padding: '2vh 2vw',
      border: '2px solid rgba(255, 187, 76, 0.2)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
    },
    discussionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1vh',
    },
    discussionTitle: {
      fontSize: '1.5vw',
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: '0.5vh',
    },
    discussionMeta: {
      fontSize: '0.9vw',
      color: '#FFBB4C',
      textAlign: 'right',
    },
    discussionDescription: {
      fontSize: '1vw',
      color: '#E0E0E0',
      marginBottom: '1vh',
      lineHeight: '1.5',
    },
    discussionStats: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.9vw',
      color: '#B0B0B0',
    },

    // NEW REDESIGNED CHAT INTERFACE
    chatOverlay: {
      position: 'fixed',
      top: '70px',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(3px)',
      zIndex: 500,
      display: isDrawerOpen ? 'block' : 'none',
    },

    chatContainer: {
      position: 'fixed',
      top: '70px',
      left: '0',
      right: '0',
      bottom: '0',
      width: '100vw',
      height: 'calc(100vh - 70px)',
      backgroundColor: '#1e293b',
      borderRadius: '0',
      boxShadow: 'none',
      border: 'none',
      display: isDrawerOpen ? 'flex' : 'none',
      overflow: 'hidden',
      zIndex: 501,
    },

    sidebar: {
      width: '400px',
      backgroundColor: '#0f172a',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      minWidth: '400px',
      maxWidth: '400px',
    },

    sidebarHeader: {
      padding: '24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },

    sidebarTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#f8fafc',
      marginBottom: '8px',
    },

    sidebarSubtitle: {
      fontSize: '13px',
      color: '#94a3b8',
      marginBottom: '20px',
    },

    sidebarControls: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },

    sidebarSearch: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
    },

    sidebarSelect: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f8fafc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '16px',
      paddingRight: '40px',
    },

    newDiscussionBtn: {
      width: '100%',
      padding: '14px 20px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },

    discussionList: {
      flex: 1,
      overflow: 'auto',
      padding: '0',
    },

    discussionItem: {
      padding: '16px 24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
    },

    discussionItemActive: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderLeft: '3px solid #3b82f6',
    },

    discussionItemTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#f8fafc',
      marginBottom: '6px',
      lineHeight: '1.3',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    discussionItemMeta: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px',
    },

    discussionItemStats: {
      fontSize: '12px',
      color: '#94a3b8',
    },

    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e293b',
    },

    chatHeader: {
      padding: '24px 32px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    chatHeaderContent: {
      flex: 1,
    },

    chatHeaderTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#f8fafc',
      marginBottom: '6px',
      lineHeight: '1.3',
    },

    chatHeaderMeta: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '8px',
    },

    chatHeaderDescription: {
      fontSize: '14px',
      color: '#94a3b8',
      lineHeight: '1.4',
      maxWidth: '600px',
    },

    chatHeaderActions: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },

    actionButton: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontSize: '18px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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

    messagesArea: {
      flex: 1,
      padding: '24px 32px',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minHeight: 0, // Important: allows flex child to shrink
      scrollBehavior: 'smooth',
    },

    message: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '16px 20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxWidth: '80%',
      flexShrink: 0, // Important: prevents messages from shrinking
      minHeight: 'auto', // Important: allows natural height
    },

    // Message for other users (left side)
    messageOther: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '16px 20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxWidth: '80%',
      flexShrink: 0,
      minHeight: 'auto',
      alignSelf: 'flex-start',
    },

    // Message for current user (right side)
    messageUser: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderRadius: '16px',
      padding: '16px 20px',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      maxWidth: '80%',
      flexShrink: 0,
      minHeight: 'auto',
      alignSelf: 'flex-end',
    },

    messageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },

    messageAuthor: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#3b82f6',
    },

    messageAuthorUser: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#93c5fd',
    },

    messageTime: {
      fontSize: '12px',
      color: '#64748b',
    },

    messageContent: {
      fontSize: '15px',
      color: '#e2e8f0',
      lineHeight: '1.5',
      wordBreak: 'break-word',
    },

    chatInputArea: {
      padding: '24px 32px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },

    chatInputContainer: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end',
    },

    chatInput: {
      flex: 1,
      padding: '14px 18px',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '15px',
      outline: 'none',
      resize: 'none',
      minHeight: '48px',
      maxHeight: '120px',
      transition: 'all 0.2s ease',
    },

    sendButton: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      flexShrink: 0,
    },

    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#64748b',
      textAlign: 'center',
    },

    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: 0.5,
    },

    emptyStateText: {
      fontSize: '16px',
      marginBottom: '8px',
    },

    emptyStateSubtext: {
      fontSize: '14px',
      opacity: 0.7,
    },

    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10001,
      padding: '20px',
    },

    modalContent: {
      backgroundColor: '#1e293b',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },

    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },

    modalTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#f8fafc',
    },

    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },

    input: {
      padding: '14px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.2s ease',
    },

    textarea: {
      padding: '14px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      fontSize: '15px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      outline: 'none',
      transition: 'all 0.2s ease',
    },

    submitButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '14px 24px',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },

    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      color: '#64748b',
      fontSize: '15px',
    },

    '@media (max-width: 768px)': {
      chatContainer: {
        flexDirection: 'column',
        top: '70px',
        height: 'calc(100vh - 70px)',
      },
      sidebar: {
        height: '40vh',
        minWidth: '100%',
        maxWidth: '100%',
        borderRight: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      },
      chatArea: {
        height: '60vh',
      },
      title: {
        fontSize: '6vw',
      },
      subtitle: {
        fontSize: '3vw',
      },
      searchInput: {
        width: '100%',
        fontSize: '3vw',
      },
      sortSelect: {
        fontSize: '3vw',
        minWidth: '30vw',
        backgroundSize: '3vw',
        paddingRight: '8vw',
      },
      createButton: {
        fontSize: '3vw',
        padding: '2vh 4vw',
      },
      discussionTitle: {
        fontSize: '4vw',
      },
      discussionDescription: {
        fontSize: '3vw',
      },
      discussionMeta: {
        fontSize: '2.5vw',
      },
      discussionStats: {
        fontSize: '2.5vw',
      },
    } as any,
  });

  return (
    <PageLayout>
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        
        {/* Original layout - only show when drawer is closed */}
        <div style={{
          ...styles.content,
          padding: isMobile 
            ? '70px 1rem 1rem' // Mobile: padding top para header + spacing
            : undefined // Desktop original
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
              className={isMobile ? "mobile-chat-search-input" : ""}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
              style={styles.sortSelect}
              className={isMobile ? "mobile-chat-sort-select" : ""}
            >
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigas</option>
              <option value="popular">Mais Populares</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            style={styles.createButton}
            className={isMobile ? "mobile-chat-new-discussion-btn hover-button" : "hover-button"}
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

      {/* New Chat Interface */}
      <div style={styles.chatOverlay} onClick={closeDiscussion}></div>
      
      <div 
        style={styles.chatContainer} 
        onClick={(e) => e.stopPropagation()}
        className={isMobile ? "mobile-chat-drawer" : ""}
      >
        {/* Sidebar */}
        <div 
          style={styles.sidebar}
          className={isMobile ? "mobile-chat-sidebar" : ""}
        >
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
          className={isMobile ? "mobile-chat-area" : ""}
        >
          {selectedDiscussion ? (
            <>
              <div 
                style={styles.chatHeader}
                className={isMobile ? "mobile-chat-header" : ""}
              >
                <div style={styles.chatHeaderContent}>
                  <h1 style={styles.chatHeaderTitle}>{selectedDiscussion.title}</h1>
                  <div style={styles.chatHeaderMeta}>
                    Por {selectedDiscussion.author_username} • {formatDate(selectedDiscussion.created_at)}
                  </div>
                  <div style={styles.chatHeaderDescription}>
                    {selectedDiscussion.description}
                  </div>
                </div>
                
                <div style={styles.chatHeaderActions}>
                  {user && selectedDiscussion.author_id === Number(user.id) && (
                    <button
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onClick={() => handleDeleteDiscussion(selectedDiscussion.id)}
                      className={`action-button delete-btn ${isMobile ? "mobile-chat-action-button" : ""}`}
                      title="Apagar discussão"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                  <button
                    style={{ ...styles.actionButton, ...styles.closeButton }}
                    onClick={closeDiscussion}
                    className={`action-button close-btn ${isMobile ? "mobile-chat-action-button" : ""}`}
                    title="Fechar"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div style={styles.messagesArea}>
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
          box-shadow: 0 10px 30px rgba(255, 187, 76, 0.4), 0 4px 15px rgba(255, 187, 76, 0.2);
          border-color: rgba(255, 187, 76, 0.6);
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

        .new-discussion-btn:hover {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .action-button:hover {
          transform: scale(1.1);
        }

        .delete-btn:hover {
          background-color: rgba(239, 68, 68, 0.25);
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .close-btn:hover {
          background-color: rgba(156, 163, 175, 0.25);
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(156, 163, 175, 0.2);
        }

        .send-btn:hover:not(:disabled) {
          background-color: #2563eb;
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        input:focus, textarea:focus, select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Placeholder styles */
        ::placeholder {
          color: #64748b;
        }

        @media (max-width: 768px) {
          .chatContainer {
            flex-direction: column;
            top: 70px !important;
            height: calc(100vh - 70px) !important;
          }
          
          .sidebar {
            height: 40vh;
            min-width: 100%;
            max-width: 100%;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .chatArea {
            height: 60vh;
          }
        }
      `}</style>
    </div>
    </PageLayout>
  );
};

export default ChatPage;
