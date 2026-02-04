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
import { CHART_COLORS } from '@/types';
import { Gauge } from 'lucide-react';

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

interface PowerChartProps {
  data: {
    labels: string[];
    power: number[];
  };
}

export function PowerChart({ data }: PowerChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Potencia (W)',
        data: data.power,
        borderColor: CHART_COLORS.power,
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, CHART_COLORS.power + '40');
          gradient.addColorStop(1, CHART_COLORS.power + '05');
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        fill: true,
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
            return `Potencia: ${value.toFixed(2)} W`;
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
        title: { display: true, text: 'Potencia (W)', font: { size: 11 } },
        grid: { color: CHART_COLORS.grid },
        ticks: { font: { size: 10 } },
        suggestedMin: 0,
        suggestedMax: 1500,
      },
    },
    animation: { duration: 0 },
  };

  return (
    <Card className="itm-panel h-full">
      <CardHeader className="itm-card-header py-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="w-4 h-4" />
          Potencia Eléctrica
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
