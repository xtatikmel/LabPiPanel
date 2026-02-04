import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { FuenteControl } from '@/components/FuenteControl';
import { RelayControl } from '@/components/RelayControl';
import { RecordingControl } from '@/components/RecordingControl';
import { TemperaturePanel } from '@/components/TemperaturePanel';
import { TemperatureChart } from '@/components/TemperatureChart';
import { VoltageCurrentChart } from '@/components/VoltageCurrentChart';
import { PowerChart } from '@/components/PowerChart';
import { ThermalResistanceChart } from '@/components/ThermalResistanceChart';
import { StatusBar } from '@/components/StatusBar';
import { ConfigPanel } from '@/components/ConfigPanel';
import { AlertsPanel } from '@/components/AlertsPanel';
import { useLiveData } from '@/hooks/useLiveData';

// Historial de datos para gráficas
const MAX_POINTS = 300; // 30 segundos a 10 Hz

interface ChartData {
  labels: string[];
  temperatures: number[][];
  voltage: number[];
  current: number[];
  power: number[];
  rThermal: number[];
}

function App() {
  const { data, connected } = useLiveData();
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    temperatures: [[], [], [], [], [], [], [], []],
    voltage: [],
    current: [],
    power: [],
    rThermal: [],
  });

  // Actualizar datos de gráficas
  useEffect(() => {
    if (!data.timestamp) return;

    const timeLabel = new Date(data.timestamp).toLocaleTimeString('es-CO', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setChartData(prev => {
      const newLabels = [...prev.labels, timeLabel].slice(-MAX_POINTS);
      const newTemperatures = prev.temperatures.map((temps, i) =>
        [...temps, data.temperatures[i] || 0].slice(-MAX_POINTS)
      );
      const newVoltage = [...prev.voltage, data.voltage].slice(-MAX_POINTS);
      const newCurrent = [...prev.current, data.current].slice(-MAX_POINTS);
      const newPower = [...prev.power, data.power].slice(-MAX_POINTS);
      const newRThermal = [...prev.rThermal, data.r_thermal].slice(-MAX_POINTS);

      return {
        labels: newLabels,
        temperatures: newTemperatures,
        voltage: newVoltage,
        current: newCurrent,
        power: newPower,
        rThermal: newRThermal,
      };
    });
  }, [data]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-4">
        {/* Fila 1: Controles principales + Configuración y Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <FuenteControl />
          <ConfigPanel />
          <AlertsPanel />
        </div>

        {/* Fila 2: Relés y Grabación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <RelayControl />
          <RecordingControl />
        </div>

        {/* Fila 3: Panel de temperaturas */}
        <div className="mb-4">
          <TemperaturePanel
            temperatures={data.temperatures}
            tEvapAvg={data.t_evap_avg}
            tCondAvg={data.t_cond_avg}
          />
        </div>

        {/* Fila 4: Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TemperatureChart data={chartData} />
          <VoltageCurrentChart data={chartData} />
          <PowerChart data={chartData} />
          <ThermalResistanceChart data={chartData} />
        </div>
      </main>

      <StatusBar connected={connected} data={data} />
    </div>
  );
}

export default App;
