import boto3
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# What is boto3?
# It's Amazon's official Python library for talking to AWS services.
# Without it, we'd have to write raw HTTP requests with complex
# AWS signature authentication. boto3 handles all of that for us.

# What is a client?
# It's the connection object to a specific AWS service.
# Think of it as opening a phone line to S3 specifically.

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

def upload_log_to_s3(file_content: bytes, original_filename: str) -> dict:
    """
    Uploads a log file to S3 and returns the file details.
    
    Why do we add a timestamp to the filename?
    If someone uploads two files with the same name,
    the second would overwrite the first without a timestamp.
    This keeps every upload unique.
    """

    # Generate a unique filename with timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    s3_key = f"logs/{timestamp}_{original_filename}"

    # What is put_object?
    # It's the boto3 method that uploads a file to S3.
    # "Key" is the file path inside the bucket.
    # "Body" is the actual file content in bytes.

    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType="text/plain",
            Metadata={
                "original_filename": original_filename,
                "uploaded_at": timestamp
            }
        )

        return {
            "success": True,
            "s3_key": s3_key,
            "bucket": BUCKET_NAME,
            "region": os.getenv("AWS_REGION"),
            "uploaded_at": timestamp
        }

    except Exception as e:
        # If S3 upload fails, we don't want to crash the whole analysis
        # We just return a failure message and continue
        return {
            "success": False,
            "error": str(e)
        }