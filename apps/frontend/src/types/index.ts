// Tipos para el Laboratorio Térmico ITM

export interface LiveData {
  timestamp: string;
  elapsed_time: number;
  voltage: number;
  current: number;
  power: number;
  temperatures: number[];
  t_evap_avg: number;
  t_cond_avg: number;
  r_thermal: number;
  relays: boolean[];
  recording: boolean;
  fuente_connected: boolean;
  daq_connected: boolean;
}

export interface FuenteStatus {
  connected: boolean;
  voltage: number;
  current: number;
  power: number;
  output_on: boolean;
}

export interface RelayStatus {
  relays: boolean[];
}

export interface RelayInfo {
  id: number;
  name: string;
  state: boolean;
  pin?: number;
}

export interface RecordingStatus {
  recording: boolean;
  paused: boolean;
  filename: string | null;
  elapsed_time: number;
  samples_recorded: number;
}

export interface SystemStatus {
  fuente_connected: boolean;
  daq_connected: boolean;
  recording: boolean;
  elapsed_time: number;
  system_time: string;
}

export interface RecordingFile {
  filename: string;
  size: number;
  created: string;
  modified: string;
}

export interface DAQStatus {
  connected: boolean;
  channels: number;
  sample_rate: number;
}

// Configuración de canales del DAQ
export const CHANNEL_NAMES = [
  "T_Evap_In",
  "T_Evap_Mid", 
  "T_Evap_Out",
  "T_Comp",
  "T_Cond_In",
  "T_Cond_Mid",
  "T_Cond_Out",
  "T_Ambient"
];

export const RELAY_NAMES = [
  "Compresor",
  "Ventilador Cond",
  "Ventilador Evap",
  "Bomba"
];

// Colores para gráficas
export const CHART_COLORS = {
  voltage: '#002060',
  current: '#E74C3C',
  power: '#27AE60',
  temperature: ['#002060', '#0055AA', '#0088CC', '#00BBDD', '#E74C3C', '#FF6633', '#FF9933', '#FFCC00'],
  r_thermal: '#9B59B6',
  grid: '#E0E0E0',
  text: '#333333'
};
