"""
Enterprise-Grade Infrastructure - Professional Layout
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import ALB, Route53, VPC, CloudFront
from diagrams.aws.compute import EC2, AutoScaling, Lambda
from diagrams.aws.database import RDS, ElastiCache
from diagrams.aws.storage import S3
from diagrams.aws.integration import SQS
from diagrams.aws.security import ACM, WAF, KMS, SecretsManager
from diagrams.aws.management import Cloudwatch, Cloudtrail
from diagrams.aws.integration import SNS
from diagrams.onprem.client import Users

graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "1.0",
    "splines": "ortho",
    "nodesep": "1.5",
    "ranksep": "3.0"
}

with Diagram("Enterprise-Grade Infrastructure",
             show=False,
             direction="TB",
             graph_attr=graph_attr):

    users = Users("Users")

    # Security Entry
    dns = Route53("Route 53\nDNS")
    cdn = CloudFront("CloudFront\nCDN")
    waf = WAF("WAF\nFirewall")
    ssl = ACM("ACM\nSSL")

    with Cluster("VPC (Isolated Network)"):

        with Cluster("Public Subnet"):
            alb = ALB("Application\nLoad Balancer")

        with Cluster("Private Subnet (Multi-AZ)"):
            with Cluster("Application Layer"):
                with Cluster("Auto Scaling Group"):
                    apps = [
                        EC2("EC2 - AZ1"),
                        EC2("EC2 - AZ2")
                    ]
                asg = AutoScaling("Auto Scaling")

            with Cluster("Cache Layer"):
                cache = ElastiCache("ElastiCache\nRedis")

            with Cluster("Database Layer (Encrypted)"):
                db_primary = RDS("RDS Primary\n(Encrypted)")
                db_replica = RDS("RDS Replica\n(Encrypted)")

            with Cluster("Background Jobs"):
                queue = SQS("SQS Queue")
                lambda_bg = Lambda("Lambda\nProcessors")

    with Cluster("Storage (Encrypted)"):
        s3 = S3("S3 Bucket\n(Encrypted)")

    with Cluster("Security & Compliance"):
        kms = KMS("KMS\nEncryption Keys")
        secrets = SecretsManager("Secrets\nManager")
        audit = Cloudtrail("CloudTrail\nAudit Logs")

    with Cluster("Monitoring & Alerts"):
        monitoring = Cloudwatch("CloudWatch\n24x7 Monitoring")
        alerts = SNS("SNS\nAlerts")

    # Main Flow
    users >> dns >> cdn >> waf >> ssl >> alb
    alb >> apps

    for app in apps:
        app >> cache
        app >> db_primary
        app >> queue

    queue >> lambda_bg >> db_primary

    db_primary >> Edge(label="replication", style="dashed") >> db_replica

    # Storage
    users >> cdn >> s3
    apps[0] >> s3
    lambda_bg >> s3

    # Security
    kms >> Edge(label="encrypts", style="dotted") >> db_primary
    kms >> Edge(label="encrypts", style="dotted") >> s3
    secrets >> Edge(style="dotted") >> apps[0]

    # Monitoring
    apps[0] >> Edge(style="dashed") >> monitoring
    monitoring >> alerts
    audit >> Edge(style="dotted") >> s3

print("✅ Enterprise-Grade diagram generated!")
