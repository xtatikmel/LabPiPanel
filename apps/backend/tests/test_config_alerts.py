"""Regresiones de configuración de alertas."""


def test_partial_update_preserves_other_thresholds(client):
    before = client.get('/api/config/alerts').get_json()
    original_power_max = before['power_alert']['max_value']
    original_current_max = before['current_alert']['max_value']

    response = client.post('/api/config/alerts', json={
        'voltage_alert': {'max_value': 123.0}
    })

    assert response.status_code == 200
    updated = response.get_json()['config']
    assert updated['voltage_alert']['max_value'] == 123.0
    assert updated['power_alert']['max_value'] == original_power_max
    assert updated['current_alert']['max_value'] == original_current_max


def test_alert_changes_are_visible_in_general_config(client):
    response = client.post('/api/config/alerts', json={
        'current_alert': {'max_value': 1.5}
    })
    assert response.status_code == 200

    general = client.get('/api/config').get_json()
    assert general['alerts']['current_alert']['max_value'] == 1.5


def test_invalid_alert_payload_returns_400(client):
    response = client.post('/api/config/alerts', json={
        'voltage_alert': {'max_value': 'no-es-un-numero'}
    })

    assert response.status_code == 400
    assert response.get_json()['success'] is False
