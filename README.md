# Lead Nurturing CRM - AI-Powered Real Estate Sales Platform

> **PropLens AI**: Intelligent lead nurturing and campaign management system for real estate sales teams powered by Anthropic Claude 3.5 Sonnet

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green?logo=django)](https://www.djangoproject.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![uv](https://img.shields.io/badge/uv-package_manager-purple)](https://github.com/astral-sh/uv)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude_3.5-orange)](https://www.anthropic.com/)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) (recommended) or pip
- [Anthropic API Key](https://console.anthropic.com/) (free credits available)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AnupCloud/Lead-Nurturing-CRM.git
cd Lead-Nurturing-CRM

# 2. Install uv (ultra-fast Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh
# Or: brew install uv

# 3. Setup Backend
cd backend
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt

# 4. Create .env file
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your_anthropic_api_key_here
EOF

# 5. Setup Database & Sample Data
python manage.py migrate
cd ..
python populate_db.py

# 6. Start Backend (in backend directory)
cd backend
python manage.py runserver 8000

# 7. Setup Frontend (new terminal)
cd frontend
npm install
npm run dev

# 8. Open Browser
# http://localhost:3000
```

**Get Your Anthropic API Key:**
1. Visit https://console.anthropic.com/
2. Sign up for free credits ($5)
3. Create API key in Settings
4. Add to `backend/.env`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Detailed Setup Guide](#detailed-setup-guide)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

**Lead Nurturing CRM** is an AI-powered platform designed to help real estate sales teams revive past customer leads from their CRM database and convert them into property visits. The system leverages Anthropic Claude to create hyper-personalized messaging based on past lead data, automate follow-ups, and track campaign performance.

### The Challenge

Property sales associates need an efficient way to send personalized follow-ups to leads stored in the CRM. This solution enables them to trigger automated, context-aware messages leveraging past enquiry data for hyper-personalization.

### The Solution

An AI agent-powered system that:
- ✅ Shortlists leads based on multiple criteria (budget, unit type, project, status)
- ✅ Generates hyper-personalized outreach messages using Claude 3.5 Sonnet
- ✅ Responds intelligently to customer queries using RAG (Retrieval Augmented Generation)
- ✅ Automatically detects intent and schedules property visits
- ✅ Tracks campaign performance with comprehensive analytics
- ✅ Multi-agent AI system for optimal conversation management

---

## ✨ Key Features

### 1. **Intelligent Lead Shortlisting**
- Filter leads by project, budget range, unit type, lead status
- View matching lead count in real-time
- Flexible criteria with multiple filter combinations

### 2. **AI-Powered Campaign Creation**
- Select target project for campaign
- Choose messaging channel (Email/WhatsApp)
- Add special offers and promotions
- Claude generates personalized messages for each lead

### 3. **Campaign Execution**
- One-click campaign execution
- Hyper-personalized messages based on:
  - Lead's past enquiry history
  - Demographics and family size
  - Budget and unit preferences
  - Last conversation summary
- Automated message dispatch at scale

### 4. **AI Agent Follow-ups**
- View all ongoing conversations in one place
- Claude responds to customer queries using property knowledge base
- Automatic goal detection (visit/call scheduling)
- Manual message override capability
- Real-time conversation tracking

### 5. **Campaign Analytics**
- Campaign-wise performance metrics
- Track leads shortlisted, messages sent, responses received
- Monitor goal achievement (visits/calls scheduled)
- Visual dashboards

### 6. **Knowledge Base Management**
- Upload property brochures (PDF, DOCX, TXT)
- AI-powered RAG system for intelligent information retrieval
- Automatic document processing and embedding
- Property-specific information for personalization

### 7. **Scheduled Visits Dashboard**
- View all scheduled property visits and sales calls
- Lead contact details and visit dates
- Conversation summaries for context
- Easy tracking of goal achievements

### 8. **AI Agent Settings**
- Configure follow-up intervals
- Set maximum follow-up attempts
- Choose messaging focus (features, pricing, location, investment)
- Select AI response style (professional, friendly, direct, detailed)
- Custom AI instructions for behavior control

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Framework**: Django 5.0
- **API**: Django Ninja (FastAPI-style REST APIs)
- **Database**: SQLite (development) / PostgreSQL (production-ready)
- **Package Manager**: uv (ultra-fast Python package installer)
- **AI/ML**:
  - Anthropic Claude 3.5 Sonnet for intelligent message generation
  - LangChain + LangGraph for multi-agent orchestration
  - ChromaDB for vector storage
  - HuggingFace Embeddings for semantic search

### AI Architecture
- **LLM**: Anthropic Claude 3.5 Sonnet
- **RAG System**: ChromaDB + LangChain
- **Multi-Agent**: LangGraph for agent orchestration
- **Embeddings**: HuggingFace all-MiniLM-L6-v2

---

## 📖 Detailed Setup Guide

### Step 1: Install Prerequisites

#### Install uv (Recommended)
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# macOS with Homebrew
brew install uv

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### Get Anthropic API Key
1. Visit https://console.anthropic.com/
2. Sign up (free $5 credits included)
3. Navigate to Settings → API Keys
4. Create new API key
5. Copy and save securely

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment with uv
uv venv

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate    # Windows

# Install dependencies (10-100x faster than pip!)
uv pip install -r requirements.txt

# Alternative with pip (slower)
# pip install -r requirements.txt
```

### Step 3: Environment Configuration

Create `.env` file in `backend` directory:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Optional (auto-generated if not provided)
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Step 4: Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser (optional, for Django admin)
python manage.py createsuperuser

# Populate sample data (IMPORTANT for demo)
cd ..
python populate_db.py
```

This creates:
- 104 sample leads with realistic data
- Sample conversations
- Campaign metrics

### Step 5: Start Backend Server

```bash
cd backend
python manage.py runserver 8000
```

**Verify**: Open http://localhost:8000/api/health
Should return: `{"status": "ok"}`

### Step 6: Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Access Application**: http://localhost:3000

---

## 📱 Usage Guide

### 1. Create a Campaign

1. Navigate to **"Create Campaign"**
2. Fill in campaign details:
   - **Name**: "Sobha Crest Q4 2024"
   - **Project**: Select "Sobha Crest"
   - **Budget Range**: 1,000,000 - 1,500,000
   - **Unit Types**: Check "2 bed" and "3 bed"
   - **Lead Status**: "Not Connected", "Connected"
   - **Channel**: WhatsApp or Email
3. Click **"Shortlist Leads"** → See matching count
4. Click **"Create Campaign"**

### 2. Execute Campaign

1. Go to **"All Campaigns"**
2. Click **"Execute Campaign"**
3. Watch backend console for AI-generated messages
4. Each message is personalized with:
   - Lead's name and context
   - Budget and preferences
   - Property features from brochures
   - Special offers

### 3. View AI Conversations

1. Navigate to **"AI Agent Follow-ups"**
2. Select your campaign
3. Click **"View Conversation"** on any lead
4. See the AI-generated personalized message
5. Simulate lead reply to see Claude respond

### 4. Simulate Lead Response

```bash
curl -X POST http://localhost:8000/api/conversations/1/reply \
  -H "Content-Type: application/json" \
  -d '{"message": "I would love to schedule a viewing this week!"}'
```

The system will:
- Detect scheduling intent
- Create scheduled visit
- Mark goal as achieved
- Notify you

### 5. View Scheduled Visits

1. Go to **"Property Visit/Call Scheduled"**
2. See all auto-created appointments
3. View lead contact information
4. Read conversation summaries

### 6. Check Analytics

1. Navigate to **"Campaign Analytics"**
2. Select campaign
3. View metrics:
   - **Leads Shortlisted**: Total in campaign
   - **Messages Sent**: AI messages generated
   - **Unique Responses**: Leads who replied
   - **Goals Achieved**: Scheduled visits/calls

### 7. Configure AI Behavior

1. Go to **"AI Agent Settings"**
2. Configure:
   - Follow-up interval (days)
   - Maximum follow-ups
   - Messaging focus
   - Response style
   - Urgency level
3. Settings auto-save and apply to future campaigns

---

## 📁 Project Structure

```
Lead-Nurturing-CRM/
├── backend/
│   ├── api/
│   │   ├── models.py          # Django models
│   │   ├── campaign_api.py    # Campaign endpoints
│   │   ├── settings_api.py    # Settings endpoints
│   │   └── schemas.py         # API schemas
│   ├── agent/
│   │   ├── graph.py           # LangGraph multi-agent
│   │   ├── rag.py             # RAG system with Claude
│   │   ├── sql.py             # SQL query system
│   │   └── personalizer.py   # Message personalization
│   ├── config/
│   │   ├── settings.py        # Django settings
│   │   └── urls.py            # URL routing
│   ├── data/
│   │   └── brochures/         # Property PDF brochures
│   ├── manage.py
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── campaigns/         # Campaign pages
│   │   ├── followups/         # Conversation viewer
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── scheduled/         # Scheduled visits
│   │   ├── settings/          # AI settings
│   │   └── knowledge/         # Knowledge base
│   ├── components/
│   │   └── Sidebar.tsx        # Navigation
│   ├── package.json
│   └── tsconfig.json
├── populate_db.py             # Sample data generator
├── ingest_brochures.py        # Brochure ingestion
└── README.md                  # This file
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Campaigns

#### Create Campaign
```http
POST /campaigns/create
Content-Type: application/json

{
  "name": "Q4 Luxury Campaign",
  "target_project": "Sobha Crest",
  "channel": "whatsapp",
  "filter_criteria": {
    "budget_min": "1000000",
    "budget_max": "2000000",
    "unit_types": "2 bed,3 bed",
    "statuses": "Connected"
  }
}
```

#### Execute Campaign
```http
POST /campaigns/{campaign_id}/execute

Response:
{
  "status": "success",
  "messages_sent": 15,
  "campaign_status": "running"
}
```

#### List Campaigns
```http
GET /campaigns/list

Response:
{
  "campaigns": [
    {
      "id": 1,
      "name": "Q4 Luxury Campaign",
      "status": "running",
      "leads_count": 15,
      "messages_sent": 15
    }
  ]
}
```

### Conversations

#### Get Campaign Conversations
```http
GET /campaigns/{campaign_id}/conversations
```

#### Add Lead Reply
```http
POST /conversations/{lead_id}/reply
Content-Type: application/json

{
  "message": "I'm interested! Can you tell me more?"
}
```

#### Mark Goal Achieved
```http
POST /conversations/{lead_id}/mark-goal
```

### AI Settings

#### Get Settings
```http
GET /agent-settings

Response:
{
  "followup_interval_days": 3,
  "max_followups": 5,
  "messaging_focus": "Property Features & Benefits",
  "response_style": "Professional & Formal"
}
```

#### Update Settings
```http
POST /agent-settings
Content-Type: application/json

{
  "followup_interval_days": 5,
  "max_followups": 7,
  "messaging_focus": "Investment Opportunities",
  "response_style": "Friendly & Conversational"
}
```

---

## 🐛 Troubleshooting

### Issue: "No leads match your criteria"
**Solution**: Run `python populate_db.py` to create sample data

### Issue: Backend 500 error on campaign execute
**Solution**:
1. Check `ANTHROPIC_API_KEY` is set in `backend/.env`
2. Verify you have credits in Anthropic account
3. Run migrations: `python manage.py migrate`
4. Check backend console for detailed error

### Issue: Frontend not loading
**Solution**:
1. Verify backend is running on port 8000
2. Verify frontend is running on port 3000
3. Check browser console for errors
4. Try: `rm -rf .next && npm run dev`

### Issue: Conversations not showing
**Solution**:
1. Execute a campaign first
2. Check backend console for API errors
3. Verify `ANTHROPIC_API_KEY` is valid

### Issue: AI responses are generic
**Solution**:
1. Upload property brochures via Knowledge Base page
2. Or run: `python ingest_brochures.py`
3. Ensure PDFs are in `backend/data/brochures/`

### Issue: "uv command not found"
**Solution**:
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
# Restart terminal
source ~/.bashrc  # or ~/.zshrc
```

### Issue: Claude API rate limit errors
**Solution**:
1. Check your usage at https://console.anthropic.com/
2. Wait a few minutes and retry
3. Consider upgrading your Anthropic plan

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Anthropic for Claude 3.5 Sonnet API
- LangChain and LangGraph for multi-agent framework
- Astral (uv) for ultra-fast Python package management
- Next.js and Django communities
- ChromaDB for vector database
- All contributors and testers

---

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for Real Estate Sales Teams**

**Powered by Anthropic Claude 3.5 Sonnet** 🤖
