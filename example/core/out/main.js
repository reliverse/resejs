// src/libs/core/core-impl/middleware.ts
var compose = (middleware) => {
  return async (ctx, next) => {
    if (middleware.length === 0)
      return next();
    const chain = middleware.map((fn, i) => {
      return async () => {
        try {
          return await fn(ctx, chain[i + 1] || next);
        } catch (err) {
          if (ctx.server.development) {
            console.error("Middleware error:", err);
            return new Response(`Internal Server Error: ${err instanceof Error ? err.message : "Unknown error"}`, {
              status: 500,
              headers: { "Content-Type": "text/plain" }
            });
          }
          return new Response("Internal Server Error", { status: 500 });
        }
      };
    });
    return chain[0]();
  };
};
var timing = () => {
  return async (_ctx, next) => {
    const start = performance.now();
    const response = await next();
    const ms = performance.now() - start;
    const headers = new Headers(response.headers);
    headers.set("X-Response-Time", `${ms.toFixed(2)}ms`);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
};
var cors = (options = {}) => {
  const {
    origin = "*",
    methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowHeaders = [],
    exposeHeaders = [],
    credentials = false,
    maxAge = 86400
  } = options;
  return async (ctx, next) => {
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", Array.isArray(origin) ? origin.join(",") : origin);
    if (credentials) {
      headers.set("Access-Control-Allow-Credentials", "true");
    }
    if (ctx.req.method === "OPTIONS") {
      headers.set("Access-Control-Allow-Methods", methods.join(","));
      if (allowHeaders.length) {
        headers.set("Access-Control-Allow-Headers", allowHeaders.join(","));
      }
      if (exposeHeaders.length) {
        headers.set("Access-Control-Expose-Headers", exposeHeaders.join(","));
      }
      headers.set("Access-Control-Max-Age", maxAge.toString());
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
};

// src/libs/core/core-impl/router.ts
var compilePattern = (pattern) => {
  const paramNames = [];
  const regexParts = pattern.split("/").map((part) => {
    if (part.startsWith(":")) {
      const paramName = part.slice(1);
      paramNames.push(paramName);
      return "([^/]+)";
    }
    if (part === "*") {
      return ".*";
    }
    return part;
  });
  return {
    regex: new RegExp(`^${regexParts.join("/")}$`),
    paramNames
  };
};
var createRouter = (routes) => {
  const compiledRoutes = Object.entries(routes).map(([pattern, handler]) => {
    const { regex, paramNames } = compilePattern(pattern);
    return { pattern, regex, paramNames, handler };
  });
  compiledRoutes.sort((a, b) => {
    const aStatic = a.paramNames.length === 0 && !a.pattern.includes("*");
    const bStatic = b.paramNames.length === 0 && !b.pattern.includes("*");
    if (aStatic && !bStatic)
      return -1;
    if (!aStatic && bStatic)
      return 1;
    const aWildcard = a.pattern.includes("*");
    const bWildcard = b.pattern.includes("*");
    if (!aWildcard && bWildcard)
      return -1;
    if (aWildcard && !bWildcard)
      return 1;
    return b.pattern.length - a.pattern.length;
  });
  return {
    match: (path, _ctx) => {
      for (const route of compiledRoutes) {
        const match = path.match(route.regex);
        if (match) {
          const params = {};
          route.paramNames.forEach((name, i) => {
            params[name] = match[i + 1];
          });
          return { handler: route.handler, params };
        }
      }
      return null;
    }
  };
};

// src/libs/core/core-main.ts
var createContext = (req, server) => {
  const url = new URL(req.url);
  return {
    req,
    params: {},
    query: url.searchParams,
    server
  };
};
var handleRoute = async (route, ctx) => {
  if (typeof route === "function") {
    return await route(ctx);
  }
  const method = ctx.req.method;
  const handler = route[method];
  if (!handler) {
    return new Response(`Method ${method} not allowed`, {
      status: 405,
      headers: {
        Allow: Object.keys(route).join(", ")
      }
    });
  }
  return await handler(ctx);
};
var createStaticHandler = (config) => {
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
var createApp = (config = {}) => {
  const {
    port = 3000,
    hostname = "0.0.0.0",
    development = true,
    routes = {},
    middleware = [],
    websocket,
    static: staticConfig
  } = config;
  if (staticConfig) {
    const staticHandler = createStaticHandler(staticConfig);
    routes[`${staticConfig.prefix || "/static"}/*`] = staticHandler;
  }
  const router = createRouter(routes);
  let server = null;
  const start = async () => {
    server = Bun.serve({
      port,
      hostname,
      development,
      websocket: websocket?.handler,
      async fetch(req, bunServer) {
        const ctx = createContext(req, bunServer);
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
          const handler = compose(middleware);
          return await handler(ctx, () => handleRoute(match.handler, ctx));
        } catch (err) {
          console.error("Server error:", err);
          if (development) {
            return new Response(`Internal Server Error: ${err instanceof Error ? err.message : "Unknown error"}`, {
              status: 500,
              headers: { "Content-Type": "text/plain" }
            });
          }
          return new Response("Internal Server Error", { status: 500 });
        }
      }
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

// example/core/src/main.ts
var wsHandler = {
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
  }
};
var app = createApp({
  port: 3000,
  development: true,
  middleware: [
    timing(),
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    })
  ],
  routes: {
    "/": () => new Response("Welcome to rese framework!", {
      headers: {
        "Content-Type": "text/html"
      }
    }),
    "/api/info": {
      GET: () => Response.json({
        name: "rese",
        version: "1.0.0",
        engine: "bun"
      })
    },
    "/api/users/:id": (ctx) => {
      const { id } = ctx.params;
      return Response.json({
        id,
        name: `User ${id}`,
        createdAt: new Date().toISOString()
      });
    },
    "/api/posts": {
      GET: async () => {
        return Response.json([
          { id: 1, title: "Hello Rese" },
          { id: 2, title: "Built with Bun" }
        ]);
      },
      POST: async (ctx) => {
        const body = await ctx.req.json();
        const id = Bun.hash(Date.now() + Math.random().toString()).toString();
        return Response.json({ id, ...body }, { status: 201 });
      }
    },
    "/api/*": () => new Response("API endpoint not found", { status: 404 })
  },
  websocket: {
    handler: wsHandler,
    path: "/ws"
  },
  static: {
    dir: "./example/core/public",
    prefix: "/static"
  }
});
var server = await app.start();
console.log(`\uD83D\uDC49 http://${server.hostname}:${server.port}/static/index.html`);
if (server.development) {
  setInterval(() => {
    server.publish("broadcast", `Server time: ${new Date().toISOString()}`);
  }, 1e4);
}
