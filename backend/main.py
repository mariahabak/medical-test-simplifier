import os
import io
import base64
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import pdfplumber
from openai import OpenAI

# Load Environment Variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing. Add it to your .env file.")

client = OpenAI(api_key=OPENAI_API_KEY)

# FastAPI Setup

app = FastAPI(
    title="Medical Test Simplifier",
    description="Uploads medical PDFs/images and returns an easy explanation.",
    version="1.0",
)

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Response Model
class SimplifyResponse(BaseModel):
    summary: str
    source_type: str


# Helper: Extract PDF Text

def extract_pdf_text(file_bytes: bytes) -> str:
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = "\n\n".join([page.extract_text() or "" for page in pdf.pages])
        return text.strip()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read PDF. Make sure the file is not scanned or blurry."
        )



# Helper: Call OpenAI for Text Input
def summarize_text(raw_text: str) -> str:
    instructions = (
        "You explain lab results in very simple, friendly language. "
        "Avoid medical jargon. Keep sentences short and easy to understand. "
        "Do NOT give medical advice, diagnosis, or treatment. "
        "Only explain what is high, low, or normal in a calm way. "
        "End with: 'This is only a general explanation. Please talk to a doctor for real medical interpretation.'"
    )

    prompt = (
        "Here is text from a lab report.\n"
        "Extract the important values and describe them in easy, everyday language. "
        "Do not diagnose anything.\n\n"
        f"LAB REPORT TEXT:\n{raw_text}"
    )

    response = client.responses.create(
        model="gpt-4.1-mini",
        instructions=instructions,
        input=[{
            "role": "user",
            "content": [
                {"type": "input_text", "text": prompt}
            ]
        }]
    )

    return response.output_text



# Helper: Call OpenAI for Image Input
def summarize_image(b64_image: str, mime_type: str) -> str:
    instructions = (
        "You explain lab results from images in simple, friendly language. "
        "Avoid jargon. Keep sentences short. Do NOT give medical advice or diagnosis. "
        "End with: 'This is only a general explanation. Please talk to a doctor for real medical interpretation.'"
    )

    prompt = (
        "This is an image of a medical lab report. "
        "Read the values and explain them in short, simple sentences that anyone can understand. "
        "Do not diagnose anything."
    )

    data_url = f"data:{mime_type};base64,{b64_image}"

    response = client.responses.create(
        model="gpt-4.1-mini",
        instructions=instructions,
        input=[{
            "role": "user",
            "content": [
                {"type": "input_text", "text": prompt},
                {"type": "input_image", "image_url": data_url}
            ]
        }]
    )

    return response.output_text


# Main API Route

@app.post("/api/simplify", response_model=SimplifyResponse)
async def simplify(file: UploadFile = File(...)):
    filename = file.filename.lower()
    content_type = file.content_type or ""

    # Read file bytes
    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # PDF 
    if filename.endswith(".pdf") or "pdf" in content_type:
        text = extract_pdf_text(file_bytes)
        if not text:
            raise HTTPException(
                status_code=400,
                detail="No readable text found in PDF."
            )
        summary = summarize_text(text)
        return SimplifyResponse(summary=summary, source_type="pdf")

    # Image 
    elif content_type.startswith("image/"):
        b64_image = base64.b64encode(file_bytes).decode("utf-8")
        summary = summarize_image(b64_image, content_type)
        return SimplifyResponse(summary=summary, source_type="image")

    # Unsupported File 
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a PDF or image file."
        )
