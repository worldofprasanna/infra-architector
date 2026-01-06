"""
Serverless & Event-Driven Architecture - Clean Layout
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import ALB, Route53, CloudFront
from diagrams.aws.compute import EC2, Lambda
from diagrams.aws.database import RDS
from diagrams.aws.storage import S3
from diagrams.aws.integration import SQS, Eventbridge
from diagrams.aws.security import ACM
from diagrams.onprem.client import Users

graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "1.0",
    "splines": "ortho",
    "nodesep": "1.5",
    "ranksep": "2.5"
}

with Diagram("Serverless & Event-Driven Architecture",
             show=False,
             direction="TB",
             graph_attr=graph_attr):

    users = Users("Users")

    # Entry
    dns = Route53("Route 53\nDNS")
    ssl = ACM("ACM\nSSL")
    cdn = CloudFront("CloudFront\nCDN")

    with Cluster("Application Tier"):
        alb = ALB("Application\nLoad Balancer")
        app = EC2("EC2\nApplication Server")

    with Cluster("Serverless Layer"):
        queue = SQS("SQS\nMessage Queue")
        scheduler = Eventbridge("EventBridge\nScheduler")

        with Cluster("Lambda Functions"):
            lambda_email = Lambda("Email\nProcessor")
            lambda_data = Lambda("Data\nProcessor")
            lambda_webhook = Lambda("Webhook\nHandler")

    with Cluster("Storage Tier"):
        s3 = S3("S3\nObject Storage")

    with Cluster("Database Tier"):
        db = RDS("RDS\nPostgreSQL")

    # Main Flow
    users >> dns >> ssl >> alb >> app >> db

    # Async Processing
    app >> queue
    queue >> lambda_email
    queue >> lambda_data

    scheduler >> lambda_data

    # Webhook
    users >> Edge(label="webhooks") >> lambda_webhook

    # Storage
    users >> cdn >> s3
    app >> s3
    lambda_email >> s3
    lambda_data >> s3

    # DB Access
    lambda_email >> db
    lambda_data >> db

print("✅ Serverless Hybrid diagram generated!")
