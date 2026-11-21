// Adapted from Tree (fragiola/tree, examples/shared/e2e/serve.ts) and Fragiola UI
// (fragiola/ui, examples/react/scripts/check-embeds.ts, its v1.3 host), same author and licence.
//
// Serves the e2e build of a framework's embed app the way the site does: under its base, plus a
// host page that embeds an example in an iframe, as fragiola.com does (same origin).
//
//   node e2e/serve.ts <port> <dist> <base>     (config.ts runs it in the app's directory)
//
//   <base>…                         <dist> (the app's build, e.g. /primitives/embed/react/)
//   /host.html?id=<id>&theme=<t>    one iframe on <base>?id=<id>&theme=<t>, below and beside a
//                                   spacer (so its rect is not the origin), with a page taller
//                                   than the viewport. It records the embed's messages in
//                                   `window.messages`, stays transparent until `ready`, then says
//                                   `host` (overlay: true) and promotes the frame on `overlay`
//                                   open, as contract §5.4 asks: `promote`, the frame over the
//                                   viewport in the top layer on `armed` (or after 500 ms), then
//                                   `promoted`; back in place on `overlay` closed.
//                                   `&legacy=1`: a site older than v1.3, which never says `host`.

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const [port, dist, base] = process.argv.slice(2);
if (!port || !dist || !base) {
    console.error("usage: node serve.ts <port> <dist> <base>");
    process.exit(1);
}
const BASE = base;
const DIST = resolve(dist);
const PORT = Number(port);

const TYPES: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
};

function host(params: URLSearchParams): string {
    const query = new URLSearchParams();
    for (const key of ["id", "theme"]) {
        const value = params.get(key);
        if (value !== null) query.set(key, value);
    }
    const legacy = params.get("legacy") === "1";
    return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>host</title>
        <style>
            #frame { display: block; position: static; inset: auto; margin: 0; padding: 0;
                     border: 0; overflow: visible; background: transparent; opacity: 0;
                     width: 720px; height: 400px; }
        </style>
    </head>
    <body style="margin: 0">
        <div style="height: 120px"></div>
        <div id="wrapper" style="margin-left: 40px; width: 720px">
            <iframe id="frame" data-testid="frame" title="Example" popover="manual"
                src="${BASE}?${query.toString().replace(/"/g, "&quot;")}"></iframe>
        </div>
        <div style="height: 1200px"></div>
        <script>
            window.messages = [];
            window.promotions = 0;
            const legacy = ${JSON.stringify(legacy)};
            const frame = document.getElementById("frame");
            const wrapper = document.getElementById("wrapper");
            let phase = "inline";
            let pending = null;
            let timer;
            const post = (message) => frame.contentWindow.postMessage(message, location.origin);
            const measure = () => {
                const box = wrapper.getBoundingClientRect();
                const root = document.documentElement;
                return {
                    rect: { x: box.left, y: box.top, width: box.width, height: frame.getBoundingClientRect().height },
                    viewport: { width: root.clientWidth, height: root.clientHeight },
                };
            };
            const promote = () => {
                if (phase !== "arming") return;
                clearTimeout(timer);
                phase = "promoted";
                window.promotions += 1;
                frame.style.position = "fixed";
                frame.style.top = frame.style.left = "0px";
                frame.style.width = pending.viewport.width + "px";
                frame.style.height = pending.viewport.height + "px";
                frame.showPopover();
                post({ type: "fragiola:example:promoted", ...pending });
            };
            const inline = () => {
                frame.style.position = frame.style.top = frame.style.left = "";
                frame.style.width = frame.style.height = "";
            };
            addEventListener("message", (event) => {
                if (event.origin !== location.origin) return;
                if (event.source !== frame.contentWindow) return;
                const data = event.data;
                window.messages.push(data);
                if (data?.type === "fragiola:example:ready") {
                    frame.style.opacity = "1";
                    if (!legacy) post({ type: "fragiola:example:host", overlay: true });
                } else if (data?.type === "fragiola:example:overlay" && data.open === true) {
                    if (phase !== "inline") return;
                    phase = "arming";
                    pending = measure();
                    post({ type: "fragiola:example:promote", ...pending });
                    timer = setTimeout(promote, 500);
                } else if (data?.type === "fragiola:example:armed") {
                    promote();
                } else if (data?.type === "fragiola:example:overlay" && data.open === false) {
                    clearTimeout(timer);
                    if (phase === "promoted") frame.hidePopover();
                    phase = "inline";
                    inline();
                }
            });
            window.isPromoted = () => frame.matches(":popover-open");
        </script>
    </body>
</html>`;
}

async function file(pathname: string): Promise<string | undefined> {
    const safe = normalize(decodeURIComponent(pathname)).replace(
        /^(\.\.[/\\])+/,
        "",
    );
    for (const candidate of [
        join(DIST, safe),
        join(DIST, safe, "index.html"),
    ]) {
        if (!candidate.startsWith(DIST)) continue;
        const info = await stat(candidate).catch(() => undefined);
        if (info?.isFile()) return candidate;
    }
    return undefined;
}

createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname === "/host.html") {
        response.writeHead(200, { "content-type": TYPES[".html"] });
        response.end(host(url.searchParams));
        return;
    }
    const found = url.pathname.startsWith(BASE)
        ? await file(url.pathname.slice(BASE.length))
        : undefined;
    if (!found) {
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200, {
        "content-type": TYPES[extname(found)] ?? "application/octet-stream",
    });
    createReadStream(found).pipe(response);
}).listen(PORT, () => {
    console.log(`serving ${DIST} at http://localhost:${PORT}${BASE}`);
});
