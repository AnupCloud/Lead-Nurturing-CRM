from django.db import models

class Lead(models.Model):
    """Lead model representing potential customer"""
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    project_interest = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[('new', 'New'), ('contacted', 'Contacted'), ('qualified', 'Qualified'), ('not_interested', 'Not Interested')])
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    last_contact_date = models.DateField()
    unit_type = models.CharField(max_length=100, blank=True)  # Comma-separated values
    created_at = models.DateTimeField(auto_now_add=True)
    last_conversation_summary = models.TextField(blank=True)
    purchase_motive = models.TextField(blank=True)
    financing_option = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.project_interest}"

class CampaignConfig(models.Model):
    """Campaign configuration for lead nurturing"""
    name = models.CharField(max_length=200)
    target_project = models.CharField(max_length=100)
    channel = models.CharField(max_length=20, choices=[('email', 'Email'), ('whatsapp', 'WhatsApp')])
    sales_offer = models.TextField(blank=True)
    
    # Filter criteria (stored as JSON for flexibility)
    filter_criteria = models.JSONField(default=dict)
    
    # Campaign execution tracking
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('running', 'Running'),
            ('paused', 'Paused'),
            ('completed', 'Completed'),
        ],
        default='draft'
    )
    leads_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.name

class SentMessage(models.Model):
    """Track messages sent to leads"""
    campaign = models.ForeignKey(CampaignConfig, on_delete=models.CASCADE, related_name='sent_messages')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='received_messages')
    message_content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    channel = models.CharField(max_length=20)
    
    def __str__(self):
        return f"{self.campaign.name} -> {self.lead.name}"

class Conversation(models.Model):
    """Track conversation between AI agent and lead"""
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='conversations')
    sent_message = models.ForeignKey(SentMessage, on_delete=models.CASCADE, related_name='conversation_turns', null=True, blank=True)
    speaker = models.CharField(max_length=10, choices=[('agent', 'Agent'), ('lead', 'Lead')])
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    appointment_date = models.DateTimeField(null=True, blank=True)  # When goal achieved
    
    # Conversation state tracking
    conversation_state = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('waiting_response', 'Waiting for Response'),
            ('goal_achieved', 'Goal Achieved'),
            ('stopped', 'Stopped'),
        ],
        default='active'
    )
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.lead.name} - {self.speaker} - {self.timestamp}"

class ScheduledVisit(models.Model):
    """Track scheduled property visits/calls"""
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='scheduled_visits')
    campaign = models.ForeignKey(CampaignConfig, on_delete=models.CASCADE, related_name='scheduled_visits')
    appointment_date = models.DateTimeField()
    last_conversation_summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.lead.name} - {self.appointment_date}"

class Campaign(models.Model):
    name = models.CharField(max_length=100)
    leads_shortlisted = models.IntegerField(default=0)
    messages_sent = models.IntegerField(default=0)
    responses_received = models.IntegerField(default=0)
    goals_achieved = models.IntegerField(default=0)

class AIAgentSettings(models.Model):
    """AI Agent configuration settings"""
    followup_interval_days = models.IntegerField(default=3)
    max_followups = models.IntegerField(default=5)
    messaging_focus = models.CharField(max_length=100, default='Property Features & Benefits')
    response_style = models.CharField(max_length=100, default='Professional & Formal')
    urgency_level = models.CharField(max_length=100, default='Medium - Moderate urgency')
    custom_instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "AI Agent Settings"

    def __str__(self):
        return f"AI Agent Settings (Updated: {self.updated_at})"
