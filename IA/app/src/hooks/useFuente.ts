import { useState, useCallback } from 'react';
import type { FuenteStatus } from '@/types';

const API_BASE = 'http://localhost:5000/api';

export function useFuente() {
  const [status, setStatus] = useState<FuenteStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/fuente/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Error fetching fuente status:', err);
    }
  }, []);

  const connect = useCallback(async (host: string = '192.168.1.100', port: number = 10001) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/fuente/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port })
      });
      const data = await response.json();
      if (data.success) {
        await fetchStatus();
      } else {
        setError(data.message);
      }
      return data.success;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/fuente/disconnect`, { method: 'POST' });
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  const setVoltage = useCallback(async (voltage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/fuente/voltage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voltage })
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      }
      return data.success;
    } catch (err) {
      setError('Error estableciendo voltaje');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const setCurrent = useCallback(async (current: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/fuente/current`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current })
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      }
      return data.success;
    } catch (err) {
      setError('Error estableciendo corriente');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const setOutput = useCallback(async (on: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/fuente/output`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ on })
      });
      const data = await response.json();
      if (data.success) {
        await fetchStatus();
      }
      return data.success;
    } catch (err) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    connect,
    disconnect,
    setVoltage,
    setCurrent,
    setOutput,
    fetchStatus
  };
}
