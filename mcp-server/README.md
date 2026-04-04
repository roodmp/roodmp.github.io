# Mark Rood MCP Server

An MCP (Model Context Protocol) server that scrapes [markrood.io](https://roodmp.github.io) and exposes structured tools for querying Mark's portfolio, resume, projects, and resources.

## Tools

| Tool | Description |
|------|-------------|
| `get_bio` | Bio, summary, location, contact info |
| `get_skills` | Skills organized by category |
| `get_experience` | Work history, education, recognitions. Optional `company` filter |
| `list_projects` | Projects with optional `status`, `type`, and `search` filters |
| `get_resources` | Tools and resources, optionally filtered by `category` |
| `ask_mark` | Open-ended questions — returns full portfolio context for the LLM |

## Cloud-Hosted (Vercel)

The server is deployed on Vercel with Streamable HTTP transport at:

```
https://your-vercel-url.vercel.app/mcp
```

### Connect from Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "mark-rood": {
      "type": "streamable-http",
      "url": "https://your-vercel-url.vercel.app/mcp"
    }
  }
}
```

### Connect from Claude Code

```bash
claude mcp add mark-rood --transport http https://your-vercel-url.vercel.app/mcp
```

## Local Setup

### Prerequisites

- Node.js 18+
- npm

### Install & Build

```bash
cd mcp-server
npm install
npm run build
```

### Run locally (stdio transport)

```bash
npm start
```

### Use locally with Claude Desktop

```json
{
  "mcpServers": {
    "mark-rood": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

## How It Works

The server scrapes three pages from roodmp.github.io at query time:

- **index.html** — resume (bio, skills, work history, education, recognitions)
- **about.html** — projects list (parsed from the `projects` JavaScript array)
- **resources.html** — tools and resources by category

Scraped data is cached for 5 minutes to keep responses fast without hammering the site.

On Vercel, each request is stateless — a new server instance is created per invocation using `StreamableHTTPServerTransport` with no session management needed.

## Project Structure

```
mcp-server/
├── api/
│   └── mcp.ts          # Vercel serverless function (HTTP transport)
├── src/
│   ├── server.ts        # Shared MCP server factory (tools + config)
│   ├── scraper.ts       # Cheerio-based scraper for markrood.io
│   └── index.ts         # Local stdio entry point
├── vercel.json          # Vercel routing + function config
├── tsconfig.json
└── package.json
```

## Development

```bash
npm run dev    # Run with tsx (no build step)
npm run build  # Compile TypeScript
npm start      # Run compiled output
```
