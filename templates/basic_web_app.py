"""
Basic Web Application - Clean & Simple
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import ALB, Route53
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.security import ACM
from diagrams.aws.management import Cloudwatch
from diagrams.onprem.client import Users

graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "1.0",
    "splines": "ortho",
    "nodesep": "1.5",
    "ranksep": "2.0"
}

with Diagram("Basic Web Application",
             show=False,
             direction="TB",
             graph_attr=graph_attr):

    users = Users("Users")

    dns = Route53("Route 53\nDNS")
    ssl = ACM("ACM\nSSL Certificate")

    with Cluster("Application Tier"):
        alb = ALB("Application\nLoad Balancer")
        app = EC2("EC2\nApplication Server")

    with Cluster("Database Tier"):
        db = RDS("RDS\nPostgreSQL")

    monitoring = Cloudwatch("CloudWatch\nMonitoring")

    # Flow
    users >> Edge(label="HTTPS") >> dns
    dns >> ssl >> alb
    alb >> app
    app >> Edge(label="queries") >> db
    app >> Edge(style="dashed") >> monitoring

print("✅ Basic Web App diagram generated!")
