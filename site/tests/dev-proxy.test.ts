// Adapted from Tree (fragiola/tree, site/tests/dev-proxy.test.ts), same author and licence (itself
// from Dockable's).

import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { connect, type Socket } from "node:net";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDevProxy, DEV_PORT, freePort, routeOf } from "../dev-proxy.ts";

// `site:dev` serves every framework's embed on one port: a proxy in front of one dev server per
// framework, routing by `<base>/embed/<framework>/`, hot-reload WebSockets included.

const upstreams = [
    { prefix: "/primitives/embed/react/", port: 1 },
    { prefix: "/primitives/embed/vue/", port: 2 },
];

describe("the dev proxy's routes", () => {
    it("send each embed's paths to its own dev server", () => {
        expect(routeOf("/primitives/embed/react/", upstreams)?.port).toBe(1);
        expect(
            routeOf("/primitives/embed/vue/src/main.ts", upstreams)?.port,
        ).toBe(2);
        expect(
            routeOf("/primitives/embed/react/manifest.json", upstreams)?.port,
        ).toBe(1);
        // without its slash, the dev server redirects it
        expect(routeOf("/primitives/embed/vue", upstreams)?.port).toBe(2);
    });

    it("send nothing else anywhere", () => {
        expect(routeOf("/", upstreams)).toBeUndefined();
        expect(
            routeOf("/primitives/embed/angular/", upstreams),
        ).toBeUndefined();
        expect(
            routeOf("/primitives/embed/reactive/", upstreams),
        ).toBeUndefined();
    });
});

describe("the dev proxy", () => {
    const servers: Server[] = [];
    // upgraded sockets are no longer the server's connections: closed by hand
    const sockets = new Set<Socket>();
    const track = (server: Server) => {
        server.on("connection", (socket) => sockets.add(socket));
        servers.push(server);
    };
    afterEach(async () => {
        for (const socket of sockets) socket.destroy();
        sockets.clear();
        await Promise.all(
            servers.map(
                (server) => new Promise((resolve) => server.close(resolve)),
            ),
        );
        servers.length = 0;
    });

    /** A dev server that names itself, answers the path it got and echoes on an upgrade. */
    async function upstream(name: string): Promise<number> {
        const port = await freePort();
        const server = createServer((request, response) => {
            response.setHeader("x-upstream", name);
            response.end(`${name} ${request.url}`);
        });
        server.on("upgrade", (_request, socket) => {
            socket.write(
                "HTTP/1.1 101 Switching Protocols\r\nUpgrade: echo\r\nConnection: Upgrade\r\n\r\n",
            );
            socket.on("data", (data) => socket.write(`${name}:${data}`));
        });
        await new Promise<void>((resolve) =>
            server.listen(port, "localhost", resolve),
        );
        track(server);
        return port;
    }

    async function proxy(): Promise<number> {
        const react = await upstream("react");
        const vue = await upstream("vue");
        const server = createDevProxy([
            { prefix: "/primitives/embed/react/", port: react },
            { prefix: "/primitives/embed/vue/", port: vue },
        ]);
        const port = await freePort();
        await new Promise<void>((resolve) =>
            server.listen(port, "localhost", resolve),
        );
        track(server);
        return port;
    }

    it("forwards each request to its framework's dev server, path and query kept", async () => {
        const port = await proxy();
        const react = await fetch(
            `http://localhost:${port}/primitives/embed/react/?id=dialog`,
        );
        expect(react.headers.get("x-upstream")).toBe("react");
        expect(await react.text()).toBe(
            "react /primitives/embed/react/?id=dialog",
        );
        const vue = await fetch(
            `http://localhost:${port}/primitives/embed/vue/manifest.json`,
        );
        expect(await vue.text()).toBe(
            "vue /primitives/embed/vue/manifest.json",
        );
        const other = await fetch(`http://localhost:${port}/elsewhere`);
        expect(other.status).toBe(404);
    });

    it("carries a WebSocket upgrade (hot reload) to the right dev server", async () => {
        const port = await proxy();
        const reply = await new Promise<string>((resolve, reject) => {
            const socket = connect(port, "localhost", () => {
                socket.write(
                    "GET /primitives/embed/vue/ HTTP/1.1\r\nHost: localhost\r\nUpgrade: echo\r\nConnection: Upgrade\r\n\r\n",
                );
            });
            let received = "";
            socket.on("data", (data) => {
                received += data;
                if (
                    received.includes("\r\n\r\n") &&
                    !received.includes("vue:")
                ) {
                    socket.write("ping");
                }
                if (received.includes("vue:ping")) {
                    socket.end();
                    resolve(received);
                }
            });
            socket.on("error", reject);
        });
        expect(reply).toMatch(/^HTTP\/1\.1 101 Switching Protocols/);
        expect(reply).toContain("vue:ping");
    });
});

describe("site:dev", () => {
    it("listens on port 5191 under /primitives by default (decisions.md#np-contract-version)", () => {
        expect(DEV_PORT).toBe(5191);
        const dev = readFileSync(
            join(import.meta.dirname, "../dev.ts"),
            "utf8",
        );
        expect(dev).toContain("default: String(DEV_PORT)");
        expect(dev).toContain("default: `/$" + "{project.slug}`");
        const root = JSON.parse(
            readFileSync(
                join(import.meta.dirname, "../../package.json"),
                "utf8",
            ),
        ) as { scripts: Record<string, string> };
        expect(root.scripts["site:dev"]).toBe("node site/dev.ts");
        expect(root.scripts["site:export"]).toBe("node site/export.ts");
    });

    it("runs each framework's app dev server, which serves the packages' sources", () => {
        for (const framework of ["react", "vue", "angular"]) {
            const app = join(import.meta.dirname, "../../examples", framework);
            const manifest = JSON.parse(
                readFileSync(join(app, "package.json"), "utf8"),
            ) as { scripts: Record<string, string> };
            expect(manifest.scripts.dev, framework).toMatch(/vite$/);
            const shared = readFileSync(join(app, "vite.shared.ts"), "utf8");
            expect(shared, framework).toContain('command === "serve"');
            expect(shared, framework).toContain(
                "withSourceCondition(defaultClientConditions)",
            );
        }
    });
});
