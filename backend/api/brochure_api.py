from ninja import Router
from typing import List
import os
from datetime import datetime
from agent.rag import RAGSystem
from api.schemas import BulkDeleteRequest

brochure_router = Router()

# Initialize RAG system for ChromaDB cleanup
rag_system = RAGSystem()

@brochure_router.get("/brochures")
def list_brochures(request):
    """List all uploaded brochures"""
    brochure_dir = "data/brochures"
    
    if not os.path.exists(brochure_dir):
        return {"brochures": []}
    
    brochures = []
    for filename in os.listdir(brochure_dir):
        if filename.endswith('.pdf'):
            file_path = os.path.join(brochure_dir, filename)
            stat = os.stat(file_path)
            brochures.append({
                "filename": filename,
                "size": stat.st_size,
                "uploaded_at": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
    
    return {"brochures": brochures}

@brochure_router.post("/brochures/bulk-delete")
def bulk_delete_brochures(request, payload: BulkDeleteRequest):
    """Delete multiple brochures at once"""
    filenames = payload.filenames
    brochure_dir = "data/brochures"
    
    results = []
    total_chunks = 0
    
    for filename in filenames:
        file_path = os.path.join(brochure_dir, filename)
        
        if not os.path.exists(file_path):
            results.append({"filename": filename, "status": "not_found"})
            continue
        
        try:
            # Delete from ChromaDB
            chunks = rag_system.delete_by_source(file_path)
            total_chunks += chunks
            
            # Delete file
            os.remove(file_path)
            results.append({
                "filename": filename,
                "status": "success",
                "chunks_removed": chunks
            })
        except Exception as e:
            results.append({
                "filename": filename,
                "status": "error",
                "error": str(e)
            })
    
    return {
        "results": results,
        "total_chunks_removed": total_chunks,
        "message": f"Processed {len(filenames)} file(s)"
    }

@brochure_router.delete("/brochures/{filename}")
def delete_brochure(request, filename: str):
    """Delete a brochure and its ChromaDB vectors"""
    brochure_dir = "data/brochures"
    file_path = os.path.join(brochure_dir, filename)
    
    if not os.path.exists(file_path):
        return {"error": "File not found"}, 404
    
    try:
        # Delete from ChromaDB first
        chunks_deleted = rag_system.delete_by_source(file_path)
        
        # Delete physical file
        os.remove(file_path)
        
        return {
            "status": "success",
            "message": f"Deleted {filename}",
            "chunks_removed": chunks_deleted
        }
    except Exception as e:
        return {"error": str(e)}, 500
