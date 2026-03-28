import json

import pulumi
import pulumi_aws as aws
import pulumi_docker as docker
from pulumi_aws import ecr, iam, lambda_, s3, cloudfront, acm, route53
from pulumi_synced_folder import S3BucketFolder

project_name = "dashhouse"

config = pulumi.Config()
environment = config.require("environment")

TAGS = {
    "Service": "dashhouse",
}


def tagged(name: str, cost_center: str, **extra: str) -> dict[str, str]:
    return {"Name": name, **TAGS, "CostCenter": cost_center, **extra}


# ---------------------------------------------------------------------------
# Fetch secrets from Parameter Store
# ---------------------------------------------------------------------------

fred_api_key = aws.ssm.get_parameter(
    name=f"/dashhouse_config/{environment}/fred_api_key",
    with_decryption=True,
).value


# ---------------------------------------------------------------------------
# ECR Repository + Docker Image
# ---------------------------------------------------------------------------


async def get_registry_info(registry_id):
    credentials = await aws.ecr.get_authorization_token(registry_id=registry_id)
    return {
        "server": credentials.proxy_endpoint,
        "username": credentials.user_name,
        "password": credentials.password,
    }


repo = ecr.Repository(
    f"{project_name}-repo",
    name=f"{project_name}-repo",
    image_tag_mutability="MUTABLE",
    tags=tagged(f"{project_name}-repo", "compute"),
)

registry_info = pulumi.Output.all(repo.registry_id).apply(
    lambda args: get_registry_info(args[0])
)

proxy_image = docker.Image(
    f"{project_name}-proxy-image",
    build=docker.DockerBuildArgs(
        context="../../lambda",
        dockerfile="../../lambda/Dockerfile",
        platform="linux/amd64",
    ),
    image_name=repo.repository_url.apply(lambda url: f"{url}:latest"),
    registry=registry_info,
)


# ---------------------------------------------------------------------------
# IAM Role
# ---------------------------------------------------------------------------

lambda_role = iam.Role(
    f"{project_name}-lambda-role",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "sts:AssumeRole",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Effect": "Allow",
            }
        ],
    }),
    tags=tagged(f"{project_name}-lambda-role", "compute"),
)

iam.RolePolicyAttachment(
    f"{project_name}-lambda-policy",
    role=lambda_role.name,
    policy_arn=iam.ManagedPolicy.AWS_LAMBDA_BASIC_EXECUTION_ROLE,
)


# ---------------------------------------------------------------------------
# Lambda Function
# ---------------------------------------------------------------------------

function = lambda_.Function(
    f"{project_name}-proxy",
    package_type="Image",
    role=lambda_role.arn,
    image_uri=proxy_image.repo_digest,
    memory_size=128,
    timeout=10,
    environment={
        "variables": {
            "FRED_API_KEY": fred_api_key,
        }
    },
    tags=tagged(f"{project_name}-proxy", "compute"),
)

pulumi.export("function_name", function.name)
pulumi.export("function_arn", function.arn)


# ---------------------------------------------------------------------------
# Lambda Function URL
# ---------------------------------------------------------------------------

function_url = lambda_.FunctionUrl(
    f"{project_name}-proxy-url",
    function_name=function.name,
    authorization_type="NONE",
)

pulumi.export("function_url", function_url.function_url)


DOMAIN_NAME = "dashhouse.dev-jeb.com"


# ---------------------------------------------------------------------------
# ACM Certificate (must be us-east-1 for CloudFront)
# ---------------------------------------------------------------------------

hosted_zone = aws.route53.get_zone(name="dev-jeb.com")

certificate = acm.Certificate(
    f"{project_name}-cert",
    domain_name=DOMAIN_NAME,
    validation_method="DNS",
    tags=tagged(f"{project_name}-cert", "networking"),
)

# DNS validation record
cert_validation_record = route53.Record(
    f"{project_name}-cert-validation",
    zone_id=hosted_zone.zone_id,
    name=certificate.domain_validation_options[0].resource_record_name,
    type=certificate.domain_validation_options[0].resource_record_type,
    records=[certificate.domain_validation_options[0].resource_record_value],
    ttl=60,
)

cert_validation = acm.CertificateValidation(
    f"{project_name}-cert-validation-wait",
    certificate_arn=certificate.arn,
    validation_record_fqdns=[cert_validation_record.fqdn],
)


# ---------------------------------------------------------------------------
# S3 Bucket for Static Site
# ---------------------------------------------------------------------------

site_bucket = s3.BucketV2(
    f"{project_name}-site",
    bucket=f"{project_name}-site",
    tags=tagged(f"{project_name}-site", "storage"),
)

s3.BucketWebsiteConfigurationV2(
    f"{project_name}-site-website",
    bucket=site_bucket.id,
    index_document=s3.BucketWebsiteConfigurationV2IndexDocumentArgs(
        suffix="index.html",
    ),
    error_document=s3.BucketWebsiteConfigurationV2ErrorDocumentArgs(
        key="index.html",
    ),
)


# ---------------------------------------------------------------------------
# CloudFront Origin Access Control
# ---------------------------------------------------------------------------

oac = cloudfront.OriginAccessControl(
    f"{project_name}-oac",
    origin_access_control_origin_type="s3",
    signing_behavior="always",
    signing_protocol="sigv4",
    description="OAC for dashhouse S3 bucket",
)


# ---------------------------------------------------------------------------
# CloudFront Distribution
# ---------------------------------------------------------------------------

distribution = cloudfront.Distribution(
    f"{project_name}-cdn",
    enabled=True,
    aliases=[DOMAIN_NAME],
    default_root_object="index.html",
    price_class="PriceClass_100",
    origins=[
        cloudfront.DistributionOriginArgs(
            domain_name=site_bucket.bucket_regional_domain_name,
            origin_id="s3",
            origin_access_control_id=oac.id,
        ),
    ],
    default_cache_behavior=cloudfront.DistributionDefaultCacheBehaviorArgs(
        target_origin_id="s3",
        viewer_protocol_policy="redirect-to-https",
        allowed_methods=["GET", "HEAD"],
        cached_methods=["GET", "HEAD"],
        forwarded_values=cloudfront.DistributionDefaultCacheBehaviorForwardedValuesArgs(
            query_string=False,
            cookies=cloudfront.DistributionDefaultCacheBehaviorForwardedValuesCookiesArgs(
                forward="none",
            ),
        ),
        default_ttl=86400,
        max_ttl=31536000,
        min_ttl=0,
    ),
    custom_error_responses=[
        cloudfront.DistributionCustomErrorResponseArgs(
            error_code=403,
            response_code=200,
            response_page_path="/index.html",
            error_caching_min_ttl=10,
        ),
        cloudfront.DistributionCustomErrorResponseArgs(
            error_code=404,
            response_code=200,
            response_page_path="/index.html",
            error_caching_min_ttl=10,
        ),
    ],
    restrictions=cloudfront.DistributionRestrictionsArgs(
        geo_restriction=cloudfront.DistributionRestrictionsGeoRestrictionArgs(
            restriction_type="none",
        ),
    ),
    viewer_certificate=cloudfront.DistributionViewerCertificateArgs(
        acm_certificate_arn=cert_validation.certificate_arn,
        ssl_support_method="sni-only",
        minimum_protocol_version="TLSv1.2_2021",
    ),
    tags=tagged(f"{project_name}-cdn", "networking"),
)

pulumi.export("cloudfront_url", distribution.domain_name.apply(lambda d: f"https://{d}"))
pulumi.export("cloudfront_distribution_id", distribution.id)


# ---------------------------------------------------------------------------
# Route53 DNS Record → CloudFront
# ---------------------------------------------------------------------------

route53.Record(
    f"{project_name}-dns-record",
    zone_id=hosted_zone.zone_id,
    name=DOMAIN_NAME,
    type="A",
    aliases=[
        route53.RecordAliasArgs(
            name=distribution.domain_name,
            zone_id=distribution.hosted_zone_id,
            evaluate_target_health=False,
        ),
    ],
)

pulumi.export("site_url", f"https://{DOMAIN_NAME}")


# ---------------------------------------------------------------------------
# S3 Bucket Policy (CloudFront OAC access only)
# ---------------------------------------------------------------------------

bucket_policy = s3.BucketPolicy(
    f"{project_name}-site-policy",
    bucket=site_bucket.id,
    policy=pulumi.Output.all(site_bucket.arn, distribution.arn).apply(
        lambda args: json.dumps({
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "AllowCloudFrontOAC",
                    "Effect": "Allow",
                    "Principal": {"Service": "cloudfront.amazonaws.com"},
                    "Action": "s3:GetObject",
                    "Resource": f"{args[0]}/*",
                    "Condition": {
                        "StringEquals": {
                            "AWS:SourceArn": args[1],
                        }
                    },
                }
            ],
        })
    ),
)


# ---------------------------------------------------------------------------
# Sync dist/ to S3
# ---------------------------------------------------------------------------

S3BucketFolder(
    f"{project_name}-site-files",
    path="../../dist",
    bucket_name=site_bucket.bucket,
    acl="private",
)

pulumi.export("site_bucket_name", site_bucket.bucket)
