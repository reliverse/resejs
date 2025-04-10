import type { Context, Route, RouteParams } from "./types.js";

type RoutePattern = {
  pattern: string;
  paramNames: string[];
  regex: RegExp;
  handler: Route;
};

const compilePattern = (
  pattern: string,
): { regex: RegExp; paramNames: string[] } => {
  const paramNames: string[] = [];
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
    paramNames,
  };
};

export const createRouter = (routes: Record<string, Route>) => {
  const compiledRoutes: RoutePattern[] = Object.entries(routes).map(
    ([pattern, handler]) => {
      const { regex, paramNames } = compilePattern(pattern);
      return { pattern, regex, paramNames, handler };
    },
  );

  // Sort routes by specificity (static routes first, then dynamic, then wildcards)
  compiledRoutes.sort((a, b) => {
    const aStatic = a.paramNames.length === 0 && !a.pattern.includes("*");
    const bStatic = b.paramNames.length === 0 && !b.pattern.includes("*");

    if (aStatic && !bStatic) return -1;
    if (!aStatic && bStatic) return 1;

    const aWildcard = a.pattern.includes("*");
    const bWildcard = b.pattern.includes("*");

    if (!aWildcard && bWildcard) return -1;
    if (aWildcard && !bWildcard) return 1;

    return b.pattern.length - a.pattern.length;
  });

  return {
    match: (
      path: string,
      _ctx: Context,
    ): { handler: Route; params: RouteParams } | null => {
      for (const route of compiledRoutes) {
        const match = path.match(route.regex);
        if (match) {
          const params: RouteParams = {};
          route.paramNames.forEach((name, i) => {
            params[name] = match[i + 1];
          });
          return { handler: route.handler, params };
        }
      }
      return null;
    },
  };
};
