export interface LiveData {
  timestamp: string;
  elapsed_time: number;
  voltaje: number;
  corriente: number;
  potencia: number;
  T_ch0: number;
  T_ch1: number;
  T_ch2: number;
  T_ch3: number;
  T_ch4: number;
  T_ch5: number;
  T_ch6: number;
  T_ch7: number;
  T_evap_avg: number;
  T_cond_avg: number;
  R_thermal: number;
  relay_1: boolean;
  relay_2: boolean;
  relay_3: boolean;
  relay_4: boolean;
}

export interface FuenteStatus {
  connected: boolean;
  output_enabled: boolean;
  voltage_set: number;
  current_set: number;
  voltage_actual: number;
  current_actual: number;
  power: number;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  startTime: number | null;
  dataPoints: LiveData[];
  fileName: string;
}

export interface FuenteConfig {
  ip: string;
  port: number;
  maxVoltage: number;
  maxCurrent: number;
  maxPower: number;
}

export interface DAQConfig {
  sampleRate: number;
  channels: number;
  tempMin: number;
  tempMax: number;
}

export interface SafetyLimits {
  maxVoltage: number;
  maxCurrent: number;
  maxPower: number;
  maxTemp: number;
  minTemp: number;
}

export interface Alert {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  clearable: boolean;
}
