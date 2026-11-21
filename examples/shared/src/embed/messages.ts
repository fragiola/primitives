// Adapted from Tree (fragiola/tree, examples/shared/src/embed/messages.ts), same author and
// licence.
//
// The messages between an embed and the site (site export contract v1.7, §5.2), for every
// framework's embed host. Same origin: every message is posted to, and only accepted from,
// `location.origin`; nothing is sent when the page is not in a frame. Overlay promotion (§5.4) is
// ./overlay-promotion.ts, which posts through `post` and holds the height reports back while the
// frame is promoted.

import { isThemeName, THEMES, type ThemeName } from "../themes/themes.ts";

export const READY = "fragiola:example:ready";
export const RESIZE = "fragiola:example:resize";
export const THEME = "fragiola:example:theme";
export const HOST = "fragiola:example:host";
export const OVERLAY = "fragiola:example:overlay";
export const PROMOTE = "fragiola:example:promote";
export const ARMED = "fragiola:example:armed";
export const PROMOTED = "fragiola:example:promoted";

/** What an embed sends to the site. */
export type EmbedMessage =
    | { type: typeof READY; id: string }
    | { type: typeof RESIZE; id: string; height: number }
    | { type: typeof OVERLAY; id: string; open: boolean }
    | { type: typeof ARMED; id: string };

const embedded = () => window.parent !== window;

/** Posts to the site; a no-op outside a frame. */
export function post(message: EmbedMessage) {
    if (embedded()) window.parent.postMessage(message, location.origin);
}

/** Once, after the example's first render. */
export function postReady(id: string) {
    post({ type: READY, id });
}

// While the frame is promoted the site does not size it: the last height waits and goes out once
// the frame is back in place.
let held = false;
let flush: (() => void) | undefined;

/** Holds the height reports back (`true`) or sends the pending one (`false`). */
export function holdResize(hold: boolean) {
    held = hold;
    if (!hold) flush?.();
}

/** Posts the content height whenever it changes (a `flow` example only). Returns a cleanup. */
export function reportHeight(id: string, content: HTMLElement): () => void {
    let last = -1;
    const report = () => {
        if (held) return;
        const height = Math.ceil(content.getBoundingClientRect().height);
        if (height === last) return;
        last = height;
        post({ type: RESIZE, id, height });
    };
    flush = report;
    const observer = new ResizeObserver(report);
    observer.observe(content);
    return () => {
        observer.disconnect();
        flush = undefined;
    };
}

/**
 * Applies an example theme: its scheme on `<html>` (`data-theme`, the `dark` class and
 * `color-scheme`, §5.1), its name on `<body>` (`data-example-theme`), where the example and the
 * overlays portalled into `<body>` both find it. The pre-paint script of every embed (its
 * `vite.shared.ts`) does the same before the first paint.
 */
export function applyTheme(theme: ThemeName) {
    const scheme =
        THEMES.find((entry) => entry.name === theme)?.scheme ?? "light";
    const html = document.documentElement;
    html.dataset.theme = scheme;
    html.classList.toggle("dark", scheme === "dark");
    html.style.colorScheme = scheme;
    document.body.dataset.exampleTheme = theme;
}

/** Follows the site's theme messages; an unknown theme is ignored. Returns a cleanup. */
export function followTheme(): () => void {
    const onMessage = (event: MessageEvent) => {
        if (event.origin !== location.origin || event.source !== window.parent)
            return;
        const data = event.data as { type?: unknown; theme?: unknown } | null;
        if (data?.type === THEME && isThemeName(data.theme)) {
            applyTheme(data.theme);
        }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
}

/**
 * The script every embed's `index.html` runs before the first paint (§5.1): `?theme=` (missing
 * or unknown: the first light theme) applied as {@link applyTheme} does. Text, for the apps' Vite
 * plugin to inline; the theme list comes from themes.ts, so the two cannot drift.
 */
export function prePaintScript(): string {
    const schemes = Object.fromEntries(
        THEMES.map((theme) => [theme.name, theme.scheme]),
    );
    const fallback = THEMES.find((theme) => theme.scheme === "light")?.name;
    return `(() => {
    const schemes = ${JSON.stringify(schemes)};
    const asked = new URLSearchParams(location.search).get("theme");
    const theme = asked && Object.hasOwn(schemes, asked) ? asked : ${JSON.stringify(fallback)};
    const html = document.documentElement;
    html.dataset.theme = schemes[theme];
    html.classList.toggle("dark", schemes[theme] === "dark");
    html.style.colorScheme = schemes[theme];
    document.body.dataset.exampleTheme = theme;
})();`;
}
