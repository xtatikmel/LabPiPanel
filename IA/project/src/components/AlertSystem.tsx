import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { Alert } from '../types';

interface Props {
  alerts: Alert[];
  onDismiss: (alertId: string) => void;
}

export function AlertSystem({ alerts, onDismiss }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-20 px-4 pointer-events-none">
      <div className="max-w-2xl mx-auto space-y-3 pointer-events-auto">
        {alerts.map((alert) => {
          const bgColor =
            alert.level === 'error'
              ? 'bg-[#E74C3C]'
              : alert.level === 'warning'
                ? 'bg-[#F39C12]'
                : 'bg-[#3498DB]';

          const Icon =
            alert.level === 'error'
              ? AlertCircle
              : alert.level === 'warning'
                ? AlertCircle
                : Info;

          return (
            <div
              key={alert.id}
              className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideIn`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{alert.message}</span>
              {alert.clearable && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
