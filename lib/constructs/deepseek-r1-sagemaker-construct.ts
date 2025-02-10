import * as cdk from 'aws-cdk-lib';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker';
import { SageMakerIamRoleConstruct } from './deepseek-r1-sagemaker-role-construct';
import { Construct } from 'constructs';
import * as logs from 'aws-cdk-lib/aws-logs';

export interface DeepSeekR1SageMakerProps {
    containerType: string;
    instanceType: string;
    modelName: string;
}

export class DeepSeekR1SageMakerConstruct extends Construct {
    public readonly sagemakerEndpointName: string;

    constructor(scope: Construct, id: string, props: DeepSeekR1SageMakerProps) {
        super(scope, id);

        const ecrRepository = props.containerType === "tgi"
            ? "huggingface-pytorch-tgi-inference"
            : "djl-inference";

        const inferenceImageUri = props.containerType === "tgi"
            ? `763104351884.dkr.ecr.us-east-1.amazonaws.com/${ecrRepository}:2.4.0-tgi2.3.1-gpu-py311-cu124-ubuntu22.04`
            : `763104351884.dkr.ecr.us-east-1.amazonaws.com/${ecrRepository}:0.31.0-lmi13.0.0-cu124`;

        const sagemakerRole = new SageMakerIamRoleConstruct(this, "SageMakerRole", {
            ecrRepository
        });

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

        const hfModelId = `deepseek-ai/DeepSeek-R1-Distill-${props.modelName}`;

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
                    "SM_NUM_GPUS": JSON.stringify(numberOfGpu)
                }
            },
            modelName: props.modelName
        });
        model.node.addDependency(sagemakerRole);

        const endpointConfig = new sagemaker.CfnEndpointConfig(this, "DeepSeekR1EndpointConfig", {
            productionVariants: [{
                variantName: "AllTraffic",
                modelName: model.attrModelName,
                instanceType: props.instanceType,
                initialInstanceCount: 1,
                containerStartupHealthCheckTimeoutInSeconds: 600
            }]
        });
        endpointConfig.node.addDependency(model);

        const sagemakerEndpoint = new sagemaker.CfnEndpoint(this, "DeepSeekR1Endpoint", {
            endpointConfigName: endpointConfig.attrEndpointConfigName
        });
        sagemakerEndpoint.node.addDependency(endpointConfig);

        this.sagemakerEndpointName = sagemakerEndpoint.attrEndpointName;
    }
}
