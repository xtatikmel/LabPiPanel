import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHANNEL_NAMES, CHART_COLORS } from '@/types';
import { Thermometer } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TemperatureChartProps {
  data: {
    labels: string[];
    temperatures: number[][];
  };
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: CHANNEL_NAMES.map((name, index) => ({
      label: name,
      data: data.temperatures[index] || [],
      borderColor: CHART_COLORS.temperature[index % CHART_COLORS.temperature.length],
      backgroundColor: CHART_COLORS.temperature[index % CHART_COLORS.temperature.length] + '20',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { size: 10 },
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y ?? 0;
            return `${label}: ${value.toFixed(2)}°C`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: CHART_COLORS.grid,
        },
        ticks: {
          maxTicksLimit: 10,
          font: { size: 10 },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperatura (°C)',
          font: { size: 11 },
        },
        grid: {
          color: CHART_COLORS.grid,
        },
        ticks: {
          font: { size: 10 },
        },
      },
    },
    animation: {
      duration: 0,
    },
  };

  return (
    <Card className="itm-panel h-full">
      <CardHeader className="itm-card-header py-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Thermometer className="w-4 h-4" />
          Temperaturas (8 Canales)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="h-[250px]">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
