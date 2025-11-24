import pytest
from ninja.testing import TestClient
from api.api import api

@pytest.fixture
def client():
    return TestClient(api)

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_chat_endpoint(client):
    # Mocking the agent response would be better, but for now just testing the endpoint structure
    response = client.post("/chat", json={"query": "Hello", "history": []})
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "intent" in data
