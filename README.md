# 🚀 Deploy DeepSeek R1 on Amazon SageMaker with AWS CDK

This module provides an AWS CDK (TypeScript) solution to deploy DeepSeek R1 models on Amazon SageMaker using Hugging Face TGI (Text Generation Inference) or AWS LMI (Large Model Inference) containers.

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

### How to test the Endpoint and Model?
```sh
python3 -m venv venv
source venv/bin/activate
pip install -r test/requirements.txt
python3 test/invoke_sagemaker.py
```

### Sample Output
```shell
📝 Testing SageMaker Endpoint: DeepSeekR1SageMakerConstructDeepSeekR1EndpointA3CF-A2OD7LAwiYSG in region us-east-1...
✅ Response: [{'generated_text': 'What is the meaning of life? (In English, please.)\n\nThe meaning of life is a profound and age-old question that has puzzled humans for centuries. There are numerous theories and perspectives that attempt to answer this question, ranging from philosophical and theological ideas to scientific and practical approaches. Here are some common approaches and perspectives on the meaning of life:\n\n1. **Philosophical Approaches**:\n   - **Existentialism**: Focuses on the search for meaning within the context of human existence and personal freedom. According to existentialists'}]
```

## 📜 Supported Models
| Short Name | Full Model Name                            | Recommended Instance Type | Number of GPUs |
|------------|--------------------------------------------|---------------------------|----------------|
| Qwen-1.5B  | DeepSeek-R1-Distill-Qwen-1.5B              | ml.g5.4xlarge             | 1              |
| Qwen-7B    | DeepSeek-R1-Distill-Qwen-7B                | ml.g5.4xlarge             | 1              |
| Qwen-14B   | DeepSeek-R1-Distill-Qwen-14B               | ml.g5.12xlarge            | 4              |
| Qwen-32B   | DeepSeek-R1-Distill-Qwen-32B               | ml.g6.12xlarge            | 4              |
| Llama-8B   | DeepSeek-R1-Distill-Llama-8B               | ml.g5.2xlarge             | 1              |
| Llama-70B  | DeepSeek-R1-Distill-Llama-70B              | ml.g6.48xlarge            | 8              |

