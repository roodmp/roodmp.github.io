import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getPortfolioData } from "./scraper.js";
import { evaluateFit, formatFitAnalysis } from "./evaluate.js";

/** Shared annotations — all tools are read-only data retrieval. */
const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

/** Suggested questions for discoverability. */
const SUGGESTED_QUESTIONS: Record<string, { label: string; questions: string[] }> = {
  "getting-started": {
    label: "Getting Started",
    questions: [
      "What's Mark's background? How did he get into product management? → use `get_bio`",
      "What does Mark's career path look like? → use `get_experience`",
      "What tools and technologies does Mark work with? → use `get_skills` and `get_resources`",
    ],
  },
  "product-ai": {
    label: "Product & AI Skills",
    questions: [
      "How does Mark approach AI product strategy? → use `ask_mark`",
      "What agentic AI projects has Mark built? → use `list_projects` with search='AI'",
      "How does Mark decide when to use AI vs. traditional approaches? → use `ask_mark` (reference the 'Should I Use AI?' project)",
    ],
  },
  "fit-assessment": {
    label: "Fit Assessment",
    questions: [
      "Is Mark a good fit for [specific role]? → paste a job description into `evaluate_fit`",
      "What are Mark's strongest areas? Where would he need to grow? → use `evaluate_fit` with a JD, or `ask_mark`",
      "How does Mark's SysAdmin-to-PM path benefit a product team? → use `ask_mark`",
    ],
  },
  "deep-dives": {
    label: "Deep Dives",
    questions: [
      "Tell me about a specific project Mark has built → use `list_projects` then `ask_mark`",
      "What's Mark's daily toolkit look like? → use `get_resources`",
      "How does Mark's engineering background influence his product work? → use `ask_mark`",
    ],
  },
};

/**
 * Creates and configures a new MCP server instance.
 * Extracted so both stdio (local) and HTTP (Vercel) entry points can share it.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "mark-rood-portfolio",
    version: "2.0.0",
  });

  // ── Tool: get_bio ─────────────────────────────────────────────────────────
  server.registerTool(
    "get_bio",
    {
      title: "Get Bio",
      description: "Get Mark Rood's bio, summary, location, and contact info",
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async () => {
      const data = await getPortfolioData();
      const { bio } = data;

      const whoAmI = data.projects.find((p) => p.name === "Who Am I?");
      const howIBuild = data.projects.find((p) => p.name === "How I Build");

      let text = `# ${bio.name}\n\n`;
      text += `**Location:** ${bio.location}\n`;
      text += `**Email:** ${bio.email}\n`;
      text += `**GitHub:** ${bio.github}\n`;
      text += `**LinkedIn:** ${bio.linkedin}\n`;
      text += `**Website:** https://roodmp.github.io\n\n`;
      text += `## Summary\n${bio.summary}\n`;

      if (whoAmI) {
        text += `\n## About\n${whoAmI.description}\n`;
      }
      if (howIBuild) {
        text += `\n## How I Build\n${howIBuild.description}\n`;
      }

      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool: get_skills ──────────────────────────────────────────────────────
  server.registerTool(
    "get_skills",
    {
      title: "Get Skills",
      description: "Get Mark Rood's skills organized by category",
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async () => {
      const data = await getPortfolioData();
      let text = "# Skills\n\n";

      for (const cat of data.skills) {
        text += `## ${cat.category}\n`;
        text += cat.skills.map((s) => `- ${s}`).join("\n");
        text += "\n\n";
      }

      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool: get_experience ──────────────────────────────────────────────────
  server.registerTool(
    "get_experience",
    {
      title: "Get Experience",
      description:
        "Get Mark Rood's work history, education, and military recognitions",
      inputSchema: {
        company: z
          .string()
          .optional()
          .describe("Filter to a specific company name (partial match)"),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ company }) => {
      const data = await getPortfolioData();
      let jobs = data.jobs;

      if (company) {
        const lower = company.toLowerCase();
        jobs = jobs.filter(
          (j) =>
            j.company.toLowerCase().includes(lower) ||
            j.title.toLowerCase().includes(lower)
        );
      }

      let text = "# Work Experience\n\n";

      if (jobs.length === 0) {
        text += `No matching positions found for "${company}".\n`;
      } else {
        for (const job of jobs) {
          text += `## ${job.title} — ${job.company}\n`;
          text += `*${job.dates}*\n\n`;
          if (job.description) {
            text += `${job.description}\n\n`;
          }
          if (job.bullets.length > 0) {
            text += job.bullets.map((b) => `- ${b}`).join("\n");
            text += "\n\n";
          }
        }
      }

      if (!company) {
        text += "# Education\n\n";
        for (const edu of data.education) {
          text += `## ${edu.title}\n`;
          text += `*${edu.institution}*\n\n`;
          if (edu.bullets.length > 0) {
            text += edu.bullets.map((b) => `- ${b}`).join("\n");
            text += "\n\n";
          }
        }

        text += "# Recognitions\n\n";
        for (const rec of data.recognitions) {
          text += `## ${rec.title}\n`;
          text += `*${rec.date}*\n\n`;
          text += `${rec.description}\n\n`;
        }
      }

      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool: list_projects ───────────────────────────────────────────────────
  server.registerTool(
    "list_projects",
    {
      title: "List Projects",
      description:
        "List projects Mark has built, with optional filtering by status, type, or search term",
      inputSchema: {
        status: z
          .enum(["shipped", "in-progress", "backlog"])
          .optional()
          .describe("Filter by project status"),
        type: z
          .string()
          .optional()
          .describe(
            "Filter by project type (tool, game, app, design, bot, extension)"
          ),
        search: z
          .string()
          .optional()
          .describe("Search project names and descriptions"),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ status, type, search }) => {
      const data = await getPortfolioData();
      let projects = data.projects;

      if (status) {
        projects = projects.filter((p) => p.status === status);
      }
      if (type) {
        const lower = type.toLowerCase();
        projects = projects.filter((p) => p.type.toLowerCase() === lower);
      }
      if (search) {
        const lower = search.toLowerCase();
        projects = projects.filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            p.description.toLowerCase().includes(lower) ||
            p.tags.some((t) => t.toLowerCase().includes(lower))
        );
      }

      let text = `# Projects (${projects.length} results)\n\n`;

      if (projects.length === 0) {
        text += "No projects match your filters.\n";
      } else {
        for (const p of projects) {
          const linkStr = p.link
            ? ` — [View](https://roodmp.github.io/${p.link})`
            : "";
          text += `## ${p.id}: ${p.name}${linkStr}\n`;
          text += `**Status:** ${p.status} | **Type:** ${p.type} | **Tags:** ${p.tags.join(", ")}\n\n`;
          text += `${p.description}\n\n`;
        }
      }

      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool: get_resources ───────────────────────────────────────────────────
  server.registerTool(
    "get_resources",
    {
      title: "Get Resources",
      description:
        "Get tools and resources Mark uses, optionally filtered by category",
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe(
            "Filter by category (e.g. 'Development', 'macOS', 'Mobile Apps', 'Daily Drivers')"
          ),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ category }) => {
      const data = await getPortfolioData();
      let resources = data.resources;

      if (category) {
        const lower = category.toLowerCase();
        resources = resources.filter((r) =>
          r.category.toLowerCase().includes(lower)
        );
      }

      let text = `# Resources & Tools (${resources.length} results)\n\n`;

      const grouped = new Map<string, typeof resources>();
      for (const r of resources) {
        const cat = r.category;
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat)!.push(r);
      }

      for (const [cat, items] of grouped) {
        text += `## ${cat}\n`;
        for (const item of items) {
          text += `- **${item.name}**`;
          if (item.description) text += ` — ${item.description}`;
          if (
            item.url &&
            !item.url.startsWith("/") &&
            !item.url.endsWith(".html")
          ) {
            text += ` (${item.url})`;
          }
          text += "\n";
        }
        text += "\n";
      }

      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool: ask_mark ────────────────────────────────────────────────────────
  server.registerTool(
    "ask_mark",
    {
      title: "Ask Mark",
      description:
        "Ask a general question about Mark Rood. Returns all portfolio data with guidance for the LLM to answer naturally. Use this for open-ended questions like 'Is Mark a good fit for a PM role?' or 'What has Mark built?'",
      inputSchema: {
        question: z
          .string()
          .describe("The question to answer about Mark Rood"),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ question }) => {
      const data = await getPortfolioData();

      let text = `# Question: ${question}\n\n`;

      // Persona and guidance for the calling LLM
      text += `## Instructions for answering\n`;
      text += `You are answering a question about Mark Rood using his portfolio data below. Follow these guidelines:\n\n`;
      text += `- Speak in **third person** about Mark unless the questioner explicitly asks you to roleplay as him.\n`;
      text += `- Lead with **impact and outcomes**, not just responsibilities. Mark's resume includes measurable results — use them.\n`;
      text += `- Highlight **PM methodology** when relevant: user research, prioritization frameworks, iterative delivery, metrics-driven decisions.\n`;
      text += `- Connect the dots on Mark's **career arc**: SysAdmin → Systems Engineer → Product Manager. This path gives him deep technical empathy and the ability to bridge engineering and product.\n`;
      text += `- Mark doesn't just talk about AI — he **builds with it**. This MCP server itself, the Documentation Audit Agent, and the "Should I Use AI?" decision tool are proof points.\n`;
      text += `- Be **honest about gaps**. Authenticity is more impressive than overselling. If something isn't in the data, say so.\n`;
      text += `- Reference **specific projects by name** when they support your answer. Use \`list_projects\` data below.\n`;
      text += `- For fit assessments, suggest also using the \`evaluate_fit\` tool with a specific job description for a structured analysis.\n\n`;
      text += "---\n\n";

      text += `## Bio\n`;
      text += `**Name:** ${data.bio.name}\n`;
      text += `**Location:** ${data.bio.location}\n`;
      text += `**Email:** ${data.bio.email}\n`;
      text += `**Summary:** ${data.bio.summary}\n\n`;

      const whoAmI = data.projects.find((p) => p.name === "Who Am I?");
      const howIBuild = data.projects.find((p) => p.name === "How I Build");
      if (whoAmI) text += `**About:** ${whoAmI.description}\n\n`;
      if (howIBuild) text += `**How I Build:** ${howIBuild.description}\n\n`;

      text += `## Skills\n`;
      for (const cat of data.skills) {
        text += `**${cat.category}:** ${cat.skills.join(", ")}\n`;
      }
      text += "\n";

      text += `## Work Experience\n`;
      for (const job of data.jobs) {
        text += `### ${job.title} — ${job.company} (${job.dates})\n`;
        if (job.description) text += `${job.description}\n`;
        for (const b of job.bullets) text += `- ${b}\n`;
        text += "\n";
      }

      text += `## Education\n`;
      for (const edu of data.education) {
        text += `**${edu.title}** — ${edu.institution}\n`;
        for (const b of edu.bullets) text += `- ${b}\n`;
        text += "\n";
      }

      text += `## Recognitions\n`;
      for (const rec of data.recognitions) {
        text += `**${rec.title}** (${rec.date})\n${rec.description}\n\n`;
      }

      text += `## Projects (${data.projects.length} total)\n`;
      for (const p of data.projects) {
        text += `- **${p.name}** [${p.status}] — ${p.description}\n`;
      }
      text += "\n";

      text += `## Tools & Resources\n`;
      for (const r of data.resources) {
        text += `- ${r.name} (${r.category})`;
        if (r.description) text += ` — ${r.description}`;
        text += "\n";
      }

      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool: evaluate_fit ────────────────────────────────────────────────────
  server.registerTool(
    "evaluate_fit",
    {
      title: "Evaluate Job Fit",
      description:
        "Evaluate how well Mark Rood matches a job description. Paste a full JD to get a structured fit analysis with skill matches, relevant experience, matching projects, and honest growth areas. This is the best tool for answering 'Is Mark a good fit for this role?'",
      inputSchema: {
        jobDescription: z
          .string()
          .describe(
            "The full text of a job description to evaluate Mark's fit against"
          ),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ jobDescription }) => {
      const data = await getPortfolioData();
      const analysis = evaluateFit(jobDescription, data);
      const text = formatFitAnalysis(analysis, jobDescription);
      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool: suggest_questions ───────────────────────────────────────────────
  server.registerTool(
    "suggest_questions",
    {
      title: "Suggest Questions",
      description:
        "Get a list of suggested questions to ask about Mark Rood, organized by topic. Helps with discoverability — each question hints at which tool to use.",
      inputSchema: {
        topic: z
          .string()
          .optional()
          .describe(
            "Filter to a topic: 'getting-started', 'product-ai', 'fit-assessment', or 'deep-dives'"
          ),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ topic }) => {
      let text = "# Suggested Questions About Mark Rood\n\n";

      const topics = topic
        ? { [topic]: SUGGESTED_QUESTIONS[topic] }
        : SUGGESTED_QUESTIONS;

      for (const [key, section] of Object.entries(topics)) {
        if (!section) {
          text += `Unknown topic "${key}". Available: ${Object.keys(SUGGESTED_QUESTIONS).join(", ")}\n`;
          continue;
        }
        text += `## ${section.label}\n`;
        for (const q of section.questions) {
          text += `- ${q}\n`;
        }
        text += "\n";
      }

      text += "---\n";
      text += "**Available tools:** `get_bio`, `get_skills`, `get_experience`, `list_projects`, `get_resources`, `ask_mark`, `evaluate_fit`\n";

      return { content: [{ type: "text", text }] };
    }
  );

  // ── Resource: portfolio://resume ──────────────────────────────────────────
  server.registerResource(
    "resume",
    "portfolio://resume",
    {
      description:
        "Mark Rood's full resume — bio, skills, work experience, education, and recognitions. Attach this to a conversation for complete context.",
      mimeType: "text/markdown",
    },
    async () => {
      const data = await getPortfolioData();
      const { bio } = data;

      let text = `# ${bio.name}\n\n`;
      text += `**Location:** ${bio.location} | **Email:** ${bio.email}\n`;
      text += `**GitHub:** ${bio.github} | **LinkedIn:** ${bio.linkedin}\n`;
      text += `**Website:** https://roodmp.github.io\n\n`;
      text += `## Summary\n${bio.summary}\n\n`;

      const whoAmI = data.projects.find((p) => p.name === "Who Am I?");
      const howIBuild = data.projects.find((p) => p.name === "How I Build");
      if (whoAmI) text += `## About\n${whoAmI.description}\n\n`;
      if (howIBuild) text += `## How I Build\n${howIBuild.description}\n\n`;

      text += "## Skills\n\n";
      for (const cat of data.skills) {
        text += `### ${cat.category}\n`;
        text += cat.skills.map((s) => `- ${s}`).join("\n");
        text += "\n\n";
      }

      text += "## Work Experience\n\n";
      for (const job of data.jobs) {
        text += `### ${job.title} — ${job.company}\n`;
        text += `*${job.dates}*\n\n`;
        if (job.description) text += `${job.description}\n\n`;
        if (job.bullets.length > 0) {
          text += job.bullets.map((b) => `- ${b}`).join("\n");
          text += "\n\n";
        }
      }

      text += "## Education\n\n";
      for (const edu of data.education) {
        text += `### ${edu.title}\n`;
        text += `*${edu.institution}*\n\n`;
        if (edu.bullets.length > 0) {
          text += edu.bullets.map((b) => `- ${b}`).join("\n");
          text += "\n\n";
        }
      }

      text += "## Recognitions\n\n";
      for (const rec of data.recognitions) {
        text += `### ${rec.title}\n`;
        text += `*${rec.date}*\n\n`;
        text += `${rec.description}\n\n`;
      }

      return { contents: [{ uri: "portfolio://resume", mimeType: "text/markdown", text }] };
    }
  );

  // ── Resource: portfolio://projects ────────────────────────────────────────
  server.registerResource(
    "projects",
    "portfolio://projects",
    {
      description:
        "All projects Mark has built — apps, tools, games, bots, and design work. Includes status, type, tags, and descriptions.",
      mimeType: "text/markdown",
    },
    async () => {
      const data = await getPortfolioData();

      let text = `# Projects (${data.projects.length} total)\n\n`;

      const byStatus = new Map<string, typeof data.projects>();
      for (const p of data.projects) {
        if (!byStatus.has(p.status)) byStatus.set(p.status, []);
        byStatus.get(p.status)!.push(p);
      }

      for (const status of ["shipped", "in-progress", "backlog"]) {
        const projects = byStatus.get(status);
        if (!projects || projects.length === 0) continue;

        text += `## ${status.charAt(0).toUpperCase() + status.slice(1)} (${projects.length})\n\n`;
        for (const p of projects) {
          const linkStr = p.link
            ? ` — [View](https://roodmp.github.io/${p.link})`
            : "";
          text += `### ${p.id}: ${p.name}${linkStr}\n`;
          text += `**Type:** ${p.type} | **Tags:** ${p.tags.join(", ")}\n\n`;
          text += `${p.description}\n\n`;
        }
      }

      return { contents: [{ uri: "portfolio://projects", mimeType: "text/markdown", text }] };
    }
  );

  return server;
}
