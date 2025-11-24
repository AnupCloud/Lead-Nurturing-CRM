import pytest
from agent.graph import build_graph

def test_router_logic():
    workflow = build_graph()
    
    # Test SQL intent
    state_sql = {"query": "List all leads", "history": [], "intent": "", "response": ""}
    result_sql = workflow.invoke(state_sql)
    assert result_sql["intent"] == "sql"
    
    # Test RAG intent
    state_rag = {"query": "What are the amenities?", "history": [], "intent": "", "response": ""}
    result_rag = workflow.invoke(state_rag)
    assert result_rag["intent"] == "rag"
