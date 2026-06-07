# CloudWatch Sentinel

An AI-powered security log analyzer and incident response tool. Upload any AWS CloudWatch or server log file — the AI agent instantly parses it, flags security threats by severity, backs up the log to AWS S3, and renders an interactive threat dashboard.

**Live Demo:** https://cloudwatch-sentinel.vercel.app

---

## What it does

- Accepts .log, .txt, and .csv log files via drag and drop
- Uses an LLM agent (Llama 3.3 70B via Groq) to analyze logs for security threats
- Detects brute force attacks, privilege escalation, data exfiltration, unauthorized access, and more
- Classifies threats by severity: CRITICAL, HIGH, MEDIUM, LOW
- Backs up every uploaded log to AWS S3 with a timestamp
- Renders an interactive dashboard with a threat breakdown chart and detailed threat cards

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Agent | LangChain + Groq (Llama 3.3 70B) |
| Backend | Python, FastAPI, uvicorn |
| File Storage | AWS S3, boto3 |
| Frontend | React, Tailwind CSS, Recharts |
| Deployment | Railway (backend), Vercel (frontend) |

---

## Architecture
User uploads log file
↓
React Frontend (Vercel)
↓
FastAPI Backend (Railway)
↓
┌───────────────┐
│               │
Groq LLM       AWS S3
(threat analysis) (log backup)
│
↓
Threat dashboard rendered in React

---

## Running locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API key (free at console.groq.com)
- AWS account with S3 bucket and IAM access keys

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create a `.env` file in the backend folder:
GROQ_API_KEY=your-groq-key
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=ap-south-1

Then run:

```bash
python main.py
```

Backend runs on http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

## Project structure
cloudwatch-sentinel/
├── backend/
│   ├── main.py          # FastAPI server and endpoints
│   ├── analyzer.py      # LangChain LLM agent for log analysis
│   ├── s3_uploader.py   # AWS S3 backup logic
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main React component and dashboard
│   │   └── index.css    # Tailwind imports
│   └── package.json
└── README.md

---

## Environment variables

| Variable | Description |
|---|---|
| GROQ_API_KEY | Groq API key for LLM access |
| AWS_ACCESS_KEY_ID | AWS IAM access key |
| AWS_SECRET_ACCESS_KEY | AWS IAM secret key |
| AWS_BUCKET_NAME | S3 bucket name for log storage |
| AWS_REGION | AWS region (e.g. ap-south-1) |

---

## Author

Faara Ramsy
