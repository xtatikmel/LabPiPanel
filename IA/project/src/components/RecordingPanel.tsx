import { Circle, Download, Pause, Play, Square } from 'lucide-react';
import { RecordingState } from '../types';

interface Props {
  recordingState: RecordingState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onExportCSV: () => void;
}

export function RecordingPanel({
  recordingState,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onExportCSV,
}: Props) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours.toString().padStart(2, '0')}:${(minutes % 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const elapsedTime = recordingState.startTime
    ? Date.now() - recordingState.startTime
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#002060]">
      <h2 className="text-xl font-bold text-[#002060] mb-6">
        Sistema de Grabación
      </h2>

      <div className="flex items-center gap-4 mb-6">
        {recordingState.isRecording && (
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-[#E74C3C] fill-current animate-pulse" />
            <span className="font-bold text-[#E74C3C]">
              {recordingState.isPaused ? 'PAUSADO' : 'GRABANDO'}
            </span>
          </div>
        )}

        {recordingState.isRecording && (
          <div className="flex-1 text-center">
            <div className="text-3xl font-mono font-bold text-[#002060]">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {recordingState.dataPoints.length} puntos grabados
            </div>
          </div>
        )}

        {!recordingState.isRecording && recordingState.dataPoints.length > 0 && (
          <div className="flex-1 text-center">
            <div className="text-lg text-gray-700">
              {recordingState.dataPoints.length} puntos en memoria
            </div>
            <div className="text-sm text-gray-500">
              Archivo: {recordingState.fileName}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={onStartRecording}
          disabled={recordingState.isRecording && !recordingState.isPaused}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#27AE60] hover:bg-[#229954] text-white font-bold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5" />
          START
        </button>

        <button
          onClick={onPauseRecording}
          disabled={!recordingState.isRecording || recordingState.isPaused}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#F39C12] hover:bg-[#E67E22] text-white font-bold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Pause className="w-5 h-5" />
          PAUSE
        </button>

        <button
          onClick={onStopRecording}
          disabled={!recordingState.isRecording}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#E74C3C] hover:bg-[#C0392B] text-white font-bold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Square className="w-5 h-5" />
          STOP
        </button>

        <button
          onClick={onExportCSV}
          disabled={recordingState.dataPoints.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#002060] hover:bg-[#001040] text-white font-bold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          CSV
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-bold text-[#002060] mb-2">
          Información de Grabación
        </h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            Frecuencia de muestreo: 100ms (10 Hz)
          </p>
          <p>
            Formato CSV: timestamp, elapsed_time, voltaje, corriente, potencia,
            T_ch0-7, T_evap_avg, T_cond_avg, R_thermal, relay_1-4
          </p>
          <p>
            La grabación puede ser iniciada/pausada/detenida dinámicamente sin
            perder datos
          </p>
        </div>
      </div>
    </div>
  );
}
