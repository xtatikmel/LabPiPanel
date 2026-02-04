import { ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
  relays: [boolean, boolean, boolean, boolean];
  onToggleRelay: (index: number) => void;
}

export function RelayControl({ relays, onToggleRelay }: Props) {
  const relayNames = ['RELAY 1', 'RELAY 2', 'RELAY 3', 'RELAY 4'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#002060]">
      <h2 className="text-xl font-bold text-[#002060] mb-6">Control Relés GPIO</h2>

      <div className="grid grid-cols-2 gap-4">
        {relays.map((isActive, index) => (
          <button
            key={index}
            onClick={() => onToggleRelay(index)}
            className={`p-4 rounded-lg border-2 transition-all ${
              isActive
                ? 'bg-[#E74C3C] border-[#E74C3C] text-white'
                : 'bg-white border-[#002060] text-[#002060] hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">{relayNames[index]}</span>
              {isActive ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isActive ? 'bg-white' : 'bg-gray-300'
                }`}
              />
              <span className="text-sm font-medium">
                {isActive ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
