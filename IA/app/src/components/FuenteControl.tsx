import { useState, useEffect } from 'react';
import { Power, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useFuente } from '@/hooks/useFuente';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FuenteControl() {
  const { status, loading, error, connect, disconnect, setVoltage, setCurrent, setOutput, fetchStatus } = useFuente();
  const [voltageInput, setVoltageInput] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [host, setHost] = useState('192.168.1.100');
  const [port, setPort] = useState('10001');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleConnect = async () => {
    await connect(host, parseInt(port));
  };

  const handleSetVoltage = async () => {
    const v = parseFloat(voltageInput);
    if (!isNaN(v) && v >= 0 && v <= 300) {
      await setVoltage(v);
      setVoltageInput('');
    }
  };

  const handleSetCurrent = async () => {
    const i = parseFloat(currentInput);
    if (!isNaN(i) && i >= 0 && i <= 5.2) {
      await setCurrent(i);
      setCurrentInput('');
    }
  };

  const formatValue = (val: number, decimals: number = 2) => {
    return isNaN(val) ? '0.00' : val.toFixed(decimals);
  };

  return (
    <Card className="itm-panel">
      <CardHeader className="itm-card-header">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5" />
          Control Fuente XLN
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Estado de conexión */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {status?.connected ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Conectado</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">Desconectado</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {!status?.connected ? (
              <>
                <Input
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="Host"
                  className="w-32 h-8 text-sm"
                />
                <Input
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="Puerto"
                  className="w-20 h-8 text-sm"
                />
                <Button 
                  onClick={handleConnect} 
                  disabled={loading}
                  className="h-8 text-sm itm-btn-primary"
                >
                  Conectar
                </Button>
              </>
            ) : (
              <Button 
                onClick={disconnect} 
                disabled={loading}
                className="h-8 text-sm itm-btn-secondary"
              >
                Desconectar
              </Button>
            )}
          </div>
        </div>

        {/* Mediciones */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-600 mb-1">Voltaje</div>
            <div className="text-xl font-bold text-[#002060]">
              {formatValue(status?.voltage || 0)}
              <span className="text-sm font-normal ml-1">V</span>
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-600 mb-1">Corriente</div>
            <div className="text-xl font-bold text-[#E74C3C]">
              {formatValue(status?.current || 0, 3)}
              <span className="text-sm font-normal ml-1">A</span>
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-600 mb-1">Potencia</div>
            <div className="text-xl font-bold text-[#27AE60]">
              {formatValue(status?.power || 0)}
              <span className="text-sm font-normal ml-1">W</span>
            </div>
          </div>
        </div>

        {/* Control de salida */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Salida de Potencia</span>
          <Button
            onClick={() => setOutput(!status?.output_on)}
            disabled={!status?.connected || loading}
            className={`h-10 px-6 font-bold transition-all ${
              status?.output_on 
                ? 'itm-btn-danger' 
                : 'itm-btn-success'
            }`}
          >
            <Power className="w-4 h-4 mr-2" />
            {status?.output_on ? 'APAGAR' : 'ENCENDER'}
          </Button>
        </div>

        {/* Setpoints */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Voltaje (0-300V)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="300"
                step="0.1"
                value={voltageInput}
                onChange={(e) => setVoltageInput(e.target.value)}
                placeholder="0.0"
                disabled={!status?.connected}
                className="itm-input"
              />
              <Button
                onClick={handleSetVoltage}
                disabled={!status?.connected || !voltageInput || loading}
                className="itm-btn-primary"
              >
                Set
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Corriente (0-5.2A)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="5.2"
                step="0.01"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="0.0"
                disabled={!status?.connected}
                className="itm-input"
              />
              <Button
                onClick={handleSetCurrent}
                disabled={!status?.connected || !currentInput || loading}
                className="itm-btn-primary"
              >
                Set
              </Button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
