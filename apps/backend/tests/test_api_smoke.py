"""Smoke tests de los endpoints principales."""


def test_status(client):
    response = client.get('/api/status')

    assert response.status_code == 200
    body = response.get_json()
    assert 'fuente_connected' in body
    assert 'daq_connected' in body
    assert 'recording' in body


def test_live_data_json(client):
    response = client.get('/api/live-data/json')

    assert response.status_code == 200
    body = response.get_json()
    assert len(body['temperatures']) == 8
    assert len(body['relays']) == 4


def test_config(client):
    response = client.get('/api/config')

    assert response.status_code == 200
    body = response.get_json()
    assert 'fuente' in body
    assert 'daq' in body
    assert 'alerts' in body
    assert 'relay_labels' in body


def test_relay_status(client):
    response = client.get('/api/relay/status')

    assert response.status_code == 200
    assert len(response.get_json()['relays']) == 4


def test_daq_status(client):
    response = client.get('/api/daq/status')

    assert response.status_code == 200
    body = response.get_json()
    assert body['channels'] == 8


def test_unknown_api_route_returns_404_json(client):
    response = client.get('/api/does-not-exist')

    assert response.status_code == 404
    assert response.is_json
