"""
Web Application with CDN - Clean Layout
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import ALB, Route53, CloudFront
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.storage import S3
from diagrams.aws.security import ACM
from diagrams.onprem.client import Users

graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "1.0",
    "splines": "ortho",
    "nodesep": "1.5",
    "ranksep": "2.0"
}

with Diagram("Web Application with CDN",
             show=False,
             direction="TB",
             graph_attr=graph_attr):

    users = Users("Users")

    # Entry Layer
    dns = Route53("Route 53\nDNS")
    ssl = ACM("ACM\nSSL Certificate")
    cdn = CloudFront("CloudFront\nCDN")

    with Cluster("Application Tier"):
        alb = ALB("Application\nLoad Balancer")
        app = EC2("EC2\nApplication Server")

    with Cluster("Storage Tier"):
        s3 = S3("S3\nMedia Storage")

    with Cluster("Database Tier"):
        db = RDS("RDS\nPostgreSQL")

    # Main Flow
    users >> Edge(label="HTTPS") >> dns >> ssl >> alb
    alb >> app >> db

    # CDN Flow
    users >> Edge(label="static/media") >> cdn >> s3
    app >> Edge(label="upload") >> s3

print("✅ Web App with CDN diagram generated!")
