import type { Server, WebSocketHandler } from "bun";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

export type RouteParams = Record<string, string>;

export type Context = {
  req: Request;
  params: RouteParams;
  query: URLSearchParams;
  server: Server;
};

export type Middleware = (
  ctx: Context,
  next: () => Promise<Response>,
) => Promise<Response>;

export type RouteHandler = (ctx: Context) => Promise<Response> | Response;

export type MethodHandlers = Partial<Record<HttpMethod, RouteHandler>>;

export type Route = RouteHandler | MethodHandlers;

export type Routes = Record<string, Route>;

export type WebSocketConfig = {
  handler: WebSocketHandler;
  path: string;
};

export type ReseConfig = {
  port?: number;
  hostname?: string;
  development?: boolean;
  routes?: Routes;
  middleware?: Middleware[];
  websocket?: WebSocketConfig;
  static?: {
    dir: string;
    prefix?: string;
  };
};

export type ReseInstance = {
  start: () => Promise<Server>;
  stop: () => Promise<void>;
};
