import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Clock, Database, Activity } from 'lucide-react';
import type { LiveData } from '@/types';

interface StatusBarProps {
  connected: boolean;
  data: LiveData;
}

export function StatusBar({ connected, data }: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="itm-status-bar">
      <div className="flex items-center gap-6">
        {/* Conexión SSE */}
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-400">Desconectado</span>
            </>
          )}
        </div>

        {/* Estado DAQ */}
        <div className="flex items-center gap-2">
          <Database className={`w-4 h-4 ${data.daq_connected ? 'text-green-400' : 'text-gray-400'}`} />
          <span className={data.daq_connected ? 'text-green-400' : 'text-gray-400'}>
            DAQ {data.daq_connected ? 'OK' : 'OFF'}
          </span>
        </div>

        {/* Estado Fuente */}
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${data.fuente_connected ? 'text-green-400' : 'text-gray-400'}`} />
          <span className={data.fuente_connected ? 'text-green-400' : 'text-gray-400'}>
            Fuente {data.fuente_connected ? 'OK' : 'OFF'}
          </span>
        </div>

        {/* Grabación */}
        {data.recording && (
          <div className="flex items-center gap-2 animate-recording">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-red-400 font-medium">
              REC {data.elapsed_time?.toFixed(1) || '0.0'}s
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>{currentTime.toLocaleString('es-CO')}</span>
      </div>
    </footer>
  );
}
