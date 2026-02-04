import { useState, useEffect } from 'react';
import { Play, Square, Pause, Download, FolderOpen, Clock, FileText } from 'lucide-react';
import { useRecording } from '@/hooks/useRecording';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function RecordingControl() {
  const { status, files, loading, start, stop, pause, download, fetchStatus, fetchFiles } = useRecording();
  const [filename, setFilename] = useState('');
  const [showFiles, setShowFiles] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchFiles();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchFiles]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleStart = async () => {
    const name = filename.trim() || undefined;
    await start(name);
    setFilename('');
  };

  return (
    <Card className="itm-panel">
      <CardHeader className="itm-card-header">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          Control de Grabación
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Estado de grabación */}
        <div className={`p-4 rounded-lg border-2 ${
          status?.recording
            ? status?.paused
              ? 'bg-yellow-50 border-yellow-400'
              : 'bg-red-50 border-red-400 animate-pulse'
            : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                status?.recording
                  ? status?.paused
                    ? 'bg-yellow-500'
                    : 'bg-red-500 animate-ping'
                  : 'bg-gray-400'
              }`} />
              <div>
                <div className="font-semibold">
                  {status?.recording
                    ? status?.paused
                      ? 'GRABACIÓN PAUSADA'
                      : 'GRABANDO...'
                    : 'SIN GRABAR'}
                </div>
                {status?.recording && (
                  <div className="text-sm text-gray-600">
                    {status?.filename}
                  </div>
                )}
              </div>
            </div>
            {status?.recording && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-mono">
                  <Clock className="w-4 h-4" />
                  {formatTime(status?.elapsed_time || 0)}
                </div>
                <div className="text-xs text-gray-500">
                  {status?.samples_recorded || 0} muestras
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-3 gap-3">
          {!status?.recording ? (
            <>
              <div className="col-span-2">
                <Input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Nombre archivo (opcional)"
                  className="itm-input w-full"
                />
              </div>
              <Button
                onClick={handleStart}
                disabled={loading}
                className="itm-btn-success h-10"
              >
                <Play className="w-4 h-4 mr-1" />
                START
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={pause}
                disabled={loading}
                className={`h-10 ${status?.paused ? 'itm-btn-primary' : 'itm-btn-secondary'}`}
              >
                <Pause className="w-4 h-4 mr-1" />
                {status?.paused ? 'RESUME' : 'PAUSE'}
              </Button>
              <Button
                onClick={stop}
                disabled={loading}
                className="itm-btn-danger h-10"
              >
                <Square className="w-4 h-4 mr-1" />
                STOP
              </Button>
              <Dialog open={showFiles} onOpenChange={setShowFiles}>
                <DialogTrigger asChild>
                  <Button
                    onClick={fetchFiles}
                    variant="outline"
                    className="h-10"
                  >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    ARCHIVOS
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Archivos de Grabación</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-80 overflow-auto">
                    {files.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No hay archivos de grabación
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {files.map((file) => (
                          <div
                            key={file.filename}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                          >
                            <div>
                              <div className="font-medium text-sm">{file.filename}</div>
                              <div className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • {new Date(file.modified).toLocaleString()}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => download(file.filename)}
                              className="itm-btn-primary"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Información */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Los archivos se guardan en formato CSV</p>
          <p>• Incluye: timestamp, temperaturas, V, I, P, R térmica</p>
          <p>• Frecuencia de muestreo: 10 Hz (100ms)</p>
        </div>
      </CardContent>
    </Card>
  );
}
