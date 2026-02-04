import { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { PowerSourceControl } from './components/PowerSourceControl';
import { RelayControl } from './components/RelayControl';
import { RealtimeCharts } from './components/RealtimeCharts';
import { RecordingPanel } from './components/RecordingPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { AlertSystem } from './components/AlertSystem';
import { FuenteStatus, LiveData, RecordingState, FuenteConfig, DAQConfig, SafetyLimits, Alert } from './types';
import { DataSimulator } from './utils/dataSimulator';
import { exportToCSV } from './utils/csvExporter';

function App() {
  const [fuenteStatus, setFuenteStatus] = useState<FuenteStatus>({
    connected: true,
    output_enabled: false,
    voltage_set: 0,
    current_set: 0,
    voltage_actual: 0,
    current_actual: 0,
    power: 0,
  });

  const [relays, setRelays] = useState<[boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
  ]);

  const [dataHistory, setDataHistory] = useState<LiveData[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    startTime: null,
    dataPoints: [],
    fileName: '',
  });

  const [fuenteConfig, setFuenteConfig] = useState<FuenteConfig>({
    ip: '192.168.1.100',
    port: 10001,
    maxVoltage: 300,
    maxCurrent: 5.2,
    maxPower: 1500,
  });

  const [daqConfig, setDAQConfig] = useState<DAQConfig>({
    sampleRate: 100,
    channels: 8,
    tempMin: -50,
    tempMax: 150,
  });

  const [safetyLimits, setSafetyLimits] = useState<SafetyLimits>({
    maxVoltage: 280,
    maxCurrent: 5.0,
    maxPower: 1400,
    maxTemp: 140,
    minTemp: -40,
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const alertTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const simulatorRef = useRef(new DataSimulator());
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const actualVoltage = fuenteStatus.output_enabled
        ? fuenteStatus.voltage_set
        : 0;
      const actualCurrent = fuenteStatus.output_enabled
        ? fuenteStatus.current_set
        : 0;
      const power = actualVoltage * actualCurrent;

      setFuenteStatus((prev) => ({
        ...prev,
        voltage_actual: actualVoltage,
        current_actual: actualCurrent,
        power,
      }));

      const newData = simulatorRef.current.generateLiveData(
        actualVoltage,
        actualCurrent,
        relays
      );

      checkSafetyLimits(newData);

      setDataHistory((prev) => [...prev.slice(-299), newData]);

      if (
        recordingState.isRecording &&
        !recordingState.isPaused &&
        recordingState.startTime
      ) {
        setRecordingState((prev) => ({
          ...prev,
          dataPoints: [...prev.dataPoints, newData],
        }));
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fuenteStatus.output_enabled, fuenteStatus.voltage_set, fuenteStatus.current_set, relays, recordingState.isRecording, recordingState.isPaused, recordingState.startTime]);

  const handleVoltageChange = (value: number) => {
    setFuenteStatus((prev) => ({ ...prev, voltage_set: value }));
  };

  const handleCurrentChange = (value: number) => {
    setFuenteStatus((prev) => ({ ...prev, current_set: value }));
  };

  const handleToggleOutput = () => {
    setFuenteStatus((prev) => ({
      ...prev,
      output_enabled: !prev.output_enabled,
    }));
  };

  const handleToggleRelay = (index: number) => {
    setRelays((prev) => {
      const newRelays = [...prev] as [boolean, boolean, boolean, boolean];
      newRelays[index] = !newRelays[index];
      return newRelays;
    });
  };

  const handleStartRecording = () => {
    if (!recordingState.isRecording) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `ITM_Lab_Termico_${timestamp}.csv`;

      simulatorRef.current.reset();

      setRecordingState({
        isRecording: true,
        isPaused: false,
        startTime: Date.now(),
        dataPoints: [],
        fileName,
      });
    } else if (recordingState.isPaused) {
      setRecordingState((prev) => ({
        ...prev,
        isPaused: false,
      }));
    }
  };

  const handleStopRecording = () => {
    setRecordingState((prev) => ({
      ...prev,
      isRecording: false,
      isPaused: false,
    }));
  };

  const handlePauseRecording = () => {
    setRecordingState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  };

  const handleExportCSV = () => {
    if (recordingState.dataPoints.length > 0) {
      exportToCSV(recordingState.dataPoints, recordingState.fileName);
    }
  };

  const addAlert = (level: 'error' | 'warning' | 'info', message: string, duration?: number) => {
    const alertId = `${Date.now()}-${Math.random()}`;
    const newAlert: Alert = {
      id: alertId,
      level,
      message,
      timestamp: Date.now(),
      clearable: true,
    };

    setAlerts((prev) => [...prev, newAlert]);

    if (duration) {
      const timeout = setTimeout(() => {
        dismissAlert(alertId);
      }, duration);
      alertTimeoutsRef.current.set(alertId, timeout);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    const timeout = alertTimeoutsRef.current.get(alertId);
    if (timeout) {
      clearTimeout(timeout);
      alertTimeoutsRef.current.delete(alertId);
    }
  };

  const checkSafetyLimits = (data: LiveData) => {
    const voltageAlert = `alert_voltage_${data.timestamp}`;
    const currentAlert = `alert_current_${data.timestamp}`;
    const powerAlert = `alert_power_${data.timestamp}`;
    const tempAlert = `alert_temp_${data.timestamp}`;

    if (data.voltaje > safetyLimits.maxVoltage && !alerts.some((a) => a.message.includes('Voltaje'))) {
      addAlert('warning', `Voltaje excede límite de seguridad: ${data.voltaje.toFixed(2)}V > ${safetyLimits.maxVoltage}V`, 5000);
    }

    if (data.corriente > safetyLimits.maxCurrent && !alerts.some((a) => a.message.includes('Corriente'))) {
      addAlert('warning', `Corriente excede límite de seguridad: ${data.corriente.toFixed(3)}A > ${safetyLimits.maxCurrent}A`, 5000);
    }

    if (data.potencia > safetyLimits.maxPower && !alerts.some((a) => a.message.includes('Potencia'))) {
      addAlert('error', `Potencia excede límite de seguridad: ${data.potencia.toFixed(2)}W > ${safetyLimits.maxPower}W`, 5000);
    }

    const maxTemp = Math.max(data.T_evap_avg, data.T_cond_avg, data.T_ch0, data.T_ch1, data.T_ch2, data.T_ch3, data.T_ch4, data.T_ch5, data.T_ch6, data.T_ch7);
    const minTemp = Math.min(data.T_evap_avg, data.T_cond_avg, data.T_ch0, data.T_ch1, data.T_ch2, data.T_ch3, data.T_ch4, data.T_ch5, data.T_ch6, data.T_ch7);

    if (maxTemp > safetyLimits.maxTemp && !alerts.some((a) => a.message.includes('Temperatura máxima'))) {
      addAlert('warning', `Temperatura máxima excede límite: ${maxTemp.toFixed(2)}°C > ${safetyLimits.maxTemp}°C`, 5000);
    }

    if (minTemp < safetyLimits.minTemp && !alerts.some((a) => a.message.includes('Temperatura mínima'))) {
      addAlert('info', `Temperatura mínima por debajo del límite: ${minTemp.toFixed(2)}°C < ${safetyLimits.minTemp}°C`, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <AlertSystem alerts={alerts} onDismiss={dismissAlert} />
      <Header />

      <div className="max-w-[1800px] mx-auto p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PowerSourceControl
              status={fuenteStatus}
              onVoltageChange={handleVoltageChange}
              onCurrentChange={handleCurrentChange}
              onToggleOutput={handleToggleOutput}
            />
          </div>

          <RelayControl relays={relays} onToggleRelay={handleToggleRelay} />
        </div>

        <RealtimeCharts dataHistory={dataHistory} maxPoints={300} />

        <RecordingPanel
          recordingState={recordingState}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onPauseRecording={handlePauseRecording}
          onExportCSV={handleExportCSV}
        />

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#002060]">
          <h2 className="text-xl font-bold text-[#002060] mb-4">
            Datos en Tiempo Real
          </h2>
          {dataHistory.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
              <div>
                <span className="text-gray-600">T Evap Avg:</span>
                <span className="ml-2 font-bold text-[#E74C3C]">
                  {dataHistory[dataHistory.length - 1].T_evap_avg.toFixed(2)}°C
                </span>
              </div>
              <div>
                <span className="text-gray-600">T Cond Avg:</span>
                <span className="ml-2 font-bold text-[#3498DB]">
                  {dataHistory[dataHistory.length - 1].T_cond_avg.toFixed(2)}°C
                </span>
              </div>
              <div>
                <span className="text-gray-600">R Thermal:</span>
                <span className="ml-2 font-bold text-[#8E44AD]">
                  {dataHistory[dataHistory.length - 1].R_thermal.toFixed(4)} K/W
                </span>
              </div>
              <div>
                <span className="text-gray-600">Voltaje:</span>
                <span className="ml-2 font-bold text-[#002060]">
                  {dataHistory[dataHistory.length - 1].voltaje.toFixed(2)}V
                </span>
              </div>
              <div>
                <span className="text-gray-600">Corriente:</span>
                <span className="ml-2 font-bold text-[#002060]">
                  {dataHistory[dataHistory.length - 1].corriente.toFixed(3)}A
                </span>
              </div>
              <div>
                <span className="text-gray-600">Potencia:</span>
                <span className="ml-2 font-bold text-[#F39C12]">
                  {dataHistory[dataHistory.length - 1].potencia.toFixed(2)}W
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <SettingsPanel
        fuenteConfig={fuenteConfig}
        daqConfig={daqConfig}
        safetyLimits={safetyLimits}
        onFuenteConfigChange={setFuenteConfig}
        onDAQConfigChange={setDAQConfig}
        onSafetyLimitsChange={setSafetyLimits}
      />
    </div>
  );
}

export default App;
