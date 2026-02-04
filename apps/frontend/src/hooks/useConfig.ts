import { useState, useCallback, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export interface FuenteConfig {
  host: string;
  port: number;
  max_voltage: number;
  max_current: number;
  max_power: number;
}

export interface DAQConfig {
  device_id: string;
  sample_rate: number;
  num_channels: number;
  channel_names: string[];
  thermocouple_type: string;
  units: string;
}

export interface AlertThreshold {
  enabled: boolean;
  min_value: number | null;
  max_value: number | null;
  description: string;
}

export interface AlertConfig {
  enabled: boolean;
  sound_enabled: boolean;
  voltage_alert: AlertThreshold;
  current_alert: AlertThreshold;
  power_alert: AlertThreshold;
  temp_evap_min: AlertThreshold;
  temp_cond_max: AlertThreshold;
  temp_comp_max: AlertThreshold;
}

export interface SystemConfig {
  fuente: FuenteConfig;
  daq: DAQConfig;
  alerts: AlertConfig;
}

const defaultConfig: SystemConfig = {
  fuente: {
    host: '192.168.1.100',
    port: 10001,
    max_voltage: 300,
    max_current: 5.2,
    max_power: 1500
  },
  daq: {
    device_id: 'USB5203',
    sample_rate: 10,
    num_channels: 8,
    channel_names: [
      'T_Evap_In', 'T_Evap_Mid', 'T_Evap_Out', 'T_Comp',
      'T_Cond_In', 'T_Cond_Mid', 'T_Cond_Out', 'T_Ambient'
    ],
    thermocouple_type: 'T',
    units: 'C'
  },
  alerts: {
    enabled: true,
    sound_enabled: true,
    voltage_alert: { enabled: true, min_value: 0, max_value: 300, description: 'Voltaje fuera de rango' },
    current_alert: { enabled: true, min_value: 0, max_value: 5.2, description: 'Corriente fuera de rango' },
    power_alert: { enabled: true, min_value: 0, max_value: 1500, description: 'Potencia excede límite' },
    temp_evap_min: { enabled: true, min_value: -30, max_value: 50, description: 'Temp. evaporador fuera de rango' },
    temp_cond_max: { enabled: true, min_value: 0, max_value: 80, description: 'Temp. condensador alta' },
    temp_comp_max: { enabled: true, min_value: 0, max_value: 90, description: 'Temp. compresor crítica' }
  }
};

export function useConfig() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateFuenteConfig = useCallback(async (fuenteConfig: Partial<FuenteConfig>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/config/fuente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fuenteConfig)
      });
      const data = await response.json();
      if (data.success) {
        setConfig(prev => ({ ...prev, fuente: { ...prev.fuente, ...fuenteConfig } }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      return data.success;
    } catch (err) {
      console.error('Error updating fuente config:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDAQConfig = useCallback(async (daqConfig: Partial<DAQConfig>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/config/daq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(daqConfig)
      });
      const data = await response.json();
      if (data.success) {
        setConfig(prev => ({ ...prev, daq: { ...prev.daq, ...daqConfig } }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      return data.success;
    } catch (err) {
      console.error('Error updating DAQ config:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAlertConfig = useCallback(async (alertConfig: Partial<AlertConfig>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/config/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertConfig)
      });
      const data = await response.json();
      if (data.success) {
        setConfig(prev => ({ ...prev, alerts: { ...prev.alerts, ...alertConfig } }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      return data.success;
    } catch (err) {
      console.error('Error updating alert config:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    config,
    loading,
    saved,
    fetchConfig,
    updateFuenteConfig,
    updateDAQConfig,
    updateAlertConfig
  };
}
