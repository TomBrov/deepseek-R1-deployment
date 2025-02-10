import * as cdk from 'aws-cdk-lib';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker';
import { SageMakerIamRoleConstruct } from './deepseek-r1-sagemaker-role-construct';
import { Construct } from 'constructs';

export interface DeepSeekR1SageMakerProps {
    containerType: string;
    instanceType: string;
    modelName: string;
    sagemakerRole: SageMakerIamRoleConstruct;
    inferenceImageUri: string;
    numberOfGpu: number;
}

export class DeepSeekR1SageMakerConstruct extends Construct {
    public readonly sagemakerEndpointName: string;

    constructor(scope: Construct, id: string, props: DeepSeekR1SageMakerProps) {
        super(scope, id);

        const instanceType = props.instanceType || "ml.g5.2xlarge";

        const hfModelId = `deepseek-ai/DeepSeek-R1-Distill-${props.modelName}`;

        const model = new sagemaker.CfnModel(this, "DeepSeekR1Model", {
            executionRoleArn: props.sagemakerRole.roleArn,
            primaryContainer: {
                image: props.inferenceImageUri,
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
                    "SM_NUM_GPUS": JSON.stringify(props.numberOfGpu)
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
        endpointConfig.node.addDependency(model);

        const sagemakerEndpoint = new sagemaker.CfnEndpoint(this, "DeepSeekR1Endpoint", {
            endpointConfigName: endpointConfig.attrEndpointConfigName
        });
        sagemakerEndpoint.node.addDependency(endpointConfig);

        this.sagemakerEndpointName = sagemakerEndpoint.attrEndpointName;
    }
}
