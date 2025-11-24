#!/bin/bash

# Lead Nurturing CRM - Quick Setup and Run Script

echo "========================================="
echo "Lead Nurturing CRM - POC Setup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Backend Setup
echo -e "${BLUE}Step 1: Setting up Backend...${NC}"
cd backend

# Check if uv is installed
if command -v uv &> /dev/null; then
    echo -e "${GREEN}✓ uv detected - using ultra-fast package manager${NC}"
    USE_UV=true
else
    echo -e "${YELLOW}! uv not found - using pip (slower)${NC}"
    echo -e "${YELLOW}  Install uv for faster installs: curl -LsSf https://astral.sh/uv/install.sh | sh${NC}"
    USE_UV=false
fi

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    if [ "$USE_UV" = true ]; then
        uv venv
    else
        python3 -m venv .venv
    fi
fi

# Activate venv
source .venv/bin/activate

# Install dependencies (if needed)
if [ ! -f ".venv/installed" ]; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    if [ "$USE_UV" = true ]; then
        uv pip install -r requirements.txt
    else
        pip install -r requirements.txt
    fi
    touch .venv/installed
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
python manage.py makemigrations
python manage.py migrate

# Go back to root
cd ..

# Step 2: Populate Sample Data
echo -e "${BLUE}Step 2: Populating sample data...${NC}"
if [ -f "populate_db.py" ]; then
    python populate_db.py
    echo -e "${GREEN}✓ Sample data loaded${NC}"
else
    echo -e "${YELLOW}! populate_db.py not found, skipping${NC}"
fi

# Step 3: Start Backend
echo ""
echo -e "${BLUE}Step 3: Starting Backend Server...${NC}"
echo -e "${GREEN}Backend will run on http://localhost:8000${NC}"
echo ""

cd backend
source .venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}! No .env file found. Creating from .env.example...${NC}"
    if [ -f "../.env.example" ]; then
        cp ../.env.example .env
        echo -e "${YELLOW}! Please edit backend/.env and add your API keys${NC}"
    fi
fi

# Start backend in background
python manage.py runserver 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "  Logs: backend.log"

cd ..

# Step 4: Frontend Setup
echo ""
echo -e "${BLUE}Step 4: Starting Frontend...${NC}"
echo -e "${GREEN}Frontend will run on http://localhost:3000${NC}"
echo ""

cd frontend

# Install npm packages if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
fi

# Start frontend in background
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "  Logs: frontend.log"

cd ..

# Summary
echo ""
echo "========================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Services running:"
echo "  • Backend:  http://localhost:8000"
echo "  • Frontend: http://localhost:3000"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Or run: pkill -f 'manage.py runserver' && pkill -f 'next-server'"
echo ""
echo "Logs:"
echo "  • Backend:  tail -f backend.log"
echo "  • Frontend: tail -f frontend.log"
echo ""
echo -e "${BLUE}Open your browser to http://localhost:3000${NC}"
echo ""
echo "Read POC_SETUP_GUIDE.md for testing instructions"
echo "========================================="
