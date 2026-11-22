// Adapted from Tree (fragiola/tree, examples/shared/tests/manifest.test.ts), same author and
// licence.
import {
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
    collectFiles,
    examplesApp,
    fileOf,
    importsOf,
} from "../scripts/examples-lib.ts";
import { loadersSource } from "../scripts/generate.ts";
import { buildManifest } from "../scripts/manifest.ts";
import {
    ENTRY_FILES,
    FRAMEWORKS,
    PRIMITIVES_PACKAGES,
} from "../src/framework.ts";

// A framework's manifest (contract §5.3): every example with its files, entry first, its own
// files then the recipes it imports (shown as `_recipes/`), stored once, verbatim.

/** The recipes an example imports besides its own component's (the picker's calendar). */
const MORE_RECIPES: Record<string, readonly string[]> = {
    "date-picker": ["_recipes/calendar.ts", "_recipes/field.ts"],
    fieldset: ["_recipes/checkbox.ts", "_recipes/field.ts"],
    form: ["_recipes/field.ts"],
    "radio-group": [
        "_recipes/button.ts",
        "_recipes/field.ts",
        "_recipes/form.ts",
        "_recipes/switch.ts",
    ],
};

/** The examples whose recipes need none of the recipes' shared pieces (no focusable part). */
const WITHOUT_SHARED: ReadonlySet<string> = new Set(["avatar"]);

describe("the manifest", () => {
    for (const framework of FRAMEWORKS) {
        it(`of ${framework} lists every example with the files it is made of`, async () => {
            const app = examplesApp(framework);
            const manifest = await buildManifest(app);
            expect(manifest.examples.map((example) => example.id)).toEqual([
                "dialog",
                "popover",
                "tooltip",
                "menu",
                "tabs",
                "field",
                "checkbox",
                "slider",
                "select",
                "combobox",
                "fieldset",
                "form",
                "radio-group",
                "switch",
                "button",
                "date-picker",
                "calendar",
                "progress",
                "avatar",
                "separator",
            ]);
            for (const example of manifest.examples) {
                const entry = ENTRY_FILES[framework];
                expect(example.files).toEqual([
                    `${example.id}/${entry}`,
                    `${example.id}/styles.ts`,
                    // its component's recipe and the recipes' shared files, in name order
                    ...[
                        `_recipes/${example.id}.ts`,
                        ...(MORE_RECIPES[example.id] ?? []),
                        "_recipes/recipe.ts",
                        ...(WITHOUT_SHARED.has(example.id)
                            ? []
                            : ["_recipes/shared.ts"]),
                    ].sort(),
                ]);
                expect(example.packages).toEqual([
                    PRIMITIVES_PACKAGES[framework],
                ]);
                expect(example.registry).toEqual([]);
                expect(example.layout).toBe("fill");
                expect(example.height).toBeGreaterThan(0);
                for (const file of example.files) {
                    expect(manifest.files[file]?.content).toBe(
                        readFileSync(fileOf(app, file), "utf-8"),
                    );
                }
            }
            // used by both examples: shared
            expect(manifest.files["_recipes/shared.ts"]?.shared).toBe(true);
            expect(manifest.files["dialog/styles.ts"]?.shared).toBeUndefined();
            expect(
                manifest.files[`dialog/${ENTRY_FILES[framework]}`]?.lang,
            ).toBe(ENTRY_FILES[framework].split(".").pop());
        });
    }

    it("refuses an import that leaves the examples, or does not resolve", () => {
        const root = mkdtempSync(join(tmpdir(), "examples-react-"));
        try {
            const app = examplesApp("react", root);
            mkdirSync(join(app.examplesDir, "leaves"), { recursive: true });
            mkdirSync(join(app.examplesDir, "broken"), { recursive: true });
            writeFileSync(join(app.src, "outside.ts"), "export const x = 1;\n");
            writeFileSync(
                join(app.examplesDir, "leaves", "index.tsx"),
                'import { x } from "../../outside.ts";\n',
            );
            writeFileSync(
                join(app.examplesDir, "broken", "index.tsx"),
                'import { y } from "./nope.ts";\n',
            );
            expect(() => collectFiles(app, "leaves")).toThrow(
                /leaves src\/examples/,
            );
            expect(() => collectFiles(app, "broken")).toThrow(
                /cannot resolve "\.\/nope\.ts"/,
            );
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it("reads static, re-exported and dynamic imports, not strings", () => {
        expect(
            importsOf(
                [
                    'import { a } from "./a.ts";',
                    'export { b } from "./b.ts";',
                    'import type { C } from "c";',
                    'const d = import("./d.ts");',
                    "const text = \"import x from 'nope'\";",
                ].join("\n"),
            ),
        ).toEqual(["./a.ts", "./b.ts", "c", "./d.ts"]);
    });
});

describe("the loaders", () => {
    it("import each example's entry lazily, with its layout", async () => {
        const source = loadersSource("vue", [
            {
                id: "dialog",
                files: [],
                meta: {
                    title: "t",
                    description: "d",
                    category: "overlays",
                    order: 1,
                    features: [],
                },
            },
        ]);
        expect(source).toContain('import type { Component } from "vue";');
        expect(source).toContain(
            'load: () => import("../examples/dialog/index.vue")',
        );
        expect(source).toContain('layout: "fill"');
    });
});
