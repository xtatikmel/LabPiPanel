import { useState, useCallback } from 'react';
import type { RecordingStatus, RecordingFile } from '@/types';

const API_BASE = 'http://localhost:5000/api';

export function useRecording() {
  const [status, setStatus] = useState<RecordingStatus | null>(null);
  const [files, setFiles] = useState<RecordingFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/recording/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Error fetching recording status:', err);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/recording/list`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      }
    } catch (err) {
      console.error('Error fetching recording files:', err);
    }
  }, []);

  const start = useCallback(async (filename?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/recording/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filename ? { filename } : {})
      });
      const data = await response.json();
      if (data.success) {
        await fetchStatus();
      }
      return data;
    } catch (err) {
      console.error('Error starting recording:', err);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  const stop = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/recording/stop`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        await fetchStatus();
        await fetchFiles();
      }
      return data;
    } catch (err) {
      console.error('Error stopping recording:', err);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [fetchStatus, fetchFiles]);

  const pause = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/recording/pause`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        await fetchStatus();
      }
      return data;
    } catch (err) {
      console.error('Error pausing recording:', err);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  const download = useCallback((filename: string) => {
    const url = `${API_BASE}/recording/download?filename=${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    status,
    files,
    loading,
    start,
    stop,
    pause,
    download,
    fetchStatus,
    fetchFiles
  };
}
