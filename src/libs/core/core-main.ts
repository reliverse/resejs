import type { Server } from "bun";

import type {
  Context,
  ReseConfig,
  ReseInstance,
  Route,
  RouteHandler,
} from "./core-impl/types.js";

import { compose } from "./core-impl/middleware.js";
import { createRouter } from "./core-impl/router.js";

const createContext = (req: Request, server: Server): Context => {
  const url = new URL(req.url);
  return {
    req,
    params: {},
    query: url.searchParams,
    server,
  };
};

const handleRoute = async (route: Route, ctx: Context): Promise<Response> => {
  if (typeof route === "function") {
    return await route(ctx);
  }

  const method = ctx.req.method as keyof typeof route;
  const handler = route[method];

  if (!handler) {
    return new Response(`Method ${method} not allowed`, {
      status: 405,
      headers: {
        Allow: Object.keys(route).join(", "),
      },
    });
  }

  return await handler(ctx);
};

const createStaticHandler = (
  config: NonNullable<ReseConfig["static"]>,
): RouteHandler => {
  const prefix = config.prefix || "/static";
  const baseDir = config.dir;

  return async (ctx) => {
    const url = new URL(ctx.req.url);
    if (!url.pathname.startsWith(prefix)) {
      return new Response("Not Found", { status: 404 });
    }

    const filePath = url.pathname.slice(prefix.length);
    const file = Bun.file(`${baseDir}${filePath}`);
    const exists = await file.exists();

    if (!exists) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(file);
  };
};

export const createApp = (config: ReseConfig = {}): ReseInstance => {
  const {
    port = 3000,
    hostname = "0.0.0.0",
    development = process.env.NODE_ENV !== "production",
    routes = {},
    middleware = [],
    websocket,
    static: staticConfig,
  } = config;

  // Add static file handler if configured
  if (staticConfig) {
    const staticHandler = createStaticHandler(staticConfig);
    routes[`${staticConfig.prefix || "/static"}/*`] = staticHandler;
  }

  const router = createRouter(routes);
  let server: Server | null = null;

  const start = async (): Promise<Server> => {
    server = Bun.serve({
      port,
      hostname,
      development,

      websocket: websocket?.handler,

      async fetch(req, bunServer) {
        const ctx = createContext(req, bunServer);

        // Handle WebSocket upgrade if configured
        if (websocket && req.url.endsWith(websocket.path)) {
          const upgraded = bunServer.upgrade(req);
          if (upgraded) {
            return new Response(null, { status: 101 });
          }
        }

        try {
          const url = new URL(req.url);
          const match = router.match(url.pathname, ctx);

          if (!match) {
            return new Response("Not Found", { status: 404 });
          }

          ctx.params = match.params;

          // Compose middleware with route handler
          const handler = compose(middleware);
          return await handler(ctx, () => handleRoute(match.handler, ctx));
        } catch (err) {
          console.error("Server error:", err);
          if (development) {
            return new Response(
              `Internal Server Error: ${err instanceof Error ? err.message : "Unknown error"}`,
              {
                status: 500,
                headers: { "Content-Type": "text/plain" },
              },
            );
          }
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    });

    console.log(`✅ Server running at ${server.url}`);
    return server;
  };

  const stop = async () => {
    if (server) {
      await server.stop();
      server = null;
    }
  };

  return { start, stop };
};
