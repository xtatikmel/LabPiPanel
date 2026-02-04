import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api';

export function useRelays() {
  const [states, setStates] = useState<boolean[]>([false, false, false, false]);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/relay/status`);
      if (response.ok) {
        const data = await response.json();
        setStates(data.relays);
      }
    } catch (err) {
      console.error('Error fetching relay status:', err);
    }
  }, []);

  const setRelay = useCallback(async (relayId: number, state: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/relay/${relayId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ on: state })
      });
      const data = await response.json();
      if (data.success) {
        setStates(prev => {
          const newStates = [...prev];
          newStates[relayId - 1] = state;
          return newStates;
        });
      }
      return data.success;
    } catch (err) {
      console.error('Error setting relay:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleRelay = useCallback(async (relayId: number) => {
    const newState = !states[relayId - 1];
    return setRelay(relayId, newState);
  }, [states, setRelay]);

  const setAllRelays = useCallback(async (newStates: boolean[]) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/relay/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ states: newStates })
      });
      const data = await response.json();
      if (data.success) {
        setStates(newStates);
      }
      return data.success;
    } catch (err) {
      console.error('Error setting all relays:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    states,
    loading,
    setRelay,
    toggleRelay,
    setAllRelays,
    fetchStatus
  };
}
