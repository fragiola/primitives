// Adapted from Tree (fragiola/tree, examples/react/vite.shared.ts), same author and licence.

import { prePaintScript } from "examples-shared/embed/messages";
import type { Framework } from "examples-shared/framework";
import { examplesApp } from "examples-shared/scripts/examples-lib";
import { buildManifest } from "examples-shared/scripts/manifest";
import { defaultClientConditions, type Plugin, type UserConfig } from "vite";
import { withSourceCondition } from "../../scripts/source-condition.ts";

// What every framework's embed app configures the same way (this file is the same in
// examples/react, examples/vue and examples/angular, but for the framework's dedupe list).

/**
 * Dev (`site:dev`) resolves the workspace packages to their sources (the source condition) so the
 * primitives hot-reload; the build uses their `dist`, as a consumer does (CI builds the packages
 * first).
 */
export function examplesResolve(
    command: "serve" | "build",
    dedupe: string[],
): UserConfig["resolve"] {
    return {
        dedupe,
        ...(command === "serve"
            ? { conditions: withSourceCondition(defaultClientConditions) }
            : {}),
    };
}

/** Applies `?theme=` before the first paint (contract §5.1), as `applyTheme` does after. */
export function prePaintTheme(): Plugin {
    return {
        name: "pre-paint-theme",
        transformIndexHtml: () => [
            {
                tag: "script",
                children: prePaintScript(),
                injectTo: "body-prepend",
            },
        ],
    };
}

/**
 * In dev, `<base>manifest.json` is served too, built per request (the site in dev reads it
 * through its proxy). The build's manifest is written by site/export.ts.
 */
export function devManifest(framework: Framework, base: string): Plugin {
    return {
        name: "dev-manifest",
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (req.url?.split("?")[0] !== `${base}manifest.json`) {
                    return next();
                }
                res.setHeader("Content-Type", "application/json");
                res.end(
                    JSON.stringify(await buildManifest(examplesApp(framework))),
                );
            });
        },
    };
}
