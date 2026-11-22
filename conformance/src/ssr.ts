import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";

const SPEC = join(import.meta.dirname, "../../spec");

/**
 * Every scenario of the specs, as its heading names it (`### \`/tabs/automatic?dir=rtl\``): the
 * pages the ssr layer renders on the server.
 */
export function scenarioPaths(): string[] {
    const paths = new Set<string>();
    for (const name of readdirSync(SPEC).sort()) {
        if (!name.endsWith(".md") || name === "README.md") {
            continue;
        }
        const text = readFileSync(join(SPEC, name), "utf8");
        for (const match of text.matchAll(/^### `(\/[^`\s]+)`/gm)) {
            paths.add(match[1] as string);
        }
    }
    return [...paths];
}

/**
 * The page's `#root` as a comparable tree: elements with their attributes sorted (classes as a
 * sorted set, an inline style by its declarations: a server writes them in its own order and
 * spacing), and non-blank text. Comments go (the frameworks' hydration anchors), and so do the
 * hydration annotations Angular writes (`ngh`, `ng-server-context`, and its event replay's
 * `jsaction`). React's ids differ between a server render (`_R_…_`) and a client one
 * (`_r_…_`): they are numbered by first appearance.
 */
export function snapshotRoot(page: Page): Promise<string> {
    return page.evaluate(() => {
        const root = document.getElementById("root");
        if (root === null) {
            return "no #root";
        }
        const ignored = new Set([
            "ngh",
            "ng-server-context",
            "ng-version",
            "jsaction",
        ]);
        const ids = new Map<string, string>();
        const reactId = /_[rR]_[0-9a-zA-Z]+_/g;
        const normalize = (value: string) =>
            value.replace(reactId, (id) => {
                const key = id;
                if (!ids.has(key)) {
                    ids.set(key, `_id${ids.size}_`);
                }
                return ids.get(key) as string;
            });
        const lines: string[] = [];
        const walk = (node: Node, depth: number) => {
            const indent = "  ".repeat(depth);
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent ?? "";
                if (text.trim() !== "") {
                    lines.push(`${indent}"${text}"`);
                }
                return;
            }
            if (!(node instanceof Element)) {
                return;
            }
            const attributes = [...node.attributes]
                .filter((attribute) => !ignored.has(attribute.name))
                // an empty inline style is no style (Vue's server writes `style=""`)
                .filter(
                    (attribute) =>
                        attribute.name !== "style" ||
                        attribute.value.trim() !== "",
                )
                .map((attribute) => {
                    // a class list and an inline style as sets: a server writes them in
                    // its own order and spacing
                    const value =
                        attribute.name === "class"
                            ? attribute.value
                                  .split(/\s+/)
                                  .filter(Boolean)
                                  .sort()
                                  .join(" ")
                            : attribute.name === "style" &&
                                node instanceof HTMLElement
                              ? [...node.style]
                                    .map(
                                        (name) =>
                                            `${name}: ${node.style.getPropertyValue(name)}`,
                                    )
                                    .sort()
                                    .join("; ")
                              : attribute.value;
                    return `${attribute.name}="${normalize(value)}"`;
                })
                .sort();
            lines.push(`${indent}<${node.localName} ${attributes.join(" ")}>`);
            for (const child of node.childNodes) {
                walk(child, depth + 1);
            }
        };
        for (const child of root.childNodes) {
            walk(child, 0);
        }
        return lines.join("\n");
    });
}
