from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2, Lambda
from diagrams.aws.database import RDS, Elasticache
from diagrams.aws.network import ALB, CloudFront
from diagrams.aws.storage import S3
from diagrams.aws.management import CloudwatchLogs
from diagrams.aws.security import CertificateManager
from diagrams.aws.mobile import Amplify
from diagrams.saas.cdn import Cloudflare
from diagrams.saas.chat import Slack
from diagrams.onprem.client import User

# Create comprehensive AWS Infrastructure Diagram
with Diagram("Complete AWS Infrastructure", show=False, direction="TB"):
    # User
    user = User("User")

    # Cloudflare DNS
    dns = Cloudflare("Cloudflare DNS")

    # AWS Certificate Manager
    acm = CertificateManager("SSL Certificates")

    # Application Load Balancer
    alb = ALB("Application Load Balancer")

    # Frontend with AWS Amplify
    with Cluster("Frontend"):
        amplify = Amplify("AWS Amplify")

    # Backend EC2 Instances
    with Cluster("Backend Services"):
        backend_1 = EC2("Backend 1\n(m5.xlarge)")
        backend_2 = EC2("Backend 2\n(m5.xlarge)")
        backend_instances = [backend_1, backend_2]

    # Storage Layer
    with Cluster("Storage Layer"):
        # RDS in HA mode (Primary + Read Replica)
        with Cluster("Database (HA)"):
            rds_primary = RDS("RDS Primary")
            rds_replica = RDS("RDS Replica")
            rds_primary - Edge(label="replication") - rds_replica

        # ElastiCache
        cache = Elasticache("Redis Cache")

        # S3 with CloudFront
        with Cluster("Object Storage"):
            s3 = S3("S3 Bucket")
            cdn = CloudFront("CloudFront CDN")
            cdn >> s3

    # Monitoring and Alerting
    with Cluster("Monitoring & Alerts"):
        cloudwatch = CloudwatchLogs("CloudWatch Logs")
        slack = Slack("Slack Alerts")

    # Background Jobs
    with Cluster("Background Jobs"):
        lambda_func = Lambda("Lambda Functions")

    # Traffic Flow
    user >> dns >> alb
    acm - Edge(label="SSL") - alb

    # ALB routes to frontend and backend
    alb >> amplify
    alb >> backend_instances

    # Backend connects to storage layer
    backend_instances >> rds_primary
    backend_instances >> cache
    backend_instances >> s3

    # Frontend connects to storage layer
    amplify >> s3

    # Monitoring: Frontend and Backend send logs to CloudWatch
    amplify >> Edge(label="logs") >> cloudwatch
    backend_instances >> Edge(label="logs") >> cloudwatch

    # Lambda sends logs to CloudWatch
    lambda_func >> Edge(label="logs") >> cloudwatch

    # CloudWatch sends alerts to Slack
    cloudwatch >> Edge(label="alerts") >> slack
