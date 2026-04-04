/**
 * Skill aliases map JD keywords to Mark's actual skills.
 * Growth framings provide honest-but-positive context for skills Mark is developing.
 *
 * Edit this file to tune evaluate_fit matching quality.
 */

export const aliases: Record<string, string[]> = {
  "product management": ["PM", "product manager", "product owner", "PdM", "product lead", "product strategy", "roadmap"],
  "project management": ["program management", "project lead", "delivery management", "project coordination"],
  "agile": ["scrum", "sprint", "kanban", "jira", "linear", "agile methodology", "iterative"],
  "ai": ["artificial intelligence", "machine learning", "ML", "LLM", "large language model", "generative AI", "gen AI"],
  "agentic": ["agentic AI", "AI agents", "agent framework", "agent harness", "autonomous agents", "MCP", "model context protocol"],
  "prompt engineering": ["prompting", "prompt design", "system prompts", "few-shot", "chain of thought"],
  "html": ["HTML5", "web development", "frontend", "front-end", "markup"],
  "css": ["CSS3", "styling", "tailwind", "responsive design"],
  "javascript": ["JS", "TypeScript", "TS", "node", "nodejs", "node.js", "frontend development"],
  "git": ["GitHub", "version control", "source control", "CI/CD", "GitHub Actions"],
  "powershell": ["PowerShell", "scripting", "automation", "shell scripting", "bash"],
  "sql": ["SQL Server", "MSSQL", "database", "queries", "relational database"],
  "api": ["REST", "REST API", "APIs", "integrations", "web services", "endpoints"],
  "vercel": ["deployment", "serverless", "cloud platform", "hosting"],
  "technical writing": ["documentation", "docs", "content strategy", "technical documentation", "knowledge base"],
  "zendesk": ["Zendesk", "customer support", "ticketing", "help desk", "support platform", "CRM"],
  "rapid prototyping": ["prototyping", "MVP", "proof of concept", "POC", "iteration"],
  "evals": ["evaluation", "model evaluation", "benchmarking", "testing AI"],
  "langfuse": ["observability", "LLM monitoring", "tracing", "AI observability"],
  "system administration": ["sysadmin", "IT administration", "infrastructure", "Windows administration", "Active Directory"],
  "security": ["cybersecurity", "information security", "InfoSec", "HIPAA", "compliance", "MFA", "EDR"],
  "cross-functional": ["stakeholder management", "cross-team", "collaboration", "team leadership"],
  "user research": ["user feedback", "customer research", "product discovery", "user experience", "UX"],
  "data analysis": ["analytics", "metrics", "KPIs", "data-driven", "measurement"],
};

export const growthFramings: Record<string, string> = {
  "python": "Strong scripting background in PowerShell and TypeScript with demonstrated rapid language acquisition across toolchains",
  "react": "Proficient in vanilla JavaScript/TypeScript and modern web standards; has shipped 15+ interactive web applications",
  "java": "Deep experience across multiple programming paradigms; adapts quickly to new language ecosystems",
  "kubernetes": "Extensive infrastructure and system administration background spanning Windows, cloud, and serverless environments",
  "docker": "Experienced with modern deployment pipelines (Vercel, GitHub Actions) and infrastructure management",
  "aws": "Hands-on with Vercel serverless and cloud deployment; infrastructure management background from system administration career",
  "gcp": "Cloud-native deployment experience with Vercel; prior infrastructure management across on-prem and cloud hybrid environments",
  "azure": "Microsoft ecosystem expertise from years of Windows system administration, MS365 migration, and Active Directory management",
  "figma": "Strong design sensibility demonstrated through multiple shipped UI projects (portfolio workspace, support form redesign, design system)",
  "mobile": "Web-first development approach with responsive design expertise; managed MDM solutions across iOS and Android",
  "machine learning": "Practical AI/ML experience through agentic AI strategy, prompt engineering, evals, and LLM observability — focused on applied AI rather than model training",
  "data science": "Data-informed product decisions backed by metrics (5% support reduction, 99.95% uptime, 25% ticket reduction); experienced with SQL and analytics",
  "go": "Polyglot developer comfortable across scripting and compiled languages; rapid adoption proven with TypeScript and PowerShell",
  "rust": "Systems-level thinking from infrastructure background; quick to pick up new toolchains as demonstrated across career transitions",
  "product analytics": "Metrics-driven approach evidenced by measurable outcomes in every role; experienced with feedback systems and product discovery",
  "design systems": "Built and shipped a living design system (design-system-v2.html) with design tokens, CSS custom properties, and component documentation",
};
