from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv
import os
import json



load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

def analyze_logs(log_text: str) -> dict:
    """
    Takes raw log text and returns structured threat analysis.

    Why a dict return type?
    Because we need structured data the frontend can render.
    A plain string would be useless for building a dashboard.
    """

    system_message = SystemMessage(content="""
You are a senior cybersecurity engineer and cloud infrastructure expert. Your task is to analyze AWS CloudWatch logs for potential security threats.
Your job is to analyze AWS CloudWatch and server log files for security threats,
anomalies, and critical system failures.

When analyzing logs, look for:
- Failed authentication attempts or brute force patterns
- Unauthorized access attempts
- Unusual IP addresses or geographic anomalies
- Critical errors or system failures
- Suspicious API calls or privilege escalations
- Rate limiting or DDoS attack patterns
- Data exfiltration attempts or large data transfers

You MUST respond with ONLY a JSON object. No explanation, no markdown, no backticks.
The JSON should have the following structure:
{
    "threats": [
        {
            "id": 1,
            "type": "threat category",
            "severity": "low/medium/high/critical",
            "description": "brief description of the threat",
            "evidence": "specific log entries or patterns that indicate this threat",
            "recommendation": "specific steps to investigate or mitigate this threat"
        }
    ],
    "threat_breakdown": {
        "CRITICAL": <number>,
        "HIGH": <number>,
        "MEDIUM": <number>,
        "LOW": <number>
    }
}
""")

    human_message = HumanMessage(content=f"""
Please analyze the following log file and identify all security threats,
anomalies, and critical issues:

--- LOG START ---
{log_text}
--- LOG END ---
""")

    response = llm.invoke([system_message, human_message])

    try:
        result = json.loads(response.content)
        return result
    except json.JSONDecodeError:
        return {
            "summary": "Analysis completed but response formatting failed",
            "risk_level": "UNKNOWN",
            "total_threats": 0,
            "threats": [],
            "threat_breakdown": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
            "raw_response": response.content
        }

