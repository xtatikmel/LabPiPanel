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
import { Flame } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ThermalResistanceChartProps {
  data: {
    labels: string[];
    rThermal: number[];
  };
}

export function ThermalResistanceChart({ data }: ThermalResistanceChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'R Térmica (K/W)',
        data: data.rThermal,
        borderColor: CHART_COLORS.r_thermal,
        backgroundColor: CHART_COLORS.r_thermal + '20',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
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
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y ?? 0;
            return `R Térmica: ${value.toFixed(4)} K/W`;
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
        title: { display: true, text: 'R Térmica (K/W)', font: { size: 11 } },
        grid: { color: CHART_COLORS.grid },
        ticks: { font: { size: 10 } },
      },
    },
    animation: { duration: 0 },
  };

  return (
    <Card className="itm-panel h-full">
      <CardHeader className="itm-card-header py-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="w-4 h-4" />
          Resistencia Térmica
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
