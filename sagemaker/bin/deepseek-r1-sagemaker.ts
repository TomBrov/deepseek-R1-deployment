#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DeepSeekR1SageMakerStack } from '../lib/deepseek-r1-sagemaker-stack';

const app = new cdk.App();
new DeepSeekR1SageMakerStack(app, 'DeepSeekR1SageMakerStack');
