import { useEffect, useState } from 'react';
import { Settings, Save, Server, Activity, Bell } from 'lucide-react';
import { useConfig } from '@/hooks/useConfig';
import type { AlertConfig, AlertThreshold } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

type AlertKey =
  | 'voltage_alert'
  | 'current_alert'
  | 'power_alert'
  | 'temp_evap_min'
  | 'temp_cond_max'
  | 'temp_comp_max';

type AlertField = 'enabled' | 'min_value' | 'max_value';
type AlertValue = boolean | number | null;

const defaultChannelGroups = {
  evaporador: [0, 1, 2],
  condensador: [4, 5, 6],
  compresor: [3],
  ambiente: [7]
};

export function ConfigPanel() {
  const { config, loading, saved, updateFuenteConfig, updateAlertConfig, updateDAQConfig, updateRelayConfig } = useConfig();

  // Estados locales para edición
  const [fuenteHost, setFuenteHost] = useState(config.fuente.host);
  const [fuentePort, setFuentePort] = useState(config.fuente.port.toString());
  const [channelNames, setChannelNames] = useState<string[]>(config.daq.channel_names ?? [
    'T_Evap_In', 'T_Evap_Mid', 'T_Evap_Out', 'T_Comp',
    'T_Cond_In', 'T_Cond_Mid', 'T_Cond_Out', 'T_Ambient'
  ]);
  const [channelGroups, setChannelGroups] = useState(config.daq.channel_groups ?? defaultChannelGroups);
  const [relayLabels, setRelayLabels] = useState<string[]>(config.relay_labels ?? [
    'Compresor',
    'Ventilador Cond',
    'Ventilador Evap',
    'Bomba'
  ]);

  useEffect(() => {
    setFuenteHost(config.fuente.host);
    setFuentePort(config.fuente.port.toString());
    setChannelNames(config.daq.channel_names ?? [
      'T_Evap_In', 'T_Evap_Mid', 'T_Evap_Out', 'T_Comp',
      'T_Cond_In', 'T_Cond_Mid', 'T_Cond_Out', 'T_Ambient'
    ]);
    setChannelGroups(config.daq.channel_groups ?? defaultChannelGroups);
    setRelayLabels(config.relay_labels ?? [
      'Compresor',
      'Ventilador Cond',
      'Ventilador Evap',
      'Bomba'
    ]);
  }, [config]);
  
  const handleSaveFuente = async () => {
    await updateFuenteConfig({
      host: fuenteHost,
      port: parseInt(fuentePort)
    });
  };

  const handleUpdateAlertThreshold = async (key: AlertKey, field: AlertField, value: AlertValue) => {
    const alertConfig = { ...config.alerts };
    alertConfig[key] = {
      ...alertConfig[key],
      [field]: value
    } as AlertThreshold;
    await updateAlertConfig({ [key]: alertConfig[key] } as Partial<AlertConfig>);
  };

  const handleSaveDAQ = async () => {
    await updateDAQConfig({
      channel_names: channelNames,
      channel_groups: channelGroups
    });
  };

  const handleSaveRelays = async () => {
    await updateRelayConfig({
      relay_labels: relayLabels
    });
  };

  const toggleChannelInGroup = (group: keyof typeof channelGroups, index: number) => {
    setChannelGroups(prev => {
      const current = prev[group] || [];
      const exists = current.includes(index);
      return {
        ...prev,
        [group]: exists ? current.filter(i => i !== index) : [...current, index].sort()
      };
    });
  };

  return (
    <Card className="itm-panel">
      <CardHeader className="itm-card-header">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5" />
          Configuración del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="fuente" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="fuente" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Fuente XLN
            </TabsTrigger>
            <TabsTrigger value="daq" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              DAQ
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="relays" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Relés
            </TabsTrigger>
          </TabsList>

          {/* Configuración Fuente XLN */}
          <TabsContent value="fuente" className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-[#002060] mb-3">Conexión Telnet</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Dirección IP</label>
                  <Input
                    value={fuenteHost}
                    onChange={(e) => setFuenteHost(e.target.value)}
                    placeholder="192.168.1.100"
                    className="itm-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Puerto</label>
                  <Input
                    value={fuentePort}
                    onChange={(e) => setFuentePort(e.target.value)}
                    placeholder="10001"
                    className="itm-input"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Límites de Operación</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Voltaje Máx</div>
                  <div className="text-lg font-bold text-[#002060]">{config.fuente.max_voltage}V</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Corriente Máx</div>
                  <div className="text-lg font-bold text-[#E74C3C]">{config.fuente.max_current}A</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Potencia Máx</div>
                  <div className="text-lg font-bold text-[#27AE60]">{config.fuente.max_power}W</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveFuente} 
                disabled={loading}
                className="itm-btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {saved ? 'Guardado!' : 'Guardar Configuración'}
              </Button>
            </div>
          </TabsContent>

          {/* Configuración DAQ */}
          <TabsContent value="daq" className="space-y-4">
            <div className="bg-cyan-50 p-3 rounded-lg">
              <h4 className="font-medium text-cyan-800 mb-3">Dispositivo USB5203</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">ID Dispositivo</label>
                  <Input
                    value={config.daq.device_id}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Frecuencia (Hz)</label>
                  <Input
                    value={config.daq.sample_rate}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Etiquetas de Canales</h4>
              <div className="grid grid-cols-4 gap-2">
                {channelNames.map((name, i) => (
                  <div key={i} className="text-center p-2 bg-white rounded border">
                    <div className="text-[10px] text-gray-400">CH{i}</div>
                    <Input
                      value={name}
                      onChange={(e) => {
                        const next = [...channelNames];
                        next[i] = e.target.value;
                        setChannelNames(next);
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Asignación de Canales por Zona</h4>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'evaporador', label: 'Evaporador' },
                  { key: 'condensador', label: 'Condensador' },
                  { key: 'compresor', label: 'Compresor' },
                  { key: 'ambiente', label: 'Ambiente' }
                ] as const).map((group) => (
                  <div key={group.key} className="bg-white rounded border p-2">
                    <div className="text-xs font-medium text-gray-700 mb-2">{group.label}</div>
                    <div className="grid grid-cols-4 gap-1">
                      {channelNames.map((_, index) => (
                        <label key={index} className="flex items-center gap-1 text-[10px] text-gray-600">
                          <input
                            type="checkbox"
                            checked={(channelGroups[group.key] || []).includes(index)}
                            onChange={() => toggleChannelInGroup(group.key, index)}
                          />
                          CH{index}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Tipo Termopar</div>
                <div className="text-lg font-bold text-yellow-700">{config.daq.thermocouple_type}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Unidades</div>
                <div className="text-lg font-bold text-green-700">°{config.daq.units}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveDAQ}
                disabled={loading}
                className="itm-btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {saved ? 'Guardado!' : 'Guardar Configuración'}
              </Button>
            </div>
          </TabsContent>

          {/* Configuración Alertas */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-medium">Sistema de Alertas</div>
                <div className="text-xs text-gray-500">Habilitar notificaciones</div>
              </div>
              <Switch
                checked={config.alerts.enabled}
                onCheckedChange={(v) => updateAlertConfig({ enabled: v })}
              />
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-medium">Sonido de Alerta</div>
                <div className="text-xs text-gray-500">Beep al detectar anomalía</div>
              </div>
              <Switch
                checked={config.alerts.sound_enabled}
                onCheckedChange={(v) => updateAlertConfig({ sound_enabled: v })}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Umbrales de Alerta</h4>
              
              {/* Voltaje */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Voltaje</span>
                  <Switch
                    checked={config.alerts.voltage_alert.enabled}
                    onCheckedChange={(v) => handleUpdateAlertThreshold('voltage_alert', 'enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Máximo (V)</label>
                    <Input
                      type="number"
                      value={config.alerts.voltage_alert.max_value || ''}
                      onChange={(e) => handleUpdateAlertThreshold('voltage_alert', 'max_value', parseFloat(e.target.value))}
                      disabled={!config.alerts.voltage_alert.enabled}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Corriente */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Corriente</span>
                  <Switch
                    checked={config.alerts.current_alert.enabled}
                    onCheckedChange={(v) => handleUpdateAlertThreshold('current_alert', 'enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Máximo (A)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={config.alerts.current_alert.max_value || ''}
                      onChange={(e) => handleUpdateAlertThreshold('current_alert', 'max_value', parseFloat(e.target.value))}
                      disabled={!config.alerts.current_alert.enabled}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Potencia */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Potencia</span>
                  <Switch
                    checked={config.alerts.power_alert.enabled}
                    onCheckedChange={(v) => handleUpdateAlertThreshold('power_alert', 'enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Máximo (W)</label>
                    <Input
                      type="number"
                      value={config.alerts.power_alert.max_value || ''}
                      onChange={(e) => handleUpdateAlertThreshold('power_alert', 'max_value', parseFloat(e.target.value))}
                      disabled={!config.alerts.power_alert.enabled}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Temperatura Compresor */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Temp. Compresor</span>
                  <Switch
                    checked={config.alerts.temp_comp_max.enabled}
                    onCheckedChange={(v) => handleUpdateAlertThreshold('temp_comp_max', 'enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Máxima (°C)</label>
                    <Input
                      type="number"
                      value={config.alerts.temp_comp_max.max_value || ''}
                      onChange={(e) => handleUpdateAlertThreshold('temp_comp_max', 'max_value', parseFloat(e.target.value))}
                      disabled={!config.alerts.temp_comp_max.enabled}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Configuración Relés */}
          <TabsContent value="relays" className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Etiquetas de Relés</h4>
              <div className="grid grid-cols-2 gap-2">
                {relayLabels.map((label, index) => (
                  <div key={index} className="bg-white rounded border p-2">
                    <div className="text-[10px] text-gray-400">RELÉ {index + 1}</div>
                    <Input
                      value={label}
                      onChange={(e) => {
                        const next = [...relayLabels];
                        next[index] = e.target.value;
                        setRelayLabels(next);
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveRelays}
                disabled={loading}
                className="itm-btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {saved ? 'Guardado!' : 'Guardar Etiquetas'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
