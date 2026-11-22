// The server of conformance's ssr layer: `node conformance/src/ssr-server.ts <fixture dir> <port>`.
// It serves a fixture's `build:ssr` output: its client build's files (`dist-ssr/client`), and
// every other path rendered on the server by its server entry (`dist-ssr/server/entry-server.js`,
// `render(url, template)`: the client's `index.html` with the page in `#root`, which the client
// then hydrates). Node only: no framework, no dependency.
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const TYPES: Record<string, string> = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".map": "application/json",
    ".mjs": "text/javascript",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
};

/** The file under `client` a request path names, or `undefined` (a page to render). */
export function staticFile(client: string, path: string): string | undefined {
    const file = normalize(join(client, decodeURIComponent(path)));
    if (!file.startsWith(client) || extname(file) === "") {
        return undefined;
    }
    return existsSync(file) && statSync(file).isFile() ? file : undefined;
}

async function main(): Promise<void> {
    const [dir, port] = process.argv.slice(2);
    if (dir === undefined || port === undefined) {
        throw new Error("usage: ssr-server.ts <fixture dir> <port>");
    }
    const client = resolve(dir, "dist-ssr/client");
    const template = readFileSync(join(client, "index.html"), "utf8");
    const entry = (await import(
        pathToFileURL(resolve(dir, "dist-ssr/server/entry-server.js")).href
    )) as {
        render: (url: string, template: string) => string | Promise<string>;
    };
    createServer((request, response) => {
        const url = request.url ?? "/";
        const path = url.split("?")[0] ?? "/";
        const file = staticFile(client, path);
        if (file !== undefined) {
            response.writeHead(200, {
                "content-type":
                    TYPES[extname(file)] ?? "application/octet-stream",
            });
            response.end(readFileSync(file));
            return;
        }
        Promise.resolve(entry.render(url, template)).then(
            (html) => {
                response.writeHead(200, { "content-type": "text/html" });
                response.end(html);
            },
            (error: unknown) => {
                console.error(`ssr-server: ${url}:`, error);
                response.writeHead(500, { "content-type": "text/plain" });
                response.end(String(error));
            },
        );
    }).listen(Number(port), () => {
        console.log(`ssr-server: ${dir} on http://localhost:${port}`);
    });
}

if (import.meta.main) {
    await main();
}
