import { useEffect, useRef } from 'react';
import { LiveData } from '../types';
import { TrendingUp } from 'lucide-react';

interface Props {
  dataHistory: LiveData[];
  maxPoints?: number;
}

export function RealtimeCharts({ dataHistory, maxPoints = 300 }: Props) {
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const viCanvasRef = useRef<HTMLCanvasElement>(null);
  const powerCanvasRef = useRef<HTMLCanvasElement>(null);
  const rthermalCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const data = dataHistory.slice(-maxPoints);

    drawTemperatureChart(tempCanvasRef.current, data);
    drawVIChart(viCanvasRef.current, data);
    drawPowerChart(powerCanvasRef.current, data);
    drawRThermalChart(rthermalCanvasRef.current, data);
  }, [dataHistory, maxPoints]);

  const drawTemperatureChart = (
    canvas: HTMLCanvasElement | null,
    data: LiveData[]
  ) => {
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const allTemps = data.flatMap((d) => [
      d.T_ch0,
      d.T_ch1,
      d.T_ch2,
      d.T_ch3,
      d.T_ch4,
      d.T_ch5,
      d.T_ch6,
      d.T_ch7,
    ]);
    const minTemp = Math.min(...allTemps) - 5;
    const maxTemp = Math.max(...allTemps) + 5;

    const colors = [
      '#E74C3C',
      '#E67E22',
      '#F39C12',
      '#F1C40F',
      '#27AE60',
      '#16A085',
      '#3498DB',
      '#2980B9',
    ];

    for (let ch = 0; ch < 8; ch++) {
      ctx.strokeStyle = colors[ch];
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, i) => {
        const x = (i / (data.length - 1)) * width;
        const temp = point[`T_ch${ch}` as keyof LiveData] as number;
        const y = height - ((temp - minTemp) / (maxTemp - minTemp)) * height;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    }

    ctx.strokeStyle = '#002060';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
  };

  const drawVIChart = (canvas: HTMLCanvasElement | null, data: LiveData[]) => {
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const maxV = Math.max(...data.map((d) => d.voltaje), 1);
    const maxI = Math.max(...data.map((d) => d.corriente), 1);

    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (point.voltaje / maxV) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = '#27AE60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (point.corriente / maxI) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = '#002060';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
  };

  const drawPowerChart = (
    canvas: HTMLCanvasElement | null,
    data: LiveData[]
  ) => {
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const maxP = Math.max(...data.map((d) => d.potencia), 1);

    ctx.strokeStyle = '#F39C12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (point.potencia / maxP) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    const limitY = height - (1500 / maxP) * height;
    ctx.beginPath();
    ctx.moveTo(0, limitY);
    ctx.lineTo(width, limitY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#002060';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
  };

  const drawRThermalChart = (
    canvas: HTMLCanvasElement | null,
    data: LiveData[]
  ) => {
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const rValues = data.map((d) => d.R_thermal);
    const minR = Math.min(...rValues);
    const maxR = Math.max(...rValues);
    const range = maxR - minR || 1;

    ctx.strokeStyle = '#8E44AD';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((point.R_thermal - minR) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = '#002060';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#002060]">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-[#002060]" />
        <h2 className="text-xl font-bold text-[#002060]">
          Gráficas en Tiempo Real
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold text-[#002060] mb-2">
            Temperaturas (8 Canales)
          </h3>
          <canvas
            ref={tempCanvasRef}
            width={600}
            height={250}
            className="w-full border border-gray-200 rounded"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((ch) => (
              <span key={ch} className="text-xs">
                <span
                  className="inline-block w-3 h-3 mr-1"
                  style={{
                    backgroundColor: [
                      '#E74C3C',
                      '#E67E22',
                      '#F39C12',
                      '#F1C40F',
                      '#27AE60',
                      '#16A085',
                      '#3498DB',
                      '#2980B9',
                    ][ch],
                  }}
                />
                CH{ch}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#002060] mb-2">
            Voltaje/Corriente
          </h3>
          <canvas
            ref={viCanvasRef}
            width={600}
            height={250}
            className="w-full border border-gray-200 rounded"
          />
          <div className="flex gap-4 mt-2 text-xs">
            <span>
              <span className="inline-block w-3 h-3 mr-1 bg-[#E74C3C]" />
              Voltaje (V)
            </span>
            <span>
              <span className="inline-block w-3 h-3 mr-1 bg-[#27AE60]" />
              Corriente (A)
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#002060] mb-2">Potencia</h3>
          <canvas
            ref={powerCanvasRef}
            width={600}
            height={250}
            className="w-full border border-gray-200 rounded"
          />
          <div className="flex gap-4 mt-2 text-xs">
            <span>
              <span className="inline-block w-3 h-3 mr-1 bg-[#F39C12]" />
              Potencia (W)
            </span>
            <span>
              <span className="inline-block w-3 h-3 mr-1 bg-[#E74C3C] opacity-50" />
              Límite 1500W
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#002060] mb-2">
            Resistencia Térmica
          </h3>
          <canvas
            ref={rthermalCanvasRef}
            width={600}
            height={250}
            className="w-full border border-gray-200 rounded"
          />
          <div className="flex gap-4 mt-2 text-xs">
            <span>
              <span className="inline-block w-3 h-3 mr-1 bg-[#8E44AD]" />
              R_thermal (K/W)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
