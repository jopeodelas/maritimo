import { useNetworkStatus } from '../hooks/useNetworkStatus';

const NetworkStatusIndicator = () => {
  const { isOnline, isApiReachable, reconnectAttempts, forceReconnect } = useNetworkStatus();

  // Não mostrar nada se tudo estiver normal
  if (isOnline && isApiReachable) {
    return null;
  }

  const getStatusMessage = () => {
    if (!isOnline) {
      return {
        title: 'Sem conexão à internet',
        message: 'Verifique a sua ligação à internet.',
        color: '#f44336',
        icon: '📶'
      };
    }
    
    if (!isApiReachable) {
      return {
        title: 'Problemas de conectividade',
        message: reconnectAttempts > 0 
          ? `A tentar reconectar... (${reconnectAttempts}/5)`
          : 'A verificar ligação ao servidor...',
        color: '#ff9800',
        icon: '⚠️'
      };
    }

    return {
      title: 'Estado desconhecido',
      message: 'Verificando ligação...',
      color: '#9e9e9e',
      icon: '❓'
    };
  };

  const status = getStatusMessage();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: status.color,
      color: 'white',
      padding: '8px 16px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 10000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderBottom: `2px solid ${status.color}`,
      animation: 'slideDown 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <span style={{ fontSize: '16px' }}>{status.icon}</span>
        <div>
          <strong>{status.title}</strong>
          <span style={{ marginLeft: '8px', opacity: 0.9 }}>
            {status.message}
          </span>
        </div>
        {!isApiReachable && reconnectAttempts < 5 && (
          <button
            onClick={forceReconnect}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            Tentar agora
          </button>
        )}
      </div>
      
      <style>
        {`
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NetworkStatusIndicator; 