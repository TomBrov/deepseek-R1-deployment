import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface SageMakerIamRoleProps {
    ecrRepository: string;
}

export class SageMakerIamRoleConstruct extends Construct {
    public readonly role: iam.Role;
    public readonly roleArn: string;

    constructor(scope: Construct, id: string, props: SageMakerIamRoleProps) {
        super(scope, id);

        this.role = new iam.Role(this, 'SageMakerExecutionRole', {
            assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
        });

        this.role.addToPolicy(new iam.PolicyStatement({
            actions: [
                "sagemaker:CreateEndpoint",
                "sagemaker:UpdateEndpoint",
                "sagemaker:InvokeEndpoint",
                "sagemaker:DescribeEndpoint",
                "sagemaker:ListModels"
            ],
            resources: [`arn:aws:sagemaker:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:endpoint/*`]
        }));

        this.role.addToPolicy(new iam.PolicyStatement({
            actions: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:BatchGetImage",
                "ecr:GetDownloadUrlForLayer"
            ],
            resources: [`arn:aws:ecr:${cdk.Aws.REGION}:763104351884:repository/${props.ecrRepository}`]
        }));

        this.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"));

        this.role.addToPolicy(new iam.PolicyStatement({
            actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            resources: [`arn:aws:logs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:log-group:/aws/sagemaker/*`]
        }));

        this.roleArn = this.role.roleArn;
    }
}
