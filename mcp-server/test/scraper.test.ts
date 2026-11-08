import assert from "node:assert/strict";
import test from "node:test";
import { getPortfolioData } from "../src/scraper.js";

test("public scraper shares cold/expired refreshes, clears failures, and times out body reads", async (t) => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  let mode: "ok" | "fail" | "timeout" = "ok";
  const signals: AbortSignal[] = [];
  const upstream = t.mock.method(globalThis, "fetch", async (url: Parameters<typeof fetch>[0], options?: RequestInit) => {
    assert.match(String(url), /^https:\/\/roodmp\.github\.io\/(index|about|resources)\.html$/);
    const signal = options?.signal;
    assert.ok(signal instanceof AbortSignal);
    signals.push(signal);
    if (mode === "fail") throw new Error("mock upstream unavailable");
    if (mode === "timeout") {
      // Headers arrive, but the body stalls until the real timeout signal fires.
      return new Response(new ReadableStream({
        start(controller) {
          signal.addEventListener("abort", () => controller.error(signal.reason), { once: true });
        },
      }));
    }
    return new Response('<h1 class="resume-name">Fixture Name</h1>');
  });

  const cold = await Promise.all(Array.from({ length: 101 }, () => getPortfolioData()));
  assert.equal(upstream.mock.callCount(), 3);
  assert.equal(cold[0].bio.name, "Fixture Name");
  assert.ok(cold.every((data) => data === cold[0]));
  assert.equal(await getPortfolioData(), cold[0]);
  assert.equal(upstream.mock.callCount(), 3);

  now += 5 * 60 * 1000;
  mode = "fail";
  const failed = await Promise.allSettled(Array.from({ length: 101 }, () => getPortfolioData()));
  assert.ok(failed.every((result) => result.status === "rejected" && /mock upstream unavailable/.test(String(result.reason))));
  assert.equal(upstream.mock.callCount(), 6);

  mode = "ok";
  const retried = await Promise.all(Array.from({ length: 101 }, () => getPortfolioData()));
  assert.equal(upstream.mock.callCount(), 9);
  assert.notEqual(retried[0], cold[0]);
  assert.ok(retried.every((data) => data === retried[0]));

  now += 5 * 60 * 1000;
  mode = "timeout";
  // AbortSignal.timeout uses an unref'ed timer; keep the test alive while waiting.
  const keepAlive = setInterval(() => {}, 1000);
  try {
    await assert.rejects(getPortfolioData(), { name: "TimeoutError" });
  } finally {
    clearInterval(keepAlive);
  }
  assert.equal(upstream.mock.callCount(), 12);
  assert.equal(signals.at(-3)?.aborted, true);
  mode = "ok";
  assert.equal((await getPortfolioData()).bio.name, "Fixture Name");
  assert.equal(upstream.mock.callCount(), 15);
});
