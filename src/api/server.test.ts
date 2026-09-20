import { describe, it, expect } from "vitest";
import { createApp } from "./server.js";
import { HackathonRepository } from "../persistence/hackathon.repository.js";

describe("API Server - /health", () => {
  it("returns 200 with { status: 'ok' } without accessing database", async () => {
    // Mock repository
    const mockRepo = {} as unknown as HackathonRepository;
    const app = createApp(mockRepo);

    // Use express's request handling
    const res = await new Promise<{ status: number; body: any }>((resolve) => {
      const server = app.listen(0, () => {
        const addr = server.address();
        const port = typeof addr === "object" && addr ? addr.port : 0;
        fetch(`http://127.0.0.1:${port}/health`)
          .then(async (response) => {
            const body = await response.json();
            server.close(() => {
              resolve({ status: response.status, body });
            });
          });
      });
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
