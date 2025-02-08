import * as cdk from 'aws-cdk-lib';
import { DeepSeekR1SageMakerConstruct } from './constructs/deepseek-r1-sagemaker-construct';

export class DeepSeekR1SageMakerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const containerType = this.node.tryGetContext("containerType") || "tgi";
    const instanceType = this.node.tryGetContext("instanceType") || "ml.g5.2xlarge";
    const modelName = this.node.tryGetContext("modelName") || "Qwen-7B";

    const sagemakerConstruct = new DeepSeekR1SageMakerConstruct(this, "DeepSeekR1SageMakerConstruct", {
      containerType,
      instanceType,
      modelName
    });

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
