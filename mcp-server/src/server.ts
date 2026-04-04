import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getPortfolioData } from "./scraper.js";

/**
 * Creates and configures a new MCP server instance.
 * Extracted so both stdio (local) and HTTP (Vercel) entry points can share it.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "mark-rood-portfolio",
    version: "1.0.0",
  });

  // ── Tool: get_bio ─────────────────────────────────────────────────────────
  server.tool(
    "get_bio",
    "Get Mark Rood's bio, summary, location, and contact info",
    {},
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
  server.tool(
    "get_skills",
    "Get Mark Rood's skills organized by category",
    {},
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
  server.tool(
    "get_experience",
    "Get Mark Rood's work history, education, and military recognitions",
    {
      company: z
        .string()
        .optional()
        .describe("Filter to a specific company name (partial match)"),
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
  server.tool(
    "list_projects",
    "List projects Mark has built, with optional filtering by status, type, or search term",
    {
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
  server.tool(
    "get_resources",
    "Get tools and resources Mark uses, optionally filtered by category",
    {
      category: z
        .string()
        .optional()
        .describe(
          "Filter by category (e.g. 'Development', 'macOS', 'Mobile Apps', 'Daily Drivers')"
        ),
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
  server.tool(
    "ask_mark",
    "Ask a general question about Mark Rood. Returns all portfolio data so the LLM can answer naturally. Use this for open-ended questions like 'Is Mark a good fit for a PM role?' or 'What has Mark built?'",
    {
      question: z.string().describe("The question to answer about Mark Rood"),
    },
    async ({ question }) => {
      const data = await getPortfolioData();

      let text = `# Question: ${question}\n\n`;
      text += `Below is Mark Rood's full portfolio data scraped from https://roodmp.github.io. Use it to answer the question.\n\n`;
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

  return server;
}
