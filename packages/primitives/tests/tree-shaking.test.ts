import { join } from "node:path";
import { rolldown } from "rolldown";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");

/** The minified bundle of an app whose only code is `source`, the toolkit from its sources. */
async function bundle(source: string): Promise<string> {
    const build = await rolldown({
        input: "app.ts",
        platform: "browser",
        external: ["@floating-ui/dom"],
        resolve: { conditionNames: ["@fragiola/source", "import", "default"] },
        plugins: [
            {
                name: "app",
                resolveId(id) {
                    if (id === "app.ts") return id;
                    if (id === "@fragiola/primitives")
                        return join(root, "src/index.ts");
                    const subpath = /^@fragiola\/primitives\/([a-z-]+)$/.exec(
                        id,
                    );
                    if (subpath)
                        return join(root, "src", subpath[1] ?? "", "index.ts");
                    return null;
                },
                load(id) {
                    return id === "app.ts" ? source : null;
                },
            },
        ],
    });
    const { output } = await build.generate({ format: "esm", minify: true });
    await build.close();
    return output
        .map((chunk) => ("code" in chunk ? chunk.code : ""))
        .join("\n");
}

// AGENTS.md rule 6 (D8): the root entry only re-exports, so it costs nothing over the subpath.
describe("importing from the root", () => {
    for (const [mechanism, name] of [
        ["scroll-lock", "lockScroll"],
        ["overlay", "openOverlaySession"],
        ["collection", "tabsKeyTarget"],
        ["date", "monthGrid"],
        ["positioning", "anchorFloating"],
    ] as const) {
        it(`tree-shakes ${name} to the same output as @fragiola/primitives/${mechanism}`, async () => {
            const use = `globalThis.used = ${name};`;
            const fromRoot = await bundle(
                `import { ${name} } from "@fragiola/primitives";\n${use}`,
            );
            const fromSubpath = await bundle(
                `import { ${name} } from "@fragiola/primitives/${mechanism}";\n${use}`,
            );
            expect(fromRoot).toBe(fromSubpath);
            expect(fromRoot.length).toBeGreaterThan(0);
        });
    }

    it("keeps an unused mechanism out", async () => {
        const output = await bundle(
            `import { lockScroll } from "@fragiola/primitives";\nglobalThis.used = lockScroll;`,
        );
        // the date mechanism's Intl formatting is not in an app that only locks the scroll
        expect(output).not.toContain("DateTimeFormat");
        expect(output).not.toContain("@floating-ui/dom");
    });
});
