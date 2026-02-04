import { Power, Zap } from 'lucide-react';
import { FuenteStatus } from '../types';

interface Props {
  status: FuenteStatus;
  onVoltageChange: (value: number) => void;
  onCurrentChange: (value: number) => void;
  onToggleOutput: () => void;
}

export function PowerSourceControl({
  status,
  onVoltageChange,
  onCurrentChange,
  onToggleOutput,
}: Props) {
  const handleVoltageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    if (value >= 0 && value <= 300) {
      onVoltageChange(value);
    }
  };

  const handleCurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    if (value >= 0 && value <= 5.2) {
      onCurrentChange(value);
    }
  };

  const powerExceeded = status.power > 1500;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#002060]">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-[#002060]" />
        <h2 className="text-xl font-bold text-[#002060]">
          Control Fuente XLN
        </h2>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-3 h-3 rounded-full ${
            status.connected ? 'bg-[#27AE60]' : 'bg-gray-400'
          }`}
        />
        <span className="text-sm font-medium text-gray-700">
          {status.connected ? 'Conectado' : 'Desconectado'} (192.168.1.100:10001)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voltaje (V)
          </label>
          <input
            type="number"
            min="0"
            max="300"
            step="0.1"
            value={status.voltage_set}
            onChange={handleVoltageChange}
            className="w-full px-4 py-2 border-2 border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002060]"
            disabled={!status.connected}
          />
          <p className="text-xs text-gray-500 mt-1">Rango: 0-300V</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Corriente (A)
          </label>
          <input
            type="number"
            min="0"
            max="5.2"
            step="0.01"
            value={status.current_set}
            onChange={handleCurrentChange}
            className="w-full px-4 py-2 border-2 border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002060]"
            disabled={!status.connected}
          />
          <p className="text-xs text-gray-500 mt-1">Rango: 0-5.2A</p>
        </div>
      </div>

      <button
        onClick={onToggleOutput}
        disabled={!status.connected || powerExceeded}
        className={`w-full py-3 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2 ${
          status.output_enabled
            ? 'bg-[#E74C3C] hover:bg-[#C0392B]'
            : 'bg-[#27AE60] hover:bg-[#229954]'
        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
      >
        <Power className="w-5 h-5" />
        {status.output_enabled ? 'APAGAR SALIDA' : 'ENCENDER SALIDA'}
      </button>

      {powerExceeded && (
        <div className="mt-4 p-3 bg-[#E74C3C] text-white rounded-lg text-sm font-medium">
          ADVERTENCIA: Potencia excede 1500W
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Voltaje Actual</p>
          <p className="text-2xl font-bold text-[#002060]">
            {status.voltage_actual.toFixed(2)}V
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Corriente Actual</p>
          <p className="text-2xl font-bold text-[#002060]">
            {status.current_actual.toFixed(3)}A
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Potencia</p>
          <p
            className={`text-2xl font-bold ${
              powerExceeded ? 'text-[#E74C3C]' : 'text-[#002060]'
            }`}
          >
            {status.power.toFixed(2)}W
          </p>
        </div>
      </div>
    </div>
  );
}
