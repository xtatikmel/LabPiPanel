"""Regresiones del gestor de grabación."""

import time

import app as app_module


def test_stop_reports_real_duration(client):
    filename = 'pytest_recording.csv'
    filepath = app_module.recorder.recordings_dir / filename

    try:
        start = client.post('/api/recording/start', json={'filename': filename})
        assert start.status_code == 200
        assert start.get_json()['recording'] is True

        time.sleep(0.2)

        stop = client.post('/api/recording/stop')
        assert stop.status_code == 200

        body = stop.get_json()
        assert body['recording'] is False
        assert body['elapsed_time'] >= 0.15

        status = client.get('/api/recording/status').get_json()
        assert status['elapsed_time'] >= 0.15
    finally:
        if app_module.recorder.is_recording:
            app_module.recorder.stop()
        filepath.unlink(missing_ok=True)
