from pypdf import PdfReader
import os

def read_pdf(filename):
    print(f"\n--- Reading {filename} ---")
    try:
        reader = PdfReader(filename)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        print(text)
    except Exception as e:
        print(f"Error reading {filename}: {e}")

if __name__ == "__main__":
    read_pdf("Sales Lead nurturing with CRM Data.pdf")
    read_pdf("Technical Requrements.pdf")
