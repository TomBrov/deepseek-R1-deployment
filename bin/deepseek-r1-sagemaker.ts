#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DeepSeekR1SageMakerStack } from '../lib/deepseek-r1-sagemaker-stack';

const app = new cdk.App();
new DeepSeekR1SageMakerStack(app, 'DeepSeekR1SageMakerStack',{
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});
