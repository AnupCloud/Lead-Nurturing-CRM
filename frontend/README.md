# Lead Nurturing CRM - Frontend Documentation

> Next.js 14 + TypeScript + Tailwind CSS

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-18.0-61dafb?logo=react)](https://reactjs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Pages & Components](#pages--components)
- [State Management](#state-management)
- [Styling](#styling)
- [Development](#development)
- [Build & Deploy](#build--deploy)

---

## 🎯 Overview

The frontend is a modern **Next.js 14** application built with **TypeScript** and **Tailwind CSS**. It provides a responsive, production-grade interface for campaign management, AI conversation tracking, and analytics visualization.

### Key Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.0
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Native Fetch API

---

## 🏗️ Architecture

### Application Structure

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js Frontend                       │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  App Router Pages                   │  │
│  ├────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  Dashboard  │  Campaigns  │  Follow-ups  │  etc.   │  │
│  │     (/)     │  (/campaigns)│ (/followups) │         │  │
│  └────────────────────────────────────────────────────┘  │
│         │              │              │                    │
│         ▼              ▼              ▼                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Shared Components                      │  │
│  ├────────────────────────────────────────────────────┤  │
│  │  Sidebar │  Modal │  Button │  Card  │  etc.       │  │
│  └────────────────────────────────────────────────────┘  │
│         │                                                  │
│         ▼                                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │                 API Layer (Fetch)                   │  │
│  └────────────────────────────────────────────────────┘  │
│         │                                                  │
│         ▼                                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Backend API (localhost:8000)               │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Interaction → Component State → API Call → Backend
                                                    │
                                                    ▼
User sees update ← Component Re-render ← State Update ← Response
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js 18+**
- **npm** or **yarn**
- Backend server running on http://localhost:8000

### Step 1: Navigate to Frontend

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Environment Configuration

Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Start Development Server

```bash
npm run dev
# or
yarn dev
```

**Access Application**: http://localhost:3000

---

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Dashboard (/)
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   │
│   ├── campaigns/               # Campaign pages
│   │   ├── page.tsx            # Create campaign (/campaigns)
│   │   └── list/
│   │       └── page.tsx        # Campaign list (/campaigns/list)
│   │
│   ├── followups/               # AI Follow-ups
│   │   └── page.tsx            # Conversations (/followups)
│   │
│   ├── analytics/               # Analytics
│   │   └── page.tsx            # Campaign analytics (/analytics)
│   │
│   ├── scheduled/               # Scheduled visits
│   │   └── page.tsx            # Visit tracking (/scheduled)
│   │
│   ├── settings/                # AI Settings
│   │   └── page.tsx            # Agent config (/settings)
│   │
│   ├── knowledge/               # Knowledge Base
│   │   └── page.tsx            # Brochure upload (/knowledge)
│   │
│   └── leads/                   # Lead Management
│       └── page.tsx            # Lead list (/leads)
│
├── components/                   # Shared components
│   └── Sidebar.tsx              # Navigation sidebar
│
├── public/                       # Static assets
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind config
├── next.config.js                # Next.js config
└── README.md                     # This file
```

---

## 📄 Pages & Components

### Pages

#### 1. Dashboard (`app/page.tsx`)

**Route**: `/`

**Purpose**: Main landing page with quick stats and navigation.

**Features**:
- Welcome message
- Quick access to all sections
- Overview statistics (future enhancement)

**Screenshot**: 
![Dashboard](../docs/images/01_dashboard.png)

---

#### 2. Create Campaign (`app/campaigns/page.tsx`)

**Route**: `/campaigns`

**Purpose**: Create new lead nurturing campaigns with intelligent filters.

**Features**:
- Campaign name input
- Target project selection
- Lead shortlisting filters:
  - Budget range (min/max)
  - Unit type (checkboxes)
  - Lead status (dropdown)
  - Last conversation date (date range)
- Real-time lead count display
- Channel selection (Email/WhatsApp)
- Offer details textarea

**State Management**:
```typescript
const [campaignData, setCampaignData] = useState({
  name: '',
  target_project: '',
  channel: 'whatsapp',
  offer_details: '',
  filter_criteria: {
    budget_min: '',
    budget_max: '',
    unit_types: '',
    statuses: ''
  }
});
const [leadCount, setLeadCount] = useState<number | null>(null);
```

**API Calls**:
- `POST /api/campaigns/shortlist` - Get matching lead count
- `POST /api/campaigns/create` - Create campaign

**Screenshot**:
![Create Campaign](../docs/images/03_create_campaign.png)

---

#### 3. All Campaigns (`app/campaigns/list/page.tsx`)

**Route**: `/campaigns/list`

**Purpose**: View and execute all campaigns.

**Features**:
- Campaign list with details
- Status badges (Draft/Running/Completed)
- Execute campaign button
- Loading states
- Error handling

**State**:
```typescript
const [campaigns, setCampaigns] = useState<Campaign[]>([]);
const [executingId, setExecutingId] = useState<number | null>(null);
```

**API Calls**:
- `GET /api/campaigns/list` - Fetch campaigns
- `POST /api/campaigns/{id}/execute` - Execute campaign

**Screenshot**:
![All Campaigns](../docs/images/04_campaigns_list.png)

---

#### 4. AI Agent Follow-ups (`app/followups/page.tsx`)

**Route**: `/followups`

**Purpose**: Track AI-powered conversations with leads.

**Features**:
- Campaign filter dropdown
- Conversation list with:
  - Lead name and contact
  - Sentiment badges
  - Last message preview
  - Goal achievement status
- Conversation modal:
  - Full message thread
  - Sentiment visualization
  - Manual follow-up input
  - Goal achievement button

**State**:
```typescript
const [conversations, setConversations] = useState([]);
const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
const [viewingConversation, setViewingConversation] = useState<any>(null);
const [followupMessage, setFollowupMessage] = useState('');
```

**API Calls**:
- `GET /api/campaigns/{id}/conversations` - Fetch conversations
- `POST /api/conversations/{id}/reply` - Send manual message
- `POST /api/conversations/{id}/mark-goal` - Mark goal achieved

**Screenshots**:
![Follow-ups List](../docs/images/06_followups.png)
![Conversation Modal](../docs/images/07_conversation_modal.png)

---

For complete documentation, see the main project [README.md](../README.md).

---

**Built with ❤️ using Next.js + TypeScript + Tailwind CSS**
