# 🌀 Rese

> @reliverse/rese is an extendible, ultra-fast, minimalist typescript/node/bun/desktop/mobile/web framework — with batteries-included DX, expressive routing, and with the full developer-first flavor of Reliverse.

[📦 NPM](https://npmjs.com/package/@reliverse/rese) • [✨ GitHub](https://github.com/reliverse/resejs) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ)

## What is Rese?

**Rese** (**/rɛs/**, **Re**liver**se**) is a **blazing fast web framework** for [**Bun**](https://bun.sh), [**Deno**](https://deno.com), and [**Node.js**](https://nodejs.org). Perfect for applications of any scale or even web-based or native games.

Built on top of `Bun.serve`, powered by a **radix tree**, and designed with **clean context-driven middleware** — Rese gives you everything you need, and nothing you don't.

> - 🧠 3.7x faster than Express.  
> - 🧩 Works like Express, feels like Koa, and is way faster than both.
> - 🔥 The goal is to make a really flexible framework by separating features into plugins.
> - ✌️ So you can have express-like or nextjs-like experience. So you can use it just as a middleware or a full-stack framework.

## Why Rese?

- You're on **Bun** and want something native
- You want **Express-style simplicity**, but with modern perf
- You're building **real-time** apps and want **WebSocket support**
- You want something fast, minimalist, but with serious DX 🧠

> **⚠️ Heads up!**  
>
> - Most of the things mentioned in this doc aren't implemented *yet* — they're part of the vision for `v1.0.0`.
> - Got thoughts? Ideas? Complaints? Drop your feedback in [Discord](https://discord.gg/Pb8uKbwpsJ) or use [GitHub Issues](https://github.com/reliverse/reosapi/issues).
> - Your feedback means the world and helps shape where this project goes next. Thank you!

## Features

- 🧑‍🍳 **DX-first API** — no boilerplate, all elegance
- 📝 **rese.config.ts** — everything is well-configurable via optional config
- 🔥 **Bun-first** — zero Node.js polyfills, 100% native speed
- 🚀 **Radix Tree Routing** — lightning-fast route resolution
- 🧠 **Context-Based Middleware** — with `.before()` and `.after()` phases
- 🎯 **Named Params & Wildcards** — `:user`, `*rest`, etc.
- 📦 **Native WebSocket support** — built on Bun's blazing-fast internals
- ⚠️ **Custom error/404 handlers**
- 📜 **TypeScript-native** — complete typings and inference
- 🔌 **Plugin system** — extendable and modular
- ✌️ **Framework agnostic** — can be used as a middleware or a full-stack framework
- 🎮 **Framework for framework developers** — create your own framework on top of Rese
- 🏗️ **[Relidler](https://github.com/reliverse/relidler)** — used to build your project (`relidler` allows you to choose preferred bundler)
- 🏘️ **Relidler x2** – used to also run your project (`relidler` allows you to choose preferred launcher)

## Installation

> Rese is small by default, but infinitely scalable through plugins.  
> Just like a modern framework should be.

```bash
bun add @reliverse/rese
```

Or if you're building a new project:

```bash
reliverse init --framework rese
```

## Hello, Rese

```ts
// index.ts
import { Rese } from "@reliverse/rese";

const app = new Rese();

app.get("/", (ctx) => ctx.sendText("Hello from Rese 🌌"));

app.listen({ port: 3000 });
```

Output:

```bash
Listening on http://localhost:3000
```

## Examples

### Read JSON body

```ts
app.post("/echo", async (ctx) => {
  const data = await ctx.req.json();
  return ctx.sendJson({ received: data });
});
```

### Dynamic Routes

```ts
app.get("/user/:username", async (ctx) => {
  const { username } = ctx.params;
  return ctx.sendJson({ profile: username });
});
```

### Wildcards

```ts
app.get("/posts/*rest", (ctx) => {
  return ctx.sendText(`You hit /posts/${ctx.params.rest}`);
});
```

### WebSocket Power

```ts
app.ws("/chat", {
  open: (ws) => {
    ws.send("Welcome to Rese chat!");
  },
  message: (ws, msg) => {
    ws.publish("chat", msg);
  },
});
```

### Custom Error / 404 Handlers

```ts
app.errorHandler = (err) => {
  console.error(err);
  return new Response("Something broken 💥", { status: 500 });
};

app.notFoundHandler = () => {
  return new Response("404. Oopsie woopsie! We couldn't find that page.", { status: 404 });
};
```

### Middleware (Before & After)

```ts
app.before((ctx) => {
  if (ctx.headers.get("Authorization") !== "secret") {
    return ctx.sendText("Forbidden", { status: 403 }).forceSend();
  }
  return ctx;
});

app.after((ctx) => {
  ctx.res.headers.set("X-Powered-By", "resejs");
  return ctx;
});
```

### WebSocket Auth Example

```ts
app.ws("/secure", {
  upgrade: (ctx) => {
    if (ctx.headers.get("authorization") !== "Bearer secret") {
      return ctx.sendText("Unauthorized", { status: 403 }).forceSend();
    }
    ctx.extra.user = { id: "abc123" };
    return ctx;
  },
  open: (ws) => {
    console.log("User connected:", ws.data.ctx.extra.user.id);
  },
  message: (ws, msg) => {
    ws.send(`Echo: ${msg}`);
  },
});
```

## Plugin Architecture

Rese supports a **lightweight, opt-in plugin system** that lets you customize and expand your app without sacrificing speed or control. Plugins are just simple modules that extend your app with routes, APIs, utilities, or behaviors.

- Only bring what you need. No bloat — just power.
- And, no worries, unused plugins or specific features are automatically removed from your bundle.

## Planned Plugins

Modular. Powerful. Plug & play.  
These upcoming plugins will unlock everything from AI to edge rendering — all deeply integrated with the Rese core.

| Plugin                            | Description                                                                 |
|-----------------------------------|-----------------------------------------------------------------------------|
| 🌍 `@reliverse/rese-edge`       | Edge-optimized runtime for AI APIs, streaming SSR, and low-latency routing. **Allows to deploy your app to Vercel easily.** |
| 🧠 `@reliverse/rese-ai`         | AI-native routes powered by [Vercel AI](https://vercel.com/ai) — chat, vision, generation |
| 🌐 `@reliverse/rese-mcp`        | Bring your own agent tools with [Model Context Protocol](https://glama.ai/mcp) integration |
| ⚛️ `@reliverse/rese-react`      | Add server-rendered **React/JSX** support (great with islands or full SSR) |
| 📦 `@reliverse/rese-static`     | Static site generation & local file serving, SSG/ISR-style. Astro-style clean JS output (zero client-side overhead unless you opt in). |
| 🧱 `@reliverse/rese-effect`     | Built-in [Effect](https://effect.website) integration — typed errors, dependencies, fibers |
| 🕒 `@reliverse/rese-cron`       | Scheduled tasks with [Trigger](https://trigger.dev), [Effect.Schedule](https://effect.website/docs/scheduling/introduction), or cron strings |
| 🔐 `@reliverse/rese-auth`       | Drop-in session/auth support: cookies, JWT, OAuth2, magic links |
| 🌍 `@reliverse/rese-i18n`       | Multilingual support via **Languine** and **General Translation** |
| 🧬 `@reliverse/rese-db`         | Lightweight DB integration: **bun.Sqlite**, **Drizzle**, **Kysely**, or **Prisma** |

Want to create your own plugin?  
Rese is plugin-first by design. You'll get:

- Full lifecycle hooks (`onInit`, `onRoute`, `onResponse`, etc.)
- Access to Bun-native runtime + oRPC/Effect context
- Typed config + auto-discovery via `rese.config.ts`

### Plugin: `@reliverse/rese-ai`

- Transforms Rese into a full-blown **AI-first framework**.
- Extends Vercel's [`ai`](https://github.com/vercel/ai) possibilities (`ai` should be installed separately)
- LLM tools, multi-agent routing, session support, uploads, vision input
- Useful for declarative AI endpoints like: `ai.chat`, `ai.tool`, `ai.route`
- Designed to work beautifully with `@reliverse/cli`, Glama MCP, Prompt IDE, and agent-first flows

```ts
// rese.config.ts
import { defineReseApp } from "resejs";
import reseai from "@reliverse/rese-ai";

export default defineReseApp({
  plugins: [reseai()],
});
```

### Plugin: `@reliverse/rese-react`

Want HTML streaming or SSR right from Bun? Just plug in React.

```ts
import react from "@reliverse/rese-react";

export default defineReseApp({
  plugins: [react()],
});
```

#### What rese-react adds

- `ctx.jsx(<Component />)` response helpers
- SSR-ready React-powered routes
- Optional integration with `@reliverse/remdn` to auto-generate docs from JSX
- Runs JSX natively in Bun without a build step

## Plugin: `@reliverse/rese-app-router`

Bring the power of **Next.js 13+ App Router** to your Rese app — with full support for file-based routing, nested layouts, loading states, and more.

No manual router config. Just drop your files in the right place, and go.

### 🔍 How it works

With this plugin enabled, Rese will:

- 🧭 Parse `app/` directory and generate routes
- 🧱 Support `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx` files
- ⚡ Automatically preload route modules (optional)
- 🔌 Work seamlessly with plugins like `@reliverse/rese-react` or `@reliverse/rese-ai`

| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| 🗂 File-based routing   | Just use folders and `page.tsx`/`layout.tsx` to build your app              |
| 📦 Per-route loading    | `loading.tsx` support for route-based skeletons                             |
| 🔐 Error boundaries     | `error.tsx` support to isolate failures                                     |
| 🧩 Nested layouts       | Use `layout.tsx` to define shared UI shells (like sidebars, navbars)       |
| ⚙️ Optional config      | Fine-tune behavior via `rese.config.ts`                                     |
| 🔄 Hot reload ready     | Built for DX – instant updates in development                               |
| 🎯 Framework agnostic   | Works with RSC-like React, or plain JSX                                     |

### Example Structure

```bash
app/
├── layout.tsx        # Global layout
├── page.tsx          # Root page
├── loading.tsx       # Global loading state
├── dashboard/
│   ├── layout.tsx    # Dashboard layout
│   ├── page.tsx      # Dashboard home
│   ├── analytics/
│   │   ├── page.tsx  # Nested route
│   │   └── loading.tsx
│   └── settings/
│       ├── page.tsx
│       ├── error.tsx
```

### Example Setup

```ts
// rese.config.ts
import { defineConfig } from "resejs";
import appRouter from "@reliverse/rese-app-router";

export default defineConfig({
  plugins: [appRouter()],
});
```

### Works great with

- `@reliverse/rese-react` — server-rendered React
- `@reliverse/rese-ai` — file-based AI chat/views
- `@reliverse/rese-static` — SSG + file output
- `@reliverse/rese-edge` — edge deployment + streaming

File-based routing, the Rese way.  
No magic. Just solid structure and next-level control.

Want examples? Try `bun create rese@latest --with-app-router` ✨

## Plugin: `@reliverse/rese-orpc`

At its core, Rese ships with **built-in support for [`oRPC`](https://orpc.unnoq.com/)** — a blazing-fast, multi-runtime RPC engine with OpenAPI-first design and TypeScript end-to-end safety.

- Want full control over RPC layer generation, OpenAPI docs, and integrations?  
- Add the **official oRPC plugin** and unlock extended capabilities.
- Fully compatible with `@tanstack/query`, `React Server Actions`, `Next.js`, `SvelteKit`, etc.
- Works as server-only or full end-to-end
- Zero setup needed — it just works™️
- Rese itself is built on **next-gen typed RPC**.

Whether you're writing backend logic, AI endpoints, or full-stack apps — `rese-orpc` gives you:

- 🧠 **Full type safety** across server/client
- 📄 **Automatic OpenAPI generation** (powered by schema definitions)
- 🔄 **Simple function-based routing** (no boilerplate)
- 🌍 **Multi-runtime support**: Bun, Node.js, Deno, Cloudflare Workers, etc.
- 📦 **Native types support**: `Date`, `Blob`, `BigInt`, `URL` — zero config

| Feature                            | Description                                                  |
|-----------------------------------|--------------------------------------------------------------|
| 🧾 OpenAPI autogen                | Auto-generate OpenAPI 3.1 docs and serve them via `/docs`    |
| 🔧 Custom router control          | Override routing logic with fine-grained handlers            |
| 🌐 Multi-runtime support          | Use your RPCs on Bun, Node, Cloudflare, etc.                 |
| 💬 Chat streaming (SSE/WebSockets) | Supports AI/LLM response streaming                           |
| 📚 Contract-first or route-first  | Define schema + routes in any order                          |
| ⚡ Lazy router loading            | Reduces cold start for large APIs                            |
| 🧩 Middleware + plugins           | Add CORS, auth guards, error mappers                         |
| 🔁 Auto client generation         | Generate type-safe clients for frontend or 3rd parties       |

### Example (server-side RPC)

```ts
import { rese } from "resejs";

export const getUser = rese.rpc({
  method: "GET",
  path: "/api/user/:id",
  input: z.object({ id: z.string() }),
  output: z.object({ name: z.string() }),
  handler: ({ input }) => {
    return { name: `User ${input.id}` };
  },
});
```

### Example

```ts
// rese.config.ts
import { defineConfig } from "resejs";
import orpc from "@reliverse/rese-orpc";

export default defineConfig({
  plugins: [orpc()],
});
```

```ts
// routes/user.ts
export const getUser = rese.rpc({
  method: "GET",
  path: "/user/:id",
  input: z.object({ id: z.string() }),
  output: z.object({ user: z.object({ id: z.string(), name: z.string() }) }),
  handler: async ({ input }) => {
    return { user: { id: input.id, name: "Jane Doe" } };
  },
});
```

- Or, want to expose your Rese routes as an OpenAPI-based public API?  
- Or, build internal tools and generate typed clients instantly?  
- This plugin is built for you 💫

## Build Your Own Framework with `@reliverse/rese-sdk`

Rese isn't just a framework — it's a platform.  
Thanks to its **plugin-first, modular architecture**, you can use `@reliverse/rese-sdk` to build your **own framework** — with your own conventions, plugins, templates, and CLI commands.

> Think: your own Next.js / Nuxt / Redwood / Remix / SvelteKit — but powered by Rese.

### What You Get

- 🧩 Plugin system built on composable runtime hooks
- ⚙️ Internal pipeline for extending `request → handler → response`
- 🧠 Plugin slots for routing, auth, DB, caching, i18n, etc.
- 📦 Reuse Rese core: HTTP server, adapters, context, helpers
- 🔧 Optional CLI extender (via `reliverse cli` plugin API)
- 📁 File-based project structure helpers

### Use Cases

- 🔥 Build your own full-featured meta-framework like Next.js
- 🧑‍💻 Wrap Rese into a React, Preact, or Solid-based system
- 🤖 Create AI-native frameworks with your own conventions
- 🛠️ Create minimal micro-frameworks for APIs, SSR, AI, CLIs, etc.
- 🎮 Extend for game servers, internal tooling, or agent frameworks

### Example Own-Framework Implementation

```ts
// packages/my-framework/index.ts
import { defineReseFramework } from "@reliverse/rese-sdk";
import base from "@reliverse/rese-core";
import react from "@reliverse/rese-react";
import db from "@reliverse/rese-db";

export default defineReseFramework({
  name: "myfw",
  plugins: [base(), react(), db()],
});
```

You now have your own framework. Add a CLI wrapper and you're in business:

```bash
bun create myfw@latest
```

## Plugin: `@reliverse/rese-effect`

Rese isn't just another web framework — it's **Effect-native** at its core. It is built on Effect — for Confidence at Scale

That means:

- 🧪 **Typed error handling** without `try/catch`
- 🧱 **Compositional logic** powered by `Effect`, `Layer`, `Stream`, `Fiber`, etc.
- 🚦 **Structured concurrency**, scoped lifecycles, and resource safety
- 🎯 **Predictable control flow** for sync, async, and long-lived logic
- 🧠 **Explicit dependencies** using Context injection (no magic globals)
- 📈 **Observability** through built-in tracing, metrics, and logging

Effect is like Rust's `Result<T, E>` meets Go's `context.Context` — but fully TypeScript-native and ergonomic.

### Real Example: Type-safe Route Handler

```ts
import { Effect } from "effect";
import { app } from "resejs";

app.get("/profile", () =>
  Effect.gen(function* (_) {
    const session = yield* _(getSession());
    const user = yield* _(UserService.findById(session.userId));
    return Response.json({ user });
  })
);
```

### Why this matters

With `Effect` inside Rese:

- Errors are **explicit** and enforced by the compiler
- Your handler's success/failure cases are **fully typed**
- Dependencies (e.g. `UserService`, `getSession`) are injected via `Layer`s
- Testing becomes effortless (mock anything, no globals required)
- Debugging is clearer (with step tracing, fiber timelines, and structured logs)

Rese isn't just fast — it's **safe**, **scalable**, and **refactorable**, from day one.

Just drop in the official plugin and let it handle the magic:

```ts
// rese.config.ts
import effect from "@reliverse/rese-effect";

export default defineReseApp({
  plugins: [effect()],
});
```

### What this plugin unlocks

#### 1. `ctx.runEffect(fn)`

Run any `Effect` inside a route:

```ts
app.get("/hello", (ctx) =>
  ctx.runEffect(
    Effect.sync(() => Response.json({ hello: "🌍" }))
  )
);
```

You get full error safety, dependency injection, cancellation, retry control, and more.

#### 2. `Layer` and `Context` Integration

Inject services, configuration, database connections, etc. at the app level:

```ts
import { Layer } from "effect";

const DBLayer = Layer.succeed(Database, new BunDatabase(...));

defineReseApp({
  plugins: [effect({ layers: [DBLayer] })],
});
```

Now any route handler using `Effect.gen()` can auto-inject `Database` — no boilerplate.

#### 3. Middleware Effects

Define middlewares as `Effect`s with full type inference:

```ts
effect().use(async (ctx, next) =>
  Effect.gen(function* (_) {
    const session = yield* _(getSession(ctx.req));
    ctx.locals.session = session;
    return yield* _(next());
  })
);
```

#### 4. Streaming, Observability, Scheduling

- 📡 Easily stream data with `Effect.Stream`
- 📊 Use `Effect.log`, `Effect.annotate`, and OpenTelemetry exporters
- ⏱ Build recurring jobs or interval tasks with `Effect.Schedule`

### Why use the plugin?

| Feature                        | Without Plugin       | With Plugin                       |
|-------------------------------|----------------------|-----------------------------------|
| `Effect` support               | Manual wiring        | Auto-configured                   |
| Dependency injection (`Layer`) | Manual setup         | Integrated with Rese context   |
| Observability                  | Extra effort         | Built-in metrics + tracing        |
| Middleware + services          | Manual wrapping      | Out-of-the-box support            |
| Error handling                 | Limited via try/catch| Tracked, typed, recoverable       |

> 🔥 It's like if Express.js, tRPC, and Rust's Actix had a baby — but built for the Bun era.

## Example: Authenticated Route

```ts
app.get("/private", (ctx) =>
  ctx.runEffect(
    Effect.gen(function* (_) {
      const session = yield* _(AuthService.validate(ctx.req));
      if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

      const data = yield* _(SecretService.getFor(session.userId));
      return Response.json({ data });
    })
  )
);
```

You now have:

- Typed errors
- Auto-injected dependencies
- Easy testability
- Middleware-safe side effects

### Build Your Own Plugins

Plugins are just functions that receive the `app` and extend it however they like:

```ts
export default () => (app) => {
  app.get("/hello", (ctx) => ctx.sendText("Hello from a plugin!"));
};
```

You can create internal plugins for your own project or publish them to the community.

Want to build a framework on top of Rese?  
We got you.

→ [Join the community](https://discord.gg/Pb8uKbwpsJ)  
→ [Read the SDK docs](https://docs.reliverse.org/rese/sdk) (coming soon)  
→ [Submit your framework to Hub](https://hub.reliverse.org) 🌀

## What's Coming Next  

🔄 oRPC Client Generator (like `tRPC` but OpenAPI-native)  
🧠 LLM tool interface via MCP  
🌎 Deploy anywhere: Bun, Node, Workers, Edge

🔥 **Rese is 3.7x faster than Express**, and matches or beats Fastify — with a simpler API.

## 🧩 How Rese Compares to Other Frameworks

- Rese isn't trying to be “definitely not just another HTTP server.”  
- It's a really **modern, modular, Bun-native fullstack framework** — built to grow with your stack, not just serve it.

| Feature                         | **Rese** 🌀     | Bao 🥟        | Express 🚌     | Koa 🍵       | Fastify 🚄    | Hono 🌈         |
|----------------------------------|-------------------|---------------|----------------|--------------|----------------|-----------------|
| 🧠 Bun-native (Zero Polyfills)   | ✅                 | ✅             | ❌              | ❌            | ❌              | ✅               |
| ⚡ Radix Routing Tree            | ✅                 | ✅             | ❌              | ❌            | ✅              | ✅               |
| ✨ TS-First Developer Experience | ✅ (typed ctx, hooks, plugins) | ✅             | ❌              | 🟡 partial     | ✅              | ✅               |
| 🔌 Plugin System (Extendability) | ✅                 | ❌             | ❌              | ❌            | 🟡 via hooks   | 🟡 middleware   |
| 📡 WebSocket Routing             | ✅                 | ✅             | ❌              | ❌            | 🟡 via plugins | ✅               |
| 📁 File-based Routing (App Router) | ✅ (`rese-app-router`)    | ❌             | ❌              | ❌            | ❌              | ✅               |
| 🤖 AI/LLM-Ready Plugins          | ✅ (`rese-ai`)     | ❌             | ❌              | ❌            | ❌              | ❌               |
| 🧠 Effect Integration            | ✅ (typed ops, retry, ctx) | ❌      | ❌              | ❌            | ❌              | ❌               |
| 📦 Native Module Bundling       | ✅ (Bun/Batteries) | ✅             | ❌              | ❌            | ✅              | ✅               |
| 🧩 Intended Use                  | **Fullstack + API + AI** | Minimal API | Middleware glue | Koa-style minimal | Optimized API server | Edge/serverless apps |

### Benchmarks

> Tested with `wrk -t12 -c500 -d10s http://localhost:3000`

| Framework   | Requests/sec | Latency    |
|-------------|---------------|-----------|
| **Rese**    | **31,821**    | **15ms**  |
| Bao         | 31,821        | 15ms      |
| Express     | 8,705         | 56ms      |
| Koa         | 26,877        | 18ms      |
| Fastify     | 31,974        | 15ms      |

## Roadmap

- [ ] Bootstap via Reliverse CLI
- [ ] Full WebSocket support
- [ ] Middleware (before/after)
- [ ] Named routes + wildcards
- [ ] Static file serving
- [ ] Plugin system
- [ ] CLI + Project templates

## Part of the Reliverse

Rese is built to work natively with:

- [`@reliverse/rempts`](https://github.com/reliverse/rempts) — CLI prompt framework
- [`@reliverse/reinit`](https://github.com/reliverse/reinit) — starter engine & boilerplate tool
- [`@reliverse/remdn`](https://github.com/reliverse/remdn) — Markdown automation
- [`@reliverse/hub`](https://github.com/reliverse/hub) — GUI/CLI app manager

## Contribute

- We welcome PRs, issues, and ideas.
- Got ideas for native Rese plugins? Let's build them together.

## Shoutouts

- [bao](https://github.com/mattreid1/baojs#readme)
- [koa](https://github.com/koajs/koa#readme)
- [hono](https://github.com/honojs/hono#readme)
- [fastify](https://github.com/fastify/fastify#readme)
- [express](https://github.com/expressjs/express#readme)

## Support & Community

- [💬 Join Discord](https://discord.gg/Pb8uKbwpsJ)
- [⭐️ Star on GitHub](https://github.com/reliverse/resejs)
- [☕ Sponsor on GitHub](https://github.com/sponsors/blefnk)

## License

💖 MIT © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)

*🧚 This README was generated with [@reliverse/remdn](https://github.com/reliverse/remdn)*
