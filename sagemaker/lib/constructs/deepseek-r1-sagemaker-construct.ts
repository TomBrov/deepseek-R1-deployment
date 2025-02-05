import * as cdk from 'aws-cdk-lib';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface DeepSeekR1SageMakerProps {
    containerType: string;
    instanceType: string;
    modelName: string;
}

export class DeepSeekR1SageMakerConstruct extends Construct {
    public sagemakerEndpointName: string;
    constructor(scope: Construct, id: string, props: DeepSeekR1SageMakerProps) {
        super(scope, id);

        const inferenceImageUri = props.containerType === "tgi"
            ? "763104351884.dkr.ecr.us-east-1.amazonaws.com/huggingface-pytorch-tgi-inference:2.4.0-tgi3.0.1-gpu-py311-cu124-ubuntu22.04"
            : "763104351884.dkr.ecr.us-east-1.amazonaws.com/djl-inference:0.31.0-lmi13.0.0-cu124";

        const sagemakerRole = new iam.Role(this, "SageMakerExecutionRole", {
            assumedBy: new iam.ServicePrincipal("sagemaker.amazonaws.com"),
        });

        sagemakerRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                "sagemaker:CreateEndpoint",
                "sagemaker:UpdateEndpoint",
                "sagemaker:InvokeEndpoint",
                "sagemaker:DescribeEndpoint",
                "sagemaker:ListModels"
            ],
            resources: [`arn:aws:sagemaker:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:endpoint/*`]
        }));


        const gpuMapping: { [key: number]: string[] } = {
            4: ["ml.g5.12xlarge", "ml.g6e.24xlarge", "ml.g6e.12xlarge", "ml.g6.12xlarge", "ml.g6.24xlarge", "ml.g4dn.12xlarge", "ml.g4ad.16xlarge"],
            8: ["ml.p5.48xlarge", "ml.p5e.48xlarge", "ml.p5en.48xlarge", "ml.p4d.24xlarge", "ml.p4de.24xlarge", "ml.g6e.48xlarge", "ml.g6.48xlarge"],
        };

        const instanceType = props.instanceType || "ml.g5.2xlarge";

        let numberOfGpu = 1; // Default
        for (const [gpuCount, instanceList] of Object.entries(gpuMapping)) {
            if (instanceList.includes(instanceType)) {
                numberOfGpu = parseInt(gpuCount);
                break;
            }
        }

        const hfModelId = `deepseek-ai/${props.modelName}`;
        console.log(`Deploying model: ${hfModelId}`);

        const model = new sagemaker.CfnModel(this, "DeepSeekR1Model", {
            executionRoleArn: sagemakerRole.roleArn,
            primaryContainer: {
                image: inferenceImageUri,
                environment: {
                    "HF_MODEL_ID": hfModelId,
                    "OPTION_MAX_MODEL_LEN": "10000",
                    "OPTION_GPU_MEMORY_UTILIZATION": "0.95",
                    "OPTION_ENABLE_STREAMING": "false",
                    "OPTION_ROLLING_BATCH": "auto",
                    "OPTION_MODEL_LOADING_TIMEOUT": "3600",
                    "OPTION_PAGED_ATTENTION": "false",
                    "OPTION_DTYPE": "fp16",
                    "MAX_CONCURRENT_REQUESTS": "10",
                    "PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True",
                    "SM_NUM_GPUS": JSON.stringify(numberOfGpu),
                }
            },
            modelName: props.modelName

        });

        const endpointConfig = new sagemaker.CfnEndpointConfig(this, "DeepSeekR1EndpointConfig", {
            productionVariants: [{
                variantName: "AllTraffic",
                modelName: model.attrModelName,
                instanceType: props.instanceType,
                initialInstanceCount: 1,
                containerStartupHealthCheckTimeoutInSeconds: 600
            }]
        });

        const sagemakerEndpoint = new sagemaker.CfnEndpoint(this, "DeepSeekR1Endpoint", {
            endpointConfigName: endpointConfig.attrEndpointConfigName
        });
        
        this.sagemakerEndpointName = sagemakerEndpoint.endpointConfigName;
    }
}
