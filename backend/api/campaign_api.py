"""
Campaign Management API

Handles campaign creation, execution, and conversation tracking.
"""

from ninja import Router
from django.shortcuts import get_object_or_404
from django.utils import timezone
from api.models import CampaignConfig, Lead, SentMessage, Conversation
from api.schemas import Schema
from typing import List, Optional
from datetime import datetime
from agent.personalizer import MessagePersonalizer
from api.utils import map_ui_statuses_to_db, map_db_status_to_ui

router = Router()

# Schemas
class CampaignCreateSchema(Schema):
    name: str
    target_project: str
    channel: str
    sales_offer: Optional[str] = ""
    filter_criteria: dict

class CampaignResponseSchema(Schema):
    id: int
    name: str
    target_project: str
    leads_count: int
    messages_sent: int
    created_at: datetime

class LeadFilterSchema(Schema):
    project: Optional[str] = None
    status: Optional[str] = None
    budget_min: Optional[str] = None
    budget_max: Optional[str] = None
    unit_type: Optional[str] = None

class ConversationSchema(Schema):
    id: int
    lead_name: str
    lead_id: int
    speaker: str
    message: str
    timestamp: datetime

@router.post("/campaigns/create", response=CampaignResponseSchema)
def create_campaign(request, payload: CampaignCreateSchema):
    """Create a new campaign"""
    campaign = CampaignConfig.objects.create(
        name=payload.name,
        target_project=payload.target_project,
        channel=payload.channel,
        sales_offer=payload.sales_offer,
        filter_criteria=payload.filter_criteria
    )
    
    # Count leads matching filter criteria
    leads = _filter_leads(payload.filter_criteria)
    
    return {
        "id": campaign.id,
        "name": campaign.name,
        "target_project": campaign.target_project,
        "leads_count": leads.count(),
        "messages_sent": 0,
        "created_at": campaign.created_at
    }

@router.get("/campaigns/list")
def list_campaigns(request):
    """List all campaigns with lead counts"""
    campaigns = CampaignConfig.objects.all().order_by('-created_at')
    
    campaign_list = []
    for campaign in campaigns:
        # Count leads based on filter criteria
        leads = _filter_leads(campaign.filter_criteria)
        
        campaign_list.append({
            "id": campaign.id,
            "name": campaign.name,
            "target_project": campaign.target_project,
            "channel": campaign.channel,
            "status": campaign.status,
            "messages_sent": campaign.sent_messages.count(),
            "leads_count": campaign.leads_count if campaign.leads_count > 0 else leads.count(),
            "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
            "executed_at": campaign.executed_at.isoformat() if campaign.executed_at else None
        })
    
    return {"campaigns": campaign_list}

@router.get("/campaigns/dashboard")
def campaign_dashboard(request, campaign_id: int = None):
    """Get dashboard metrics for a specific campaign or overall"""
    # If no campaign_id, use the most recent campaign
    if campaign_id:
        campaign = get_object_or_404(CampaignConfig, id=campaign_id)
        campaigns = [campaign]
    else:
        campaigns = list(CampaignConfig.objects.all().order_by('-created_at'))
    
    # Calculate metrics across selected campaign(s)
    total_leads = 0
    total_messages = 0
    unique_responses = set()
    goals_achieved = 0
    
    for campaign in campaigns:
        # Leads shortlisted
        leads = _filter_leads(campaign.filter_criteria)
        total_leads += leads.count()
        
        # Messages sent
        total_messages += campaign.sent_messages.count()
        
        # Unique leads responded
        for msg in campaign.sent_messages.all():
            lead_convos = Conversation.objects.filter(lead=msg.lead, speaker='lead')
            if lead_convos.exists():
                unique_responses.add(msg.lead.id)
        
        # Goals achieved
        goals_achieved += campaign.scheduled_visits.count()
    
    # Get scheduled visits
    from api.models import ScheduledVisit
    scheduled_visits = ScheduledVisit.objects.all().select_related('lead', 'campaign').order_by('-appointment_date')[:10]
    
    visits_list = []
    for visit in scheduled_visits:
        visits_list.append({
            "lead_name": visit.lead.name,
            "email": visit.lead.email,
            "phone": visit.lead.phone,
            "project_interest": visit.lead.project_interest,  # Added project interest
            "campaign_name": visit.campaign.name,
            "appointment_date": visit.appointment_date.isoformat(),
            "last_conversation_summary": visit.last_conversation_summary or "N/A"
        })

    
    # Get all campaigns for dropdown
    all_campaigns = [{"id": c.id, "name": c.name} for c in CampaignConfig.objects.all().order_by('-created_at')]
    
    return {
        "campaigns": all_campaigns,
        "metrics": {
            "leads_shortlisted": total_leads,
            "messages_sent": total_messages,
            "unique_responses": len(unique_responses),
            "goals_achieved": goals_achieved
        },
        "scheduled_visits": visits_list
    }

@router.post("/campaigns/{campaign_id}/execute")
def execute_campaign(request, campaign_id: int):
    """Execute campaign - generate and send personalized messages"""
    campaign = get_object_or_404(CampaignConfig, id=campaign_id)
    
    # Check if campaign is already running
    if campaign.status == 'running':
        return {"status": "error", "message": "Campaign is already running"}
    
    # Get filtered leads
    leads = _filter_leads(campaign.filter_criteria)
    leads_list = list(leads)
    
    if not leads_list:
        return {"status": "error", "message": "No leads match the campaign criteria"}
    
    # Update campaign status to running
    campaign.status = 'running'
    campaign.leads_count = len(leads_list)
    campaign.executed_at = timezone.now()
    campaign.save()
    
    # Initialize personalizer
    personalizer = MessagePersonalizer()
    
    # Generate messages for each lead
    messages_sent = 0
    for lead in leads_list:  # Send to all matching leads
        try:
            message = personalizer.generate_personalized_message(lead, campaign)
            
            # Save sent message
            sent_msg = SentMessage.objects.create(
                campaign=campaign,
                lead=lead,
                message_content=message,
                channel=campaign.channel
            )
            
            # Create initial conversation entry
            Conversation.objects.create(
                lead=lead,
                sent_message=sent_msg,
                speaker='agent',
                message=message,
                conversation_state='waiting_response'
            )
            
            # In production, send via email/WhatsApp here
            print(f"[{campaign.channel.upper()} TO {lead.email}]\n{message}\n{'='*50}")
            
            messages_sent += 1
        except Exception as e:
            print(f"Error sending message to {lead.name}: {e}")
            continue
    
    return {
        "status": "success",
        "message": f"Campaign executed successfully. Sent {messages_sent} messages to {len(leads_list)} leads.",
        "messages_sent": messages_sent,
        "leads_reached": len(leads_list)
    }

@router.get("/leads/filter")
def filter_leads(request, project: str = None, status: str = None, statuses: str = None,
                budget_min: str = None, budget_max: str = None,
                date_from: str = None, date_to: str = None,
                unit_types: str = None):
    """Filter leads based on criteria"""
    filter_dict = {}
    if project and project != "All Projects":
        filter_dict['project'] = project

    # Handle both single status and multiple statuses (comma-separated)
    if statuses:  # Frontend sends 'statuses' (plural)
        ui_status_list = [s.strip() for s in statuses.split(',')]
        db_status_list = map_ui_statuses_to_db(ui_status_list)
        filter_dict['statuses'] = ','.join(db_status_list)
    elif status and status != "All Statuses":
        filter_dict['status'] = status

    if budget_min:
        filter_dict['budget_min'] = budget_min
    if budget_max:
        filter_dict['budget_max'] = budget_max
    if date_from:
        filter_dict['date_from'] = date_from
    if date_to:
        filter_dict['date_to'] = date_to
    if unit_types:
        filter_dict['unit_types'] = unit_types

    leads = _filter_leads(filter_dict)

    # Map database status back to UI labels for response
    leads_data = []
    for lead in leads[:50]:
        lead_dict = {
            'id': lead.id,
            'name': lead.name,
            'project_interest': lead.project_interest,
            'status': map_db_status_to_ui(lead.status),
            'budget': str(lead.budget),
            'unit_type': lead.unit_type,
            'last_contact_date': lead.last_contact_date.isoformat() if lead.last_contact_date else None
        }
        leads_data.append(lead_dict)

    return {
        "count": leads.count(),
        "leads": leads_data
    }

@router.get("/campaigns/{campaign_id}/conversations", response=List[ConversationSchema])
def get_conversations(request, campaign_id: int):
    """Get all conversations for a campaign"""
    campaign = get_object_or_404(CampaignConfig, id=campaign_id)
    
    conversations = Conversation.objects.filter(
        sent_message__campaign=campaign
    ).select_related('lead')
    
    return [
        {
            "id": conv.id,
            "lead_name": conv.lead.name,
            "lead_id": conv.lead.id,
            "speaker": conv.speaker,
            "message": conv.message,
            "timestamp": conv.timestamp
        }
        for conv in conversations
    ]

@router.post("/conversations/{lead_id}/reply")
def add_lead_reply(request, lead_id: int, message: str):
    """Add a lead's reply and generate agent response"""
    lead = get_object_or_404(Lead, id=lead_id)
    
    # Save lead's message
    lead_conv = Conversation.objects.create(
        lead=lead,
        speaker='lead',
        message=message
    )
    
    # Detect goal achievement (keywords: call, meeting, visit, schedule)
    goal_keywords = ['call', 'meeting', 'visit', 'schedule', 'appointment', 'interested', 'yes', 'book', 'viewing']
    goal_achieved = any(keyword in message.lower() for keyword in goal_keywords)
    
    # Extract appointment info if goal achieved
    appointment_date = None
    if goal_achieved:
        # Try to extract date (simplified - in production use NLP)
        import re
        from datetime import datetime, timedelta
        
        # Look for common date patterns
        date_patterns = ['tomorrow', 'next week', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        found_date = None
        
        for pattern in date_patterns:
            if pattern in message.lower():
                if pattern == 'tomorrow':
                    found_date = datetime.now() + timedelta(days=1)
                elif pattern == 'next week':
                    found_date = datetime.now() + timedelta(days=7)
                else:
                    found_date = datetime.now() + timedelta(days=3)  # Default 3 days
                break
        
        if not found_date:
            found_date = datetime.now() + timedelta(days=3)  # Default
        
        appointment_date = found_date
        lead_conv.appointment_date = found_date
        lead_conv.save()
    
    # Generate agent response using RAG with urgency
    from agent.rag import RAGSystem
    rag = RAGSystem()

    # Build context-aware query
    context_query = f"Project: {lead.project_interest}. Customer question: {message}"
    rag_response = rag.query(context_query)

    # Add urgency to response
    if goal_achieved:
        response = f"""Thank you for your interest! I'm excited to help you explore {lead.project_interest}.

{rag_response[:400]}

I've noted your preferred appointment time. Our sales advisor will contact you shortly to confirm the viewing.

⏰ Please note: We have limited viewing slots available, and properties are selling fast. Looking forward to showing you your future home!"""
    else:
        response = f"""{rag_response[:500]}

If this information is helpful, I'd be happy to arrange an exclusive property viewing for you. We have special offers available for a limited time only!

Would you like to schedule a visit this week?"""

    # Save agent response
    agent_conv = Conversation.objects.create(
        lead=lead,
        speaker='agent',
        message=response
    )

    # Create scheduled visit if goal achieved
    if goal_achieved and appointment_date:
        from api.models import ScheduledVisit

        # Get most recent campaign for this lead
        recent_message = SentMessage.objects.filter(lead=lead).order_by('-sent_at').first()
        if recent_message:
            # Generate better conversation summary
            recent_convos = Conversation.objects.filter(lead=lead).order_by('-timestamp')[:5]
            # Create a readable summary
            summary_parts = []
            for c in reversed(list(recent_convos)):
                prefix = "Customer" if c.speaker == "lead" else "Agent"
                summary_parts.append(f"{prefix}: {c.message[:80]}...")
            summary = f"Interested in {lead.project_interest}, budget {lead.budget}. " + " → ".join(summary_parts[-3:])
            
            ScheduledVisit.objects.create(
                lead=lead,
                campaign=recent_message.campaign,
                appointment_date=appointment_date,
                last_conversation_summary=summary
            )
    
    # Send notification if goal achieved
    if goal_achieved:
        from django.core.mail import send_mail
        send_mail(
            subject=f'🎯 Lead Conversion Alert: {lead.name}',
            message=f'Lead {lead.name} has shown interest in scheduling a call/meeting!\n\nLead Details:\n- Project: {lead.project_interest}\n- Budget: {lead.budget}\n- Last Message: {message}\n\nAppointment: {appointment_date.strftime("%Y-%m-%d %H:%M") if appointment_date else "TBD"}\n\nPlease follow up immediately.',
            from_email='noreply@proplens.ai',
            recipient_list=['sales@proplens.ai'],
            fail_silently=True,
        )
    
    return {
        "status": "success",
        "agent_response": response,
        "goal_achieved": goal_achieved,
        "appointment_date": appointment_date.isoformat() if appointment_date else None
    }

@router.post("/conversations/{lead_id}/mark-goal")
def mark_goal_achieved(request, lead_id: int, appointment_date: str = None):
    """Manually mark a conversation as goal achieved"""
    from datetime import datetime, timedelta
    from api.models import ScheduledVisit

    lead = get_object_or_404(Lead, id=lead_id)

    # Parse appointment date or default to 3 days from now
    if appointment_date:
        try:
            parsed_date = datetime.fromisoformat(appointment_date.replace('Z', '+00:00'))
        except ValueError:
            parsed_date = datetime.now() + timedelta(days=3)
    else:
        parsed_date = datetime.now() + timedelta(days=3)

    # Update Lead Status
    lead.status = 'Visit scheduled'
    lead.save()

    # Get the most recent conversation for this lead
    recent_conv = Conversation.objects.filter(lead=lead).order_by('-timestamp').first()
    if recent_conv:
        recent_conv.appointment_date = parsed_date
        recent_conv.save()

    # Get most recent campaign for this lead
    recent_message = SentMessage.objects.filter(lead=lead).order_by('-sent_at').first()

    if recent_message:
        # Generate conversation summary
        recent_convos = Conversation.objects.filter(lead=lead).order_by('-timestamp')[:5]
        summary_parts = []
        for c in reversed(list(recent_convos)):
            prefix = "Customer" if c.speaker == "lead" else "Agent"
            summary_parts.append(f"{prefix}: {c.message[:80]}...")
        summary = f"Interested in {lead.project_interest}, budget {lead.budget}. " + " → ".join(summary_parts[-3:])

        # Create or update scheduled visit
        visit, created = ScheduledVisit.objects.get_or_create(
            lead=lead,
            campaign=recent_message.campaign,
            defaults={
                'appointment_date': parsed_date,
                'last_conversation_summary': summary
            }
        )

        if not created:
            visit.appointment_date = parsed_date
            visit.last_conversation_summary = summary
            visit.save()

        # Send notification email
        from django.core.mail import send_mail
        send_mail(
            subject=f'🎯 Manual Goal Achievement: {lead.name}',
            message=f'Lead {lead.name} has been manually marked as goal achieved!\n\nLead Details:\n- Project: {lead.project_interest}\n- Budget: {lead.budget}\n\nAppointment: {parsed_date.strftime("%Y-%m-%d %H:%M")}\n\nPlease follow up immediately.',
            from_email='noreply@proplens.ai',
            recipient_list=['sales@proplens.ai'],
            fail_silently=True,
        )

        return {
            "status": "success",
            "message": "Goal marked as achieved",
            "appointment_date": parsed_date.isoformat()
        }

    return {"status": "error", "message": "No campaign found for this lead"}

@router.post("/conversations/{lead_id}/send-followup")
def send_manual_followup(request, lead_id: int):
    """Send a manual follow-up message to a lead"""
    lead = get_object_or_404(Lead, id=lead_id)

    # Get most recent campaign for this lead
    recent_message = SentMessage.objects.filter(lead=lead).order_by('-sent_at').first()

    if not recent_message:
        return {"status": "error", "message": "No campaign found for this lead"}

    # Generate follow-up message using RAG
    from agent.rag import RAGSystem
    from agent.personalizer import MessagePersonalizer

    rag = RAGSystem()
    personalizer = MessagePersonalizer()

    # Get conversation history
    recent_convos = Conversation.objects.filter(lead=lead).order_by('-timestamp')[:3]
    conversation_context = "\n".join([f"{c.speaker}: {c.message[:200]}" for c in reversed(list(recent_convos))])

    # Generate context-aware follow-up
    context_query = f"Project: {lead.project_interest}. Following up with customer. Previous conversation: {conversation_context}"
    rag_response = rag.query(context_query)

    # Create personalized follow-up message
    followup_message = f"""Hi {lead.name},

I wanted to follow up on our previous conversation about {lead.project_interest}.

{rag_response[:400]}

We have exclusive viewing slots available this week. Would you like to schedule a visit to see the property?

Looking forward to hearing from you!"""

    # Save the follow-up message as a conversation
    Conversation.objects.create(
        lead=lead,
        sent_message=recent_message,
        speaker='agent',
        message=followup_message
    )

    # In production, actually send the message via email/WhatsApp
    print(f"[FOLLOW-UP TO {lead.email}]\n{followup_message}\n{'='*50}")

    return {
        "status": "success",
        "message": "Follow-up sent successfully",
        "followup_content": followup_message
    }

def _filter_leads(criteria: dict):
    """Helper to filter leads based on criteria dict"""
    from datetime import datetime
    from django.db.models import Q
    queryset = Lead.objects.all()

    if 'project' in criteria and criteria['project']:
        queryset = queryset.filter(project_interest__icontains=criteria['project'])

    # Handle multiple statuses (plural)
    if 'statuses' in criteria and criteria['statuses']:
        statuses_list = [s.strip() for s in criteria['statuses'].split(',')]
        queryset = queryset.filter(status__in=statuses_list)
    # Handle single status (backward compatibility)
    elif 'status' in criteria and criteria['status']:
        queryset = queryset.filter(status__iexact=criteria['status'])

    if 'budget_min' in criteria and criteria['budget_min']:
        # Simplified budget filtering
        queryset = queryset.filter(budget__gte=criteria['budget_min'])

    if 'budget_max' in criteria and criteria['budget_max']:
        queryset = queryset.filter(budget__lte=criteria['budget_max'])

    # Date range filtering
    if 'date_from' in criteria and criteria['date_from']:
        queryset = queryset.filter(last_contact_date__gte=criteria['date_from'])

    if 'date_to' in criteria and criteria['date_to']:
        queryset = queryset.filter(last_contact_date__lte=criteria['date_to'])

    # Unit type filtering (comma-separated values in unit_type field)
    if 'unit_types' in criteria and criteria['unit_types']:
        # unit_types is comma-separated string like "1 bed,2 bed"
        types_list = [t.strip() for t in criteria['unit_types'].split(',')]
        q_objects = Q()
        for unit in types_list:
            q_objects |= Q(unit_type__icontains=unit)
        queryset = queryset.filter(q_objects)

    return queryset


# Pydantic schemas for request bodies
class MarkGoalRequest(Schema):
    lead_id: int

class SendFollowupRequest(Schema):
    lead_id: int
    message: str

# New endpoints for AI Agent Follow-ups functionality  
@router.post("/campaigns/{campaign_id}/mark_goal")
def mark_campaign_goal(request, campaign_id: int, payload: MarkGoalRequest):
    """Mark a lead conversation as goal achieved for a campaign"""
    from datetime import datetime, timedelta
    from api.models import ScheduledVisit
    
    campaign = get_object_or_404(CampaignConfig, id=campaign_id)
    lead = get_object_or_404(Lead, id=payload.lead_id)
    
    # Update Lead Status
    lead.status = 'Visit scheduled'
    lead.save()
    
    # Create scheduled visit with appointment_date (3 days from now)
    appointment_date = datetime.now() + timedelta(days=3)
    ScheduledVisit.objects.create(
        lead=lead,
        campaign=campaign,
        appointment_date=appointment_date
    )
    
    return {
        "status": "success",
        "message": "Goal marked as achieved",
        "appointment_date": appointment_date.isoformat()
    }


@router.post("/campaigns/{campaign_id}/send_followup")
def send_campaign_followup(request, campaign_id: int, payload: SendFollowupRequest):
    """Send a follow-up message to a lead in a campaign"""
    from django.utils import timezone
    
    campaign = get_object_or_404(CampaignConfig, id=campaign_id)
    lead = get_object_or_404(Lead, id=payload.lead_id)
    
    # Create SentMessage record (no 'message' field, it's stored in Conversation)
    sent_msg = SentMessage.objects.create(
        campaign=campaign,
        lead=lead,
        channel=campaign.channel
    )
    
    # Create conversation entry with the actual message
    Conversation.objects.create(
        lead=lead,
        sent_message=sent_msg,
        speaker='agent',
        message=payload.message
    )
    
    # In production, send via email/WhatsApp here
    print(f"[FOLLOW-UP to {lead.email}]\\n{payload.message}\\n{'='*50}")
    
    return {
        "status": "success",
        "message": "Follow-up sent successfully"
    }
