"""
Highly Available Application - Clean & Spacious
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import ALB, Route53, CloudFront
from diagrams.aws.compute import EC2, AutoScaling
from diagrams.aws.database import RDS, ElastiCache
from diagrams.aws.storage import S3
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

with Diagram("Highly Available Application",
             show=False,
             direction="TB",
             graph_attr=graph_attr):

    users = Users("Users")

    # Entry
    dns = Route53("Route 53\nDNS")
    ssl = ACM("ACM\nSSL Certificate")
    cdn = CloudFront("CloudFront\nCDN")

    with Cluster("Load Balancing"):
        alb = ALB("Application\nLoad Balancer\n(Multi-AZ)")

    with Cluster("Application Tier (Multi-AZ)"):
        with Cluster("Auto Scaling Group"):
            apps = [
                EC2("EC2\nAZ-1"),
                EC2("EC2\nAZ-2"),
                EC2("EC2\nAZ-3")
            ]
        asg = AutoScaling("Auto Scaling")

    with Cluster("Cache Layer"):
        cache = ElastiCache("ElastiCache\nRedis")

    with Cluster("Storage Tier"):
        s3 = S3("S3\nMedia Storage")

    with Cluster("Database Tier (Multi-AZ)"):
        db_primary = RDS("RDS Primary")
        db_replica = RDS("RDS Replica")

    # Flow
    users >> dns >> ssl >> alb
    alb >> apps

    for app in apps:
        app >> cache
        app >> db_primary

    db_primary >> Edge(label="replication", style="dashed") >> db_replica

    users >> cdn >> s3
    apps[0] >> s3

    asg >> Edge(style="dotted") >> apps[1]

print("✅ Highly Available App diagram generated!")
