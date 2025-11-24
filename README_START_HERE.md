# Lead Nurturing CRM - START HERE 🚀

## Quick Start (1 Minute)

### Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable
chmod +x setup_and_run.sh

# Run everything!
./setup_and_run.sh
```

Then open: **http://localhost:3000**

### Option 2: Manual Setup with uv (Faster)

```bash
# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh
# Or: brew install uv

# Backend
cd backend
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
python manage.py migrate
cd .. && python populate_db.py

# Start backend
cd backend && python manage.py runserver 8000 &

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## What is This?

An **AI-powered Lead Nurturing CRM** for real estate sales that automatically engages leads through intelligent conversations, detects buying intent, and schedules property visits.

### Key Features (All Working!)
- ✅ AI-generated personalized messages for each lead
- ✅ Smart conversation tracking (AI + Lead messages)
- ✅ Automatic goal detection (schedules visits when lead shows interest)
- ✅ Campaign analytics dashboard
- ✅ Multi-criteria lead filtering
- ✅ RAG system with property brochures (ChromaDB)
- ✅ Configurable AI agent behavior

---

## Project Status

### ✅ What's Implemented (85% - POC Complete)
- Complete backend API with Django + Ninja
- Full frontend with Next.js + React
- AI agents with LangGraph + Gemini
- RAG system with ChromaDB
- Campaign creation, execution, tracking
- Conversation management
- Goal detection and scheduling
- Analytics and reporting

### ❌ What's Not Implemented (Production Features)
- Actual WhatsApp/Email sending (messages logged to console)
- Automated background follow-ups (Celery/Redis)
- Inbound webhook receivers
- Calendar integration (Google/Outlook)
- Multi-user authentication

**Bottom Line**: Fully functional for demos and testing. Needs external integrations for production.

---

## Quick Links to Documentation

1. **POC_SETUP_GUIDE.md** - Complete setup and testing guide
2. **CORRECTED_IMPLEMENTATION_STATUS.md** - What's actually implemented
3. **WORKFLOW_AND_IMPLEMENTATION_PLAN.md** - Original detailed workflow analysis

---

## Manual Setup (If Script Fails)

### Backend
```bash
cd backend
source .venv/bin/activate
python manage.py makemigrations
python manage.py migrate
cd ..
python populate_db.py
cd backend
python manage.py runserver 8000
```

### Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

---

## Testing the Application

### 1. Create a Campaign
- Navigate to "Create Campaign" in sidebar
- Select project: "Sobha Crest"
- Set budget: 1M - 1.5M AED
- Select unit types: "2 bed", "3 bed"
- Click "Shortlist Leads"

### 2. Execute Campaign
- Go to "All Campaigns"
- Click "Execute Campaign"
- Check backend console - see AI-generated messages

### 3. View Conversations
- Go to "AI Agent Follow-ups"
- Select your campaign
- Click "View Conversation" on any lead
- See AI-personalized message

### 4. Simulate Lead Reply
Use API:
```bash
curl -X POST http://localhost:8000/api/conversations/1/reply \
  -H "Content-Type: application/json" \
  -d '{"message": "I would love to schedule a viewing!"}'
```

### 5. See Scheduled Visit
- Go to "Property Visit/Call Scheduled"
- See the auto-created appointment

### 6. Check Analytics
- Go to "Campaign Analytics"
- View metrics: leads, messages, responses, goals

---

## Architecture

```
Frontend (Next.js) → Django API → AI Agents (LangGraph + Gemini)
                                     ↓
                                 ChromaDB (RAG)
                                     ↓
                                 SQLite DB
```

---

## Demo Scenario

**Scenario**: Nurture leads interested in Sobha Crest 2-bedroom units

1. **Create Campaign**
   - Filter: Budget 1M-1.5M, Unit: 2-bed, Status: Not Connected
   - Result: 15 leads matched

2. **Execute**
   - System sends 15 AI-personalized messages
   - Each message includes property features from brochures

3. **Lead Responds** (simulated)
   - "Yes, I'm interested! Can you tell me about amenities?"
   - AI responds with property amenities from RAG system

4. **Lead Shows Intent**
   - "This looks perfect! Can we schedule a viewing?"
   - System auto-detects goal
   - Creates scheduled visit
   - Sends notification

5. **View Results**
   - Analytics: 15 shortlisted, 15 messages, 3 responses, 1 goal
   - Scheduled Visits: 1 appointment with full context

---

## Key API Endpoints

### Campaigns
- `POST /api/campaigns/create` - Create campaign
- `POST /api/campaigns/{id}/execute` - Execute campaign
- `GET /api/campaigns/list` - List all campaigns
- `GET /api/campaigns/dashboard` - Get analytics

### Conversations
- `GET /api/campaigns/{id}/conversations` - Get all conversations
- `POST /api/conversations/{lead_id}/reply` - Add lead reply (AI responds)
- `POST /api/conversations/{lead_id}/mark-goal` - Manual goal marking
- `POST /api/conversations/{lead_id}/send-followup` - Send manual follow-up

### Settings
- `GET /api/agent-settings` - Get AI agent settings
- `POST /api/agent-settings` - Update AI settings

### Leads
- `GET /api/leads/filter` - Filter leads by criteria

---

## Project Structure

```
cms_real_estate/
├── backend/
│   ├── api/
│   │   ├── models.py          # Django models
│   │   ├── api.py             # Main API
│   │   ├── campaign_api.py    # Campaign endpoints
│   │   ├── settings_api.py    # Settings endpoints
│   │   └── schemas.py         # Pydantic schemas
│   ├── agent/
│   │   ├── graph.py           # LangGraph multi-agent
│   │   ├── rag.py             # RAG system
│   │   ├── sql.py             # SQL agent
│   │   └── personalizer.py   # Message personalization
│   └── config/
│       ├── settings.py        # Django settings
│       └── urls.py            # URL routing
├── frontend/
│   ├── app/
│   │   ├── campaigns/         # Campaign pages
│   │   ├── followups/         # Conversation viewer
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── scheduled/         # Scheduled visits
│   │   └── settings/          # AI settings
│   └── components/
│       └── Sidebar.tsx        # Navigation
├── populate_db.py             # Sample data generator
├── POC_SETUP_GUIDE.md         # Detailed setup guide
└── CORRECTED_IMPLEMENTATION_STATUS.md  # Feature status
```

---

## Environment Variables

Backend `.env` (create from .env.example):
```env
# Required: Choose at least one AI provider
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional
GROQ_API_KEY=your_groq_api_key_here
```

**Get API Keys**:
- Google Gemini: https://makersuite.google.com/app/apikey (Free)
- Anthropic Claude: https://console.anthropic.com/ (Production recommended)
- Groq: https://console.groq.com/ (Very fast, optional)

---

## Troubleshooting

### "No leads match your criteria"
**Fix**: Run `python populate_db.py` to create sample data

### Backend 500 errors
**Check**:
1. GEMINI_API_KEY is set in `.env`
2. Migrations are applied: `python manage.py migrate`
3. Backend console for detailed errors

### Frontend not loading
**Check**:
1. Backend is running on port 8000
2. Frontend is running on port 3000
3. Browser console for errors

### No conversations showing
**Fix**:
1. Execute a campaign first
2. Check backend console for errors
3. Verify API is accessible

---

## Next Steps

### To Make Production-Ready:
1. **WhatsApp Integration** (Meta Business API)
2. **Email Service** (SendGrid/AWS SES)
3. **Background Jobs** (Celery + Redis)
4. **Webhooks** (Inbound message processing)
5. **Calendar** (Google/Outlook API)
6. **Authentication** (Multi-user with roles)

**Estimated Time**: 4-6 weeks

---

## Tech Stack

### Backend
- Django 5.0
- Django Ninja (FastAPI-like for Django)
- LangChain + LangGraph (multi-agent orchestration)
- Google Gemini AI / Anthropic Claude
- ChromaDB (vector database)
- SQLite (easily migrates to PostgreSQL)
- uv (ultra-fast Python package manager)

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

### AI/ML
- Google Gemini 1.5 Pro
- ChromaDB (vector database)
- LangGraph (multi-agent orchestration)
- RAG (Retrieval-Augmented Generation)

---

## Support & Contact

For issues:
1. Check `backend.log` for backend errors
2. Check `frontend.log` for frontend errors
3. Check browser DevTools console
4. Review documentation files

---

## Success Criteria ✅

You have a working POC if you can:
- [x] Create a campaign with filters
- [x] Execute campaign (see messages in backend console)
- [x] View AI-generated conversations
- [x] Simulate lead reply
- [x] Get AI response with property data
- [x] Auto-detect goal and create scheduled visit
- [x] View analytics with correct metrics
- [x] Change AI settings and see them persist

**All of the above work!** The POC is complete and functional.

---

## Quick Commands

```bash
# Start everything
./setup_and_run.sh

# Stop everything
pkill -f 'manage.py runserver' && pkill -f 'next-server'

# View logs
tail -f backend.log
tail -f frontend.log

# Repopulate data
python populate_db.py

# Django admin
python backend/manage.py createsuperuser
# Then visit: http://localhost:8000/admin

# Database shell
cd backend
python manage.py shell
```

---

## License

Proprietary - Real Estate Lead Nurturing CRM

---

**Ready to start?** Run `./setup_and_run.sh` and open http://localhost:3000!

For detailed testing: Read `POC_SETUP_GUIDE.md`
For implementation status: Read `CORRECTED_IMPLEMENTATION_STATUS.md`
