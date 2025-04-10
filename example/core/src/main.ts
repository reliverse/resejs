import type { WebSocketHandler } from "bun";

import { timing, cors } from "../../../src/libs/core/core-impl/middleware.js";
import { createApp } from "../../../src/libs/core/core-main.js";

// WebSocket handler
const wsHandler: WebSocketHandler = {
  message(ws, message) {
    console.log("Received:", message);
    ws.send(`Echo: ${message}`);
  },
  open(ws) {
    console.log("Client connected");
    ws.subscribe("broadcast");
  },
  close(ws) {
    console.log("Client disconnected");
    ws.unsubscribe("broadcast");
  },
};

// Create the app
const app = createApp({
  port: 3000,
  development: true,

  // Configure middleware
  middleware: [
    timing(),
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }),
  ],

  // Configure routes
  routes: {
    // Static route
    "/": () =>
      new Response("Welcome to rese framework!", {
        headers: {
          "Content-Type": "text/html",
        },
      }),

    // JSON response
    "/api/info": {
      GET: () =>
        Response.json({
          name: "rese",
          version: "1.0.0",
          engine: "bun",
        }),
    },

    // Dynamic route with parameters
    "/api/users/:id": (ctx) => {
      const { id } = ctx.params;
      return Response.json({
        id,
        name: `User ${id}`,
        createdAt: new Date().toISOString(),
      });
    },

    // Route with different HTTP methods
    "/api/posts": {
      GET: async () => {
        return Response.json([
          { id: 1, title: "Hello Rese" },
          { id: 2, title: "Built with Bun" },
        ]);
      },
      POST: async (ctx) => {
        const body = (await ctx.req.json()) as Record<string, unknown>;
        // Generate a unique ID
        const id = Bun.hash(Date.now() + Math.random().toString()).toString();
        return Response.json({ id, ...body }, { status: 201 });
      },
    },

    // Wildcard route
    "/api/*": () => new Response("API endpoint not found", { status: 404 }),
  },

  // Configure WebSocket
  websocket: {
    handler: wsHandler,
    path: "/ws",
  },

  // Configure static file serving
  static: {
    dir: "./example/core/public",
    prefix: "/static",
  },
});

// Start the server
const server = await app.start();

console.log(`👉 http://${server.hostname}:${server.port}/static/index.html`);

// Broadcast message every 5 seconds (in development only)
if (server.development) {
  setInterval(() => {
    server.publish("broadcast", `Server time: ${new Date().toISOString()}`);
  }, 10000);
}
