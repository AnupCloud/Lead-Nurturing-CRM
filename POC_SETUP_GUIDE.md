# Lead Nurturing CRM - POC Setup & Testing Guide

## Overview

This guide will help you set up and test the **fully functional** Lead Nurturing CRM POC. Most features are already implemented - you just need to set up the environment and data.

## What's Already Implemented ✅

### Backend (100% Complete for POC)
- ✅ All Django models with proper relationships
- ✅ Campaign creation and execution API
- ✅ AI-powered message personalization
- ✅ Conversation tracking system
- ✅ Goal achievement detection (automatic + manual)
- ✅ Scheduled visit management
- ✅ Campaign analytics dashboard
- ✅ AI Agent settings (full CRUD)
- ✅ Lead filtering by multiple criteria
- ✅ RAG system with ChromaDB for property brochures
- ✅ Multi-agent AI workflow (LangGraph)

### Frontend (100% Complete for POC)
- ✅ Campaign creation with filters
- ✅ Campaign list with execution button
- ✅ Conversation viewer with AI/Lead messages
- ✅ Scheduled visits page
- ✅ Analytics dashboard
- ✅ AI Agent settings page
- ✅ Manual follow-up sending
- ✅ Manual goal achievement marking

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- **uv** (recommended) or pip for Python packages
  - Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh` or `brew install uv`
- **AI API Key**: Get at least one:
  - Google Gemini: https://makersuite.google.com/app/apikey (Free tier)
  - Anthropic Claude: https://console.anthropic.com/ (Recommended)
  - Groq: https://console.groq.com/ (Optional)

---

## Setup Instructions

### Step 1: Backend Setup

#### Using uv (Recommended - Much Faster)

```bash
cd backend

# Create and activate virtual environment with uv
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies with uv (10-100x faster than pip!)
uv pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GROQ_API_KEY=your_groq_api_key_here
EOF

# Apply migrations
python manage.py migrate

# Populate sample data (IMPORTANT!)
cd ..
python populate_db.py

# Start backend server
cd backend
python manage.py runserver 8000
```

#### Alternative: Using pip (Slower)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# ... rest of steps same as above
```

**Verify Backend**: Open http://localhost:8000/api/health - should return `{"status": "ok"}`

### Step 2: Frontend Setup

```bash
# In a new terminal
cd frontend

# Install dependencies (if not already installed)
npm install

# Start frontend development server
npm run dev
```

**Verify Frontend**: Open http://localhost:3000

---

## Testing the Complete Flow

### Test 1: View Existing Leads

1. Navigate to **Leads** page (sidebar)
2. You should see sample leads populated from `populate_db.py`
3. Try filtering by:
   - Project: "Sobha Crest"
   - Budget range: 1000000 - 2000000
   - Status: "Not Connected"

### Test 2: Create a Campaign

1. Navigate to **Create Campaign** (sidebar)
2. Fill in campaign details:
   - **Name**: "Sobha Crest Q4 2024 Campaign"
   - **Project**: Select "Sobha Crest" from dropdown
   - **Budget Range**: Min 800000, Max 1500000
   - **Unit Type**: Check "2 bed" and "3 bed"
   - **Lead Status**: Check "Not Connected", "Connected"
   - **Channel**: Select "WhatsApp" or "Email"
3. Click **"Shortlist Leads"**
4. You'll see "X leads match your criteria"
5. Click **"Create Campaign"**

### Test 3: Execute the Campaign

1. Navigate to **Campaign Analytics** → **All Campaigns** (or `/campaigns/list`)
2. Find your campaign (status should be "Draft")
3. Click **"Execute Campaign"**
4. Confirm the dialog
5. **Check backend terminal** - you'll see AI-generated personalized messages:
   ```
   [WHATSAPP TO john@example.com]
   Hi John! Thank you for your interest in Sobha Crest...
   ==================================================
   ```
6. Campaign status changes to "Running"

### Test 4: View AI-Generated Conversations

1. Navigate to **AI Agent Follow-ups** (sidebar)
2. Select your campaign from dropdown
3. You'll see list of leads with:
   - Lead name
   - Message count (should be 1 for each lead)
   - Last activity time
   - Status: "Active"
   - Preview of AI-generated message
4. Click **"View Conversation"** on any lead
5. See the full AI-personalized message

### Test 5: Simulate Lead Response & AI Reply

1. In the conversation modal, there's a lead message input
2. Type a lead response: "Yes, I'm interested! Can you tell me more about the 2-bedroom units?"
3. Click **"Send as Lead"** (or use the reply endpoint)
4. The system will:
   - Save the lead's message
   - Generate an AI response using RAG (from property brochures)
   - Display the conversation thread
   - Detect intent (if lead shows interest in scheduling)

**API Test** (using curl):
```bash
curl -X POST http://localhost:8000/api/conversations/1/reply \
  -H "Content-Type: application/json" \
  -d '{
    "message": "That sounds great! I would love to schedule a viewing this week."
  }'
```

### Test 6: Goal Achievement - Auto Detection

1. Send a lead message with scheduling intent:
   - "Yes, I'd like to schedule a visit tomorrow"
   - "Can we book a viewing for next week?"
   - "I'm interested in seeing the property"
2. The system automatically:
   - Detects goal achievement
   - Creates a `ScheduledVisit` record
   - Updates conversation status to "Goal Achieved"
   - Sends notification (check backend terminal)

### Test 7: Manual Goal Achievement

1. In conversation modal, click **"Mark as Goal Achieved"**
2. System creates scheduled visit with appointment date (3 days from now)
3. Lead status changes to "Visit scheduled"
4. Navigate to **Property Visit/Call Scheduled** page
5. See the new appointment with:
   - Lead name and contact info
   - Project interest
   - Appointment date/time
   - Conversation summary

### Test 8: Send Manual Follow-up

1. In conversation modal (AI Agent Follow-ups page)
2. Click **"Send Follow-up"** button
3. System generates contextual follow-up using:
   - Previous conversation history
   - Lead's project interest
   - Property brochure data (RAG)
4. New AI message appears in conversation

### Test 9: Campaign Analytics

1. Navigate to **Campaign Analytics** (sidebar)
2. Select your campaign from dropdown
3. View metrics:
   - **Leads Shortlisted**: Total leads in campaign
   - **Messages Sent**: Number of messages sent
   - **Unique Responses**: Leads who replied
   - **Goals Achieved**: Scheduled visits/calls

### Test 10: Scheduled Visits Management

1. Navigate to **Property Visit/Call Scheduled** (sidebar)
2. View all scheduled appointments
3. Each entry shows:
   - Lead name, phone, email
   - Project interest
   - Appointment type (Property Visit / Sales Call)
   - Date and time
   - Expandable conversation summary
4. Click to expand - see **Last Conversation Summary**
5. Click **"Confirm Visit"** or **"Reschedule"**

### Test 11: AI Agent Settings

1. Navigate to **AI Agent Settings** (sidebar)
2. Configure:
   - **Follow-up Interval**: 3 days (default)
   - **Maximum Follow-ups**: 5 (default)
   - **Messaging Focus**: Select "Investment Potential"
   - **AI Response Style**: Select "Friendly & Conversational"
3. Settings auto-save to database
4. These settings will be used for future AI message generation

---

## API Testing with Curl

### Create a Campaign
```bash
curl -X POST http://localhost:8000/api/campaigns/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "target_project": "Sobha Crest",
    "channel": "whatsapp",
    "filter_criteria": {
      "project": "Sobha Crest",
      "budget_min": "1000000",
      "budget_max": "2000000",
      "statuses": "new,contacted"
    }
  }'
```

### Execute a Campaign
```bash
curl -X POST http://localhost:8000/api/campaigns/1/execute
```

### Get Conversations for a Campaign
```bash
curl http://localhost:8000/api/campaigns/1/conversations
```

### Send Lead Reply
```bash
curl -X POST http://localhost:8000/api/conversations/1/reply \
  -H "Content-Type: application/json" \
  -d '{"message": "I am interested in a 2-bedroom unit. Can we schedule a viewing?"}'
```

### Mark Goal as Achieved
```bash
curl -X POST http://localhost:8000/api/conversations/1/mark-goal \
  -H "Content-Type: application/json"
```

### Get Campaign Dashboard
```bash
curl http://localhost:8000/api/campaigns/dashboard
```

### Get AI Agent Settings
```bash
curl http://localhost:8000/api/agent-settings
```

---

## Verifying Data in Database

```bash
cd backend
python manage.py shell
```

```python
from api.models import *

# Check leads
print(f"Total Leads: {Lead.objects.count()}")

# Check campaigns
print(f"Total Campaigns: {CampaignConfig.objects.count()}")

# Check conversations
print(f"Total Conversations: {Conversation.objects.count()}")

# Check scheduled visits
print(f"Total Scheduled Visits: {ScheduledVisit.objects.count()}")

# View latest conversation
conv = Conversation.objects.latest('timestamp')
print(f"\nLatest Conversation:")
print(f"Lead: {conv.lead.name}")
print(f"Speaker: {conv.speaker}")
print(f"Message: {conv.message[:100]}...")

# View campaigns with messages
for campaign in CampaignConfig.objects.all():
    msgs = campaign.sent_messages.count()
    print(f"\n{campaign.name}: {msgs} messages sent")
```

---

## What Actually Works Right Now

### ✅ Fully Functional
1. Campaign creation with advanced filtering
2. Campaign execution (sends AI-personalized messages to all matched leads)
3. AI message personalization using RAG + lead data
4. Conversation tracking (AI and lead messages)
5. Manual lead reply simulation
6. AI response generation to lead replies
7. Auto goal detection from lead messages
8. Manual goal achievement marking
9. Scheduled visit creation
10. Campaign analytics (real-time metrics)
11. AI Agent settings (persistence to database)
12. Lead filtering by multiple criteria
13. Property brochure ingestion (ChromaDB)

### ❌ Not Implemented (Out of Scope for POC)
1. **Actual message sending** via WhatsApp/Email APIs (messages logged to console)
2. **Automated background jobs** (Celery) for scheduled follow-ups
3. **Webhook integration** for capturing external replies
4. **Calendar integration** (Google Calendar, Outlook)
5. **Multi-user authentication** with roles

---

## Demo Scenario: Complete User Journey

Here's a complete scenario to demonstrate all features:

### Scenario: Nurturing a Lead for Sobha Crest

1. **Sales Manager Creates Campaign**
   - Go to "Create Campaign"
   - Name: "Sobha Crest 2-Bed Luxury Campaign"
   - Project: Sobha Crest
   - Budget: 1M - 1.5M AED
   - Unit Types: 2 bed, 2 bed w study
   - Status: Not Connected, Connected
   - Creates campaign → 15 leads matched

2. **Execute Campaign**
   - Go to "All Campaigns"
   - Click "Execute Campaign"
   - System sends 15 personalized messages (check backend console)
   - Each message is tailored with:
     - Lead's name
     - Their budget
     - Specific property features from brochures (RAG)
     - Unit type they're interested in

3. **Lead Responds** (Simulated)
   - Go to "AI Agent Follow-ups"
   - Select campaign
   - Click "View Conversation" for "Sarah Johnson"
   - Simulate response: "Hi! Yes, I'm very interested. Can you tell me about the amenities?"
   - AI generates response with property amenities from RAG system

4. **Lead Shows Interest**
   - Sarah replies: "This looks perfect! Can we schedule a viewing this weekend?"
   - System automatically detects scheduling intent
   - Creates ScheduledVisit with appointment date
   - Updates Sarah's status to "Goal Achieved"
   - Sends notification to sales team (console)

5. **Sales Team Views Scheduled Visits**
   - Navigate to "Property Visit/Call Scheduled"
   - See Sarah Johnson's appointment
   - Date: This weekend (auto-generated)
   - Type: Property Visit
   - Summary: Full conversation context
   - Can confirm or reschedule

6. **Track Campaign Performance**
   - Go to "Campaign Analytics"
   - Select "Sobha Crest 2-Bed Luxury Campaign"
   - Metrics:
     - Leads Shortlisted: 15
     - Messages Sent: 15
     - Unique Responses: 3
     - Goals Achieved: 1 (Sarah Johnson)

---

## Troubleshooting

### Issue: "No leads match your criteria"
**Solution**: Run `python populate_db.py` to create sample data

### Issue: Backend 500 error on campaign execute
**Solution**:
1. Check `GEMINI_API_KEY` is set in `backend/.env`
2. Verify migrations are applied: `python manage.py migrate`
3. Check backend console for detailed error

### Issue: Conversations not showing
**Solution**:
1. Execute a campaign first
2. Check browser console for API errors
3. Verify backend is running on port 8000

### Issue: AI responses are generic
**Solution**:
1. Upload property brochures via Knowledge Base page
2. Or run `python ingest_brochures.py` with PDF files in `data/brochures/`

---

## Next Steps After POC

Once the POC is validated, implement:

1. **WhatsApp Business API Integration**
   - Meta WhatsApp Business Platform
   - Twilio WhatsApp API

2. **Email Service Integration**
   - SendGrid or AWS SES
   - HTML email templates

3. **Automated Follow-up System**
   - Celery + Redis for background jobs
   - Scheduled task to check follow-up intervals
   - Auto-send follow-ups based on AI Agent Settings

4. **Calendar Integration**
   - Google Calendar API
   - Outlook Calendar API
   - Send calendar invites to leads

5. **Real-time Updates**
   - WebSocket (Django Channels)
   - Live conversation updates
   - Live metric updates

---

## Architecture Diagram

```
┌─────────────────┐
│  Next.js        │
│  Frontend       │
│  (localhost:    │
│   3000)         │
└────────┬────────┘
         │ HTTP API Calls
         ▼
┌─────────────────┐      ┌──────────────┐
│  Django API     │◄─────┤  PostgreSQL/ │
│  (Ninja)        │      │  SQLite DB   │
│  (localhost:    │      └──────────────┘
│   8000)         │
└────────┬────────┘
         │
         ├─────────►┌──────────────────┐
         │          │  LangGraph       │
         │          │  Multi-Agent AI  │
         │          └──────────────────┘
         │
         ├─────────►┌──────────────────┐
         │          │  ChromaDB        │
         │          │  (RAG System)    │
         │          └──────────────────┘
         │
         └─────────►┌──────────────────┐
                    │  Gemini AI       │
                    │  (Google AI)     │
                    └──────────────────┘
```

---

## Success Criteria for POC

The POC is successful if you can demonstrate:

- [x] Create a campaign with filter criteria
- [x] Execute campaign and generate personalized messages
- [x] View AI-generated conversations
- [x] Simulate lead replies
- [x] AI responds intelligently using property data
- [x] System detects goal achievement automatically
- [x] Scheduled visits are created
- [x] Analytics show accurate metrics
- [x] Settings persist and affect AI behavior

**All of the above are working!** 🎉

---

## Support

For issues or questions:
1. Check backend console for detailed errors
2. Check browser DevTools console for frontend errors
3. Verify all services are running (backend on 8000, frontend on 3000)
4. Ensure `populate_db.py` has been run for sample data
