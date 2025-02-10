import * as cdk from 'aws-cdk-lib';
import { DeepSeekR1SageMakerConstruct } from './constructs/deepseek-r1-sagemaker-construct';
import {SageMakerIamRoleConstruct} from "./constructs/deepseek-r1-sagemaker-role-construct";

export class DeepSeekR1SageMakerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const containerType = this.node.tryGetContext("containerType") || "tgi";
    const instanceType = this.node.tryGetContext("instanceType") || "ml.g5.2xlarge";
    const modelName = this.node.tryGetContext("modelName") || "Qwen-7B";

    const ecrRepository = containerType === "tgi"
        ? "huggingface-pytorch-tgi-inference"
        : "djl-inference";

    const inferenceImageUri = containerType === "tgi"
        ? `763104351884.dkr.ecr.us-east-1.amazonaws.com/${ecrRepository}:2.4.0-tgi2.3.1-gpu-py311-cu124-ubuntu22.04`
        : `763104351884.dkr.ecr.us-east-1.amazonaws.com/${ecrRepository}:0.31.0-lmi13.0.0-cu124`;

    const gpuMapping: { [key: number]: string[] } = {
      4: ["ml.g5.12xlarge", "ml.g6e.24xlarge", "ml.g6e.12xlarge", "ml.g6.12xlarge", "ml.g6.24xlarge", "ml.g4dn.12xlarge", "ml.g4ad.16xlarge"],
      8: ["ml.p5.48xlarge", "ml.p5e.48xlarge", "ml.p5en.48xlarge", "ml.p4d.24xlarge", "ml.p4de.24xlarge", "ml.g6e.48xlarge", "ml.g6.48xlarge"],
    };

    let numberOfGpu = 1;
    for (const [gpuCount, instanceList] of Object.entries(gpuMapping)) {
      if (instanceList.includes(instanceType)) {
        numberOfGpu = parseInt(gpuCount);
        break;
      }
    }

    const sagemakerRole = new SageMakerIamRoleConstruct(this, "SageMakerRole", {
      ecrRepository
    });

    const sagemakerConstruct = new DeepSeekR1SageMakerConstruct(this, "DeepSeekR1SageMakerConstruct", {
      containerType,
      instanceType,
      modelName,
      sagemakerRole,
      inferenceImageUri,
      numberOfGpu
    });
    sagemakerConstruct.node.addDependency(sagemakerRole);

    new cdk.CfnOutput(this, "SageMakerEndpointName", {
      value: sagemakerConstruct.sagemakerEndpointName,
      description: "The name of the deployed SageMaker endpoint"
    });

    new cdk.CfnOutput(this, "AWSRegion", {
      value: this.region,
      description: "AWS region where the SageMaker endpoint is deployed"
    });
  }
}
