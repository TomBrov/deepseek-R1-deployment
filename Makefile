deploy:
    export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query "Account" --output text)
    export CDK_DEFAULT_REGION=$(aws configure get region)
    cdk deploy