export type Category = 'infrastructure' | 'tech_stack' | 'security' | 'scalability'

export type Option = {
  id: string
  text: string
  points: number
  description: string
}

export type Question = {
  id: number
  question: string
  category: Category
  options: Option[]
}

export const questions: Question[] = [
  {
    id: 1,
    question: "How is your application currently hosted?",
    category: "infrastructure",
    options: [
      { id: "1a", text: "Shared hosting / Basic VPS", points: 3, description: "Using shared hosting or basic VPS indicates limited resources and scalability. This setup may face performance issues during traffic spikes and lacks advanced infrastructure features." },
      { id: "1b", text: "Cloud provider (AWS, GCP, Azure) with manual setup", points: 5, description: "Cloud infrastructure with manual configuration provides better flexibility and resources, but requires significant DevOps expertise and manual intervention for scaling and maintenance." },
      { id: "1c", text: "Managed platform (Vercel, Heroku, Netlify)", points: 7, description: "Managed platforms offer excellent developer experience with automatic scaling, SSL, and deployments. However, they may have higher costs at scale and less customization options." },
      { id: "1d", text: "Kubernetes or containerized with auto-scaling", points: 10, description: "Enterprise-grade containerized infrastructure with Kubernetes provides maximum scalability, resilience, and control. This represents best-in-class infrastructure management but requires specialized expertise." }
    ]
  },
  {
    id: 2,
    question: "What's your current database solution?",
    category: "tech_stack",
    options: [
      { id: "2a", text: "Local file storage or SQLite", points: 3, description: "File-based storage is suitable only for prototypes and small applications. It lacks ACID guarantees, concurrent access controls, and scalability needed for production systems." },
      { id: "2b", text: "Traditional SQL (MySQL, PostgreSQL) on single server", points: 5, description: "Single-server SQL databases provide robust data integrity and querying capabilities but represent a single point of failure. Scaling requires significant planning and potential downtime." },
      { id: "2c", text: "Managed database service with backups", points: 7, description: "Managed database services (RDS, Cloud SQL) offer automated backups, patching, and monitoring. This reduces operational overhead while maintaining reliability and data integrity." },
      { id: "2d", text: "Distributed database with replication", points: 10, description: "Distributed databases with replication provide high availability, fault tolerance, and geographic distribution. This architecture ensures business continuity but requires careful consistency management." }
    ]
  },
  {
    id: 3,
    question: "How do you handle application security?",
    category: "security",
    options: [
      { id: "3a", text: "Basic password authentication", points: 3, description: "Basic authentication without encryption exposes your application to credential theft, man-in-the-middle attacks, and unauthorized access. This is insufficient for any production environment." },
      { id: "3b", text: "SSL/HTTPS with token-based auth", points: 5, description: "SSL/HTTPS with token authentication provides encrypted data transmission and stateless authentication. However, it still lacks advanced features like SSO and may not meet compliance requirements." },
      { id: "3c", text: "OAuth/SSO with encrypted data at rest", points: 7, description: "OAuth/SSO implementation with data encryption provides robust security and better user experience. This approach meets most security standards and protects both data in transit and at rest." },
      { id: "3d", text: "Multi-factor auth, SOC2 compliance, regular security audits", points: 10, description: "Enterprise-grade security with MFA, compliance certifications, and regular audits represents best practices. This comprehensive approach is essential for handling sensitive data and meeting regulatory requirements." }
    ]
  },
  {
    id: 4,
    question: "What's your deployment process?",
    category: "infrastructure",
    options: [
      { id: "4a", text: "Manual FTP/SSH uploads", points: 3, description: "Manual deployments are error-prone, lack version control, and cannot scale with team growth. This approach leads to inconsistent environments and makes rollbacks nearly impossible." },
      { id: "4b", text: "Git-based deployments", points: 5, description: "Git-based deployments provide version control and basic automation. While better than manual uploads, they still lack testing automation and may result in inconsistent deployment procedures." },
      { id: "4c", text: "CI/CD pipeline with automated testing", points: 7, description: "Automated CI/CD with testing ensures code quality, reduces deployment risks, and enables rapid iteration. This represents modern DevOps practices and significantly improves reliability." },
      { id: "4d", text: "Blue-green deployments with automated rollback", points: 10, description: "Advanced deployment strategies with zero-downtime releases and instant rollback capability represent enterprise best practices. This approach minimizes deployment risks and ensures business continuity." }
    ]
  },
  {
    id: 5,
    question: "How does your application handle increased load?",
    category: "scalability",
    options: [
      { id: "5a", text: "Single server, no scaling plan", points: 3, description: "Single-server architecture without scaling strategy is a critical risk. Any traffic spike or server issue can cause complete service outage, leading to lost revenue and poor user experience." },
      { id: "5b", text: "Vertical scaling (upgrading server resources)", points: 5, description: "Vertical scaling provides a temporary solution but has hard limits and requires downtime. This approach becomes increasingly expensive and eventually hits physical hardware limitations." },
      { id: "5c", text: "Horizontal scaling with load balancer", points: 7, description: "Horizontal scaling distributes load across multiple servers, providing better fault tolerance and virtually unlimited scaling potential. This architecture is essential for handling growth." },
      { id: "5d", text: "Auto-scaling with CDN and caching layers", points: 10, description: "Intelligent auto-scaling combined with CDN and caching represents optimal architecture. This approach automatically handles traffic variations while minimizing costs and maximizing performance globally." }
    ]
  },
  {
    id: 6,
    question: "What monitoring and logging tools do you use?",
    category: "infrastructure",
    options: [
      { id: "6a", text: "No monitoring or basic server logs", points: 3, description: "Lack of monitoring means you discover issues when users complain. This reactive approach leads to extended outages, poor user experience, and difficulty diagnosing problems." },
      { id: "6b", text: "Basic application logging", points: 5, description: "Application-level logging provides insights into errors and user actions but lacks system-wide visibility. Troubleshooting complex issues remains challenging without comprehensive monitoring." },
      { id: "6c", text: "Centralized logging with alerts", points: 7, description: "Centralized logging with proactive alerts enables quick problem detection and resolution. This approach significantly reduces mean time to resolution and improves system reliability." },
      { id: "6d", text: "Full observability stack (metrics, logs, traces, APM)", points: 10, description: "Complete observability with metrics, distributed tracing, and APM provides deep insights into system behavior. This enables proactive optimization and rapid troubleshooting of complex distributed systems." }
    ]
  },
  {
    id: 7,
    question: "What's your disaster recovery plan?",
    category: "security",
    options: [
      { id: "7a", text: "No backup strategy", points: 3, description: "Operating without backups is gambling with your business. A single hardware failure, ransomware attack, or human error could result in permanent, catastrophic data loss." },
      { id: "7b", text: "Manual backups performed occasionally", points: 5, description: "Inconsistent manual backups provide minimal protection and often fail when needed most. The backup data may be outdated, and recovery procedures are typically untested and unreliable." },
      { id: "7c", text: "Automated daily backups", points: 7, description: "Automated daily backups provide consistent data protection with minimal human intervention. However, without tested recovery procedures and geographic redundancy, you remain vulnerable to regional disasters." },
      { id: "7d", text: "Automated backups with tested recovery procedures and geo-redundancy", points: 10, description: "Comprehensive disaster recovery with automated backups, regular testing, and geographic distribution ensures business continuity even in catastrophic scenarios. This is essential for mission-critical applications." }
    ]
  },
  {
    id: 8,
    question: "What frontend framework/library are you using?",
    category: "tech_stack",
    options: [
      { id: "8a", text: "Vanilla JavaScript or jQuery", points: 3, description: "Legacy JavaScript approaches lack modern tooling, component architecture, and performance optimizations. This makes development slower and maintaining complex UIs increasingly difficult." },
      { id: "8b", text: "Modern framework without optimization (React, Vue, Angular)", points: 5, description: "Modern frameworks provide better development experience and maintainability. However, without proper optimization, applications may suffer from large bundle sizes and poor performance." },
      { id: "8c", text: "Optimized SPA with code splitting", points: 7, description: "Optimized single-page applications with code splitting deliver better performance through lazy loading and efficient resource usage. This significantly improves user experience, especially on mobile devices." },
      { id: "8d", text: "SSR/SSG framework (Next.js, Nuxt, SvelteKit)", points: 10, description: "Server-side rendering and static generation provide optimal performance, SEO benefits, and excellent user experience. These frameworks represent current best practices for production web applications." }
    ]
  },
  {
    id: 9,
    question: "How do you manage API rate limiting and DDoS protection?",
    category: "security",
    options: [
      { id: "9a", text: "No protection in place", points: 3, description: "Without rate limiting and DDoS protection, your application is vulnerable to abuse, resource exhaustion attacks, and service disruption. Malicious actors can easily overwhelm your infrastructure." },
      { id: "9b", text: "Basic rate limiting on application level", points: 5, description: "Application-level rate limiting provides basic protection against abuse but can be bypassed and doesn't protect against sophisticated DDoS attacks. Infrastructure-level protection is more effective." },
      { id: "9c", text: "WAF (Web Application Firewall) with rate limiting", points: 7, description: "WAF with rate limiting offers robust protection against common attacks and abuse patterns. This infrastructure-level defense significantly reduces risk of service disruption and data breaches." },
      { id: "9d", text: "Enterprise DDoS protection with geographic filtering", points: 10, description: "Enterprise-grade DDoS protection with geographic filtering and traffic analysis provides comprehensive security. This ensures service availability even during large-scale coordinated attacks." }
    ]
  },
  {
    id: 10,
    question: "What's your approach to API architecture?",
    category: "scalability",
    options: [
      { id: "10a", text: "Monolithic application with no API", points: 3, description: "Monolithic architecture without API severely limits scalability, integration possibilities, and mobile application development. This approach makes it nearly impossible to scale individual components independently." },
      { id: "10b", text: "REST API in monolithic app", points: 5, description: "REST API in monolithic architecture enables client flexibility but still couples all functionality together. Scaling requires deploying the entire application, even when only specific features experience high load." },
      { id: "10c", text: "Microservices with API gateway", points: 7, description: "Microservices architecture enables independent scaling, deployment, and technology choices for each service. API gateway provides unified interface while maintaining flexibility and fault isolation." },
      { id: "10d", text: "Event-driven microservices with message queues", points: 10, description: "Event-driven architecture with message queues provides ultimate scalability, resilience, and flexibility. This approach enables asynchronous processing, complex workflows, and independent service evolution." }
    ]
  }
]

export const categoryNames: Record<Category, string> = {
  infrastructure: "Infrastructure",
  tech_stack: "Tech Stack",
  security: "Security",
  scalability: "Scalability"
}

// Calculate max score per category based on number of questions in each category
export const maxScorePerCategory: Record<Category, number> = {
  infrastructure: 30, // 3 questions (1, 4, 6) * 10 points max
  tech_stack: 20,     // 2 questions (2, 8) * 10 points max
  security: 30,       // 3 questions (3, 7, 9) * 10 points max
  scalability: 20     // 2 questions (5, 10) * 10 points max
}

export const maxTotalScore = 100 // Total of all category max scores
