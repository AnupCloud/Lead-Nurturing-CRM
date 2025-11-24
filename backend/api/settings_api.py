from ninja import Router
from ninja import Schema
from typing import Optional
import json
import os
from api.models import AIAgentSettings

settings_router = Router()

SETTINGS_FILE = "data/user_settings.json"

class UserSettingsSchema(Schema):
    name: str = ""
    email: str = ""
    notification_email: str = ""
    email_notifications: bool = True
    goal_alerts: bool = True

def get_settings_file():
    os.makedirs("data", exist_ok=True)
    return SETTINGS_FILE

@settings_router.get("/settings")
def get_settings(request):
    """Get user settings"""
    settings_file = get_settings_file()

    if os.path.exists(settings_file):
        with open(settings_file, 'r') as f:
            return json.load(f)

    # Return defaults
    return {
        "name": "",
        "email": "",
        "notification_email": "sales@proplens.ai",
        "email_notifications": True,
        "goal_alerts": True
    }

@settings_router.post("/settings")
def save_settings(request, payload: UserSettingsSchema):
    """Save user settings"""
    settings_file = get_settings_file()

    settings = {
        "name": payload.name,
        "email": payload.email,
        "notification_email": payload.notification_email,
        "email_notifications": payload.email_notifications,
        "goal_alerts": payload.goal_alerts
    }

    with open(settings_file, 'w') as f:
        json.dump(settings, f, indent=2)

    return {"status": "success", "message": "Settings saved"}

# AI Agent Settings
class AIAgentSettingsSchema(Schema):
    followup_interval_days: int = 3
    max_followups: int = 5
    messaging_focus: str = 'Property Features & Benefits'
    response_style: str = 'Professional & Formal'
    urgency_level: str = 'Medium - Moderate urgency'
    custom_instructions: str = ''

@settings_router.get("/agent-settings")
def get_agent_settings(request):
    """Get AI Agent settings"""
    # Get or create single settings instance
    settings, created = AIAgentSettings.objects.get_or_create(
        pk=1,  # Always use ID 1 for singleton settings
        defaults={
            'followup_interval_days': 3,
            'max_followups': 5,
            'messaging_focus': 'Property Features & Benefits',
            'response_style': 'Professional & Formal',
            'urgency_level': 'Medium - Moderate urgency',
            'custom_instructions': ''
        }
    )

    return {
        "followup_interval_days": settings.followup_interval_days,
        "max_followups": settings.max_followups,
        "messaging_focus": settings.messaging_focus,
        "response_style": settings.response_style,
        "urgency_level": settings.urgency_level,
        "custom_instructions": settings.custom_instructions
    }

@settings_router.post("/agent-settings")
def save_agent_settings(request, payload: AIAgentSettingsSchema):
    """Save AI Agent settings"""
    # Update or create singleton settings
    settings, created = AIAgentSettings.objects.get_or_create(pk=1)

    settings.followup_interval_days = payload.followup_interval_days
    settings.max_followups = payload.max_followups
    settings.messaging_focus = payload.messaging_focus
    settings.response_style = payload.response_style
    settings.urgency_level = payload.urgency_level
    settings.custom_instructions = payload.custom_instructions
    settings.save()

    return {"status": "success", "message": "AI Agent settings saved"}
