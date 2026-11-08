import type { VercelRequest, VercelResponse } from "@vercel/node";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "../src/server.js";

const MAX_REQUEST_BYTES = 64 * 1024;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for remote MCP clients
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Mcp-Session-Id");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // Only POST is supported for stateless streamable HTTP
  if (req.method !== "POST") {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed. Use POST.",
      },
      id: null,
    });
    return;
  }

  // Vercel has already parsed the body. Guard it here: the transport's raw
  // request limit does not apply to parsedBody, and MCP accepts one message only.
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32600, message: "Expected a single JSON-RPC message; batches are not supported." },
      id: null,
    });
    return;
  }

  const bodyBytes = Buffer.byteLength(JSON.stringify(req.body), "utf8");
  if (bodyBytes > MAX_REQUEST_BYTES) {
    res.status(413).json({
      jsonrpc: "2.0",
      error: { code: -32600, message: "Request exceeds 64 KiB." },
      id: null,
    });
    return;
  }

  const server = createServer();

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless — no sessions
      maxRequestBodySize: MAX_REQUEST_BYTES,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
}
