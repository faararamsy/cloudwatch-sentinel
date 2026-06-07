from analyzer import analyze_logs
import json

# A fake but realistic looking CloudWatch log for testing
sample_log = """
2024-01-15 08:23:11 ERROR Failed login attempt for user admin from IP 192.168.1.105
2024-01-15 08:23:12 ERROR Failed login attempt for user admin from IP 192.168.1.105
2024-01-15 08:23:13 ERROR Failed login attempt for user admin from IP 192.168.1.105
2024-01-15 08:23:14 ERROR Failed login attempt for user admin from IP 192.168.1.105
2024-01-15 08:23:15 ERROR Failed login attempt for user admin from IP 192.168.1.105
2024-01-15 08:25:00 INFO Successful login for user admin from IP 192.168.1.105
2024-01-15 08:25:45 WARNING IAM role escalation detected for user admin
2024-01-15 08:26:10 INFO S3 bucket policy modified: made public - bucket: company-secrets-prod
2024-01-15 09:15:00 ERROR Database connection timeout - retrying
2024-01-15 09:45:22 WARNING Unusual data transfer volume detected: 45GB outbound
2024-01-15 10:00:01 INFO EC2 instance i-0abc123 terminated by user root
"""

print("Sending log to AI for analysis...")
print("=" * 50)

result = analyze_logs(sample_log)

print(json.dumps(result, indent=2))