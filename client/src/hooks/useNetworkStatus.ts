import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

interface NetworkStatus {
  isOnline: boolean;
  isApiReachable: boolean;
  lastChecked: Date;
  reconnectAttempts: number;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isApiReachable: true,
    lastChecked: new Date(),
    reconnectAttempts: 0
  });

  // Ping API para verificar conectividade
  const checkApiConnectivity = useCallback(async () => {
    try {
      console.log('🔍 Checking API connectivity...');
      const response = await api.get('/health', { timeout: 5000 });
      console.log('✅ API is reachable:', response.data);
      
      setNetworkStatus(prev => ({
        ...prev,
        isApiReachable: true,
        lastChecked: new Date(),
        reconnectAttempts: 0
      }));
      
      return true;
    } catch (error) {
      console.error('❌ API not reachable:', error);
      
      setNetworkStatus(prev => ({
        ...prev,
        isApiReachable: false,
        lastChecked: new Date(),
        reconnectAttempts: prev.reconnectAttempts + 1
      }));
      
      return false;
    }
  }, []);

  // Handle de mudanças na conectividade do navegador
  const handleOnlineStatusChange = useCallback(() => {
    const isOnline = navigator.onLine;
    console.log(`🌐 Network status changed: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline,
      lastChecked: new Date()
    }));

    // Se voltou online, verificar API
    if (isOnline) {
      setTimeout(() => {
        checkApiConnectivity();
      }, 1000);
    }
  }, [checkApiConnectivity]);

  // Reconexão automática quando detecta problemas
  const handleReconnection = useCallback(async () => {
    if (!networkStatus.isApiReachable && networkStatus.isOnline && networkStatus.reconnectAttempts < 5) {
      console.log(`🔄 Attempting API reconnection (${networkStatus.reconnectAttempts + 1}/5)...`);
      
      // Delay exponencial para reconexão
      const delay = Math.pow(2, networkStatus.reconnectAttempts) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await checkApiConnectivity();
    }
  }, [networkStatus, checkApiConnectivity]);

  // Setup event listeners
  useEffect(() => {
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Check inicial da conectividade
    checkApiConnectivity();

    // Heartbeat periódico para manter conexão ativa
    const heartbeatInterval = setInterval(() => {
      if (navigator.onLine) {
        checkApiConnectivity();
      }
    }, 30000); // Check a cada 30 segundos

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      clearInterval(heartbeatInterval);
    };
  }, [handleOnlineStatusChange, checkApiConnectivity]);

  // Tentar reconectar quando há problemas
  useEffect(() => {
    if (!networkStatus.isApiReachable && networkStatus.isOnline) {
      const reconnectTimeout = setTimeout(() => {
        handleReconnection();
      }, 2000); // Wait 2 seconds before attempting reconnection

      return () => clearTimeout(reconnectTimeout);
    }
  }, [networkStatus.isApiReachable, networkStatus.isOnline, handleReconnection]);

  return {
    ...networkStatus,
    checkApiConnectivity,
    forceReconnect: handleReconnection
  };
}; 