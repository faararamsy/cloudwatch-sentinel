from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from analyzer import analyze_logs
from S3_uploader import upload_log_to_s3
import uvicorn



app = FastAPI(
    title="CloudWatch Sentinel",
    description="AI-Powered Security Log Analyzer",
    version="1.0.0"
)

# CORS (Cross Origin Resource Sharing) is a browser security rule.
# By default, browsers block requests between different origins.
# Our React frontend runs on localhost:3000
# Our FastAPI backend runs on localhost:8000
# Without CORS, the browser would block the frontend from talking to the backend.
# This middleware tells the browser "yes, these two are allowed to talk."

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Endpoint is  a URL the frontend can send requests to.
# This one is a GET request to "/" — just to confirm the server is running.


@app.get("/")
def root():
    return {"status": "CloudWatch Sentinel is running"}

# What is a POST request?
# GET requests fetch data. POST requests send data.
# We use POST here because the frontend is sending us a file.
# You can't send a file with a GET request.



@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    
    # Validate file type
    # We only accept .log and .txt files
    # If someone uploads a .exe or .pdf we reject it immediately

    if not file.filename.endswith((".log", ".txt", ".csv")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a .log, .txt, or .csv file"
        )
    
    # Read the file contents
    # file.read() gives us the raw bytes
    # .decode("utf-8") converts bytes to a string the LLM can read

    try:
        contents = await file.read()
        log_text = contents.decode("utf-8")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read file. Make sure it is a valid text file."
        )
    
    # Check file isn't empty
    if not log_text.strip():
        raise HTTPException(
            status_code=400,
            detail="File is empty. Please upload a log file with content."
        )
    
        # Upload to S3 first — we back up before analyzing
    # Why before? If analysis fails, we still have the log saved.
    s3_result = upload_log_to_s3(contents, file.filename)

    # Send to our AI analyzer
    # This is the function we built in analyzer.py
    try:
        result = analyze_logs(log_text)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
    
    # Return the result
    # FastAPI automatically converts this dict to JSON
    return {
        "filename": file.filename,
        "analysis": result,
        "backup": s3_result,
    }

# This only runs if you execute main.py directly
# uvicorn is the server that actually runs FastAPI
# host="0.0.0.0" means accept connections from anywhere
# port=8000 is the port number
# reload=True means the server restarts automatically when you save changes

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)