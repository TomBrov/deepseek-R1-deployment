import boto3
import json
import os

# Fetch region and SageMaker endpoint name from environment variables
region = os.getenv("AWS_REGION")
endpoint_name = os.getenv("SAGEMAKER_ENDPOINT_NAME")

if not region:
    print("❌ Error: AWS region is missing.")
    exit(1)

if not endpoint_name:
    print("❌ Error: SageMaker endpoint name is missing.")
    exit(1)

# Initialize the SageMaker runtime client
runtime = boto3.client("sagemaker-runtime", region_name=region)

# Define a test input payload
payload = {"inputs": "What is the meaning of life?"}

print(f"📝 Testing SageMaker Endpoint: {endpoint_name} in region {region}...")

try:
    # Invoke the SageMaker endpoint
    response = runtime.invoke_endpoint(
        EndpointName=endpoint_name,
        ContentType="application/json",
        Body=json.dumps(payload)
    )

    # Parse and print the response
    result = json.loads(response["Body"].read().decode())
    print("✅ Response:", result)
except Exception as e:
    print("❌ SageMaker inference failed:", str(e))
    exit(1)
