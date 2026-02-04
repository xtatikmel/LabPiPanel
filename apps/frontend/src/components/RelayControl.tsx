import { useEffect } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { useRelays } from '@/hooks/useRelays';
import { useConfig } from '@/hooks/useConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RELAY_NAMES } from '@/types';

export function RelayControl() {
  const { states, toggleRelay, fetchStatus } = useRelays();
  const { config } = useConfig();
  const relayNames = config.relay_labels?.length === 4 ? config.relay_labels : RELAY_NAMES;

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <Card className="itm-panel">
      <CardHeader className="itm-card-header">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ToggleLeft className="w-5 h-5" />
          Control de Relés
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {states.map((state, index) => (
            <button
              key={index}
              onClick={() => toggleRelay(index + 1)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                state
                  ? 'bg-[#27AE60]/10 border-[#27AE60] shadow-[0_0_10px_rgba(39,174,96,0.3)]'
                  : 'bg-gray-50 border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs text-gray-500 mb-1">RELÉ {index + 1}</div>
                  <div className={`font-semibold ${state ? 'text-[#27AE60]' : 'text-gray-700'}`}>
                    {relayNames[index]}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {state ? (
                    <ToggleRight className="w-8 h-8 text-[#27AE60]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                  <span className={`text-xs font-medium ${state ? 'text-[#27AE60]' : 'text-gray-500'}`}>
                    {state ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              {/* LED indicador */}
              <div
                className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                  state ? 'bg-[#27AE60] animate-pulse' : 'bg-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Estado general */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-2">ESTADO GENERAL</div>
          <div className="flex gap-2">
            {states.map((state, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                  state
                    ? 'bg-[#27AE60] text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
                title={relayNames[i]}
              >
                R{i + 1}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
