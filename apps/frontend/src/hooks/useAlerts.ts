import { useState, useCallback, useEffect } from 'react';
import { API_BASE } from '@/lib/api';

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  parameter: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
}

export function useAlerts() {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Crear audio element para alertas
  useEffect(() => {
    // Beep simple usando AudioContext
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playAlertSound = () => {
      if (!soundEnabled) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    (window as any).playAlertSound = playAlertSound;
    
    return () => {
      audioContext.close();
    };
  }, [soundEnabled]);

  const fetchActiveAlerts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/alerts/active`);
      if (response.ok) {
        const data = await response.json();
        const newAlerts: Alert[] = data.alerts;
        
        // Reproducir sonido si hay nuevas alertas
        if (newAlerts.length > activeAlerts.length && soundEnabled) {
          if ((window as any).playAlertSound) {
            (window as any).playAlertSound();
          }
        }
        
        setActiveAlerts(newAlerts);
      }
    } catch (err) {
      console.error('Error fetching active alerts:', err);
    }
  }, [activeAlerts.length, soundEnabled]);

  const fetchAlertHistory = useCallback(async (limit: number = 50) => {
    try {
      const response = await fetch(`${API_BASE}/alerts/history?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setAlertHistory(data.alerts);
      }
    } catch (err) {
      console.error('Error fetching alert history:', err);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`${API_BASE}/alerts/acknowledge/${alertId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
      }
      return data.success;
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      return false;
    }
  }, []);

  const clearAllAlerts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/alerts/clear`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setActiveAlerts([]);
      }
      return data.success;
    } catch (err) {
      console.error('Error clearing alerts:', err);
      return false;
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  // Polling de alertas
  useEffect(() => {
    fetchActiveAlerts();
    const interval = setInterval(fetchActiveAlerts, 1000);
    return () => clearInterval(interval);
  }, [fetchActiveAlerts]);

  return {
    activeAlerts,
    alertHistory,
    soundEnabled,
    fetchActiveAlerts,
    fetchAlertHistory,
    acknowledgeAlert,
    clearAllAlerts,
    toggleSound
  };
}
