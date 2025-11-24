from ninja import NinjaAPI, File, UploadedFile
from api.schemas import ChatRequest, ChatResponse, UploadResponse
from typing import List
from agent.graph import build_graph
from agent.rag import RAGSystem
import os

api = NinjaAPI(
    title="CMS Real Estate Agent API",
    version="1.0.0",
    description="API for Sales Lead Nurturing Agent"
)

# Initialize Agent
agent_workflow = build_graph()
rag_system = RAGSystem()

@api.get("/health")
def health(request):
    return {"status": "ok"}

@api.post("/chat", response=ChatResponse)
def chat(request, payload: ChatRequest):
    initial_state = {
        "query": payload.query,
        "history": payload.history,
        "intent": "",
        "response": ""
    }
    result = agent_workflow.invoke(initial_state)
    return {
        "response": result.get("response", "No response generated."),
        "intent": result.get("intent", "unknown")
    }

@api.post("/upload", response=UploadResponse)
def upload(request, files: List[UploadedFile] = File(...)):
    """Upload multiple brochure files"""
    upload_dir = "data/brochures"
    os.makedirs(upload_dir, exist_ok=True)

    results = []
    total_chunks = 0
    errors = []

    for file in files:
        file_path = os.path.join(upload_dir, file.name)

        try:
            # Save file
            with open(file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # Ingest to ChromaDB
            num_chunks = rag_system.ingest_file(file_path)
            total_chunks += num_chunks

            results.append({
                "filename": file.name,
                "chunks": num_chunks,
                "status": "success"
            })
        except Exception as e:
            # Clean up the file if ingestion failed
            if os.path.exists(file_path):
                os.remove(file_path)

            error_msg = str(e)
            errors.append({
                "filename": file.name,
                "error": error_msg,
                "status": "failed"
            })
            results.append({
                "filename": file.name,
                "chunks": 0,
                "status": "failed",
                "error": error_msg
            })

    success_count = len([r for r in results if r.get("status") == "success"])

    if errors:
        message = f"Uploaded {success_count}/{len(files)} file(s). {len(errors)} failed."
    else:
        message = f"Successfully uploaded {len(files)} file(s) with {total_chunks} total chunks"

    return {
        "files": results,
        "total_chunks": total_chunks,
        "message": message
    }

from typing import List
from api.models import Lead, Campaign
from api.schemas import LeadSchema, MetricsSchema

@api.get("/leads", response=List[LeadSchema])
def list_leads(request):
    return Lead.objects.all()

@api.get("/metrics", response=MetricsSchema)
def get_metrics(request):
    # For demo, aggregate or get from latest campaign
    # If no campaign, return dummy or zeros
    campaign = Campaign.objects.first()
    if campaign:
        return {
            "leads_shortlisted": campaign.leads_shortlisted,
            "messages_sent": campaign.messages_sent,
            "responses": campaign.responses_received,
            "goals_achieved": campaign.goals_achieved
        }
    return {
        "leads_shortlisted": 124,
        "messages_sent": 98,
        "responses": 45,
        "goals_achieved": 12
    }

# Include campaign router
from api.campaign_api import router as campaign_router
api.add_router("", campaign_router, tags=["campaigns"])

# Include brochure router
from api.brochure_api import brochure_router
api.add_router("", brochure_router, tags=["brochures"])

# Include auth router
from api.auth_api import auth_router
api.add_router("", auth_router, tags=["auth"])

# Include settings router
from api.settings_api import settings_router
api.add_router("", settings_router, tags=["settings"])
