from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
import operator

class AgentState(TypedDict):
    query: str
    intent: str
    response: str
    history: list

def router_node(state: AgentState):
    """Route query to SQL (database queries), RAG (property info), or Goal (scheduling)"""
    print("--- Router Node ---")
    query = state["query"].lower().strip()
    history = state.get("history", [])

    # Goal keywords - user wants to schedule viewing/call (conversion intent)
    goal_keywords = ["yes", "sure", "ok", "okay", "schedule", "book", "arrange",
                     "set up", "viewing", "visit", "call me", "contact me",
                     "interested", "i want to", "i'd like to", "please do", "go ahead"]

    # Check if this is a goal confirmation (short affirmative response or explicit scheduling)
    is_short_response = len(query.split()) <= 5
    has_goal_keyword = any(kw in query for kw in goal_keywords)

    # Check conversation history for context (was last message offering to schedule?)
    last_agent_msg = ""
    if history and len(history) > 0:
        for msg in reversed(history):
            if msg.get("role") == "agent":
                last_agent_msg = msg.get("content", "").lower()
                break

    scheduling_context = any(phrase in last_agent_msg for phrase in [
        "schedule", "viewing", "arrange", "call", "would you like", "shall i"
    ])

    # Check for booking/closing context first
    booking_context = "booking confirmed" in last_agent_msg or "anything else" in last_agent_msg

    # If user says "yes" after "anything else?" (post-booking) - they want to ask more questions
    if booking_context and query in ["yes", "yeah", "yep", "sure"]:
        return {"intent": "followup_prompt"}

    # Check for closing/negative responses after booking or conversation end
    closing_keywords = ["no", "nothing", "that's all", "thats all", "i'm good", "im good",
                       "no thanks", "thank you", "thanks", "nope", "all good", "that's it"]

    if any(kw in query for kw in closing_keywords):
        return {"intent": "closing"}

    # Check if user is providing contact details (phone number, time, email)
    import re
    has_phone = bool(re.search(r'\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', query))
    
    # Use regex for time to avoid partial matches (e.g. "am" in "campaign")
    time_pattern = r'\b(morning|afternoon|evening|night|am|pm|time)\b'
    has_time = bool(re.search(time_pattern, query, re.IGNORECASE))
    
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+', query))

    if has_phone or (has_time and scheduling_context) or has_email:
        return {"intent": "contact_capture"}

    # Route to goal if user confirms or explicitly asks for scheduling (but NOT in booking context)
    if has_goal_keyword and not booking_context and (is_short_response or scheduling_context or "schedule" in query or "arrange" in query):
        return {"intent": "goal"}

    # SQL keywords - queries about leads, campaigns, metrics, budget filters
    sql_keywords = ["list", "count", "how many", "show me", "leads", "campaigns",
                    "total", "number of", "statistics", "metrics", "database",
                    "budget", "under", "below", "above", "interested in purchasing"]

    # RAG keywords - queries about properties, amenities, features
    rag_keywords = ["amenities", "facilities", "features", "price", "location",
                    "bedroom", "bed", "floor plan", "brochure", "property",
                    "project", "what is", "tell me about", "describe", "compare"]

    sql_score = sum(1 for kw in sql_keywords if kw in query)
    rag_score = sum(1 for kw in rag_keywords if kw in query)

    if sql_score > rag_score:
        return {"intent": "sql"}
    else:
        return {"intent": "rag"}

from agent.sql import SQLSystem

sql_system = SQLSystem()

def sql_node(state: AgentState):
    print("--- SQL Node ---")
    query = state["query"]
    response = sql_system.execute_query(query)
    return {"response": response}

from agent.rag import RAGSystem

rag_system = RAGSystem()

def rag_node(state: AgentState):
    print("--- RAG Node ---")
    query = state["query"]
    history = state.get("history", [])
    response = rag_system.query(query, conversation_history=history)
    return {"response": response}

def goal_node(state: AgentState):
    """Handle goal completion - scheduling viewing/call"""
    print("--- Goal Node ---")
    query = state["query"].lower()
    history = state.get("history", [])

    # Check if we just sent the scheduling prompt to avoid repetition
    last_agent_msg = ""
    if history and len(history) > 0:
        for msg in reversed(history):
            if msg.get("role") == "agent":
                last_agent_msg = msg.get("content", "")
                break
    
    # If we already asked for details, just nudge gently
    if "Excellent! I'm delighted to help you" in last_agent_msg or "Which property" in last_agent_msg:
        return {"response": "I'm ready to help you schedule that! To proceed, I just need your **phone number** and **preferred time**."}

    # Determine type of goal
    if any(word in query for word in ["call", "contact", "phone"]):
        goal_type = "call"
    else:
        goal_type = "viewing"

    # First, ask which property they're interested in
    response = f"""Excellent! I'd be delighted to help you schedule a property {goal_type}.

Which property would you like to {goal_type == 'call' and 'learn more about' or 'visit'}?

🏠 **Our Available Properties:**
• **Altura** - Modern luxury living
• **Beachgate by Address** - Coastal elegance
• **Damac Bay by Cavalli** - Fashion meets real estate
• **DLF WestPark** - Premium development
• **Godrej Vistas** - Scenic views
• **Lumina Grand** - Grand living spaces
• **Sobha Crest** - Prestigious address
• **Sobha Waves** - Waterfront lifestyle

You can tell me the property name, or if you'd like to see multiple properties, just let me know!"""

    return {"response": response}

def contact_capture_node(state: AgentState):
    """Handle contact details capture and confirm booking"""
    print("--- Contact Capture Node ---")
    import re
    from datetime import datetime

    query = state["query"]

    # Extract phone number
    # Flexible phone regex to capture international formats
    phone_match = re.search(r'(\+?(?:[\d\-\.\s]\s*){10,})', query)
    phone = phone_match.group(1).strip() if phone_match else None

    # Extract time preference
    time_pref = None
    query_lower = query.lower()
    if "morning" in query_lower:
        time_pref = "Morning (9 AM - 12 PM)"
    elif "afternoon" in query_lower:
        time_pref = "Afternoon (12 PM - 5 PM)"
    elif "evening" in query_lower:
        time_pref = "Evening (5 PM - 8 PM)"

    # Extract email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', query)
    email = email_match.group(0) if email_match else None

    # Safeguard: If no details captured, ask for them instead of confirming
    if not phone and not time_pref and not email:
        response = """I'd love to help you schedule that! 
        
To proceed, could you please provide your **phone number** and **preferred time** for the call?

For example: "Call me at 0501234567 in the evening"."""
        return {"response": response}

    # Generate booking reference
    booking_ref = f"PL{datetime.now().strftime('%Y%m%d%H%M')}"

    # Build confirmation response
    response = f"""✅ **Booking Confirmed!**

Thank you for sharing your details. Your consultation has been scheduled successfully.

📋 **Booking Reference:** {booking_ref}

**Your Details:**
"""
    if phone:
        response += f"📞 Phone: {phone}\n"
    if email:
        response += f"📧 Email: {email}\n"
    if time_pref:
        response += f"🕐 Preferred Time: {time_pref}\n"

    response += f"""
**What happens next:**
1. Our sales consultant will call you within the next 24 hours during your preferred time slot
2. They will confirm the property viewing date and location
3. You'll receive a calendar invite with all the details

**Need to make changes?**
Just reply here or call us at +971-XXX-XXXX

We're excited to help you find your dream property! 🏠

Is there anything else you'd like to know about our properties before the call?"""

    return {"response": response}

def closing_node(state: AgentState):
    """Handle conversation closing gracefully"""
    print("--- Closing Node ---")

    response = """Perfect! Thank you for your interest in our properties.

**Quick Recap:**
✅ Your consultation has been scheduled
✅ Our team will contact you within 24 hours

If you have any questions before then, feel free to reach out anytime. We're here to help!

Have a wonderful day! 🌟

---
*PropLens AI - Your trusted real estate partner*"""

    return {"response": response}

def followup_prompt_node(state: AgentState):
    """Handle when user wants to ask more questions after booking"""
    print("--- Followup Prompt Node ---")

    response = """Of course! I'm happy to help with any questions you have.

What would you like to know? I can help with:

🏠 **Property Information**
• Amenities and facilities at any of our properties
• Floor plans and unit types
• Location and neighborhood details

💰 **Pricing & Payment**
• Starting prices and payment plans
• Special offers and promotions

📍 **Our Available Properties**
• Altura • Beachgate by Address • Damac Bay by Cavalli
• DLF WestPark • Godrej Vistas • Lumina Grand
• Sobha Crest • Sobha Waves

Just ask away!"""

    return {"response": response}

def build_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("router", router_node)
    workflow.add_node("sql_agent", sql_node)
    workflow.add_node("rag_agent", rag_node)
    workflow.add_node("goal_agent", goal_node)
    workflow.add_node("contact_agent", contact_capture_node)
    workflow.add_node("closing_agent", closing_node)
    workflow.add_node("followup_agent", followup_prompt_node)

    workflow.set_entry_point("router")

    def route_intent(state):
        intent = state["intent"]
        if intent == "sql":
            return "sql_agent"
        elif intent == "goal":
            return "goal_agent"
        elif intent == "contact_capture":
            return "contact_agent"
        elif intent == "closing":
            return "closing_agent"
        elif intent == "followup_prompt":
            return "followup_agent"
        else:
            return "rag_agent"

    workflow.add_conditional_edges("router", route_intent)

    workflow.add_edge("sql_agent", END)
    workflow.add_edge("rag_agent", END)
    workflow.add_edge("goal_agent", END)
    workflow.add_edge("contact_agent", END)
    workflow.add_edge("closing_agent", END)
    workflow.add_edge("followup_agent", END)

    return workflow.compile()
