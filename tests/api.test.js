import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

describe("Node.js REST API", () => {
  let server;
  let baseUrl;

  beforeEach(async () => {
    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("returns API metadata on GET / and health status on GET /health", async () => {
    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    const rootBody = await rootRes.json();
    assert.equal(rootBody.name, "node-rest-api");
    assert.equal(rootBody.status, "ok");
    assert.ok(Array.isArray(rootBody.endpoints));

    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    const healthBody = await healthRes.json();
    assert.equal(healthBody.status, "ok");
    assert.equal(typeof healthBody.uptime, "number");
    assert.ok(Date.parse(healthBody.timestamp));
  });

  it("lists seeded items and supports filtering", async () => {
    const res = await fetch(`${baseUrl}/api/items`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.count, 2);
    assert.equal(body.data.length, 2);

    const completedRes = await fetch(`${baseUrl}/api/items?completed=true`);
    assert.equal(completedRes.status, 200);
    const completedBody = await completedRes.json();
    assert.equal(completedBody.count, 1);
    assert.equal(completedBody.data[0].completed, true);

    const searchRes = await fetch(`${baseUrl}/api/items?q=database`);
    assert.equal(searchRes.status, 200);
    const searchBody = await searchRes.json();
    assert.equal(searchBody.count, 1);
    assert.match(searchBody.data[0].title, /database/i);

    const badFilterRes = await fetch(`${baseUrl}/api/items?completed=maybe`);
    assert.equal(badFilterRes.status, 400);
  });

  it("performs full CRUD lifecycle on /api/items", async () => {
    const createRes = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "  Ship feature  " }),
    });
    assert.equal(createRes.status, 201);
    const { data: created } = await createRes.json();
    assert.equal(created.id, 3);
    assert.equal(created.title, "Ship feature");
    assert.equal(created.completed, false);

    const getRes = await fetch(`${baseUrl}/api/items/${created.id}`);
    assert.equal(getRes.status, 200);
    const { data: fetched } = await getRes.json();
    assert.equal(fetched.id, created.id);

    const patchRes = await fetch(`${baseUrl}/api/items/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    assert.equal(patchRes.status, 200);
    const { data: patched } = await patchRes.json();
    assert.equal(patched.completed, true);
    assert.equal(patched.title, "Ship feature");

    const putRes = await fetch(`${baseUrl}/api/items/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Shipped feature", completed: true }),
    });
    assert.equal(putRes.status, 200);
    const { data: replaced } = await putRes.json();
    assert.equal(replaced.title, "Shipped feature");

    const delRes = await fetch(`${baseUrl}/api/items/${created.id}`, {
      method: "DELETE",
    });
    assert.equal(delRes.status, 204);

    const missingRes = await fetch(`${baseUrl}/api/items/${created.id}`);
    assert.equal(missingRes.status, 404);
  });

  it("validates payloads, IDs, malformed JSON, and unknown routes", async () => {
    const badIdRes = await fetch(`${baseUrl}/api/items/abc`);
    assert.equal(badIdRes.status, 400);

    const missingItemRes = await fetch(`${baseUrl}/api/items/999`);
    assert.equal(missingItemRes.status, 404);

    const badPostRes = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    });
    assert.equal(badPostRes.status, 400);

    const emptyPatchRes = await fetch(`${baseUrl}/api/items/1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(emptyPatchRes.status, 400);

    const badJsonRes = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad json",
    });
    assert.equal(badJsonRes.status, 400);

    const notFoundRes = await fetch(`${baseUrl}/unknown-route`);
    assert.equal(notFoundRes.status, 404);
  });
});
