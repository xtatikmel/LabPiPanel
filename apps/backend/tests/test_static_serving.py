"""Tests del servido del frontend compilado y del fallback SPA."""

import tempfile
from pathlib import Path

import pytest

import app as app_module


@pytest.fixture()
def dist_dir():
    """Directorio temporal independiente del tmp_path de pytest."""
    with tempfile.TemporaryDirectory() as tmp:
        yield Path(tmp)


def test_serves_index_and_assets(client, dist_dir, monkeypatch):
    (dist_dir / 'index.html').write_text('<html>LabPiPanel</html>', encoding='utf-8')
    assets = dist_dir / 'assets'
    assets.mkdir()
    (assets / 'app.js').write_text('console.log("ok")', encoding='utf-8')

    monkeypatch.setattr(app_module, 'FRONTEND_DIST', dist_dir)

    index = client.get('/')
    assert index.status_code == 200
    assert b'LabPiPanel' in index.data

    asset = client.get('/assets/app.js')
    assert asset.status_code == 200
    assert b'console.log' in asset.data


def test_unknown_route_falls_back_to_spa(client, dist_dir, monkeypatch):
    (dist_dir / 'index.html').write_text('<html>SPA</html>', encoding='utf-8')
    monkeypatch.setattr(app_module, 'FRONTEND_DIST', dist_dir)

    response = client.get('/experimentos/123')

    assert response.status_code == 200
    assert b'SPA' in response.data


def test_returns_503_when_frontend_not_built(client, dist_dir, monkeypatch):
    monkeypatch.setattr(app_module, 'FRONTEND_DIST', dist_dir / 'no-existe')

    response = client.get('/')

    assert response.status_code == 503
    assert response.is_json
