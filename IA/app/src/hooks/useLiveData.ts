import { useState, useEffect, useRef, useCallback } from 'react';
import type { LiveData, SystemStatus } from '@/types';

const API_BASE = 'http://localhost:5000/api';

const defaultLiveData: LiveData = {
  timestamp: '',
  elapsed_time: 0,
  voltage: 0,
  current: 0,
  power: 0,
  temperatures: [0, 0, 0, 0, 0, 0, 0, 0],
  t_evap_avg: 0,
  t_cond_avg: 0,
  r_thermal: 0,
  relays: [false, false, false, false],
  recording: false,
  fuente_connected: false,
  daq_connected: false
};

export function useLiveData() {
  const [data, setData] = useState<LiveData>(defaultLiveData);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(`${API_BASE}/live-data`);
      
      eventSource.onopen = () => {
        setConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const newData: LiveData = JSON.parse(event.data);
          setData(newData);
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE error');
        setConnected(false);
        setError('Conexión perdida. Reconectando...');
        eventSource.close();
        
        // Reconectar después de 3 segundos
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error('Error creating EventSource:', err);
      setError('Error de conexión');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { data, connected, error };
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { status, loading, refresh: fetchStatus };
}

// Fallback: polling si SSE no funciona
export function useLiveDataPolling(interval: number = 100) {
  const [data, setData] = useState<LiveData>(defaultLiveData);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/live-data/json`);
        if (response.ok) {
          const newData = await response.json();
          setData(newData);
          setConnected(true);
        }
      } catch (err) {
        setConnected(false);
      }
    };

    fetchData();
    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return { data, connected };
}
