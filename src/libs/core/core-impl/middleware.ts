import type { Context, Middleware } from "./types.js";

export const compose = (middleware: Middleware[]) => {
  return async (
    ctx: Context,
    next: () => Promise<Response>,
  ): Promise<Response> => {
    // Return immediately if no middleware
    if (middleware.length === 0) return next();

    // Create array of middleware functions with next handlers
    const chain = middleware.map((fn, i) => {
      return async () => {
        try {
          return await fn(ctx, chain[i + 1] || next);
        } catch (err) {
          if (ctx.server.development) {
            console.error("Middleware error:", err);
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
      };
    });

    return chain[0]();
  };
};

// Built-in middleware
export const timing = (): Middleware => {
  return async (_ctx, next) => {
    const start = performance.now();
    const response = await next();
    const ms = performance.now() - start;

    // Clone the response to add the timing header
    const headers = new Headers(response.headers);
    headers.set("X-Response-Time", `${ms.toFixed(2)}ms`);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
};

export const cors = (
  options: {
    origin?: string | string[];
    methods?: string[];
    allowHeaders?: string[];
    exposeHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  } = {},
): Middleware => {
  const {
    origin = "*",
    methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowHeaders = [],
    exposeHeaders = [],
    credentials = false,
    maxAge = 86400,
  } = options;

  return async (ctx, next) => {
    const response = await next();
    const headers = new Headers(response.headers);

    headers.set(
      "Access-Control-Allow-Origin",
      Array.isArray(origin) ? origin.join(",") : origin,
    );

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
      headers,
    });
  };
};
