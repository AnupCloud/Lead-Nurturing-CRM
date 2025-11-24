import os
import sqlite3
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

class SQLSystem:
    def __init__(self):
        self.db_path = "./db.sqlite3"
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.schema = self._get_schema()

    def _get_schema(self):
        return """
        Table: api_lead
        Columns: id, name, email, phone, project_interest, budget, status, last_contact_date

        Status values: 'Connected', 'Not Connected', 'Visit Scheduled', 'visit scheduled',
                      'visit done not purchased', 'Purchased', 'purchased', 'Not Interested', 'Not interested'

        Project values: 'Altura', 'Beachgate by Address', 'Damac Bay by Cavalli', 'DLF WestPark',
                       'Godrej Vistas', 'Lumina Grand', 'Sobha Crest', 'Sobha Waves'
        """

    def generate_sql(self, question: str):
        # Simple keyword extraction for common queries
        question_lower = question.lower()

        # Check for project names
        projects = ['altura', 'beachgate', 'damac bay', 'dlf', 'godrej', 'lumina', 'sobha crest', 'sobha waves']
        project_filter = None
        for p in projects:
            if p in question_lower:
                project_filter = p
                break

        # Check for count queries
        if 'count' in question_lower or 'how many' in question_lower:
            if project_filter:
                return f"SELECT COUNT(*) as count FROM api_lead WHERE LOWER(project_interest) LIKE '%{project_filter}%'"
            return "SELECT COUNT(*) as count FROM api_lead"

        # Check for list/filter queries
        if project_filter:
            return f"SELECT * FROM api_lead WHERE LOWER(project_interest) LIKE '%{project_filter}%'"

        # Status filters
        statuses = {'connected': 'connected', 'scheduled': 'scheduled', 'purchased': 'purchased', 'not interested': 'not interested'}
        for s, v in statuses.items():
            if s in question_lower:
                return f"SELECT * FROM api_lead WHERE LOWER(status) LIKE '%{v}%'"

        # Budget filters
        import re
        budget_match = re.search(r'(under|below|less than)\s*(\d+)', question_lower)
        if budget_match:
            amount = int(budget_match.group(2))
            # Convert to millions if number is small (e.g., "under 1" means under 1 million)
            if amount < 100:
                amount = amount * 1000000
            return f"SELECT * FROM api_lead WHERE budget < {amount}"

        budget_match = re.search(r'(above|over|more than)\s*(\d+)', question_lower)
        if budget_match:
            amount = int(budget_match.group(2))
            if amount < 100:
                amount = amount * 1000000
            return f"SELECT * FROM api_lead WHERE budget > {amount}"

        return "SELECT * FROM api_lead LIMIT 10;"

    def execute_query(self, question: str):
        sql = self.generate_sql(question)
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(sql)
            results = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            conn.close()

            # Handle count queries
            if 'count' in columns:
                count = results[0][0] if results else 0
                return f"There are {count} leads matching your criteria."

            # Format response
            if not results:
                return f"No results found for: {question}"

            response = f"Found {len(results)} leads:\n\n"
            for row in results[:10]:  # Limit to 10 rows
                row_dict = dict(zip(columns, row))
                response += f"- {row_dict.get('name', 'Unknown')}: {row_dict.get('project_interest', '')} ({row_dict.get('status', '')})\n"

            if len(results) > 10:
                response += f"\n...and {len(results) - 10} more."

            return response
        except Exception as e:
            return f"Error executing query: {str(e)}"
