import { Settings, X } from 'lucide-react';
import { useState } from 'react';
import { FuenteConfig, DAQConfig, SafetyLimits } from '../types';

interface Props {
  fuenteConfig: FuenteConfig;
  daqConfig: DAQConfig;
  safetyLimits: SafetyLimits;
  onFuenteConfigChange: (config: FuenteConfig) => void;
  onDAQConfigChange: (config: DAQConfig) => void;
  onSafetyLimitsChange: (limits: SafetyLimits) => void;
}

export function SettingsPanel({
  fuenteConfig,
  daqConfig,
  safetyLimits,
  onFuenteConfigChange,
  onDAQConfigChange,
  onSafetyLimitsChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fuente' | 'daq' | 'safety'>(
    'fuente'
  );

  const handleFuenteChange = (key: string, value: string | number) => {
    onFuenteConfigChange({
      ...fuenteConfig,
      [key]: value,
    });
  };

  const handleDAQChange = (key: string, value: string | number) => {
    onDAQConfigChange({
      ...daqConfig,
      [key]: value,
    });
  };

  const handleSafetyChange = (key: string, value: number) => {
    onSafetyLimitsChange({
      ...safetyLimits,
      [key]: value,
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-[#002060] hover:bg-[#001040] text-white rounded-full p-4 shadow-lg transition-colors z-40"
      >
        <Settings className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#002060] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex border-b">
              {(['fuente', 'daq', 'safety'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 font-bold transition-colors ${
                    activeTab === tab
                      ? 'bg-[#E74C3C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'fuente'
                    ? 'Fuente XLN'
                    : tab === 'daq'
                      ? 'DAQ USB5203'
                      : 'Límites de Seguridad'}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {activeTab === 'fuente' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#002060]">
                    Configuración Fuente XLN
                  </h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Dirección IP
                    </label>
                    <input
                      type="text"
                      value={fuenteConfig.ip}
                      onChange={(e) =>
                        handleFuenteChange('ip', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Puerto
                    </label>
                    <input
                      type="number"
                      value={fuenteConfig.port}
                      onChange={(e) =>
                        handleFuenteChange('port', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Voltaje Máximo (V)
                    </label>
                    <input
                      type="number"
                      value={fuenteConfig.maxVoltage}
                      onChange={(e) =>
                        handleFuenteChange('maxVoltage', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Corriente Máxima (A)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={fuenteConfig.maxCurrent}
                      onChange={(e) =>
                        handleFuenteChange('maxCurrent', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Potencia Máxima (W)
                    </label>
                    <input
                      type="number"
                      value={fuenteConfig.maxPower}
                      onChange={(e) =>
                        handleFuenteChange('maxPower', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'daq' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#002060]">
                    Configuración DAQ USB5203
                  </h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Frecuencia de Muestreo (ms)
                    </label>
                    <input
                      type="number"
                      value={daqConfig.sampleRate}
                      onChange={(e) =>
                        handleDAQChange('sampleRate', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recomendado: 100ms (10 Hz)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Canales
                    </label>
                    <select
                      value={daqConfig.channels}
                      onChange={(e) =>
                        handleDAQChange('channels', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    >
                      <option value={4}>4 Canales</option>
                      <option value={8}>8 Canales</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Temperatura Mínima (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={daqConfig.tempMin}
                      onChange={(e) =>
                        handleDAQChange('tempMin', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Temperatura Máxima (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={daqConfig.tempMax}
                      onChange={(e) =>
                        handleDAQChange('tempMax', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#002060]">
                    Límites de Seguridad
                  </h3>
                  <div className="bg-yellow-50 border border-[#F39C12] rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      Estos límites generarán alertas si se exceden
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Voltaje Máximo (V)
                    </label>
                    <input
                      type="number"
                      value={safetyLimits.maxVoltage}
                      onChange={(e) =>
                        handleSafetyChange('maxVoltage', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Corriente Máxima (A)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={safetyLimits.maxCurrent}
                      onChange={(e) =>
                        handleSafetyChange('maxCurrent', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Potencia Máxima (W)
                    </label>
                    <input
                      type="number"
                      value={safetyLimits.maxPower}
                      onChange={(e) =>
                        handleSafetyChange('maxPower', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Temperatura Máxima (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={safetyLimits.maxTemp}
                      onChange={(e) =>
                        handleSafetyChange('maxTemp', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Temperatura Mínima (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={safetyLimits.minTemp}
                      onChange={(e) =>
                        handleSafetyChange('minTemp', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#002060] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
