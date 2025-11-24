"""
Utility functions and constants for the API
"""

# Status mapping between UI labels and database values
# The database has values from Excel with mixed capitalization
# We need to normalize them for consistent UI display
UI_TO_DB_STATUS = {
    'Not Connected': 'Not connected',
    'Connected': 'connected',
    'Visit scheduled': 'visit scheduled',
    'Visit done not purchased': 'visit done not purchased',
    'Purchased': 'purchased',
    'Not interested': 'Not interested'
}

DB_TO_UI_STATUS = {
    'Not connected': 'Not Connected',
    'connected': 'Connected',
    'visit scheduled': 'Visit scheduled',
    'visit done not purchased': 'Visit done not purchased',
    'purchased': 'Purchased',
    'Not interested': 'Not interested'
}

def map_ui_status_to_db(ui_status: str) -> str:
    """Convert UI status label to database value"""
    return UI_TO_DB_STATUS.get(ui_status, ui_status)

def map_db_status_to_ui(db_status: str) -> str:
    """Convert database status value to UI label"""
    return DB_TO_UI_STATUS.get(db_status, db_status)

def map_ui_statuses_to_db(ui_statuses: list) -> list:
    """Convert list of UI status labels to database values"""
    return [map_ui_status_to_db(status) for status in ui_statuses]
