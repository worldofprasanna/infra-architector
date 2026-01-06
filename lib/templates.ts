/**
 * AWS ARCHITECTURE TEMPLATE DEFINITIONS
 *
 * Defines 5 AWS architecture templates that can be recommended
 * based on user's question answers.
 */

export type AwsTemplate = {
  id: string
  name: string
  description: string
  bestFor: string[]
  requiredResources: string[]
  optionalResources: string[]
  excludedResources: string[]
  pythonFile: string
  estimatedMonthlyCost: string
  components: TemplateComponent[]
}

export type TemplateComponent = {
  service: string
  purpose: string
  icon?: string
}

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

export const AWS_TEMPLATES: Record<string, AwsTemplate> = {
  // Template 1: Basic Web Application
  basic_web_app: {
    id: "basic_web_app",
    name: "Basic Web Application",
    description: "Simple, cost-effective architecture for early-stage applications with low to moderate traffic. Perfect for MVPs and startups.",
    bestFor: [
      "Building from scratch",
      "Low traffic (<1,000 users)",
      "No compliance requirements",
      "Small team with limited DevOps experience"
    ],
    requiredResources: ["BASIC_SETUP", "SIMPLE_ARCH", "LOW_SCALE"],
    optionalResources: ["CLOUDWATCH"],
    excludedResources: ["ENTERPRISE", "HIGH_SCALE", "MULTI_AZ", "LAMBDA", "S3"],
    pythonFile: "basic_web_app.py",
    estimatedMonthlyCost: "$200 - $500",
    components: [
      {
        service: "Amazon EC2",
        purpose: "Application server hosting your web application"
      },
      {
        service: "Amazon RDS (PostgreSQL/MySQL)",
        purpose: "Managed relational database for data storage"
      },
      {
        service: "Application Load Balancer",
        purpose: "Route traffic to your application with SSL/TLS termination"
      },
      {
        service: "Amazon CloudWatch",
        purpose: "Basic monitoring and logging"
      },
      {
        service: "AWS Certificate Manager",
        purpose: "Free SSL/TLS certificates"
      }
    ]
  },

  // Template 2: Web Application with CDN
  web_app_with_cdn: {
    id: "web_app_with_cdn",
    name: "Web Application with CDN",
    description: "Enhanced architecture with media storage and content delivery network for applications serving images, videos, or documents to users.",
    bestFor: [
      "Moderate user-generated content",
      "Image or document heavy applications",
      "Need fast global content delivery",
      "Currently storing media on servers (migration needed)"
    ],
    requiredResources: ["S3", "CLOUDFRONT"],
    optionalResources: ["MEDIUM_SCALE", "AUTO_SCALING", "LOAD_BALANCER"],
    excludedResources: ["ENTERPRISE", "LAMBDA"],
    pythonFile: "web_app_with_cdn.py",
    estimatedMonthlyCost: "$400 - $1,000",
    components: [
      {
        service: "Amazon EC2",
        purpose: "Application server instances"
      },
      {
        service: "Application Load Balancer",
        purpose: "Distribute traffic across multiple instances"
      },
      {
        service: "Amazon RDS",
        purpose: "Managed database with automated backups"
      },
      {
        service: "Amazon S3",
        purpose: "Scalable object storage for media files (images, videos, documents)"
      },
      {
        service: "Amazon CloudFront",
        purpose: "Global CDN for fast content delivery and reduced latency"
      },
      {
        service: "Amazon CloudWatch",
        purpose: "Monitoring, logging, and basic alerting"
      }
    ]
  },

  // Template 3: Highly Available Application
  highly_available_app: {
    id: "highly_available_app",
    name: "Highly Available Application",
    description: "Production-ready architecture with high availability, auto-scaling, and redundancy across multiple availability zones. Built for reliability and growth.",
    bestFor: [
      "Production applications with existing user base",
      "Medium to high traffic (1,000+ users)",
      "Need 99.9%+ uptime",
      "Planning to scale rapidly"
    ],
    requiredResources: ["HIGH_AVAILABILITY", "MULTI_AZ", "AUTO_SCALING", "LOAD_BALANCER"],
    optionalResources: ["REDIS", "S3", "CLOUDFRONT", "CLOUDWATCH", "SNS"],
    excludedResources: ["BASIC_SETUP", "SIMPLE_ARCH", "LOW_SCALE"],
    pythonFile: "highly_available_app.py",
    estimatedMonthlyCost: "$800 - $2,000",
    components: [
      {
        service: "Auto Scaling Group",
        purpose: "Automatically scale EC2 instances based on traffic demand"
      },
      {
        service: "Application Load Balancer",
        purpose: "Multi-AZ load balancing with health checks"
      },
      {
        service: "Amazon EC2 (Multi-AZ)",
        purpose: "Application servers distributed across availability zones"
      },
      {
        service: "Amazon RDS (Multi-AZ)",
        purpose: "Database with automatic failover and read replicas"
      },
      {
        service: "Amazon ElastiCache (Redis)",
        purpose: "In-memory caching for improved performance"
      },
      {
        service: "Amazon S3",
        purpose: "Media and static asset storage"
      },
      {
        service: "Amazon CloudFront",
        purpose: "CDN for global content delivery"
      },
      {
        service: "Amazon CloudWatch",
        purpose: "Advanced monitoring with custom metrics"
      },
      {
        service: "Amazon SNS",
        purpose: "Alert notifications for infrastructure issues"
      }
    ]
  },

  // Template 4: Serverless & Event-Driven
  serverless_hybrid: {
    id: "serverless_hybrid",
    name: "Serverless & Event-Driven Architecture",
    description: "Modern serverless architecture using Lambda functions for background jobs, event processing, and microservices. Combines traditional EC2 with serverless components.",
    bestFor: [
      "Applications with background jobs (emails, data processing)",
      "Event-driven workflows",
      "Want to minimize operational overhead",
      "Need automatic scaling for variable workloads"
    ],
    requiredResources: ["LAMBDA", "SQS"],
    optionalResources: ["EVENTBRIDGE", "S3", "CLOUDFRONT", "CRITICAL_JOBS"],
    excludedResources: ["BASIC_SETUP", "SIMPLE_ARCH"],
    pythonFile: "serverless_hybrid.py",
    estimatedMonthlyCost: "$500 - $1,500",
    components: [
      {
        service: "Amazon EC2 / AWS Fargate",
        purpose: "Main application hosting"
      },
      {
        service: "Application Load Balancer",
        purpose: "Route HTTP/HTTPS traffic"
      },
      {
        service: "AWS Lambda",
        purpose: "Serverless functions for background jobs, webhooks, data processing"
      },
      {
        service: "Amazon SQS",
        purpose: "Message queuing for asynchronous job processing"
      },
      {
        service: "Amazon EventBridge",
        purpose: "Event routing and scheduled tasks"
      },
      {
        service: "Amazon RDS",
        purpose: "Relational database"
      },
      {
        service: "Amazon S3",
        purpose: "File storage and Lambda deployment packages"
      },
      {
        service: "Amazon CloudWatch",
        purpose: "Monitoring and Lambda logs"
      }
    ]
  },

  // Template 5: Enterprise-Grade Infrastructure
  enterprise_grade: {
    id: "enterprise_grade",
    name: "Enterprise-Grade Infrastructure",
    description: "Comprehensive, security-focused architecture for regulated industries with compliance requirements (HIPAA, PCI DSS, SOC 2). Includes VPC isolation, WAF, encryption, and audit logging.",
    bestFor: [
      "Healthcare or payment processing (HIPAA/PCI DSS)",
      "Enterprise customers requiring SOC 2",
      "High security and compliance needs",
      "Need 24x7 monitoring and support"
    ],
    requiredResources: ["ENTERPRISE", "VPC", "ENCRYPTION"],
    optionalResources: ["WAF", "CLOUDTRAIL", "COMPLIANCE_HIPAA", "COMPLIANCE_SOC2", "24X7", "ALERTING"],
    excludedResources: ["BASIC_SETUP", "SIMPLE_ARCH"],
    pythonFile: "enterprise_grade.py",
    estimatedMonthlyCost: "$2,000 - $5,000+",
    components: [
      {
        service: "Amazon VPC",
        purpose: "Isolated network environment with public/private subnets"
      },
      {
        service: "AWS WAF",
        purpose: "Web Application Firewall protecting against OWASP Top 10"
      },
      {
        service: "Application Load Balancer",
        purpose: "Multi-AZ load balancing with WAF integration"
      },
      {
        service: "Auto Scaling Group",
        purpose: "Auto-scaling EC2 instances across multiple AZs"
      },
      {
        service: "Amazon RDS (Encrypted, Multi-AZ)",
        purpose: "Encrypted database with automated backups and compliance logging"
      },
      {
        service: "Amazon ElastiCache",
        purpose: "Redis for session management and caching"
      },
      {
        service: "Amazon S3 (Encrypted)",
        purpose: "Encrypted object storage with versioning and lifecycle policies"
      },
      {
        service: "AWS CloudTrail",
        purpose: "API activity logging for compliance audits"
      },
      {
        service: "Amazon CloudWatch",
        purpose: "Comprehensive monitoring, custom metrics, and dashboards"
      },
      {
        service: "AWS Lambda",
        purpose: "Serverless functions for automation and event processing"
      },
      {
        service: "Amazon SNS",
        purpose: "24x7 alerting for security and infrastructure events"
      },
      {
        service: "AWS KMS",
        purpose: "Key management for encryption at rest"
      },
      {
        service: "AWS Secrets Manager",
        purpose: "Secure credential storage and rotation"
      }
    ]
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): AwsTemplate | undefined {
  return AWS_TEMPLATES[templateId]
}

/**
 * Get all template IDs
 */
export function getAllTemplateIds(): string[] {
  return Object.keys(AWS_TEMPLATES)
}

/**
 * Get all templates as array
 */
export function getAllTemplates(): AwsTemplate[] {
  return Object.values(AWS_TEMPLATES)
}

/**
 * Get template components as formatted list
 */
export function getComponentsList(templateId: string): string[] {
  const template = getTemplate(templateId)
  if (!template) return []

  return template.components.map(c => `${c.service}: ${c.purpose}`)
}

/**
 * Get human-readable template name
 */
export function getTemplateName(templateId: string): string {
  return getTemplate(templateId)?.name || "Unknown Template"
}
