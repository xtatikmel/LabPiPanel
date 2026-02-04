import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS } from '@/types';
import { Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VoltageCurrentChartProps {
  data: {
    labels: string[];
    voltage: number[];
    current: number[];
  };
}

export function VoltageCurrentChart({ data }: VoltageCurrentChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Voltaje (V)',
        data: data.voltage,
        borderColor: CHART_COLORS.voltage,
        backgroundColor: CHART_COLORS.voltage + '20',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Corriente (A)',
        data: data.current,
        borderColor: CHART_COLORS.current,
        backgroundColor: CHART_COLORS.current + '20',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
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
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const label = context.dataset.label || '';
            const unit = label.includes('Voltaje') ? 'V' : 'A';
            const value = context.parsed.y ?? 0;
            return `${label}: ${value.toFixed(unit === 'V' ? 2 : 3)}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: CHART_COLORS.grid },
        ticks: { maxTicksLimit: 10, font: { size: 10 } },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Voltaje (V)', font: { size: 10 } },
        grid: { color: CHART_COLORS.grid },
        ticks: { font: { size: 10 } },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Corriente (A)', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        ticks: { font: { size: 10 } },
      },
    },
    animation: { duration: 0 },
  };

  return (
    <Card className="itm-panel h-full">
      <CardHeader className="itm-card-header py-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-4 h-4" />
          Voltaje y Corriente
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
