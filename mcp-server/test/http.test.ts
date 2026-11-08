import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { setTimeout } from "node:timers/promises";
import test from "node:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "../api/mcp.js";

test("public HTTP handler bounds requests without breaking single-message MCP", async (t) => {
  const httpFetch = globalThis.fetch;
  const upstream = t.mock.method(globalThis, "fetch", async (url: Parameters<typeof fetch>[0], options?: RequestInit) => {
    assert.match(String(url), /^https:\/\/roodmp\.github\.io\/(index|about|resources)\.html$/);
    assert.ok(options?.signal instanceof AbortSignal);
    await setTimeout(20);
    return new Response('<h1 class="resume-name">Fixture Name</h1>');
  });

  // Supply the same parsed body and response helpers as Vercel, but use real
  // Node sockets and the real handler/SDK transport (not a mocked transport).
  const server = createServer(async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const request = req as VercelRequest;
      const response = res as VercelResponse;
      const body = Buffer.concat(chunks).toString();
      request.body = body ? JSON.parse(body) : undefined;
      response.status = (status) => { response.statusCode = status; return response; };
      response.json = (value) => {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(value));
        return response;
      };
      await handler(request, response);
    } catch (error) {
      res.statusCode = 500;
      res.end(String(error));
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => { server.closeAllConnections(); server.close(); });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/mcp`;
  async function send(body?: unknown, method = "POST") {
    const response = await httpFetch(url, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", Origin: "https://example.com" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    assert.equal(response.headers.get("access-control-allow-origin"), "*");
    const text = await response.text();
    const data = text.startsWith("{") ? JSON.parse(text)
      : JSON.parse(text.split("\n").find((line) => line.startsWith("data: "))?.slice(6) || "null");
    return { status: response.status, data };
  }
  const call = (name: string, args = {}) => ({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });

  await t.test("rejects batches (including the 101-call exploit) before any fetch", async () => {
    for (const body of [[], [call("get_bio")], Array.from({ length: 101 }, () => call("get_bio")), null, "invalid"]) {
      const response = await send(body);
      assert.equal(response.status, 400);
      assert.equal(response.data.error.code, -32600);
    }
    assert.equal(upstream.mock.callCount(), 0);
  });

  await t.test("limits serialized UTF-8 bytes of parsed bodies, including the exact boundary", async () => {
    const body = { jsonrpc: "2.0", id: 1, method: "tools/list", params: { _meta: { padding: "" } } };
    body.params._meta.padding = "a".repeat(65536 - Buffer.byteLength(JSON.stringify(body)));
    assert.equal((await send(body)).status, 200);
    body.params._meta.padding += "a";
    assert.equal((await send(body)).status, 413);
    body.params._meta.padding = "é".repeat(32768);
    assert.equal((await send(body)).status, 413);
    assert.equal(upstream.mock.callCount(), 0);
  });

  await t.test("accepts initialize, notifications, discovery, and concurrent unauthenticated tool calls", async () => {
    const initialized = await send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {
      protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" },
    } });
    assert.equal(initialized.status, 200);
    assert.equal(initialized.data.result.serverInfo.name, "mark-rood-portfolio");
    assert.equal((await send({ jsonrpc: "2.0", method: "notifications/initialized" })).status, 202);
    const tools = await send({ jsonrpc: "2.0", id: 1, method: "tools/list" });
    assert.ok(tools.data.result.tools.every((tool: { annotations: { readOnlyHint: boolean } }) => tool.annotations.readOnlyHint));
    const responses = await Promise.all(Array.from({ length: 20 }, () => send(call("get_bio"))));
    for (const response of responses) {
      assert.equal(response.status, 200);
      assert.match(response.data.result.content[0].text, /Fixture Name/);
    }
    assert.equal(upstream.mock.callCount(), 3);
    const resource = await send({ jsonrpc: "2.0", id: 1, method: "resources/read", params: { uri: "portfolio://resume" } });
    assert.match(resource.data.result.contents[0].text, /Fixture Name/);
    assert.equal(upstream.mock.callCount(), 3);
  });

  await t.test("enforces tool string boundaries and SDK complexity limit", async () => {
    const limits: [string, string, number][] = [
      ["get_experience", "company", 256], ["list_projects", "type", 64],
      ["list_projects", "search", 256], ["get_resources", "category", 256],
      ["ask_mark", "question", 4096], ["evaluate_fit", "jobDescription", 32768],
      ["suggest_questions", "topic", 64],
    ];
    for (const [name, field, max] of limits) {
      const valid = await send(call(name, { [field]: "a".repeat(max) }));
      assert.equal(valid.status, 200);
      assert.notEqual(valid.data.result.isError, true, `${name} boundary should work`);
      const invalid = await send(call(name, { [field]: "a".repeat(max + 1) }));
      assert.equal(invalid.data.result.isError, true, `${name} must reject oversized ${field}`);
    }
    const complex = await send(call("ask_mark", { question: "Hi", extra: Array(64).fill(0) }));
    assert.equal(complex.data.result.isError, true);
    assert.match(complex.data.result.content[0].text, /maximum of 64 elements/);
    assert.equal(upstream.mock.callCount(), 3);
  });

  await t.test("retains preflight and method behavior", async () => {
    assert.equal((await send(undefined, "OPTIONS")).status, 204);
    for (const method of ["GET", "DELETE"]) assert.equal((await send(undefined, method)).status, 405);
  });
});
