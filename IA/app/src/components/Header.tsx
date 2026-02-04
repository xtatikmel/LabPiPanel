import { Activity, Thermometer, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="itm-header">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg">
              <img 
                src="https://www.itm.edu.co/favicon.ico" 
                alt="ITM Logo" 
                className="w-10 h-10"
                onError={(e) => {
                  // Fallback si el favicon no carga
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="w-10 h-10 bg-[#002060] rounded flex items-center justify-center text-white font-bold text-lg hidden">
                ITM
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">
                LABORATORIO TÉRMICO
              </h1>
              <p className="text-sm text-white/80">
                Instituto Tecnológico Metropolitano - Medellín
              </p>
            </div>
          </div>

          {/* Indicadores de sistema */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">Fuente XLN</span>
              <div className="itm-indicator itm-indicator-on" title="Conectado"></div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-cyan-400" />
              <span className="text-sm">DAQ USB5203</span>
              <div className="itm-indicator itm-indicator-on" title="Conectado"></div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-sm">Sistema</span>
              <div className="itm-indicator itm-indicator-on" title="Activo"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
