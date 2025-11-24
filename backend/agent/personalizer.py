"""
Message Personalization Engine

Combines lead CRM data, brochure content, and campaign offer
to generate hyper-personalized outreach messages.
"""

from agent.rag import RAGSystem
import os

class MessagePersonalizer:
    def __init__(self):
        self.rag = RAGSystem()
    
    def generate_personalized_message(self, lead, campaign_config):
        """
        Generate a personalized message for a lead using CRM qualitative data
        """
        # Get project information from brochure
        project_name = campaign_config.target_project
        brochure_context = self.rag.query(f"What are the key features and amenities of {project_name}?")

        # Build personalization context with all qualitative fields
        lead_context = {
            'name': lead.name,
            'project_interest': lead.project_interest,
            'budget': lead.budget,
            'status': lead.status,
            'unit_type': getattr(lead, 'unit_type', ''),
            'last_contact': lead.last_contact_date.strftime('%B %Y') if lead.last_contact_date else 'recently',
            'last_conversation': getattr(lead, 'last_conversation_summary', ''),
            'purchase_motive': getattr(lead, 'purchase_motive', ''),
            'financing': getattr(lead, 'financing_option', '')
        }

        # Personalization based on past conversation
        personal_touch = ""
        if lead_context['last_conversation']:
            personal_touch = f"I remember from our last conversation that {lead_context['last_conversation'][:150]}... "

        # Unit type preference
        unit_mention = ""
        if lead_context['unit_type']:
            unit_mention = f"Based on your preference for {lead_context['unit_type']} units, "

        # Construct personalized message
        message = f"""Dear {lead_context['name']},

I hope this message finds you well! {personal_touch}

I noticed you were interested in {lead_context['project_interest']} back in {lead_context['last_contact']}.

{unit_mention}I wanted to reach out personally because we have an exciting new opportunity at {project_name} that matches your budget range of {lead_context['budget']}.

{brochure_context[:500]}...

"""

        # Add sales offer with urgency if provided
        if campaign_config.sales_offer:
            message += f"""
🎁 **EXCLUSIVE OFFER - LIMITED TIME**: {campaign_config.sales_offer}

⏰ This special offer is available for a limited period only. Don't miss this opportunity!

"""

        # Strong CTA with urgency
        message += f"""I'd love to schedule an exclusive property viewing for you. We have limited slots available this week, and properties at {project_name} are moving fast.

📞 Would you be available for a call tomorrow or the day after? Simply reply to this message with your preferred time.

Looking forward to helping you find your dream home!

Best regards,
Your Dedicated Real Estate Advisor
PropLens AI"""

        return message
