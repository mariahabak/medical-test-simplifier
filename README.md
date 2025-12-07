A web application that allows users to upload medical test reports (PDF or image).
The backend extracts and analyzes the text using the OpenAI API, then generates a simple, easy-to-understand explanation of the results.

🚀 Features

Upload PDFs or images of lab reports

Automatic text extraction (PDF reading + OCR)

AI-powered simplification using OpenAI

Friendly UI for non-technical users

Fast and secure backend using FastAPI

Modern frontend using Next.js + TailwindCSS

API key stored safely in .env (ignored by Git)

🏗️ Project Structure
medical-test-simplifier/
│
├── backend/
│   ├── main.py               # FastAPI backend logic
│   ├── requirements.txt
│   └── .env (ignored)
│
├── Frontend/
│   ├── app/                  # Next.js pages
│   ├── components/
│   ├── public/
│   ├── styles/
│   └── package.json
│
├── venv/                     # Python virtual environment
├── .gitignore
└── README.md

⚙️ Backend Setup (FastAPI)
1️⃣ Install dependencies
cd backend
pip install -r requirements.txt

2️⃣ Create your .env file

Inside backend/.env:

OPENAI_API_KEY=your_openai_key_here

3️⃣ Run the server
uvicorn main:app --reload --port 8000


Backend will start at:

👉 http://localhost:8000

With interactive docs at:

👉 http://localhost:8000/docs

🎨 Frontend Setup (Next.js)
Install and run:
cd Frontend
pnpm install    # or npm install
pnpm dev         # or npm run dev


Frontend will run at:

👉 http://localhost:3000

🔄 How It Works

User uploads a lab report (PDF or image)

Backend extracts text using:

pdfplumber for PDFs

OpenAI Vision for images

OpenAI is prompted to produce a simple explanation

Frontend displays the summary clearly and safely

🧪 Example Output
- Your red blood cell level is slightly low.
- Hemoglobin is below the usual range.
- Kidney and calcium results look normal.
- White blood cells are low, which may affect immunity.

🔐 Security Notes

.env files are NOT pushed to GitHub

API keys must remain private

GitHub secret scanning helps prevent accidental leaks

CORS is enabled for localhost development

⚠️ Disclaimer

This tool provides general explanations only.
It does not give medical advice or diagnoses.
Always consult a real healthcare professional for proper interpretation.

👩‍💻 Developer

Maria Habak
Project created for academic use.