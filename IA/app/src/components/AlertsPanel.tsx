import { useState } from 'react';
import { AlertTriangle, X, Volume2, VolumeX, History, Bell } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AlertsPanel() {
  const { 
    activeAlerts, 
    alertHistory, 
    soundEnabled, 
    acknowledgeAlert, 
    clearAllAlerts, 
    toggleSound,
    fetchAlertHistory 
  } = useAlerts();
  
  const [showHistory, setShowHistory] = useState(false);

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case 'danger':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      case 'info':
        return 'border-blue-500';
      default:
        return 'border-gray-500';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="itm-panel">
      <CardHeader className="itm-card-header">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5" />
            Sistema de Alertas
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {activeAlerts.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Alertas Activas */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Alertas Activas</h4>
            {activeAlerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllAlerts}
                className="text-xs h-7"
              >
                Limpiar todas
              </Button>
            )}
          </div>

          {activeAlerts.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Bell className="w-5 h-5" />
                <span className="font-medium">Sistema OK</span>
              </div>
              <p className="text-xs text-green-500 mt-1">
                No hay alertas activas
              </p>
            </div>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-l-4 ${getAlertBorderColor(alert.type)} bg-gray-50 rounded-r-lg p-3 animate-in slide-in-from-right`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          alert.type === 'danger' ? 'text-red-500' : 
                          alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div>
                          <div className="text-sm font-medium">{alert.message}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {alert.parameter}: {alert.value.toFixed(2)} 
                            (límite: {alert.threshold})
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {formatTime(alert.timestamp)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Reconocer alerta"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Historial */}
        <div className="flex justify-between items-center">
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAlertHistory(50)}
                className="text-xs"
              >
                <History className="w-4 h-4 mr-1" />
                Ver Historial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Historial de Alertas</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {alertHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay alertas en el historial
                    </div>
                  ) : (
                    alertHistory.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`border-l-4 ${getAlertBorderColor(alert.type)} bg-gray-50 rounded-r-lg p-3`}
                      >
                        <div className="text-sm">{alert.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTime(alert.timestamp)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <div className="text-xs text-gray-500">
            Sonido: {soundEnabled ? 'ON' : 'OFF'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
