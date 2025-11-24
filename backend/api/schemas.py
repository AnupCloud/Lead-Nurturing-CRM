from ninja import Schema
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

class ChatRequest(Schema):
    query: str
    history: Optional[List[dict]] = []

class ChatResponse(Schema):
    response: str
    intent: str

class UploadResponse(Schema):
    files: List[dict]
    total_chunks: int
    message: str

class BulkDeleteRequest(Schema):
    filenames: List[str]


class LeadSchema(Schema):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    project_interest: str
    status: str
    budget: float
    unit_type: Optional[str] = None
    last_contact_date: Optional[date] = None
    last_conversation_summary: Optional[str] = None

class MetricsSchema(Schema):
    leads_shortlisted: int
    messages_sent: int
    responses: int
    goals_achieved: int
