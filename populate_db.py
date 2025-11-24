import os
import django
import sys
import pandas as pd
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Lead, Campaign
from django.conf import settings

def populate():
    print(f"Using database: {settings.DATABASES['default']['NAME']}")
    print("Populating database from Excel...")
    
    # Clear existing
    Lead.objects.all().delete()
    Campaign.objects.all().delete()
    
    # Read Excel
    excel_path = '/Users/anup/Desktop/Anup/project/cms_real_estate/Mock CRM leads for nurturing.xlsx'
    try:
        df = pd.read_excel(excel_path)
        print(f"Read {len(df)} rows from Excel.")
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    leads = []
    for _, row in df.iterrows():
        # Parse date
        date_str = str(row['Last conversation date'])
        try:
            last_contact = pd.to_datetime(date_str).date()
        except:
            last_contact = datetime.now().date()

        # Parse budget (convert string like '13,00,000' to number)
        def parse_budget(val):
            if pd.isna(val):
                return 0
            return float(str(val).replace(',', ''))

        min_b = parse_budget(row['Min. Budget'])
        max_b = parse_budget(row['Max Budget'])
        budget = (min_b + max_b) / 2  # Use average as budget

        leads.append(Lead(
            name=row['Lead name'],
            email=row['Email'],
            phone=f"{row['Country code']}{row['Phone']}",
            project_interest=row['Project name'],
            budget=budget,
            status=row['Lead status'],
            last_contact_date=last_contact,
            unit_type=str(row.get('Unit type', '')),
        ))
    
    # Inject Demo Personas
    demo_leads = [
        {
            "name": "Sarah Johnson",
            "email": "sarah.j@example.com",
            "phone": "+971 50 123 4567",
            "project": "Sobha Crest",
            "status": "connected",
            "budget": 1300000,
            "unit": "2 bed",
            "summary": "Interested in 2 bed, budget 1.3M. Asking about payment plans."
        },
        {
            "name": "Ahmed Al Rashid",
            "email": "ahmed.r@example.com",
            "phone": "+971 55 987 6543",
            "project": "Damac Bay by Cavalli",
            "status": "visit scheduled",
            "budget": 3500000,
            "unit": "3 bed",
            "summary": "Scheduled visit for next Tuesday. Interested in sea view units."
        },
        {
            "name": "Maria Rodriguez",
            "email": "maria.r@example.com",
            "phone": "+971 52 345 6789",
            "project": "Altura",
            "status": "connected",
            "budget": 950000,
            "unit": "1 bed",
            "summary": "Looking for investment property. Sent brochure."
        },
        {
            "name": "John Thompson",
            "email": "john.t@example.com",
            "phone": "+971 58 111 2222",
            "project": "Lumina Grand",
            "status": "Not connected",
            "budget": 1800000,
            "unit": "2 bed w study",
            "summary": "New lead from website."
        }
    ]

    for demo in demo_leads:
        leads.append(Lead(
            name=demo["name"],
            email=demo["email"],
            phone=demo["phone"],
            project_interest=demo["project"],
            budget=demo["budget"],
            status=demo["status"],
            last_contact_date=datetime.now().date(),
            unit_type=demo["unit"],
            last_conversation_summary=demo["summary"]
        ))
    # Lead.objects.bulk_create(leads)
    print(f"Attempting to save {len(leads)} leads...")
    for i, lead in enumerate(leads):
        try:
            lead.save()
            if i % 10 == 0:
                print(f"Saved lead {i}: {lead.name}")
        except Exception as e:
            print(f"Error saving lead {lead.name}: {e}")

    print(f"Created {len(leads)} leads.")
    
    # Create Campaign (Mock metrics based on data)
    campaign_metrics = Campaign(
        name="Excel Import Campaign",
        leads_shortlisted=len(leads),
        messages_sent=int(len(leads) * 0.8),
        responses_received=int(len(leads) * 0.3),
        goals_achieved=int(len(leads) * 0.1)
    )
    campaign_metrics.save()
    print("Created campaign metrics.")

    # Create CampaignConfig for conversations
    from api.models import CampaignConfig
    campaign_config = CampaignConfig.objects.create(
        name="Demo Campaign",
        target_project="Sobha Crest",
        channel="email",
        sales_offer="Exclusive payment plan"
    )

    # Inject Conversation History for Demo Personas
    from api.models import Conversation, SentMessage
    
    # Find Sarah Johnson
    sarah = Lead.objects.filter(name="Sarah Johnson").first()
    if sarah:
        # Create a SentMessage first
        sent_msg = SentMessage.objects.create(
            campaign=campaign_config,
            lead=sarah,
            message_content="Hi Sarah, I noticed you're interested in Sobha Crest. We have some exclusive units available. Would you like to see them?",
            channel="email"
        )
        
        # Add conversation history matching frames
        Conversation.objects.create(
            lead=sarah,
            sent_message=sent_msg,
            speaker='agent',
            message="Hi Sarah, I noticed you're interested in Sobha Crest. We have some exclusive units available. Would you like to see them?",
            timestamp=datetime.now() - pd.Timedelta(days=2)
        )
        Conversation.objects.create(
            lead=sarah,
            sent_message=sent_msg,
            speaker='lead',
            message="Yes, I am looking for a 2 bedroom apartment. What is the price range?",
            timestamp=datetime.now() - pd.Timedelta(days=2, hours=23)
        )
        Conversation.objects.create(
            lead=sarah,
            sent_message=sent_msg,
            speaker='agent',
            message="The 2 bedroom units start from AED 1.3M. We have a flexible payment plan available. Are you free for a viewing this week?",
            timestamp=datetime.now() - pd.Timedelta(days=1)
        )
        Conversation.objects.create(
            lead=sarah,
            sent_message=sent_msg,
            speaker='lead',
            message="That sounds good. I am free on Thursday afternoon.",
            timestamp=datetime.now() - pd.Timedelta(days=1, hours=23)
        )
        print("Injected conversation for Sarah Johnson.")

    print(f"Final Lead Count in DB: {Lead.objects.count()}")
    s = Lead.objects.filter(name="Sarah Johnson").first()
    if s:
        print(f"Sarah found in DB: {s.name}")
    else:
        print("Sarah NOT found in DB immediately after creation.")

if __name__ == "__main__":
    populate()
