# 🚀 Deploy DeepSeek R1 on Amazon SageMaker with AWS CDK

This module provides an **AWS CDK (TypeScript) solution** to deploy **DeepSeek R1 models** on **Amazon SageMaker** using **Hugging Face TGI (Text Generation Inference) or AWS LMI (Large Model Inference) containers**.

## 📌 Features
- ✅ **Dynamic Model Selection** – Choose from supported **DeepSeek R1 models**.
- ✅ **Flexible Inference Container** – Deploy using either **Hugging Face TGI** or **AWS LMI**.
- ✅ **Configurable Instance Type** – Select different GPU instance types dynamically.
- ✅ **Fully Automated Deployment** – Uses **AWS CDK** for infrastructure provisioning.
- ✅ **Easy Model Invocation** – Test the endpoint using **AWS SDK (Boto3) or AWS CLI**.

## 🛠️ Installation
### **1️⃣ Install AWS CDK & Dependencies**
```sh
npm install -g aws-cdk
cdk bootstrap
npm install
```

### **2️⃣ Deploy a Model to SageMaker**
You can deploy a model dynamically by selecting:
- **Container Type:** `tgi` (Hugging Face TGI) or `lmi` (AWS LMI)
- **Instance Type:** GPU instance for inference
- **Model Name:** Short model identifier (e.g., `Qwen-7B`)

#### **Example Deployment**
```sh
cdk deploy -c containerType=tgi -c instanceType=ml.g5.2xlarge -c modelName=Qwen-7B
```

## 🎯 Testing the SageMaker Endpoint
### **Using AWS CLI**
```sh
aws sagemaker-runtime invoke-endpoint \
    --endpoint-name deepseek-r1-distill-qwen-7b-ep \
    --content-type "application/json" \
    --body '{"inputs": "Hello, AI!"}' \
    output.json && cat output.json
```

## 📜 Supported Models
| Short Name  | Full Model Name  |
|-------------|------------------|
| Qwen-1.5B  | DeepSeek-R1-Distill-Qwen-1.5B  |
| Qwen-7B    | DeepSeek-R1-Distill-Qwen-7B    |
| Llama-8B   | DeepSeek-R1-Distill-Llama-8B   |
| Qwen-14B   | DeepSeek-R1-Distill-Qwen-14B   |
| Qwen-32B   | DeepSeek-R1-Distill-Qwen-32B   |
| Llama-70B  | DeepSeek-R1-Distill-Llama-70B  |
