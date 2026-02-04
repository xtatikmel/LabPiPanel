import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHANNEL_NAMES } from '@/types';
import { Thermometer, TrendingUp, TrendingDown } from 'lucide-react';

interface TemperaturePanelProps {
  temperatures: number[];
  tEvapAvg: number;
  tCondAvg: number;
}

export function TemperaturePanel({ temperatures, tEvapAvg, tCondAvg }: TemperaturePanelProps) {
  const getTempColor = (temp: number) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 20) return 'text-cyan-600';
    if (temp < 40) return 'text-green-600';
    if (temp < 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTempBg = (temp: number) => {
    if (temp < 0) return 'bg-blue-50';
    if (temp < 20) return 'bg-cyan-50';
    if (temp < 40) return 'bg-green-50';
    if (temp < 60) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <Card className="itm-panel">
      <CardHeader className="itm-card-header">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Thermometer className="w-5 h-5" />
          Temperaturas en Tiempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Promedios */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-medium">T Evaporador (Prom)</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {tEvapAvg.toFixed(2)}°C
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">T Condensador (Prom)</span>
            </div>
            <div className="text-2xl font-bold text-red-800">
              {tCondAvg.toFixed(2)}°C
            </div>
          </div>
        </div>

        {/* Grid de canales */}
        <div className="grid grid-cols-4 gap-2">
          {temperatures.map((temp, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${getTempBg(temp)} border border-gray-200`}
            >
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                CH{index}
              </div>
              <div className={`text-sm font-bold ${getTempColor(temp)}`}>
                {temp.toFixed(1)}°C
              </div>
              <div className="text-[9px] text-gray-400 truncate">
                {CHANNEL_NAMES[index]}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
