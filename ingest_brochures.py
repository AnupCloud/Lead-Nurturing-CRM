import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from agent.rag import RAGSystem

def ingest_all_brochures():
    print("--- Ingesting All Brochures ---")
    rag = RAGSystem()
    
    brochure_dir = "backend/data/brochures"
    
    if not os.path.exists(brochure_dir):
        print(f"Directory {brochure_dir} not found.")
        return
    
    ingested_count = 0
    for filename in os.listdir(brochure_dir):
        if filename.endswith('.pdf'):
            file_path = os.path.join(brochure_dir, filename)
            print(f"\nIngesting: {filename}")
            chunks = rag.ingest_file(file_path)
            print(f"✓ Ingested {chunks} chunks")
            ingested_count += 1
    
    print(f"\n✅ Successfully ingested {ingested_count} brochures!")

if __name__ == "__main__":
    ingest_all_brochures()
