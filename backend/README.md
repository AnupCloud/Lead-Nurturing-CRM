# Lead Nurturing CRM - Backend Documentation

> Django 5.0 + Django Ninja REST API powered by Anthropic Claude 3.5 Sonnet

[![Django](https://img.shields.io/badge/Django-5.0-green?logo=django)](https://www.djangoproject.com/)
[![Django Ninja](https://img.shields.io/badge/Django_Ninja-REST_API-blue)](https://django-ninja.rest-framework.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude_3.5-orange)](https://www.anthropic.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [AI Agents](#ai-agents)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)

---

## 🎯 Overview

The backend is built with **Django 5.0** and **Django Ninja** (FastAPI-style REST APIs for Django). It provides a robust foundation for lead nurturing, campaign management, and AI-powered conversation handling.

### Key Technologies

- **Framework**: Django 5.0
- **API**: Django Ninja (OpenAPI/Swagger documentation)
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI/ML**:
  - Anthropic Claude 3.5 Sonnet for LLM
  - LangChain + LangGraph for multi-agent orchestration
  - ChromaDB for vector storage
  - HuggingFace embeddings for semantic search
- **Package Manager**: uv (ultra-fast Python package installer)

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Django Backend                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Campaign   │──────│  Follow-up   │──────│ Analytics │ │
│  │      API     │      │      API     │      │    API    │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                     │                      │       │
│         ▼                     ▼                      ▼       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               Django ORM (Models Layer)                 │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                     │                      │       │
│         ▼                     ▼                      ▼       │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │  Lead Data   │      │ Conversation │      │  Campaign │ │
│  │  (SQLite)    │      │    History   │      │  Metrics  │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    AI Agent Layer                       │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │ │
│  │  │   Message    │    │     RAG      │    │  Intent  │ │ │
│  │  │ Personalizer │    │    System    │    │ Detector │ │ │
│  │  └──────────────┘    └──────────────┘    └──────────┘ │ │
│  │         │                   │                   │       │ │
│  │         └───────────────────┴───────────────────┘       │ │
│  │                          │                               │ │
│  │                          ▼                               │ │
│  │              ┌────────────────────────┐                 │ │
│  │              │  Claude 3.5 Sonnet     │                 │ │
│  │              │  (Anthropic API)       │                 │ │
│  │              └────────────────────────┘                 │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │         ChromaDB Vector Store                      │ │ │
│  │  │  (Property brochures + embeddings)                 │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
backend/
├── api/                          # Main Django app
│   ├── models.py                # Database models
│   ├── campaign_api.py          # Campaign management endpoints
│   ├── followup_api.py          # Follow-up & conversation endpoints
│   ├── knowledge_api.py         # Knowledge base management
│   ├── settings_api.py          # AI agent settings
│   ├── schemas.py               # Pydantic schemas for validation
│   ├── utils.py                 # Utility functions
│   └── migrations/              # Database migrations
├── agent/                        # AI Agent modules
│   ├── graph.py                 # LangGraph multi-agent orchestration
│   ├── rag.py                   # RAG system (ChromaDB + LangChain)
│   ├── sql.py                   # SQL query agent
│   └── personalizer.py          # Message personalization logic
├── config/                       # Django configuration
│   ├── settings.py              # Django settings
│   ├── urls.py                  # URL routing
│   └── wsgi.py                  # WSGI application
├── data/                         # Data files
│   └── brochures/               # Property PDF brochures
├── chroma_db/                    # ChromaDB vector database
├── manage.py                     # Django management script
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.11+**
- **uv** (recommended) or pip
- **Anthropic API Key** ([Get one free](https://console.anthropic.com/))

### Step 1: Install uv (Recommended)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# macOS with Homebrew
brew install uv

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Step 2: Clone and Navigate

```bash
cd backend
```

### Step 3: Create Virtual Environment

```bash
# Using uv (10-100x faster!)
uv venv

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate    # Windows
```

### Step 4: Install Dependencies

```bash
# Using uv (recommended)
uv pip install -r requirements.txt

# Or using pip
pip install -r requirements.txt
```

### Step 5: Environment Configuration

Create `.env` file in `backend/` directory:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Optional (auto-generated if not provided)
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Step 6: Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser (optional, for Django admin)
python manage.py createsuperuser

# Populate sample data
cd ..
python populate_db.py
cd backend
```

### Step 7: Start Development Server

```bash
python manage.py runserver 8000
```

**Verify**:
- API: http://localhost:8000/api/docs
- Health check: http://localhost:8000/api/health

---

## 📊 Database Schema

### Core Models

#### Lead
```python
class Lead(models.Model):
    name = CharField(max_length=255)
    email = EmailField()
    phone = CharField(max_length=20)
    project_enquired = CharField(max_length=100)
    budget_min = IntegerField()
    budget_max = IntegerField()
    unit_type_preference = CharField(max_length=100)
    lead_status = CharField(max_length=50)
    last_conversation_date = DateField()
    last_conversation_summary = TextField()
    family_size = IntegerField()
    financing_option = CharField(max_length=100)
    created_at = DateTimeField(auto_now_add=True)
```

**Purpose**: Stores all lead information from CRM including demographics, preferences, and conversation history.

#### CampaignConfig
```python
class CampaignConfig(models.Model):
    name = CharField(max_length=255)
    target_project = CharField(max_length=100)
    channel = CharField(max_length=50)  # email/whatsapp
    offer_details = TextField(blank=True)
    filter_criteria = JSONField()
    status = CharField(max_length=20)  # draft/running/completed
    leads_count = IntegerField(default=0)
    executed_at = DateTimeField(null=True)
    created_at = DateTimeField(auto_now_add=True)
```

**Purpose**: Campaign configuration and execution tracking.

#### Conversation
```python
class Conversation(models.Model):
    lead = ForeignKey(Lead)
    campaign = ForeignKey(CampaignConfig)
    sentiment = CharField(max_length=20)  # positive/neutral/negative
    goal_achieved = BooleanField(default=False)
    conversation_state = JSONField(default=dict)
    appointment_date = DateTimeField(null=True)
    created_at = DateTimeField(auto_now_add=True)
```

**Purpose**: Tracks conversations between AI agent and leads.

#### SentMessage
```python
class SentMessage(models.Model):
    conversation = ForeignKey(Conversation)
    sender = CharField(max_length=10)  # 'agent' or 'lead'
    message_text = TextField()
    timestamp = DateTimeField(auto_now_add=True)
```

**Purpose**: Stores individual messages in conversation threads.

#### AIAgentSettings
```python
class AIAgentSettings(models.Model):
    followup_interval_days = IntegerField(default=3)
    max_followups = IntegerField(default=5)
    messaging_focus = CharField(max_length=100)
    response_style = CharField(max_length=100)
    urgency_level = CharField(max_length=100)
    custom_instructions = TextField(blank=True)
```

**Purpose**: Configurable AI agent behavior settings.

#### ScheduledVisit
```python
class ScheduledVisit(models.Model):
    conversation = ForeignKey(Conversation)
    visit_date = DateField()
    visit_time = TimeField(null=True)
    notes = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

**Purpose**: Tracks scheduled property visits/calls.

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8000/api
```

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Campaign Endpoints

#### Create Campaign
```http
POST /campaigns/create
Content-Type: application/json

{
  "name": "Q4 Sobha Crest Campaign",
  "target_project": "Sobha Crest",
  "channel": "whatsapp",
  "offer_details": "10% early bird discount",
  "filter_criteria": {
    "budget_min": "1000000",
    "budget_max": "2000000",
    "unit_types": "2 bed,3 bed",
    "statuses": "Connected,Not Connected"
  }
}

Response: 201 Created
{
  "id": 1,
  "name": "Q4 Sobha Crest Campaign",
  "status": "draft",
  "leads_count": 0
}
```

#### Shortlist Leads
```http
POST /campaigns/shortlist
Content-Type: application/json

{
  "target_project": "Sobha Crest",
  "budget_min": 1000000,
  "budget_max": 2000000,
  "unit_types": ["2 bed", "3 bed"],
  "statuses": ["Connected"]
}

Response: 200 OK
{
  "count": 15
}
```

#### Execute Campaign
```http
POST /campaigns/{campaign_id}/execute

Response: 200 OK
{
  "status": "success",
  "messages_sent": 15,
  "campaign_status": "running"
}
```

#### List Campaigns
```http
GET /campaigns/list

Response: 200 OK
{
  "campaigns": [
    {
      "id": 1,
      "name": "Q4 Sobha Crest Campaign",
      "status": "running",
      "leads_count": 15,
      "messages_sent": 15,
      "executed_at": "2024-11-24T10:30:00Z"
    }
  ]
}
```

### Conversation Endpoints

#### Get Campaign Conversations
```http
GET /campaigns/{campaign_id}/conversations

Response: 200 OK
{
  "conversations": [
    {
      "id": 1,
      "lead_id": 1,
      "lead_name": "Sarah Johnson",
      "sentiment": "positive",
      "goal_achieved": false,
      "messages": [
        {
          "sender": "agent",
          "message_text": "Hi Sarah, …",
          "timestamp": "2024-11-24T10:30:00Z"
        }
      ]
    }
  ]
}
```

#### Add Lead Reply
```http
POST /conversations/{lead_id}/reply
Content-Type: application/json

{
  "message": "I'm interested! What are the amenities?"
}

Response: 200 OK
{
  "agent_response": "Lumina Grand offers exceptional amenities…",
  "sentiment": "positive",
  "goal_achieved": false
}
```

#### Mark Goal Achieved
```http
POST /conversations/{lead_id}/mark-goal

Response: 200 OK
{
  "goal_achieved": true,
  "visit_scheduled": true
}
```

### Settings Endpoints

#### Get AI Settings
```http
GET /agent-settings

Response: 200 OK
{
  "followup_interval_days": 3,
  "max_followups": 5,
  "messaging_focus": "Property Features & Benefits",
  "response_style": "Professional & Formal",
  "urgency_level": "Medium - Moderate urgency",
  "custom_instructions": ""
}
```

#### Update AI Settings
```http
POST /agent-settings
Content-Type: application/json

{
  "followup_interval_days": 5,
  "messaging_focus": "Investment Opportunities",
  "response_style": "Friendly & Conversational"
}

Response: 200 OK
{
  "status": "success"
}
```

---

## 🤖 AI Agents

### 1. Message Personalizer

**File**: `agent/personalizer.py`

**Purpose**: Generates hyper-personalized outreach messages using Claude 3.5.

**Inputs**:
- Lead data (name, budget, preferences, history)
- Target project details
- Campaign offers
- Property information from RAG

**Output**: Personalized message text

**Example**:
```python
from agent.personalizer import MessagePersonalizer

personalizer = MessagePersonalizer()
message = personalizer.generate_message(
    lead=lead_obj,
    project="Lumina Grand",
    offer="10% early bird discount"
)
```

### 2. RAG System

**File**: `agent/rag.py`

**Purpose**: Retrieval Augmented Generation for property information.

**Components**:
- **Vector Store**: ChromaDB
- **Embeddings**: HuggingFace all-MiniLM-L6-v2
- **LLM**: Claude 3.5 Sonnet

**Flow**:
1. User asks question about property
2. Query embedded using HuggingFace
3. Semantic search in ChromaDB
4. Relevant chunks retrieved
5. Claude generates answer with context

**Example**:
```python
from agent.rag import RAGSystem

rag = RAGSystem()
answer = rag.query(
    question="What are the amenities in Lumina Grand?",
    project="Lumina Grand"
)
```

### 3. Intent Detection

**File**: `agent/graph.py`

**Purpose**: Detects user intent from messages (goal detection).

**Intents**:
- Property viewing/visit
- Sales call request
- General questions
- Objections

**Example**:
```python
from agent.graph import detect_intent

intent = detect_intent("I'd like to schedule a viewing this week")
# Returns: "schedule_visit"
```

### 4. Multi-Agent Orchestration

**File**: `agent/graph.py`

**Purpose**: LangGraph-based agent workflow.

**Workflow**:
```
User Message → Intent Detection → 
  ├─ [Goal Detected] → Schedule Visit → End
  └─ [Question] → RAG Query → Generate Response → End
```

---

## 🔐 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | `sk-ant-api03-xxxxx` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Auto-generated |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Allowed hosts | `localhost,127.0.0.1` |
| `DATABASE_URL` | PostgreSQL URL (production) | SQLite (dev) |

---

## 💻 Development

### Run Development Server

```bash
python manage.py runserver 8000
```

### Create Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Access Django Admin

```bash
# Create superuser
python manage.py createsuperuser

# Visit http://localhost:8000/admin
```

### Shell Access

```bash
# Django shell
python manage.py shell

# Example: Test RAG system
from agent.rag import RAGSystem
rag = RAGSystem()
result = rag.query("What amenities does Sobha Crest have?")
print(result)
```

### Populate Sample Data

```bash
cd ..
python populate_db.py
```

Creates:
- 104 sample leads
- Sample conversations
- Campaign data

---

## 🧪 Testing

### Run Tests

```bash
# All tests
python manage.py test

# Specific app
python manage.py test api

# With coverage
coverage run --source='.' manage.py test
coverage report
```

### Test AI Components

```bash
# Test RAG system
python -c "from agent.rag import RAGSystem; rag = RAGSystem(); print(rag.query('test'))"

# Test message personalizer
python -c "from agent.personalizer import MessagePersonalizer; print('OK')"
```

---

## 📝 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit pull request

---

**Built with ❤️ using Django + Anthropic Claude**
